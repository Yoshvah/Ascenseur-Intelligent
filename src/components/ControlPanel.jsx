import React from 'react';
import FloorControls from './FloorControls';

const ControlPanel = ({ 
  elevatorPosition, 
  elevatorDirection, 
  elevatorStatus, 
  requests = [], // Valeur par défaut
  floors, 
  requestElevator,
  callElevatorFromFloor,
  getDirectionIcon,
  currentPassengers,
  maxPassengers,
  floorCalls = {}, // Valeur par défaut
  passengerDestinations = {}, // Valeur par défaut
  isElevatorFull,
  animations
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-2xl w-full max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
        🎮 Contrôle Ascenseur
      </h2>
      
      {/* Statut de l'ascenseur - COMPACT */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Position</p>
            <p className="text-lg font-bold text-blue-700">
              {elevatorPosition === 0 ? 'RDC' : `Étage ${elevatorPosition}`}
            </p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg border border-green-100">
            <p className="text-xs text-gray-600 mb-1">Direction</p>
            <p className="text-lg font-bold text-green-700">
              {elevatorDirection === 'up' ? '↑' : 
               elevatorDirection === 'down' ? '↓' : '●'} 
              {elevatorDirection === 'up' ? 'Montée' : 
               elevatorDirection === 'down' ? 'Descente' : 'Arrêté'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <p className="text-xs text-gray-600 mb-1">Occupation</p>
            <p className={`text-sm font-bold ${isElevatorFull ? 'text-red-600' : 'text-purple-700'}`}>
              {currentPassengers}/{maxPassengers} 
              <span className="text-xs ml-1">pers.</span>
              {isElevatorFull && <span className="text-xs block text-red-500">COMPLET</span>}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div 
                className={`h-1.5 rounded-full ${isElevatorFull ? 'bg-red-500' : 'bg-purple-500'}`}
                style={{ width: `${(currentPassengers / maxPassengers) * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
            <p className="text-xs text-gray-600 mb-1">Statut</p>
            <p className="text-sm font-bold text-orange-700">{elevatorStatus}</p>
          </div>
        </div>
      </div>
      
      {/* Appels actifs - COMPACT */}
      <div className="mb-4">
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 mb-3">
          <p className="text-xs text-gray-600 mb-2">Appels actifs</p>
          <div className="flex flex-wrap gap-1 min-h-8">
            {Object.keys(floorCalls).length > 0 ? (
              Object.entries(floorCalls)
                .filter(([_, calls]) => calls?.up || calls?.down)
                .map(([floor, calls]) => (
                  <span key={floor} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
                    {floor === '0' ? 'RDC' : floor}
                    {calls?.up && <span className="ml-1 text-xs">↑</span>}
                    {calls?.down && <span className="ml-1 text-xs">↓</span>}
                  </span>
                ))
            ) : (
              <p className="text-gray-500 text-sm">Aucun appel actif</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Contrôles des étages */}
      <FloorControls 
        floors={floors}
        requests={requests}
        requestElevator={requestElevator}
        isElevatorFull={isElevatorFull}
      />
    </div>
  );
};

export default ControlPanel;