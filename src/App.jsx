import React from 'react';
import BuildingVisualization from './components/BuildingVisualization';
import ControlPanel from './components/ControlPanel';
import CallModal from './components/CallModal';
import { useElevator } from './hooks/useElevator';

function App() {
  const elevator = useElevator(10, 6); // 10 étages, capacité max 6 personnes

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Effet d'arrière-plan animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse-slow"></div>
      
      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-float"
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
        {/* En-tête avec animations */}
        <header className="text-center mb-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
          
          <h1 className="text-5xl font-bold text-white mb-4 pt-6 animate-fade-in-down">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent animate-gradient-x">
              🏢 Système d'Ascenseur Intelligent
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-2 animate-fade-in-up">
            Gestion multi-utilisateurs avec réservation et capacité
          </p>
          
          <div className="flex justify-center items-center space-x-4 text-sm text-gray-400 animate-fade-in-up">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>En temps réel</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Animations fluides</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Gestion intelligente</span>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="flex flex-col xl:flex-row gap-8 items-start justify-center mb-8">
          {/* Visualisation du bâtiment - Côté gauche */}
          <div className="flex-1 flex justify-center animate-fade-in-left">
            <div className="relative">
              <BuildingVisualization
                floors={elevator.floors}
                elevatorPosition={elevator.elevatorPosition}
                elevatorDirection={elevator.elevatorDirection}
                floorCalls={elevator.floorCalls}
                callElevatorFromFloor={elevator.callElevatorFromFloor}
                currentPassengers={elevator.currentPassengers}
                maxPassengers={elevator.maxPassengers}
                animations={elevator.animations}
              />
              
              {/* Badge d'état en temps réel */}
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse z-20">
                ⚡ TEMPS RÉEL
              </div>
            </div>
          </div>

          {/* Panneau de contrôle - Côté droit */}
          <div className="flex-1 animate-fade-in-right">
            <ControlPanel 
              elevatorPosition={elevator.elevatorPosition}
              elevatorDirection={elevator.elevatorDirection}
              elevatorStatus={elevator.elevatorStatus}
              requests={elevator.requests}
              floors={elevator.floors}
              requestElevator={elevator.requestElevator}
              callElevatorFromFloor={elevator.callElevatorFromFloor}
              getDirectionIcon={elevator.getDirectionIcon}
              currentPassengers={elevator.currentPassengers}
              maxPassengers={elevator.maxPassengers}
              floorCalls={elevator.floorCalls}
              passengerDestinations={elevator.passengerDestinations}
              isElevatorFull={elevator.isElevatorFull}
              animations={elevator.animations}
            />
          </div>
        </div>

        {/* Modal d'appel */}
        <CallModal
          pendingCall={elevator.pendingCall}
          onConfirm={elevator.confirmCall}
          onCancel={elevator.cancelCall}
          maxCapacity={elevator.maxPassengers}
          currentPassengers={elevator.currentPassengers}
          floors={elevator.floors}
        />

        {/* Cartes d'information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-xl">
                🎯
              </div>
              <div>
                <h3 className="font-bold text-white">Appel Intelligent</h3>
                <p className="text-gray-300 text-sm">Modal de réservation avec destination</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                👥
              </div>
              <div>
                <h3 className="font-bold text-white">Gestion de Capacité</h3>
                <p className="text-gray-300 text-sm">Max {elevator.maxPassengers} personnes</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white text-xl">
                ⚡
              </div>
              <div>
                <h3 className="font-bold text-white">Animations Temps Réel</h3>
                <p className="text-gray-300 text-sm">Mouvement fluide et effets visuels</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl">
                🏢
              </div>
              <div>
                <h3 className="font-bold text-white">{elevator.floors} Étages</h3>
                <p className="text-gray-300 text-sm">Bâtiment complet avec RDC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions détaillées */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-6 text-center animate-pulse">
            🎯 Guide d'Utilisation du Système
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30 hover:border-blue-400/60 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <h4 className="font-bold text-white text-lg">Appel d'Ascenseur</h4>
              </div>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Cliquez sur les boutons ↑↓ dans le bâtiment</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Spécifiez le nombre de personnes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span>Choisissez la destination</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30 hover:border-green-400/60 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <h4 className="font-bold text-white text-lg">Gestion Intelligente</h4>
              </div>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Capacité max: {elevator.maxPassengers} personnes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Arrêt uniquement si nécessaire</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>Optimisation des trajets</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <h4 className="font-bold text-white text-lg">Visualisation Temps Réel</h4>
              </div>
              <ul className="text-gray-300 text-sm space-y-2">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Mouvement fluide entre étages</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Animations portes/passagers</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  <span>Indicateurs visuels en direct</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Indicateurs de statut en temps réel */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/30 rounded-lg p-4 text-center border border-yellow-400/30">
              <div className="text-2xl font-bold text-yellow-400">{elevator.currentPassengers}</div>
              <div className="text-xs text-yellow-300">Passagers actuels</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center border border-blue-400/30">
              <div className="text-2xl font-bold text-blue-400">{elevator.requests.length}</div>
              <div className="text-xs text-blue-300">Demandes en cours</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center border border-green-400/30">
              <div className="text-2xl font-bold text-green-400">
                {elevator.elevatorPosition === 0 ? 'RDC' : elevator.elevatorPosition}
              </div>
              <div className="text-xs text-green-300">Position actuelle</div>
            </div>
            <div className="bg-black/30 rounded-lg p-4 text-center border border-purple-400/30">
              <div className="text-2xl font-bold text-purple-400">
                {elevator.elevatorDirection === 'idle' ? '●' : elevator.elevatorDirection === 'up' ? '↑' : '↓'}
              </div>
              <div className="text-xs text-purple-300">Direction</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <div className="border-t border-white/20 pt-8">
            <p className="text-gray-400 text-sm">
              🚀 Système d'Ascenseur Intelligent - Développé avec React & Tailwind CSS
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Animations temps réel • Gestion de capacité • Interface immersive
            </p>
          </div>
        </footer>
      </div>

      {/* Styles d'animation inline */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-left {
          0% { opacity: 0; transform: translateX(-20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fade-in-right {
          0% { opacity: 0; transform: translateX(20px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.2s both; }
        .animate-fade-in-left { animation: fade-in-left 0.8s ease-out 0.4s both; }
        .animate-fade-in-right { animation: fade-in-right 0.8s ease-out 0.6s both; }
      `}</style>
    </div>
  );
}

export default App;