const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const {Pool} = require('pg');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123dev@localhost:5432/elevator_db',
});


// --- DB init & helpers ---
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS elevators (
      id BIGINT PRIMARY KEY,
      name TEXT,
      current_floor INT DEFAULT 0,
      direction TEXT DEFAULT 'idle',
      status TEXT DEFAULT 'operational',
      max_capacity INT DEFAULT 8,
      current_passengers INT DEFAULT 0,
      is_door_open BOOLEAN DEFAULT false,
      metadata JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS elevator_status_history (
      id BIGSERIAL PRIMARY KEY,
      elevator_id BIGINT REFERENCES elevators(id) ON DELETE CASCADE,
      status TEXT,
      meta JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      elevator_id BIGINT REFERENCES elevators(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      payload JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id BIGSERIAL PRIMARY KEY,
      floor INT NOT NULL,
      direction TEXT,
      passengers INT DEFAULT 1,
      destination_floor INT,
      status TEXT DEFAULT 'pending', -- pending, assigned, served, cancelled
      assigned_elevator BIGINT REFERENCES elevators(id),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS passengers (
      id BIGSERIAL PRIMARY KEY,
      request_id BIGINT REFERENCES requests(id) ON DELETE SET NULL,
      elevator_id BIGINT REFERENCES elevators(id) ON DELETE SET NULL,
      pickup_floor INT NOT NULL,
      destination_floor INT NOT NULL,
      count INT DEFAULT 1,
      status TEXT DEFAULT 'waiting', -- waiting, onboard, completed, cancelled
      requested_at TIMESTAMPTZ DEFAULT now(),
      boarded_at TIMESTAMPTZ,
      alighted_at TIMESTAMPTZ
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS destinations (
      id BIGSERIAL PRIMARY KEY,
      elevator_id BIGINT REFERENCES elevators(id) ON DELETE CASCADE,
      floor INT NOT NULL,
      is_destination BOOLEAN DEFAULT FALSE,
      expected_passengers INT DEFAULT 0,
      pair_passenger_id BIGINT REFERENCES passengers(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      completed_at TIMESTAMPTZ
    );
  `);
}
initDb().catch(err => console.error('DB init error', err));

async function ensureElevatorRow(elevator) {
  const { id, maxCapacity, currentFloor, direction, status, currentPassengers, isDoorOpen } = elevator;
  await pool.query(
    `INSERT INTO elevators (id, name, max_capacity, current_floor, direction, status, current_passengers, is_door_open)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (id) DO UPDATE SET
       max_capacity = EXCLUDED.max_capacity,
       current_floor = EXCLUDED.current_floor,
       direction = EXCLUDED.direction,
       status = EXCLUDED.status,
       current_passengers = EXCLUDED.current_passengers,
       is_door_open = EXCLUDED.is_door_open,
       updated_at = now()`,
    [id, `Elevator ${id}`, maxCapacity, currentFloor, direction, status, currentPassengers, isDoorOpen]
  );
}

async function logEvent(elevatorId, type, payload = {}) {
  try {
    await pool.query(
      `INSERT INTO events (elevator_id, type, payload) VALUES ($1,$2,$3)`,
      [elevatorId, type, payload]
    );
  } catch (err) {
    console.error('logEvent error', err);
  }
}

async function recordElevatorStatusChange(elevatorId, status, meta = {}) {
  try {
    await pool.query(
      `INSERT INTO elevator_status_history (elevator_id, status, meta) VALUES ($1,$2,$3)`,
      [elevatorId, status, meta]
    );
    await pool.query(
      `UPDATE elevators SET status = $2, updated_at = now() WHERE id = $1`,
      [elevatorId, status]
    );
  } catch (err) {
    console.error('recordElevatorStatusChange', err);
  }
}

async function createRequest({ floor, direction, passengers = 1, destination_floor = null }) {
  const { rows } = await pool.query(
    `INSERT INTO requests (floor, direction, passengers, destination_floor) VALUES ($1,$2,$3,$4) RETURNING *`,
    [floor, direction, passengers, destination_floor]
  );
  return rows[0];
}

async function createPassenger({ request_id, elevator_id = null, pickup_floor, destination_floor, count = 1 }) {
  const { rows } = await pool.query(
    `INSERT INTO passengers (request_id, elevator_id, pickup_floor, destination_floor, count) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [request_id, elevator_id, pickup_floor, destination_floor, count]
  );
  return rows[0];
}

async function createDestination({ elevator_id, floor, is_destination = false, expected_passengers = 0, pair_passenger_id = null }) {
  const { rows } = await pool.query(
    `INSERT INTO destinations (elevator_id, floor, is_destination, expected_passengers, pair_passenger_id)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [elevator_id, floor, is_destination, expected_passengers, pair_passenger_id]
  );
  return rows[0];
}

async function markPassengerOnboard(passengerId) {
  await pool.query(
    `UPDATE passengers SET status='onboard', boarded_at = now() WHERE id = $1`,
    [passengerId]
  );
}

async function markPassengerCompleted(passengerId) {
  await pool.query(
    `UPDATE passengers SET status='completed', alighted_at = now() WHERE id = $1`,
    [passengerId]
  );
}

async function markRequestServed(requestId) {
  await pool.query(
    `UPDATE requests SET status='served', updated_at = now() WHERE id = $1`,
    [requestId]
  );
}

class ElevatorSystem {
  constructor() {
    this.elevators = new Map();
    this.initializeElevators();
  }

  async initializeElevators() {
    this.elevators.set(1, {
      id: 1,
      currentFloor: 0,
      direction: 'idle',
      status: 'operational',
      maxCapacity: 8,
      currentPassengers: 0,
      isDoorOpen: false,
      destinations: [],
      passengerQueue: [] // Nouveau: file d'attente des passagers avec destinations
    });
    console.log('🚀 Système ascenseur initialisé');

    //persist initial elevator state + event 
    const elevator = this.elevators.get(1);
    await ensureElevatorRow(elevator).catch(() => {});
    logEvent(1, 'system_initialized', { currentFloor: elevator.currentFloor }).catch(() => {});
    recordElevatorStatusChange(1, elevator.status, { currentFloor: elevator.currentFloor }).catch(() => {});
  }

  // Nouvelle fonction: ajouter un passager avec destination
  async addPassenger(elevatorId, pickupFloor, destinationFloor, passengerCount = 1) {
    const elevator = this.elevators.get(elevatorId);
    if (!elevator) return false;

    // create request + passenger rows
    const req = await createRequest({ floor: pickupFloor, direction: destinationFloor > pickupFloor ? 'up' : 'down', passengers: passengerCount, destination_floor: destinationFloor });
    const passengerRow = await createPassenger({ request_id: req.id, elevator_id: elevatorId, pickup_floor: pickupFloor, destination_floor: destinationFloor, count: passengerCount });

    const pickupId = Date.now() + Math.random();
    const dropId = Date.now() + Math.random() + 1;

    const pickupDest = {
      floor: parseInt(pickupFloor, 10),
      isDestination: false,
      passengers: parseInt(passengerCount, 10) || 0,
      destination: parseInt(destinationFloor, 10),
      timestamp: Date.now(),
      id: pickupId,
      pairId: dropId // lien vers la drop
    };

    const dropDest = {
      floor: parseInt(destinationFloor, 10),
      isDestination: true,
      passengers: parseInt(passengerCount, 10) || 0,
      destination: null,
      timestamp: Date.now(),
      id: dropId,
      pairId: pickupId // lien vers la pickup
    };

    // enregistrer destinations en DB (basic append order — optimisation d'insertion est encore en mémoire)
    await createDestination({ elevator_id: elevatorId, floor: pickupDest.floor, is_destination: false, expected_passengers: pickupDest.passengers, pair_passenger_id: passengerRow.id }).catch(() => {});
    await createDestination({ elevator_id: elevatorId, floor: dropDest.floor, is_destination: true, expected_passengers: dropDest.passengers, pair_passenger_id: passengerRow.id }).catch(() => {});

    // Ajouter à la file d'attente logique
    elevator.passengerQueue.push({
      pickupFloor,
      destinationFloor,
      passengerCount,
      status: 'waiting',
      id: passengerRow.id
    });

    // Inserer pickup + drop en une opération avec contrainte : drop index > pickup index
    this.insertPairedDestinations(elevatorId, pickupDest, dropDest);

    console.log(`📝 Passager ajouté: ${pickupFloor} → ${destinationFloor} (${passengerCount} pers.)`);
    logEvent(elevatorId, 'passenger_added', { request: req, passenger: passengerRow }).catch(() => {});
    await ensureElevatorRow(elevator).catch(() => {});
    return true;
  }

  // Nouvelle fonction: ajouter une destination
  addDestination(elevatorId, floor, isDestination = false, passengers = 0, destination = null) {
    const elevator = this.elevators.get(elevatorId);
    if (!elevator) return null;

    const dest = {
      floor: parseInt(floor, 10),
      isDestination,
      passengers: parseInt(passengers, 10) || 0,
      destination: destination !== null ? parseInt(destination, 10) : null,
      timestamp: Date.now(),
      id: Date.now() + Math.random()
    };

    // Si pas de destinations existantes -> push et démarrer si idle
    if (elevator.destinations.length === 0) {
      elevator.destinations.push(dest);
      if (elevator.direction === 'idle') {
        const nextDest = elevator.destinations[0];
        elevator.direction = nextDest.floor > elevator.currentFloor ? 'up' : 'down';
        this.processElevatorMovement(elevatorId);
      }
      return dest;
    }

    // Fonction utilitaire : calcule la distance totale parcourue si on parcourt la séquence depuis currentFloor
    const totalRouteDistance = (startFloor, seq) => {
      let dist = 0;
      let curr = startFloor;
      for (let s of seq) {
        dist += Math.abs(curr - s.floor);
        curr = s.floor;
      }
      return dist;
    };

    // Tester toutes les positions d'insertion et choisir la meilleure (coût minimal)
    const currentFloor = elevator.currentFloor;
    const baseSeq = elevator.destinations.slice();
    let bestSeq = null;
    let bestCost = Infinity;

    for (let i = 0; i <= baseSeq.length; i++) {
      const testSeq = baseSeq.slice();
      testSeq.splice(i, 0, dest);
      const cost = totalRouteDistance(currentFloor, testSeq);
      if (cost < bestCost) {
        bestCost = cost;
        bestSeq = testSeq;
      }
    }

    // Appliquer la meilleure séquence trouvée
    elevator.destinations = bestSeq;

    // Si l'ascenseur était idle, démarrer le mouvement
    if (elevator.direction === 'idle' && elevator.destinations.length > 0) {
      const nextDest = elevator.destinations[0];
      elevator.direction = nextDest.floor > elevator.currentFloor ? 'up' : 'down';
      this.processElevatorMovement(elevatorId);
    }

    return dest;
  }

    // Helper: insérer deux destinations (pickup puis drop) en minimisant la distance totale
  insertPairedDestinations(elevatorId, pickupDest, dropDest) {
    const elevator = this.elevators.get(elevatorId);
    if (!elevator) return null;

    const totalRouteDistance = (startFloor, seq) => {
      let dist = 0;
      let curr = startFloor;
      for (let s of seq) {
        dist += Math.abs(curr - s.floor);
        curr = s.floor;
      }
      return dist;
    };

    const baseSeq = elevator.destinations.slice();
    const startFloor = elevator.currentFloor;

    let bestSeq = null;
    let bestCost = Infinity;

    // Parcourir toutes les positions i (pickup) et j (drop) avec j > i
    for (let i = 0; i <= baseSeq.length; i++) {
      for (let j = i + 1; j <= baseSeq.length + 1; j++) {
        const testSeq = baseSeq.slice();
        testSeq.splice(i, 0, pickupDest);
        // j doit tenir compte que pickup a été inséré (donc position +1 possible)
        testSeq.splice(j, 0, dropDest);
        const cost = totalRouteDistance(startFloor, testSeq);
        if (cost < bestCost) {
          bestCost = cost;
          bestSeq = testSeq;
        }
      }
    }

    // Appliquer la meilleure séquence
    if (bestSeq) {
      elevator.destinations = bestSeq;
    } else {
      // fallback: push à la fin en respectant l'ordre pickup->drop
      elevator.destinations.push(pickupDest);
      elevator.destinations.push(dropDest);
    }

    // Démarrer si idle
    if (elevator.direction === 'idle' && elevator.destinations.length > 0) {
      const nextDest = elevator.destinations[0];
      elevator.direction = nextDest.floor > elevator.currentFloor ? 'up' : 'down';
      this.processElevatorMovement(elevatorId);
    }

    return true;
  }

  async processElevatorMovement(elevatorId) {
    const elevator = this.elevators.get(elevatorId);
    
    while (elevator.destinations.length > 0) {
      const nextDest = elevator.destinations[0];
      
      // Mouvement vers la destination
      await this.moveToFloor(elevatorId, nextDest.floor);
      
      // Arrivé à destination
      await this.handleArrival(elevatorId, nextDest);
      
      // Retirer la destination traitée
      elevator.destinations = elevator.destinations.filter(d => d.id !== nextDest.id);
      
      // Mettre à jour la file des passagers
      this.updatePassengerQueue(elevatorId, nextDest);
    }
    
        // Plus de destinations → idle
    elevator.direction = 'idle';
    console.log(`⏹️ Ascenseur ${elevatorId} est maintenant IDLE`);
    logEvent(elevatorId, 'idle', { currentFloor: elevator.currentFloor }).catch(() => {});
    recordElevatorStatusChange(elevatorId, 'idle', { currentFloor: elevator.currentFloor }).catch(() => {});
    await ensureElevatorRow(elevator).catch(() => {});
  }

  async moveToFloor(elevatorId, targetFloor) {
    const elevator = this.elevators.get(elevatorId);
    const currentFloor = elevator.currentFloor;
    
    console.log(`🚀 Ascenseur ${elevatorId} se déplace de ${currentFloor} à ${targetFloor}`);
    logEvent(elevatorId, 'move_start', { from: currentFloor, to: targetFloor }).catch(() => {});
    recordElevatorStatusChange(elevatorId, 'moving', { from: currentFloor, to: targetFloor }).catch(() => {});
    await ensureElevatorRow(elevator).catch(() => {});

    // Simulation de mouvement
    let step = currentFloor;
    const increment = targetFloor > currentFloor ? 1 : -1;
    
    while (step !== targetFloor) {
      step += increment;
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s par étage
      elevator.currentFloor = step;
      console.log(`📊 Ascenseur ${elevatorId} maintenant à l'étage ${step}`);

      // log floor reached
      logEvent(elevatorId, 'floor_reached', { floor: step }).catch(() => {});
      await pool.query(`UPDATE elevators SET current_floor = $2, updated_at = now() WHERE id = $1`, [elevatorId, step]).catch(() => {});
    }

    logEvent(elevatorId, 'move_end', { at: targetFloor }).catch(() => {});
    await ensureElevatorRow(elevator).catch(() => {});
  }

  async handleArrival(elevatorId, arrival) {
    const elevator = this.elevators.get(elevatorId);
    
    console.log(`🎯 Arrivée à l'étage ${arrival.floor}`);
    logEvent(elevatorId, 'arrival', { floor: arrival.floor, arrival }).catch(() => {});

    // Ouvrir les portes
    elevator.isDoorOpen = true;
    await pool.query(`UPDATE elevators SET is_door_open = true WHERE id = $1`, [elevatorId]).catch(() => {});
    console.log(`🚪 Portes ouvertes à l'étage ${arrival.floor}`);
    
    // Attendre 2 secondes pour l'embarquement/débarquement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Si c'est une DESTINATION (débarquement)
    if (arrival.isDestination) {
      console.log(`👋 ${arrival.passengers} passager(s) descendent`);
      elevator.currentPassengers = Math.max(0, elevator.currentPassengers - arrival.passengers);
      // marquer passagers complétés en DB pour cet étage (simple heuristic: match by destination_floor)
      const passengersToComplete = await pool.query(
        `SELECT id FROM passengers WHERE destination_floor = $1 AND status = 'onboard' AND elevator_id = $2`,
        [arrival.floor, elevatorId]
      ).catch(() => ({ rows: [] }));
      for (const p of (passengersToComplete.rows || [])) {
        await markPassengerCompleted(p.id).catch(() => {});
        logEvent(elevatorId, 'passenger_alighted', { passengerId: p.id, floor: arrival.floor }).catch(() => {});
      }
    }
    
    // Si c'est un PICKUP (embarquement)
    else if (arrival.destination !== null) {
      console.log(`👥 ${arrival.passengers} passager(s) montent, destination: ${arrival.destination}`);

      // trouver waiting passengers at this pickup and assign to this elevator
      const waitingPassengers = await pool.query(
        `SELECT id FROM passengers WHERE pickup_floor = $1 AND status = 'waiting' ORDER BY requested_at LIMIT $2`,
        [arrival.floor, arrival.passengers]
      ).catch(() => ({ rows: [] }));

      for (const p of (waitingPassengers.rows || [])) {
        await pool.query(`UPDATE passengers SET status='onboard', elevator_id=$2, boarded_at = now() WHERE id = $1`, [p.id, elevatorId]).catch(() => {});
        await pool.query(`UPDATE requests SET assigned_elevator = $2, updated_at = now() WHERE id = (SELECT request_id FROM passengers WHERE id = $1)`, [p.id, elevatorId]).catch(() => {});
        logEvent(elevatorId, 'passenger_boarded', { passengerId: p.id, pickupFloor: arrival.floor, destination: arrival.destination }).catch(() => {});
      }

      elevator.currentPassengers = Math.min(
        elevator.maxCapacity,
        elevator.currentPassengers + arrival.passengers
      );

      // ensure drop destination exists in DB (createDestination)
      await createDestination({ elevator_id: elevatorId, floor: arrival.destination, is_destination: true, expected_passengers: arrival.passengers }).catch(() => {});
    }
    
    console.log(`📊 Occupation: ${elevator.currentPassengers}/${elevator.maxCapacity}`);
    
    // Fermer les portes
    elevator.isDoorOpen = false;
    await pool.query(`UPDATE elevators SET is_door_open = false, current_passengers = $2 WHERE id = $1`, [elevatorId, elevator.currentPassengers]).catch(() => {});
    console.log(`🚪 Portes fermées à l'étage ${arrival.floor}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await ensureElevatorRow(elevator).catch(() => {});
  }

  updatePassengerQueue(elevatorId, arrival) {
    const elevator = this.elevators.get(elevatorId);

    if (arrival.isDestination) {
      // Marquer les passagers comme arrivés en mémoire
      elevator.passengerQueue = elevator.passengerQueue.filter(passenger =>
        passenger.destinationFloor !== arrival.floor
      );
    } else {
      // Marquer les passagers comme embarqués en mémoire
      elevator.passengerQueue = elevator.passengerQueue.map(passenger => {
        if (passenger.pickupFloor === arrival.floor && passenger.status === 'waiting') {
          // also update DB passenger status
          markPassengerOnboard(passenger.id).catch(() => {});
          return { ...passenger, status: 'onboard' };
        }
        return passenger;
      });
    }
  }

  getElevatorStatus(elevatorId) {
    const elevator = this.elevators.get(elevatorId);
    if (!elevator) return null;
    
    return {
      id: elevator.id,
      currentFloor: elevator.currentFloor,
      direction: elevator.direction,
      status: elevator.status,
      maxCapacity: elevator.maxCapacity,
      currentPassengers: elevator.currentPassengers,
      isDoorOpen: elevator.isDoorOpen,
      destinations: elevator.destinations,
      passengerQueue: elevator.passengerQueue
    };
  }
}

const elevatorSystem = new ElevatorSystem();

// API Routes
app.get('/api/elevator/:id?', async (req, res) => {
  const elevatorId = req.params.id || 1;
  const status = elevatorSystem.getElevatorStatus(parseInt(elevatorId));
  
  if (status) {
    // also enrich with DB elevator row
    const { rows } = await pool.query(`SELECT * FROM elevators WHERE id = $1`, [elevatorId]).catch(() => ({ rows: [] }));
    const dbRow = rows[0] || null;
    res.json({ success: true, elevator: status, db: dbRow });
  } else {
    res.status(404).json({ success: false, message: 'Elevator not found' });
  }
});


// Get all active requests
// app.get('/api/requests', (req, res) => {
//   try {
//     // Si vous utilisez la version simple sans database
//     const activeRequests = elevatorSystem.getPendingCalls ? elevatorSystem.getPendingCalls() : [];
    
//     res.json({
//       success: true,
//       requests: activeRequests.map(call => ({
//         id: call.id || Date.now(),
//         floor: call.floor,
//         direction: call.direction,
//         passengers: call.passengers || 1,
//         destination: call.destination,
//         status: call.status || 'pending',
//         isDestination: false, // Vous pouvez ajuster cette logique
//         waitingTime: Date.now() - (call.timestamp || Date.now())
//       }))
//     });
//   } catch (error) {
//     console.error('Error getting requests:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error getting requests' 
//     });
//   }
// });

// Get requests from DB
app.get('/api/requests', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM requests ORDER BY created_at DESC LIMIT 100`);
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ success: false, message: 'Error getting requests' });
  }
});

