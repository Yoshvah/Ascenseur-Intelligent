import React from 'react';

const FloorCallButtons = ({ floorNumber, floorCalls, callElevatorFromFloor, elevatorPosition }) => {
  const isCurrentFloor = elevatorPosition === floorNumber;
  const hasCall = floorCalls[floorNumber] && (floorCalls[floorNumber].up || floorCalls[floorNumber].down);

  return (
    <div className={`absolute right-2 flex flex-col gap-1 z-20 ${floorNumber === 0 ? 'top-4' : 'top-2'}`}>
      {/* Bouton appel ascenseur - Haut */}
      {floorNumber < 9 && (
        <button
          onClick={() => callElevatorFromFloor(floorNumber, 'up')}
          disabled={floorCalls[floorNumber]?.up}
          className={`
            w-6 h-6 rounded-full text-xs font-bold transition-all duration-200
            flex items-center justify-center shadow-md
            ${floorCalls[floorNumber]?.up 
              ? 'bg-green-500 text-white animate-pulse' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
            ${isCurrentFloor ? 'ring-2 ring-yellow-400' : ''}
          `}
          title={`Appeler ascenseur pour monter - Étage ${floorNumber}`}
        >
          ↑
        </button>
      )}
      
      {/* Bouton appel ascenseur - Bas */}
      {floorNumber > 0 && (
        <button
          onClick={() => callElevatorFromFloor(floorNumber, 'down')}
          disabled={floorCalls[floorNumber]?.down}
          className={`
            w-6 h-6 rounded-full text-xs font-bold transition-all duration-200
            flex items-center justify-center shadow-md
            ${floorCalls[floorNumber]?.down 
              ? 'bg-green-500 text-white animate-pulse' 
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }
            ${isCurrentFloor ? 'ring-2 ring-yellow-400' : ''}
          `}
          title={`Appeler ascenseur pour descendre - Étage ${floorNumber}`}
        >
          ↓
        </button>
      )}

      {/* Indicateur d'appel en cours */}
      {hasCall && (
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mx-auto"></div>
      )}
    </div>
  );
};

export default FloorCallButtons;