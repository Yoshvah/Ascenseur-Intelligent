import { useState, useEffect, useCallback } from 'react';

export const useElevator = (initialFloors = 10, maxCapacity = 6) => {
  const [elevatorPosition, setElevatorPosition] = useState(0);
  const [elevatorDirection, setElevatorDirection] = useState('idle');
  const [requests, setRequests] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [floors] = useState(initialFloors);
  const [elevatorStatus, setElevatorStatus] = useState('Arrêté');
  const [currentPassengers, setCurrentPassengers] = useState(0);
  const [maxPassengers] = useState(maxCapacity);
  const [floorCalls, setFloorCalls] = useState({});
  const [passengerDestinations, setPassengerDestinations] = useState({});
  const [pendingCall, setPendingCall] = useState(null);
const [animations, setAnimations] = useState({
  doorsOpening: false,
  doorsClosing: false,
  passengersEntering: 0,
  passengersLeaving: 0
});

  // Initialize floor calls
  useEffect(() => {
    const initialCalls = {};
    for (let i = 0; i < floors; i++) {
      initialCalls[i] = { up: false, down: false, passengers: 0, destination: null };
    }
    setFloorCalls(initialCalls);
  }, [floors]);

  const processNextRequest = useCallback(() => {
    if (requests.length === 0 || isMoving) return;

    setIsMoving(true);
    const nextFloor = requests[0];
    
    if (nextFloor > elevatorPosition) {
      setElevatorDirection('up');
      setElevatorStatus('Montée ↑');
    } else if (nextFloor < elevatorPosition) {
      setElevatorDirection('down');
      setElevatorStatus('Descente ↓');
    } else {
      handleArrivalAtFloor(nextFloor);
      return;
    }

    const travelTime = Math.abs(nextFloor - elevatorPosition) * 600; // Animation plus fluide
    
    setTimeout(() => {
      setElevatorPosition(nextFloor);
      handleArrivalAtFloor(nextFloor);
    }, travelTime);
  }, [requests, isMoving, elevatorPosition]);

  const animateDoors = (action) => {
    return new Promise((resolve) => {
      if (action === 'open') {
        setAnimations(prev => ({ ...prev, doorsOpening: true, doorsClosing: false }));
        setTimeout(() => resolve(), 800);
      } else {
        setAnimations(prev => ({ ...prev, doorsOpening: false, doorsClosing: true }));
        setTimeout(() => resolve(), 600);
      }
    });
  };

  const animatePassengers = (action, count) => {
    return new Promise((resolve) => {
      if (action === 'enter') {
        setAnimations(prev => ({ ...prev, passengersEntering: count }));
        setTimeout(() => {
          setAnimations(prev => ({ ...prev, passengersEntering: 0 }));
          resolve();
        }, 1200);
      } else {
        setAnimations(prev => ({ ...prev, passengersLeaving: count }));
        setTimeout(() => {
          setAnimations(prev => ({ ...prev, passengersLeaving: 0 }));
          resolve();
        }, 1000);
      }
    });
  };

  const handleArrivalAtFloor = async (floor) => {
    const floorCall = floorCalls[floor];
    const hasCall = floorCall && (floorCall.up || floorCall.down);
    
    // Vérifier si des passagers doivent descendre à cet étage
    const passengersGettingOff = Object.values(passengerDestinations).filter(dest => dest === floor).length;
    
    if (passengersGettingOff > 0 || (hasCall && floorCall.passengers > 0 && currentPassengers < maxPassengers)) {
      setElevatorStatus('🔓 Ouverture des portes...');
      
      // Animation ouverture portes
      await animateDoors('open');
      
      let newPassengerCount = currentPassengers;
      let totalActions = 0;
      
      // Faire descendre les passagers
      if (passengersGettingOff > 0) {
        setElevatorStatus(`👋 ${passengersGettingOff} passager(s) sortent...`);
        await animatePassengers('leave', passengersGettingOff);
        
        newPassengerCount -= passengersGettingOff;
        setPassengerDestinations(prev => {
          const newDestinations = { ...prev };
          Object.keys(newDestinations).forEach(key => {
            if (newDestinations[key] === floor) {
              delete newDestinations[key];
            }
          });
          return newDestinations;
        });
        totalActions += passengersGettingOff;
      }
      
      // Faire monter les nouveaux passagers si possible
      if (hasCall && floorCall.passengers > 0) {
        const availableSpace = maxPassengers - newPassengerCount;
        const passengersToBoard = Math.min(availableSpace, floorCall.passengers);
        
        if (passengersToBoard > 0) {
          setElevatorStatus(`👥 ${passengersToBoard} passager(s) montent...`);
          await animatePassengers('enter', passengersToBoard);
          
          newPassengerCount += passengersToBoard;
          
          // Ajouter les destinations des nouveaux passagers
          const newDestinations = {};
          for (let i = 0; i < passengersToBoard; i++) {
            newDestinations[`passenger_${Date.now()}_${i}`] = floorCall.destination;
          }
          setPassengerDestinations(prev => ({ ...prev, ...newDestinations }));
          
          // Mettre à jour l'appel d'étage
          setFloorCalls(prev => ({
            ...prev,
            [floor]: { 
              up: false, 
              down: false, 
              passengers: 0, 
              destination: null 
            }
          }));
          totalActions += passengersToBoard;
        }
      }
      
      setCurrentPassengers(newPassengerCount);
      
      // Animation fermeture portes
      setElevatorStatus('🔒 Fermeture des portes...');
      await animateDoors('close');
      
      setElevatorDirection('idle');
      setElevatorStatus(totalActions > 0 ? '✅ Transfert terminé' : 'Arrêté');
      setRequests(prev => prev.slice(1));
      setIsMoving(false);
    } else {
      // Aucune action à cet étage - passage sans arrêt
      if (hasCall && floorCall.passengers > 0) {
        setElevatorStatus(`🚫 Complet - Passage étage ${floor}`);
        // Garder l'appel actif pour plus tard
      } else {
        setElevatorStatus('➡️ Passage sans arrêt');
      }
      
      setTimeout(() => {
        setElevatorDirection('idle');
        setElevatorStatus('Arrêté');
        setRequests(prev => prev.slice(1));
        setIsMoving(false);
      }, 800);
    }
  };

  useEffect(() => {
    if (requests.length > 0 && !isMoving) {
      processNextRequest();
    }
  }, [requests, isMoving, processNextRequest]);

  const requestElevator = useCallback((floor, direction = null, passengers = 0, destination = null) => {
    if (!requests.includes(floor)) {
      setRequests(prev => [...prev, floor]);
    }
    
    if (direction && passengers > 0 && destination !== null) {
      setFloorCalls(prev => ({
        ...prev,
        [floor]: {
          ...prev[floor],
          [direction]: true,
          passengers: passengers,
          destination: destination
        }
      }));
    }
  }, [requests]);

  const callElevatorFromFloor = useCallback((floor, direction) => {
    setPendingCall({ floor, direction });
  }, []);

  const confirmCall = useCallback((passengers, destination) => {
    if (pendingCall) {
      requestElevator(pendingCall.floor, pendingCall.direction, passengers, destination);
      setPendingCall(null);
    }
  }, [pendingCall, requestElevator]);

  const cancelCall = useCallback(() => {
    setPendingCall(null);
  }, []);

  const getDirectionIcon = () => {
    switch(elevatorDirection) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '●';
    }
  };

  const isElevatorFull = currentPassengers >= maxPassengers;

  return {
    elevatorPosition,
    elevatorDirection,
    requests,
    isMoving,
    floors,
    elevatorStatus,
    currentPassengers,
    maxPassengers,
    floorCalls,
    passengerDestinations,
    pendingCall,
    animations,
    requestElevator,
    callElevatorFromFloor,
    confirmCall,
    cancelCall,
    getDirectionIcon,
    isElevatorFull
  };
};