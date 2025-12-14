import React, { useState, useEffect, useCallback } from 'react';
import BuildingVisualization from './components/BuildingVisualization';
import ControlPanel from './components/ControlPanel';
import CallModal from './components/CallModal';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [floors] = useState(10);
  const [maxPassengers] = useState(8);
  const [elevatorPosition, setElevatorPosition] = useState(0);
  const [elevatorDirection, setElevatorDirection] = useState('idle');
  const [elevatorStatus, setElevatorStatus] = useState('En attente');
  const [requests, setRequests] = useState([]);
  const [pendingCall, setPendingCall] = useState(null);
  const [currentPassengers, setCurrentPassengers] = useState(0);
  const [floorCalls, setFloorCalls] = useState({});
  const [passengerDestinations, setPassengerDestinations] = useState({});
  const [animations, setAnimations] = useState({
    doorsOpening: false,
    doorsClosing: false,
    passengersEntering: 0,
    passengersLeaving: 0
  });
  const [elevatorData, setElevatorData] = useState(null);
  const [activeRequests, setActiveRequests] = useState([]);
  const [backendConnected, setBackendConnected] = useState(false);
  const [algorithmCost, setAlgorithmCost] = useState(0);

  // Fetch elevator state from backend
  const fetchElevatorState = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/elevator/1`);
      const data = await response.json();
      
      if (data.success && data.elevator) {
        const elevator = data.elevator;
        setElevatorData(elevator);
        setElevatorPosition(elevator.currentFloor);
        setElevatorDirection(elevator.direction);
        setCurrentPassengers(elevator.currentPassengers);
        setElevatorStatus(
          elevator.isDoorOpen ? 'Portes ouvertes' : 
          elevator.direction === 'idle' ? 'Arrêté' : 
          elevator.direction === 'up' ? 'En montée' : 'En descente'
        );
        setBackendConnected(true);
      }
    } catch (error) {
      console.error('Error fetching elevator state:', error);
      setBackendConnected(false);
    }
  }, []);

  // Fetch active requests
  const fetchActiveRequests = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/requests`);
      const data = await response.json();
      
      if (data.success) {
        setActiveRequests(data.requests);
        
        // Update floor calls from backend data
        const calls = {};
        data.requests.forEach(req => {
          if (!calls[req.floor]) {
            calls[req.floor] = {
              up: false,
              down: false,
              passengers: 0,
              destination: null
            };
          }
          
          if (req.isDestination) {
            calls[req.floor].destination = req.floor;
          } else {
            if (req.direction === 'up') calls[req.floor].up = true;
            if (req.direction === 'down') calls[req.floor].down = true;
            if (req.passengers) calls[req.floor].passengers = req.passengers;
            if (req.destination) {
              if (!calls[req.destination]) {
                calls[req.destination] = {
                  up: false,
                  down: false,
                  passengers: 0,
                  destination: req.destination
                };
              }
            }
          }
        });
        
        setFloorCalls(calls);
        
        // Calculate algorithm cost for demo
        if (data.requests.length > 0) {
          const latestReq = data.requests[0];
          const cost = Math.abs(elevatorPosition - latestReq.floor);
          setAlgorithmCost(cost);
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  }, [elevatorPosition]);

  // Poll for updates
  useEffect(() => {
    fetchElevatorState();
    fetchActiveRequests();
    
    const interval = setInterval(() => {
      fetchElevatorState();
      fetchActiveRequests();
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchElevatorState, fetchActiveRequests]);

  // Call elevator from control panel
  const requestElevator = (floor) => {
    const direction = floor > elevatorPosition ? 'up' : 'down';
    
    setPendingCall({
      floor,
      direction,
      timestamp: Date.now()
    });
  };

  // Call elevator from floor buttons
  const callElevatorFromFloor = async (floor, direction) => {
    setPendingCall({
      floor,
      direction,
      timestamp: Date.now()
    });
  };

  // Confirm call and send to backend
  const handleConfirmCall = async (passengers, destination) => {
    if (!pendingCall) return;

    try {
      const response = await fetch(`${API_URL}/call`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          floor: pendingCall.floor,
          direction: pendingCall.direction,
          passengers: passengers,
          destination: destination
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Show animations
        setAnimations(prev => ({ 
          ...prev, 
          passengersEntering: passengers,
          doorsOpening: true
        }));
        
        setTimeout(() => {
          setAnimations(prev => ({ 
            ...prev, 
            passengersEntering: 0,
            doorsOpening: false,
            doorsClosing: true
          }));
        }, 1000);
        
        setTimeout(() => {
          setAnimations(prev => ({ ...prev, doorsClosing: false }));
        }, 1800);
        
        // Update requests
        setRequests(prev => [...prev, pendingCall.floor]);
        
        // Fetch updated state
        fetchElevatorState();
        fetchActiveRequests();
      } else {
        alert('Échec de l\'appel: ' + result.message);
      }
    } catch (error) {
      console.error('Error calling elevator:', error);
      // Fallback to local simulation
      simulateLocalElevator(pendingCall.floor, pendingCall.direction, passengers, destination);
    }

    setPendingCall(null);
  };

  // Local simulation fallback
  const simulateLocalElevator = (floor, direction, passengers, destination) => {
    setCurrentPassengers(prev => Math.min(maxPassengers, prev + passengers));
    
    const floorDiff = Math.abs(floor - elevatorPosition);
    const timePerFloor = 1000;
    
    setElevatorDirection(floor > elevatorPosition ? 'up' : 'down');
    
    setTimeout(() => {
      setElevatorPosition(floor);
      setElevatorStatus('Arrivé à l\'étage');
      setAnimations(prev => ({ ...prev, doorsOpening: true }));
      
      setTimeout(() => {
        setAnimations(prev => ({ ...prev, doorsOpening: false, doorsClosing: true }));
        
        setTimeout(() => {
          setAnimations(prev => ({ ...prev, doorsClosing: false }));
          setElevatorDirection(destination > floor ? 'up' : 'down');
          
          setTimeout(() => {
            setElevatorPosition(destination);
            setElevatorStatus('Arrivé à destination');
            setCurrentPassengers(prev => Math.max(0, prev - passengers));
            setAnimations(prev => ({ ...prev, passengersLeaving: passengers }));
            
            setTimeout(() => {
              setAnimations(prev => ({ ...prev, passengersLeaving: 0 }));
              setElevatorDirection('idle');
              setElevatorStatus('Arrêté');
              setRequests(prev => prev.filter(r => r !== floor && r !== destination));
            }, 1000);
          }, Math.abs(destination - floor) * timePerFloor);
        }, 1000);
      }, 2000);
    }, floorDiff * timePerFloor);
  };

  const handleCancelCall = () => {
    setPendingCall(null);
  };

  const getDirectionIcon = () => {
    switch(elevatorDirection) {
      case 'up': return '🔼';
      case 'down': return '🔽';
      default: return '⏹️';
    }
  };

  const isElevatorFull = currentPassengers >= maxPassengers;

  // Get active calls count
  const activeCallsCount = Object.keys(floorCalls).filter(floor => 
    floorCalls[floor].up || floorCalls[floor].down
  ).length;

  // Reset elevator system
  const resetSystem = async () => {
    try {
      const response = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Système réinitialisé avec succès!');
        fetchElevatorState();
        fetchActiveRequests();
        setRequests([]);
      }
    } catch (error) {
      console.error('Error resetting system:', error);
      // Local reset
      setElevatorPosition(0);
      setElevatorDirection('idle');
      setCurrentPassengers(0);
      setElevatorStatus('Arrêté');
      setFloorCalls({});
      setActiveRequests([]);
      setRequests([]);
      alert('Réinitialisation locale effectuée');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Effet d'arrière-plan animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse-slow"></div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* En-tête compact */}
        <header className="text-center mb-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-3">
            <div className="text-center md:text-left mb-3 md:mb-0">
              <h1 className="text-3xl font-bold text-white mb-1 pt-4">
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  🏢 Ascenseur Intelligent
                </span>
              </h1>
              <p className="text-gray-300 text-sm">Algorithme d'optimisation avec PostgreSQL</p>
            </div>
            
            {/* Status indicators */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className={`px-3 py-2 rounded-lg ${backendConnected ? 'bg-green-900/50 border border-green-500/50' : 'bg-red-900/50 border border-red-500/50'}`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-white text-sm">
                    {backendConnected ? 'Backend Connecté' : 'Mode Local'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={resetSystem}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                <span>Réinit</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-center items-center space-x-3 text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <span>PostgreSQL</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Algorithme</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Temps réel</span>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="flex flex-col xl:flex-row gap-6 items-start justify-center mb-6">
          {/* Visualisation du bâtiment */}
          <div className="xl:w-2/3 flex justify-center">
            <div className="relative">
              <BuildingVisualization
                floors={floors}
                elevatorPosition={elevatorPosition}
                elevatorDirection={elevatorDirection}
                floorCalls={floorCalls}
                callElevatorFromFloor={callElevatorFromFloor}
                currentPassengers={currentPassengers}
                maxPassengers={maxPassengers}
                animations={animations}
              />
            </div>
          </div>

          {/* Panneau de contrôle et info */}
          <div className="xl:w-1/3 space-y-4">
            <ControlPanel 
              elevatorPosition={elevatorPosition}
              elevatorDirection={elevatorDirection}
              elevatorStatus={elevatorStatus}
              requests={requests}
              floors={floors}
              requestElevator={requestElevator}
              callElevatorFromFloor={callElevatorFromFloor}
              getDirectionIcon={getDirectionIcon}
              currentPassengers={currentPassengers}
              maxPassengers={maxPassengers}
              floorCalls={floorCalls}
              passengerDestinations={passengerDestinations}
              isElevatorFull={isElevatorFull}
              animations={animations}
            />
            
            {/* Algorithm panel - Compact */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">🤖 Algorithme</h3>
                <span className="text-xs px-2 py-1 bg-blue-500/30 text-blue-300 rounded">
                  {activeCallsCount} appels
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-black/30 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1">Coût calculé</p>
                    <p className="text-sm font-bold text-blue-400">{algorithmCost}</p>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <p className="text-xs text-gray-400 mb-1">Distance actuelle</p>
                    <p className="text-sm font-bold text-green-400">
                      {activeRequests.length > 0 
                        ? Math.abs(elevatorPosition - activeRequests[0].floor)
                        : '0'}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-300">
                  <div className="flex items-center justify-between mb-1">
                    <span>Assignation:</span>
                    <span className="text-green-400">Optimale ✓</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Direction:</span>
                    <span className={`font-bold ${elevatorDirection === 'up' ? 'text-green-400' : elevatorDirection === 'down' ? 'text-blue-400' : 'text-gray-400'}`}>
                      {elevatorDirection === 'up' ? '↑ Montée' : 
                       elevatorDirection === 'down' ? '↓ Descente' : '● Idle'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
              <h3 className="text-sm font-bold text-white mb-3">📊 Statistiques</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{currentPassengers}</div>
                  <div className="text-xs text-gray-300">Passagers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{activeCallsCount}</div>
                  <div className="text-xs text-gray-300">Appels actifs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {elevatorPosition === 0 ? 'RDC' : elevatorPosition}
                  </div>
                  <div className="text-xs text-gray-300">Position</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {elevatorDirection === 'idle' ? '●' : elevatorDirection === 'up' ? '↑' : '↓'}
                  </div>
                  <div className="text-xs text-gray-300">Direction</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal d'appel */}
        <CallModal
          pendingCall={pendingCall}
          onConfirm={handleConfirmCall}
          onCancel={handleCancelCall}
          maxCapacity={maxPassengers}
          currentPassengers={currentPassengers}
          floors={floors}
        />

        {/* API Endpoints Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl mb-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">🚀 Backend API</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
              <h4 className="font-bold text-white text-sm mb-2">📊 GET /api/elevator/1</h4>
              <p className="text-gray-300 text-xs mb-2">État de l'ascenseur</p>
              <div className="text-xs text-gray-400 bg-black/30 p-2 rounded">
                {`currentFloor: ${elevatorPosition}`}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
              <h4 className="font-bold text-white text-sm mb-2">📞 POST /api/call</h4>
              <p className="text-gray-300 text-xs mb-2">Nouvel appel</p>
              <div className="text-xs text-gray-400 bg-black/30 p-2 rounded">
                {`appels actifs: ${activeCallsCount}`}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
              <h4 className="font-bold text-white text-sm mb-2">📋 GET /api/requests</h4>
              <p className="text-gray-300 text-xs mb-2">Demandes actives</p>
              <div className="text-xs text-gray-400 bg-black/30 p-2 rounded">
                {activeRequests.length > 0 
                  ? `${activeRequests.length} demande(s)`
                  : 'Aucune demande'
                }
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="flex justify-center gap-2">
              <a href="http://localhost:5000/api" target="_blank" rel="noopener noreferrer"
                 className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition-colors">
                📡 Accéder à l'API
              </a>
              <a href="http://localhost:5000/api/db-test" target="_blank" rel="noopener noreferrer"
                 className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors">
                🗄️ Tester DB
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 pb-6">
          <div className="border-t border-white/20 pt-6">
            <p className="text-gray-400 text-sm">
              🚀 Système d'Ascenseur Intelligent - Express.js + React + PostgreSQL
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Algorithme d'optimisation • Persistance des données • Interface temps réel
            </p>
          </div>
        </footer>
      </div>

      {/* Styles d'animation inline */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
      `}</style>
    </div>
  );
}

export default App;