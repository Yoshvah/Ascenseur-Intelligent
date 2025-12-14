const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

class ElevatorSystem {
  constructor() {
    this.elevators = new Map();
    this.initializeElevators();
  }

  initializeElevators() {
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
  }

  // Nouvelle fonction: ajouter un passager avec destination
  addPassenger(elevatorId, pickupFloor, destinationFloor, passengerCount = 1) {
    const elevator = this.elevators.get(elevatorId);
    
    if (!elevator) return false;
    
    // Ajouter à la file d'attente
    elevator.passengerQueue.push({
      pickupFloor,
      destinationFloor,
      passengerCount,
      status: 'waiting', // waiting, onboard, completed
      id: Date.now()
    });
    
    // Ajouter le pickup à destinations
    this.addDestination(elevatorId, pickupFloor, false, passengerCount, destinationFloor);
    
    console.log(`📝 Passager ajouté: ${pickupFloor} → ${destinationFloor} (${passengerCount} pers.)`);
    return true;
  }

  // Nouvelle fonction: ajouter une destination
  addDestination(elevatorId, floor, isDestination = false, passengers = 0, destination = null) {
    const elevator = this.elevators.get(elevatorId);
    
    const dest = {
      floor: parseInt(floor),
      isDestination,
      passengers: parseInt(passengers),
      destination: destination !== null ? parseInt(destination) : null,
      timestamp: Date.now(),
      id: Date.now() + Math.random()
    };
    
    elevator.destinations.push(dest);
    
    // Trier selon la direction
    if (elevator.direction === 'up' || elevator.direction === 'idle') {
      elevator.destinations.sort((a, b) => a.floor - b.floor);
    } else {
      elevator.destinations.sort((a, b) => b.floor - a.floor);
    }
    
    // Démarre le mouvement si idle
    if (elevator.direction === 'idle' && elevator.destinations.length > 0) {
      const nextDest = elevator.destinations[0];
      elevator.direction = nextDest.floor > elevator.currentFloor ? 'up' : 'down';
      this.processElevatorMovement(elevatorId);
    }
    
    return dest;
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
  }

  async moveToFloor(elevatorId, targetFloor) {
    const elevator = this.elevators.get(elevatorId);
    const currentFloor = elevator.currentFloor;
    
    console.log(`🚀 Ascenseur ${elevatorId} se déplace de ${currentFloor} à ${targetFloor}`);
    
    // Simulation de mouvement
    let step = currentFloor;
    const increment = targetFloor > currentFloor ? 1 : -1;
    
    while (step !== targetFloor) {
      step += increment;
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s par étage
      elevator.currentFloor = step;
      console.log(`📊 Ascenseur ${elevatorId} maintenant à l'étage ${step}`);
    }
  }

  async handleArrival(elevatorId, arrival) {
    const elevator = this.elevators.get(elevatorId);
    
    console.log(`🎯 Arrivée à l'étage ${arrival.floor}`);
    
    // Ouvrir les portes
    elevator.isDoorOpen = true;
    console.log(`🚪 Portes ouvertes à l'étage ${arrival.floor}`);
    
    // Attendre 2 secondes pour l'embarquement/débarquement
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Si c'est une DESTINATION (débarquement)
    if (arrival.isDestination) {
      console.log(`👋 ${arrival.passengers} passager(s) descendent`);
      elevator.currentPassengers = Math.max(0, elevator.currentPassengers - arrival.passengers);
    } 
    // Si c'est un PICKUP (embarquement)
    else if (arrival.destination !== null) {
      console.log(`👥 ${arrival.passengers} passager(s) montent, destination: ${arrival.destination}`);
      elevator.currentPassengers = Math.min(
        elevator.maxCapacity, 
        elevator.currentPassengers + arrival.passengers
      );
      
      // Ajouter la destination des nouveaux passagers
      this.addDestination(elevatorId, arrival.destination, true, arrival.passengers);
    }
    
    console.log(`📊 Occupation: ${elevator.currentPassengers}/${elevator.maxCapacity}`);
    
    // Fermer les portes
    elevator.isDoorOpen = false;
    console.log(`🚪 Portes fermées à l'étage ${arrival.floor}`);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  updatePassengerQueue(elevatorId, arrival) {
    const elevator = this.elevators.get(elevatorId);
    
    if (arrival.isDestination) {
      // Marquer les passagers comme arrivés
      elevator.passengerQueue = elevator.passengerQueue.filter(passenger => 
        passenger.destinationFloor !== arrival.floor
      );
    } else {
      // Marquer les passagers comme embarqués
      elevator.passengerQueue = elevator.passengerQueue.map(passenger => {
        if (passenger.pickupFloor === arrival.floor && passenger.status === 'waiting') {
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
app.get('/api/elevator/:id?', (req, res) => {
  const elevatorId = req.params.id || 1;
  const status = elevatorSystem.getElevatorStatus(parseInt(elevatorId));
  
  if (status) {
    res.json({ success: true, elevator: status });
  } else {
    res.status(404).json({ success: false, message: 'Elevator not found' });
  }
});

// Dans votre server.js, ajoutez cette route:

// Get all active requests
app.get('/api/requests', (req, res) => {
  try {
    // Si vous utilisez la version simple sans database
    const activeRequests = elevatorSystem.getPendingCalls ? elevatorSystem.getPendingCalls() : [];
    
    res.json({
      success: true,
      requests: activeRequests.map(call => ({
        id: call.id || Date.now(),
        floor: call.floor,
        direction: call.direction,
        passengers: call.passengers || 1,
        destination: call.destination,
        status: call.status || 'pending',
        isDestination: false, // Vous pouvez ajuster cette logique
        waitingTime: Date.now() - (call.timestamp || Date.now())
      }))
    });
  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting requests' 
    });
  }
});

// Nouvel appel avec gestion des passagers
app.post('/api/call', (req, res) => {
  try {
    const { floor, direction, passengers = 1, destination } = req.body;
    
    if (floor === undefined || direction === undefined || destination === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'Floor, direction and destination are required' 
      });
    }
    
    // Ajouter le passager avec sa destination
    const success = elevatorSystem.addPassenger(1, floor, destination, passengers);
    
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

// Récupérer la file d'attente des passagers
app.get('/api/passengers', (req, res) => {
  try {
    const elevator = elevatorSystem.elevators.get(1);
    if (!elevator) {
      return res.json({ success: true, passengers: [] });
    }
    
    res.json({ success: true, passengers: elevator.passengerQueue });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error getting passengers' 
    });
  }
});

app.post('/api/reset', (req, res) => {
  elevatorSystem.initializeElevators();
  res.json({ success: true, message: 'Système réinitialisé' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📡 API disponible à http://localhost:${PORT}`);
});