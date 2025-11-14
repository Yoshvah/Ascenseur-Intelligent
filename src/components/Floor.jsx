import React from 'react';
import FloorCallButtons from './FloorCallButtons';

const Floor = ({ 
  floorNumber, 
  isCurrentFloor, 
  floorCalls, 
  callElevatorFromFloor, 
  elevatorPosition,
  elevatorDirection
}) => {
  const floorHeight = 70;
  const positionFromBottom = floorNumber * floorHeight;

  const floorCall = floorCalls[floorNumber];
  const hasActiveCall = floorCall && (floorCall.up || floorCall.down);

  return (
    <div 
      className={`absolute left-0 right-0 flex items-center justify-between px-6 h-[70px]
                  transition-all duration-500 ease-in-out
                  ${isCurrentFloor ? 'bg-green-500 bg-opacity-30 border-t-2 border-b-2 border-green-400' : ''}
                  ${hasActiveCall ? 'bg-orange-500 bg-opacity-20' : ''}
                  ${elevatorDirection !== 'idle' && isCurrentFloor ? 'pulse-glow' : ''}`}
      style={{ bottom: `${positionFromBottom}px` }}
    >
      {/* Numéro d'étage avec animation */}
      <div className={`
        w-14 h-10 rounded-lg flex items-center justify-center 
        font-bold text-white shadow-lg z-10 border-2 transition-all duration-300
        transform hover:scale-110
        ${isCurrentFloor 
          ? 'bg-green-500 border-green-300 animate-pulse' 
          : hasActiveCall
          ? 'bg-orange-500 border-orange-300 animate-bounce'
          : 'bg-gray-700 border-gray-600'
        }
      `}>
        {floorNumber === 0 ? 'RDC' : floorNumber}
        {isCurrentFloor && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
        )}
      </div>
      
      {/* Informations d'appel avec animation */}
      {hasActiveCall && (
        <div className="flex items-center space-x-2 bg-orange-100 px-3 py-1 rounded-full animate-pulse">
          <span className="text-xs font-semibold text-orange-800">
            {floorCall.passengers} 👥
          </span>
          <span className="text-xs text-orange-600 animate-bounce">
            → {floorCall.destination === 0 ? 'RDC' : floorCall.destination}
          </span>
        </div>
      )}
      
      {/* Ligne de séparation animée */}
      <div 
        className="flex-1 h-1 bg-amber-600 bg-opacity-40 mx-4 rounded-full transition-all duration-300"
        style={{
          transform: isCurrentFloor ? 'scaleX(1.1)' : 'scaleX(1)',
          opacity: isCurrentFloor ? 0.8 : 0.4
        }}
      ></div>

      {/* Boutons d'appel d'étage */}
      <FloorCallButtons
        floorNumber={floorNumber}
        floorCalls={floorCalls}
        callElevatorFromFloor={callElevatorFromFloor}
        elevatorPosition={elevatorPosition}
      />
    </div>
  );
};

export default Floor;