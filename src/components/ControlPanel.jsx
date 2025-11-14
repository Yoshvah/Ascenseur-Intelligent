import React from 'react';
import ElevatorStatus from './ElevatorStatus';
import FloorControls from './FloorControls';

const ControlPanel = ({ 
  elevatorPosition, 
  elevatorDirection, 
  elevatorStatus, 
  requests, 
  floors, 
  requestElevator,
  callElevatorFromFloor,
  getDirectionIcon,
  currentPassengers,
  maxPassengers,
  floorCalls,
  passengerDestinations,
  isElevatorFull,
  animations // ← AJOUTEZ CETTE LIGNE
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🏢 Contrôle Ascenseur Intelligent
      </h2>
      
      {/* Statut de l'ascenseur - PASSEZ animations */}
      <ElevatorStatus 
        elevatorPosition={elevatorPosition}
        elevatorDirection={elevatorDirection}
        elevatorStatus={elevatorStatus}
        requests={requests}
        getDirectionIcon={getDirectionIcon}
        currentPassengers={currentPassengers}
        maxPassengers={maxPassengers}
        floorCalls={floorCalls}
        passengerDestinations={passengerDestinations}
        isElevatorFull={isElevatorFull}
        animations={animations} // ← ICI
      />
      
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