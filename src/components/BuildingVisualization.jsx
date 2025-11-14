import React from 'react';
import ElevatorShaft from './ElevatorShaft';
import Floor from './Floor';

const BuildingVisualization = ({ 
  floors, 
  elevatorPosition, 
  elevatorDirection, 
  floorCalls, 
  callElevatorFromFloor,
  currentPassengers,
  maxPassengers,
  animations = {
    doorsOpening: false,
    doorsClosing: false,
    passengersEntering: 0,
    passengersLeaving: 0
  }
}) => {
  return (
    <div className="relative w-80 h-[700px] bg-gradient-to-b from-amber-800 to-amber-900 border-4 border-amber-900 rounded-2xl overflow-hidden shadow-2xl">
      
      {/* Structure du bâtiment avec animation subtile */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-800 opacity-20 animate-pulse-slow"></div>
      
      {/* Fenêtres avec effet de lumière */}
      <div className="absolute inset-0 flex">
        {/* Colonne de fenêtres gauche */}
        <div className="w-1/3 border-r border-amber-700">
          {Array.from({ length: floors * 3 }, (_, i) => (
            <div key={`left-${i}`} className="h-16 border-b border-amber-700 flex items-center justify-center">
              <div 
                className="w-8 h-12 bg-yellow-200 bg-opacity-20 rounded border border-amber-600 transition-all duration-1000 hover:bg-opacity-40"
                style={{
                  animationDelay: `${(i % 3) * 0.5}s`,
                  animation: `glow ${2 + (i % 3)}s ease-in-out infinite alternate`
                }}
              ></div>
            </div>
          ))}
        </div>
        
        {/* Colonne de fenêtres centrale */}
        <div className="w-1/3 border-r border-amber-700">
          {Array.from({ length: floors * 3 }, (_, i) => (
            <div key={`center-${i}`} className="h-16 border-b border-amber-700 flex items-center justify-center">
              <div 
                className="w-8 h-12 bg-yellow-200 bg-opacity-20 rounded border border-amber-600 transition-all duration-1000 hover:bg-opacity-40"
                style={{
                  animationDelay: `${(i % 3) * 0.7}s`,
                  animation: `glow ${2.5 + (i % 3)}s ease-in-out infinite alternate`
                }}
              ></div>
            </div>
          ))}
        </div>
        
        {/* Colonne de fenêtres droite */}
        <div className="w-1/3">
          {Array.from({ length: floors * 3 }, (_, i) => (
            <div key={`right-${i}`} className="h-16 border-b border-amber-700 flex items-center justify-center">
              <div 
                className="w-8 h-12 bg-yellow-200 bg-opacity-20 rounded border border-amber-600 transition-all duration-1000 hover:bg-opacity-40"
                style={{
                  animationDelay: `${(i % 3) * 0.9}s`,
                  animation: `glow ${3 + (i % 3)}s ease-in-out infinite alternate`
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>

      {/* Cage d'ascenseur avec effet de lumière */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-44 h-full bg-amber-700 border-x-4 border-amber-900">
        {/* Effet de lumière qui suit l'ascenseur */}
        <div 
          className="absolute left-0 right-0 bg-yellow-200 bg-opacity-10 transition-all duration-600 ease-in-out rounded-full blur-sm"
          style={{ 
            bottom: `${elevatorPosition * 70}px`,
            height: '80px',
            transform: 'translateY(-10px)'
          }}
        ></div>
      </div>

      {/* Ascenseur */}
      <ElevatorShaft 
        elevatorPosition={elevatorPosition}
        elevatorDirection={elevatorDirection}
        currentPassengers={currentPassengers}
        maxPassengers={maxPassengers}
        animations={animations}
      />
      
      {/* Étages avec boutons d'appel */}
      <div className="absolute inset-0">
        {Array.from({ length: floors }, (_, index) => {
          const floorNumber = floors - 1 - index;
          return (
            <Floor 
              key={floorNumber}
              floorNumber={floorNumber}
              isCurrentFloor={elevatorPosition === floorNumber}
              floorCalls={floorCalls}
              callElevatorFromFloor={callElevatorFromFloor}
              elevatorPosition={elevatorPosition}
              elevatorDirection={elevatorDirection}
            />
          );
        })}
      </div>

      {/* Toit avec animation */}
      <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-amber-900 to-amber-950 flex justify-center items-center shadow-inner">
        <div className="w-48 h-8 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-b-2xl flex justify-center items-center text-xs font-bold text-amber-900 shadow-lg animate-pulse-slow border-b-2 border-amber-700">
          <span className="animate-bounce-slow">🏢</span>
          <span className="ml-2">TOIT</span>
        </div>
        
        {/* Antennes du toit */}
        <div className="absolute -top-4 left-1/4 w-1 h-4 bg-gray-400 rounded-t"></div>
        <div className="absolute -top-6 left-1/3 w-1 h-6 bg-gray-400 rounded-t"></div>
        <div className="absolute -top-4 left-2/3 w-1 h-4 bg-gray-400 rounded-t"></div>
      </div>
      
      {/* Entrée avec animation */}
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-900 to-gray-800 flex justify-center items-center border-t-4 border-amber-700 shadow-inner">
        <div className="w-40 h-14 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-2xl flex justify-center items-center text-white text-sm font-bold border-x-4 border-t-4 border-amber-600 animate-pulse-slow relative">
          {/* Porte d'entrée */}
          <div className="w-12 h-10 bg-amber-800 rounded-t-lg border border-amber-700 flex items-center justify-center">
            <div className="w-1 h-1 bg-yellow-300 rounded-full"></div>
          </div>
          
          {/* Marches d'escalier */}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-44 h-2 bg-amber-700 rounded-t"></div>
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-48 h-2 bg-amber-600 rounded-t"></div>
          <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-52 h-2 bg-amber-500 rounded-t"></div>
        </div>
      </div>

      {/* Indicateur de position de l'ascenseur avec animation */}
      <div 
        className="absolute left-1/2 top-4 transform -translate-x-1/2 bg-black bg-opacity-90 text-green-400 px-4 py-3 rounded-2xl font-mono font-bold text-lg shadow-2xl border-2 border-green-500 transition-all duration-500 z-30"
        style={{
          animation: elevatorDirection !== 'idle' ? 'bounce 0.8s ease-in-out infinite alternate' : 'none',
          boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)'
        }}
      >
        <div className="flex items-center justify-center space-x-2">
          <span className={`${elevatorDirection !== 'idle' ? 'animate-pulse' : ''}`}>
            {elevatorPosition === 0 ? 'RDC' : `Étage ${elevatorPosition}`}
          </span>
          {elevatorDirection !== 'idle' && (
            <span className="text-yellow-300 animate-bounce">
              {elevatorDirection === 'up' ? '🚀 ↑' : '🔻 ↓'}
            </span>
          )}
        </div>
        <div className="text-xs text-white text-center flex items-center justify-center space-x-2 mt-1">
          <span className="flex items-center">
            <span className="mr-1">👥</span>
            {currentPassengers}/{maxPassengers}
          </span>
          {currentPassengers >= maxPassengers && (
            <span className="text-red-400 animate-pulse">🚫 COMPLET</span>
          )}
        </div>
      </div>

      {/* Effet de particules pour l'animation */}
      {(animations.passengersEntering > 0 || animations.passengersLeaving > 0) && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Particules pour l'entrée des passagers */}
          {animations.passengersEntering > 0 && Array.from({ length: 10 }).map((_, i) => (
            <div
              key={`enter-${i}`}
              className="absolute w-2 h-2 bg-green-400 rounded-full animate-bounce"
              style={{
                left: `${30 + (i * 5)}%`,
                bottom: `${elevatorPosition * 70 + 20}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
          
          {/* Particules pour la sortie des passagers */}
          {animations.passengersLeaving > 0 && Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`leave-${i}`}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{
                left: `${60 + (i * 4)}%`,
                bottom: `${elevatorPosition * 70 + 10}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: '0.8s'
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Effet de lumière pour l'ouverture des portes */}
      {animations.doorsOpening && (
        <div 
          className="absolute left-1/2 transform -translate-x-1/2 w-32 h-20 bg-yellow-300 bg-opacity-30 rounded-xl blur-xl animate-pulse transition-all duration-800"
          style={{
            bottom: `${elevatorPosition * 70}px`,
            transform: 'translateX(-50%) translateY(-10px)'
          }}
        ></div>
      )}

      {/* Indicateur de direction avec flèches animées */}
      {elevatorDirection !== 'idle' && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center space-y-2">
          {elevatorDirection === 'up' && (
            <>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold animate-bounce">
                ↑
              </div>
              <div className="text-green-400 text-sm font-bold animate-pulse">
                MONTÉE
              </div>
            </>
          )}
          {elevatorDirection === 'down' && (
            <>
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold animate-bounce">
                ↓
              </div>
              <div className="text-blue-400 text-sm font-bold animate-pulse">
                DESCENTE
              </div>
            </>
          )}
        </div>
      )}

      {/* Indicateur de mouvement */}
      {elevatorDirection !== 'idle' && (
        <div 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-sm font-bold bg-black bg-opacity-50 px-3 py-2 rounded-lg animate-pulse"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        >
          {elevatorDirection === 'up' ? '⬆️ EN MONTÉE' : '⬇️ EN DESCENTE'}
        </div>
      )}
    </div>
  );
};

export default BuildingVisualization;