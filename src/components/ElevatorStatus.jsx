import React from 'react';

const ElevatorStatus = ({ 
  elevatorPosition, 
  elevatorDirection, 
  elevatorStatus, 
  floorCalls = {}, // Valeur par défaut
  currentPassengers,
  maxPassengers,
  isElevatorFull
}) => {
  
  const getActiveCalls = () => {
    return Object.entries(floorCalls).filter(([_, calls]) => calls?.up || calls?.down);
  };

  return (
    <div className="mb-4">
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Position</p>
          <p className="text-base font-bold text-blue-700">
            {elevatorPosition === 0 ? 'RDC' : `Étage ${elevatorPosition}`}
          </p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Direction</p>
          <p className="text-base font-bold text-green-700">
            {elevatorDirection === 'up' ? '↑ Montée' : 
             elevatorDirection === 'down' ? '↓ Descente' : '● Arrêté'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Occupation</p>
          <p className={`text-sm font-bold ${isElevatorFull ? 'text-red-600' : 'text-purple-700'}`}>
            {currentPassengers}/{maxPassengers}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div 
              className="h-1.5 rounded-full bg-purple-500 transition-all duration-300"
              style={{ width: `${(currentPassengers / maxPassengers) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Statut</p>
          <p className="text-sm font-bold text-orange-700">{elevatorStatus}</p>
        </div>
      </div>
      
      {/* Appels actifs - compact */}
      {getActiveCalls().length > 0 && (
        <div className="mt-3 bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Appels actifs</p>
          <div className="flex flex-wrap gap-1">
            {getActiveCalls().map(([floor, calls]) => (
              <span key={floor} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                {floor === '0' ? 'RDC' : floor}
                {calls?.up && '↑'}
                {calls?.down && '↓'}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElevatorStatus;