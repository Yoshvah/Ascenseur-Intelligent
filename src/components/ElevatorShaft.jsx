import React from 'react';

const ElevatorShaft = ({ 
  elevatorPosition, 
  elevatorDirection, 
  currentPassengers, 
  maxPassengers,
  animations = {} // Valeur par défaut pour éviter l'erreur
}) => {
  // Valeurs par défaut pour les animations
  const {
    doorsOpening = false,
    doorsClosing = false,
    passengersEntering = 0,
    passengersLeaving = 0
  } = animations;

  const getElevatorColor = () => {
    if (currentPassengers >= maxPassengers) {
      return 'from-red-400 to-red-600';
    }
    switch(elevatorDirection) {
      case 'up': return 'from-green-400 to-green-600';
      case 'down': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-300 to-gray-500';
    }
  };

  const getElevatorPosition = () => {
    return { bottom: `${elevatorPosition * 70}px` };
  };

  const getPassengerIcons = () => {
    const icons = [];
    const passengerCount = Math.min(currentPassengers, 8);
    
    for (let i = 0; i < passengerCount; i++) {
      icons.push(
        <div 
          key={i}
          className="w-4 h-4 bg-white rounded-full opacity-90 shadow-sm transition-all duration-300 hover:scale-110"
          style={{
            marginLeft: i > 0 ? '-3px' : '0',
            animation: passengersEntering > 0 ? 'bounceIn 0.6s ease-out' : 
                      passengersLeaving > 0 ? 'fadeOut 0.5s ease-out' : 'none'
          }}
        />
      );
    }
    
    if (currentPassengers > 8) {
      icons.push(
        <div 
          key="more" 
          className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[6px] font-bold shadow-sm"
        >
          +{currentPassengers - 8}
        </div>
      );
    }
    
    return icons;
  };

  // Animation des portes avec valeurs sécurisées
  const getDoorStyles = () => {
    if (doorsOpening) {
      return {
        left: '0%',
        right: '0%',
        transition: 'all 0.8s ease-out'
      };
    } else if (doorsClosing) {
      return {
        left: '50%',
        right: '50%',
        transition: 'all 0.6s ease-in'
      };
    }
    return {
      left: '50%',
      right: '50%',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 w-44 h-full bg-amber-700 border-x-4 border-amber-900">
      {/* Portes d'ascenseur avec animation */}
      <div className="absolute inset-0 flex overflow-hidden">
        <div 
          className="absolute top-0 bottom-0 bg-amber-600 border-r-2 border-amber-800 z-20"
          style={getDoorStyles()}
        ></div>
        <div 
          className="absolute top-0 bottom-0 bg-amber-600 border-l-2 border-amber-800 z-20"
          style={getDoorStyles()}
        ></div>
      </div>
      
      {/* Ascenseur avec animation de mouvement */}
      <div 
        className={`absolute left-2 w-40 h-16 bg-gradient-to-br ${getElevatorColor()} 
                   border-2 border-gray-600 rounded-xl transition-all duration-600 ease-in-out
                   flex flex-col items-center justify-center shadow-2xl relative
                   ${doorsOpening ? 'ring-4 ring-yellow-300 ring-opacity-50' : ''}
                   hover:scale-105 transform-gpu`}
        style={getElevatorPosition()}
      >
        {/* Affichage étage avec animation */}
        <div className={`
          bg-black text-green-400 px-3 py-1 rounded-lg font-mono font-bold text-sm mb-1 
          transition-all duration-300 transform
          ${doorsOpening ? 'scale-110 bg-green-900' : ''}
        `}>
          {elevatorPosition === 0 ? 'RDC' : elevatorPosition}
          <span className="ml-1 text-xs">
            {elevatorDirection === 'up' ? '↑' : elevatorDirection === 'down' ? '↓' : '●'}
          </span>
        </div>
        
        {/* Passagers avec animations */}
        <div className="flex justify-center items-end space-x-1 px-2">
          {getPassengerIcons()}
        </div>
        
        {/* Indicateur d'animation en cours */}
        {(passengersEntering > 0 || passengersLeaving > 0) && (
          <div className="absolute -top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            {passengersEntering > 0 ? `+${passengersEntering}` : `-${passengersLeaving}`}
          </div>
        )}
        
        {/* Capacité */}
        <div className={`
          absolute bottom-1 right-1 text-xs font-bold text-white bg-black bg-opacity-70 rounded px-2 py-1
          transition-all duration-300
          ${currentPassengers >= maxPassengers ? 'bg-red-600 scale-110' : ''}
        `}>
          {currentPassengers}/{maxPassengers}
        </div>

        {/* Animation de pulsation quand des passagers montent/descendent */}
        {(passengersEntering > 0 || passengersLeaving > 0) && (
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-xl animate-ping opacity-60"></div>
        )}
      </div>

      {/* Effet de lumière pour l'ouverture des portes */}
      {doorsOpening && (
        <div className="absolute inset-0 bg-yellow-200 bg-opacity-20 animate-pulse"></div>
      )}
    </div>
  );
};

export default ElevatorShaft;