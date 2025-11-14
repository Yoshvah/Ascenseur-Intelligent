import React from 'react';

const FloorControls = ({ floors, requests, requestElevator }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-4">🎯 Appeler l'ascenseur</h3>
      
      <div className="grid grid-cols-5 gap-3 max-h-96 overflow-y-auto p-2">
        {Array.from({ length: floors }, (_, index) => {
          const floorNumber = floors - 1 - index;
          const isRequested = requests.includes(floorNumber);
          
          return (
            <button
              key={floorNumber}
              onClick={() => requestElevator(floorNumber)}
              disabled={isRequested}
              className={`
                w-12 h-12 rounded-full font-bold text-white transition-all duration-300
                transform hover:scale-105 active:scale-95 flex items-center justify-center
                ${isRequested 
                  ? 'bg-green-500 animate-pulse cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg'
                }
                ${floorNumber === 0 ? 'bg-purple-500 hover:bg-purple-600' : ''}
              `}
            >
              {floorNumber === 0 ? 'RDC' : floorNumber}
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>💡 Cliquez sur un étage pour appeler l'ascenseur</p>
        <p>Les boutons verts indiquent les demandes en cours</p>
      </div>
    </div>
  );
};

export default FloorControls;