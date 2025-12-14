import React from 'react';

const FloorControls = ({ 
  floors = 10, // Valeur par défaut
  requests, 
  requestElevator, 
  isElevatorFull 
}) => {
  // Assurer que requests est un tableau
  const safeRequests = Array.isArray(requests) ? requests : [];
  
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">🎯 Appeler l'ascenseur</h3>
      
      <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
        {Array.from({ length: floors }, (_, index) => {
          const floorNumber = floors - 1 - index;
          const isRequested = safeRequests.includes(floorNumber);
          
          return (
            <button
              key={floorNumber}
              onClick={() => requestElevator && requestElevator(floorNumber)}
              disabled={isRequested || isElevatorFull}
              className={`
                w-10 h-10 rounded-full font-bold text-white transition-all duration-200
                transform hover:scale-105 active:scale-95 flex items-center justify-center
                text-sm
                ${isRequested 
                  ? 'bg-green-500 animate-pulse cursor-not-allowed' 
                  : isElevatorFull
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 shadow'
                }
                ${floorNumber === 0 ? 'bg-purple-500 hover:bg-purple-600' : ''}
              `}
              title={isElevatorFull 
                ? 'Ascenseur complet' 
                : `Appeler ascenseur - ${floorNumber === 0 ? 'RDC' : `Étage ${floorNumber}`}`
              }
            >
              {floorNumber === 0 ? 'RDC' : floorNumber}
              {isRequested && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        {isElevatorFull ? (
          <p className="text-red-500 font-medium animate-pulse">
            🚫 Ascenseur complet - Attendez que des passagers sortent
          </p>
        ) : (
          <p>💡 Cliquez sur un étage pour appeler l'ascenseur</p>
        )}
      </div>
    </div>
  );
};

export default FloorControls;