// Nouvel appel avec gestion des passagers
app.post('/api/call', async (req, res) => {
  try {
    const { floor, direction, passengers = 1, destination } = req.body;

    if (floor === undefined || direction === undefined || destination === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Floor, direction and destination are required'
      });
    }

    // persist request + passenger + schedule
    const success = await elevatorSystem.addPassenger(1, floor, destination, passengers);

    if (success) {
      res.json({
        success: true,
        message: `Appel enregistré: ${floor} → ${destination} (${passengers} pers.)`
      });
    } else {
      res.status(500).json({ success: false, message: 'Failed to add passenger' });
    }
  } catch (error) {
    console.error('Error processing call:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Récupérer la file d'attente des passagers (en DB)
app.get('/api/passengers', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM passengers ORDER BY requested_at DESC LIMIT 200`);
    res.json({ success: true, passengers: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting passengers'
    });
  }
});

// Get event history
app.get('/api/events', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM events ORDER BY created_at DESC LIMIT 1000`);
    res.json({ success: true, events: rows });
  } catch (err) {
    console.error('Error fetching events', err);
    res.status(500).json({ success: false, message: 'Error fetching events' });
  }
});

app.post('/api/reset', async (req, res) => {
  await elevatorSystem.initializeElevators();
  await logEvent(1, 'system_reset', { timestamp: Date.now() }).catch(() => {});
  res.json({ success: true, message: 'Système réinitialisé' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible à http://localhost:${PORT}`);
});