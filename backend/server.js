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

// NEW: Helper function to clean up completed destinations
async function markDestinationCompleted(elevatorId, floor, isDestination) {
  await pool.query(
    `UPDATE destinations 
     SET completed_at = now() 
     WHERE elevator_id = $1 
       AND floor = $2 
       AND is_destination = $3 
       AND completed_at IS NULL`,
    [elevatorId, floor, isDestination]
  );
}

// NEW: Clean up completed requests
async function cleanupCompletedRequests() {
  try {
    const result = await pool.query(`
      UPDATE requests r
      SET status = 'served', updated_at = now()
      WHERE r.status IN ('pending', 'assigned')
        AND NOT EXISTS (
          SELECT 1 FROM passengers p 
          WHERE p.request_id = r.id 
          AND p.status != 'completed'
        )
      RETURNING id;
    `);
    
    if (result.rowCount > 0) {
      console.log(`✅ ${result.rowCount} requête(s) marquée(s) comme servie(s)`);
    }
    
    return result.rows;
  } catch (error) {
    console.error('Error cleaning up completed requests:', error);
    return [];
  }
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
      passengerQueue: []
    });
    console.log('🚀 Système ascenseur initialisé');

    //persist initial elevator state + event 
    const elevator = this.elevators.get(1);
    await ensureElevatorRow(elevator).catch(() => {});
    logEvent(1, 'system_initialized', { currentFloor: elevator.currentFloor }).catch(() => {});
    recordElevatorStatusChange(1, elevator.status, { currentFloor: elevator.currentFloor }).catch(() => {});
  }

  async addPassenger(elevatorId, pickupFloor, destinationFloor, passengerCount = 1) {
    const elevator = this.elevators.get(elevatorId);
    if (!elevator) return false;

    // create request + passenger rows
    const req = await createRequest({ 
      floor: pickupFloor, 
      direction: destinationFloor > pickupFloor ? 'up' : 'down', 
      passengers: passengerCount, 
      destination_floor: destinationFloor 
    });
    const passengerRow = await createPassenger({ 
      request_id: req.id, 
      elevator_id: elevatorId, 
      pickup_floor: pickupFloor, 
      destination_floor: destinationFloor, 
      count: passengerCount 
    });

    const pickupId = Date.now() + Math.random();
    const dropId = Date.now() + Math.random() + 1;

    const pickupDest = {
      floor: parseInt(pickupFloor, 10),
      isDestination: false,
      passengers: parseInt(passengerCount, 10) || 0,
      destination: parseInt(destinationFloor, 10),
      timestamp: Date.now(),
      id: pickupId,
      pairId: dropId,
      requestId: req.id,
      passengerId: passengerRow.id
    };

    const dropDest = {
      floor: parseInt(destinationFloor, 10),
      isDestination: true,
      passengers: parseInt(passengerCount, 10) || 0,
      destination: null,
      timestamp: Date.now(),
      id: dropId,
      pairId: pickupId,
      requestId: req.id,
      passengerId: passengerRow.id
    };

    // enregistrer destinations en DB
    await createDestination({ 
      elevator_id: elevatorId, 
      floor: pickupDest.floor, 
      is_destination: false, 
      expected_passengers: pickupDest.passengers, 
      pair_passenger_id: passengerRow.id 
    }).catch(() => {});
    
    await createDestination({ 
      elevator_id: elevatorId, 
      floor: dropDest.floor, 
      is_destination: true, 
      expected_passengers: dropDest.passengers, 
      pair_passenger_id: passengerRow.id 
    }).catch(() => {});

    // Ajouter à la file d'attente logique
    elevator.passengerQueue.push({
      pickupFloor,
      destinationFloor,
      passengerCount,
      status: 'waiting',
      id: passengerRow.id,
      requestId: req.id
    });

    // Inserer pickup + drop en une opération avec contrainte : drop index > pickup index
    this.insertPairedDestinations(elevatorId, pickupDest, dropDest);

    console.log(`📝 Passager ajouté: ${pickupFloor} → ${destinationFloor} (${passengerCount} pers.)`);
    logEvent(elevatorId, 'passenger_added', { 
      request: req, 
      passenger: passengerRow,
      pickupFloor,
      destinationFloor 
    }).catch(() => {});
    
    await ensureElevatorRow(elevator).catch(() => {});
    return true;
  }

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

    if (elevator.destinations.length === 0) {
      elevator.destinations.push(dest);
      if (elevator.direction === 'idle') {
        const nextDest = elevator.destinations[0];
        elevator.direction = nextDest.floor > elevator.currentFloor ? 'up' : 'down';
        this.processElevatorMovement(elevatorId);
      }
      return dest;
    }

    const totalRouteDistance = (startFloor, seq) => {
      let dist = 0;
      let curr = startFloor;
      for (let s of seq) {
        dist += Math.abs(curr - s.floor);
        curr = s.floor;
      }
      return dist;
    };

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

    elevator.destinations = bestSeq;

    if (elevator.direction === 'idle' && elevator.destinations.length > 0) {
      const nextDest = elevator.destinations[0];
      elevator.direction = nextDest.floor > elevator.currentFloor ? 'up' : 'down';
      this.processElevatorMovement(elevatorId);
    }

    return dest;
  }

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

    for (let i = 0; i <= baseSeq.length; i++) {
      for (let j = i + 1; j <= baseSeq.length + 1; j++) {
        const testSeq = baseSeq.slice();
        testSeq.splice(i, 0, pickupDest);
        testSeq.splice(j, 0, dropDest);
        const cost = totalRouteDistance(startFloor, testSeq);
        if (cost < bestCost) {
          bestCost = cost;
          bestSeq = testSeq;
        }
      }
    }

    if (bestSeq) {
      elevator.destinations = bestSeq;
    } else {
      elevator.destinations.push(pickupDest);
      elevator.destinations.push(dropDest);
    }

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
      
      await this.moveToFloor(elevatorId, nextDest.floor);
      await this.handleArrival(elevatorId, nextDest);
      
      elevator.destinations = elevator.destinations.filter(d => d.id !== nextDest.id);
      this.updatePassengerQueue(elevatorId, nextDest);
      
      // NEW: Clean up completed requests after each arrival
      await cleanupCompletedRequests();
    }
    
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

    let step = currentFloor;
    const increment = targetFloor > currentFloor ? 1 : -1;
    
    while (step !== targetFloor) {
      step += increment;
      await new Promise(resolve => setTimeout(resolve, 1000));
      elevator.currentFloor = step;
      console.log(`📊 Ascenseur ${elevatorId} maintenant à l'étage ${step}`);

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

    // Marquer la destination comme complétée dans la DB
    await markDestinationCompleted(elevatorId, arrival.floor, arrival.isDestination).catch(() => {});

    // Ouvrir les portes
    elevator.isDoorOpen = true;
    await pool.query(`UPDATE elevators SET is_door_open = true WHERE id = $1`, [elevatorId]).catch(() => {});
    console.log(`🚪 Portes ouvertes à l'étage ${arrival.floor}`);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (arrival.isDestination) {
      console.log(`👋 ${arrival.passengers} passager(s) descendent`);
      elevator.currentPassengers = Math.max(0, elevator.currentPassengers - arrival.passengers);
      
      // NEW: Get passengers and their request IDs
      const passengersToComplete = await pool.query(
        `SELECT p.id, p.request_id FROM passengers p 
         WHERE p.destination_floor = $1 
           AND p.status = 'onboard' 
           AND p.elevator_id = $2`,
        [arrival.floor, elevatorId]
      ).catch(() => ({ rows: [] }));
      
      for (const p of passengersToComplete.rows) {
        await markPassengerCompleted(p.id).catch(() => {});
        
        // NEW: Check if all passengers from this request have completed
        if (p.request_id) {
          const remainingPassengers = await pool.query(
            `SELECT COUNT(*) FROM passengers 
             WHERE request_id = $1 AND status != 'completed'`,
            [p.request_id]
          ).catch(() => ({ rows: [{ count: '0' }] }));
          
          if (parseInt(remainingPassengers.rows[0].count) === 0) {
            await markRequestServed(p.request_id).catch(() => {});
            console.log(`✅ Tous les passagers de la requête ${p.request_id} sont arrivés`);
          }
        }
        
        logEvent(elevatorId, 'passenger_alighted', { 
          passengerId: p.id, 
          floor: arrival.floor,
          requestId: p.request_id 
        }).catch(() => {});
      }
    } else if (arrival.destination !== null) {
      console.log(`👥 ${arrival.passengers} passager(s) montent, destination: ${arrival.destination}`);

      const waitingPassengers = await pool.query(
        `SELECT id, request_id FROM passengers 
         WHERE pickup_floor = $1 
           AND status = 'waiting' 
         ORDER BY requested_at 
         LIMIT $2`,
        [arrival.floor, arrival.passengers]
      ).catch(() => ({ rows: [] }));

      for (const p of waitingPassengers.rows) {
        await pool.query(
          `UPDATE passengers 
           SET status='onboard', elevator_id=$2, boarded_at = now() 
           WHERE id = $1`,
          [p.id, elevatorId]
        ).catch(() => {});
        
        await pool.query(
          `UPDATE requests 
           SET assigned_elevator = $2, status='assigned', updated_at = now() 
           WHERE id = $1`,
          [p.request_id, elevatorId]
        ).catch(() => {});
        
        logEvent(elevatorId, 'passenger_boarded', { 
          passengerId: p.id, 
          requestId: p.request_id,
          pickupFloor: arrival.floor, 
          destination: arrival.destination 
        }).catch(() => {});
      }

      elevator.currentPassengers = Math.min(
        elevator.maxCapacity,
        elevator.currentPassengers + arrival.passengers
      );

      await createDestination({ 
        elevator_id: elevatorId, 
        floor: arrival.destination, 
        is_destination: true, 
        expected_passengers: arrival.passengers 
      }).catch(() => {});
    }
    
    console.log(`📊 Occupation: ${elevator.currentPassengers}/${elevator.maxCapacity}`);
    
    elevator.isDoorOpen = false;
    await pool.query(
      `UPDATE elevators SET is_door_open = false, current_passengers = $2 WHERE id = $1`,
      [elevatorId, elevator.currentPassengers]
    ).catch(() => {});
    
    console.log(`🚪 Portes fermées à l'étage ${arrival.floor}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await ensureElevatorRow(elevator).catch(() => {});
  }

  updatePassengerQueue(elevatorId, arrival) {
    const elevator = this.elevators.get(elevatorId);

    if (arrival.isDestination) {
      elevator.passengerQueue = elevator.passengerQueue.filter(passenger =>
        passenger.destinationFloor !== arrival.floor
      );
    } else {
      elevator.passengerQueue = elevator.passengerQueue.map(passenger => {
        if (passenger.pickupFloor === arrival.floor && passenger.status === 'waiting') {
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
    const { rows } = await pool.query(`SELECT * FROM elevators WHERE id = $1`, [elevatorId]).catch(() => ({ rows: [] }));
    const dbRow = rows[0] || null;
    res.json({ success: true, elevator: status, db: dbRow });
  } else {
    res.status(404).json({ success: false, message: 'Elevator not found' });
  }
});

// Get only pending/assigned requests (not served)
app.get('/api/requests', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM requests 
       WHERE status IN ('pending', 'assigned') 
       ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ success: false, message: 'Error getting requests' });
  }
});

// Get all requests (including served)
app.get('/api/requests/all', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM requests ORDER BY created_at DESC LIMIT 100`
    );
    res.json({ success: true, requests: rows });
  } catch (error) {
    console.error('Error getting all requests:', error);
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
    const { rows } = await pool.query(
      `SELECT * FROM passengers 
       WHERE status != 'completed' 
       ORDER BY requested_at DESC LIMIT 200`
    );
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

// NEW: Clean up completed requests endpoint
app.post('/api/cleanup', async (req, res) => {
  try {
    const cleaned = await cleanupCompletedRequests();
    res.json({ 
      success: true, 
      message: 'Nettoyage terminé',
      cleaned: cleaned 
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ success: false, message: 'Error during cleanup' });
  }
});

// NEW: Debug endpoint to see all data
app.get('/api/debug', async (req, res) => {
  try {
    const [requests, passengers, elevator, destinations] = await Promise.all([
      pool.query(`SELECT * FROM requests ORDER BY created_at DESC`),
      pool.query(`SELECT * FROM passengers ORDER BY requested_at DESC`),
      pool.query(`SELECT * FROM elevators WHERE id = 1`),
      pool.query(`SELECT * FROM destinations ORDER BY created_at DESC`)
    ]);
    
    res.json({
      success: true,
      requests: requests.rows,
      passengers: passengers.rows,
      elevator: elevator.rows[0],
      destinations: destinations.rows,
      activeRequests: requests.rows.filter(r => r.status !== 'served').length,
      activePassengers: passengers.rows.filter(p => p.status !== 'completed').length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reset', async (req, res) => {
  await elevatorSystem.initializeElevators();
  
  // NEW: Reset all requests and passengers
  await pool.query(`UPDATE requests SET status = 'cancelled', updated_at = now()`).catch(() => {});
  await pool.query(`UPDATE passengers SET status = 'cancelled'`).catch(() => {});
  await pool.query(`DELETE FROM destinations`).catch(() => {});
  
  await logEvent(1, 'system_reset', { timestamp: Date.now() }).catch(() => {});
  res.json({ success: true, message: 'Système réinitialisé' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible à http://localhost:${PORT}`);
  
  // Schedule periodic cleanup every 30 seconds
  setInterval(async () => {
    try {
      await cleanupCompletedRequests();
    } catch (error) {
      console.error('Error in scheduled cleanup:', error);
    }
  }, 30000);
});