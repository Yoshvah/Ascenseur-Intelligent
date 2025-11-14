import React from 'react';

const ElevatorStatus = ({ 
  elevatorPosition, 
  elevatorDirection, 
  elevatorStatus, 
  requests, 
  getDirectionIcon,
  currentPassengers,
  maxPassengers,
  floorCalls,
  passengerDestinations,
  isElevatorFull
}) => {
  
  const getActiveCalls = () => {
    return Object.entries(floorCalls).filter(([_, calls]) => calls.up || calls.down);
  };

  const getNextDestinations = () => {
    return [...new Set(Object.values(passengerDestinations))];
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Statut Actuel</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Position</p>
          <p className="text-xl font-bold text-blue-700">
            {elevatorPosition === 0 ? 'RDC' : `Étage ${elevatorPosition}`}
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Direction</p>
          <p className="text-xl font-bold text-green-700">
            {getDirectionIcon()} {elevatorDirection === 'up' ? 'Montée' : 
             elevatorDirection === 'down' ? 'Descente' : 'Arrêté'}
          </p>
        </div>
      </div>
      
      <div className="bg-purple-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">Occupation</p>
        <p className={`text-lg font-bold ${isElevatorFull ? 'text-red-600' : 'text-purple-700'}`}>
          {currentPassengers}/{maxPassengers} passagers
          {isElevatorFull && ' 🚫 COMPLET'}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className={`h-2 rounded-full ${isElevatorFull ? 'bg-red-500' : 'bg-purple-500'} transition-all duration-300`}
            style={{ width: `${(currentPassengers / maxPassengers) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-orange-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">Statut</p>
        <p className="text-lg font-bold text-orange-700">{elevatorStatus}</p>
      </div>
      
      {/* Appels actifs */}
      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
        <p className="text-sm text-gray-600">Appels actifs</p>
        <div className="mt-2">
          {getActiveCalls().length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {getActiveCalls().map(([floor, calls]) => (
                <span key={floor} className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs flex items-center">
                  {floor === '0' ? 'RDC' : floor}
                  {calls.up && <span className="ml-1">↑</span>}
                  {calls.down && <span className="ml-1">↓</span>}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucun appel actif</p>
          )}
        </div>
      </div>
      
      {/* Destinations des passagers */}
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Destinations en cours</p>
        <div className="mt-2">
          {getNextDestinations().length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {getNextDestinations().map(dest => (
                <span key={dest} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                  {dest === 0 ? 'RDC' : dest}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Aucune destination</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElevatorStatus;