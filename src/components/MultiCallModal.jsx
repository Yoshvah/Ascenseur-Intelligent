import React, { useState, useEffect } from 'react';

const MultiCallModal = ({ 
  pendingCalls = [],
  onConfirmCall,
  onCancelCall,
  currentPassengers = 0,
  maxPassengers = 8,
  floors = 10,
  elevatorPosition = 0,
  elevatorDirection = 'idle'
}) => {
  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [passengerCount, setPassengerCount] = useState(1);
  const [destination, setDestination] = useState(1);

  // S'il n'y a pas d'appels en attente, ne rien afficher
  if (!pendingCalls || pendingCalls.length === 0) {
    return null;
  }

  const currentCall = pendingCalls[activeModalIndex];
  
  // Vérifier que currentCall existe
  if (!currentCall) {
    return null;
  }

  // Countdown automatique
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Auto-confirm après 5 secondes
      handleAutoConfirm();
    }
  }, [countdown]);

  // Initialiser la destination
  useEffect(() => {
    if (currentCall) {
      // Définir une destination par défaut (différente de l'étage d'appel)
      const defaultDestination = currentCall.floor === 0 ? 1 : 0;
      setDestination(defaultDestination);
      setPassengerCount(currentCall.passengers || 1);
    }
  }, [currentCall]);

  const handleAutoConfirm = () => {
    if (onConfirmCall && currentCall) {
      onConfirmCall(
        currentCall.floor,
        currentCall.direction,
        passengerCount,
        destination
      );
      moveToNextOrClose();
    }
  };

  const handleManualConfirm = () => {
    if (onConfirmCall && currentCall) {
      onConfirmCall(
        currentCall.floor,
        currentCall.direction,
        passengerCount,
        destination
      );
      moveToNextOrClose();
    }
  };

  const handleSkip = () => {
    if (onCancelCall && currentCall.id) {
      onCancelCall(currentCall.id);
    }
    moveToNextOrClose();
  };

  const moveToNextOrClose = () => {
    if (activeModalIndex < pendingCalls.length - 1) {
      setActiveModalIndex(prev => prev + 1);
      setCountdown(5);
    } else {
      // Dernier modal, on ferme
      if (onCancelCall && currentCall.id) {
        onCancelCall(currentCall.id);
      }
    }
  };

  const availableSpace = maxPassengers - currentPassengers;
  const canAcceptPassengers = passengerCount <= availableSpace;
  const isValidDestination = destination !== currentCall.floor;

  // Calculer la distance optimisée
  const calculateOptimizedDistance = () => {
    if (!currentCall) return 0;
    const distanceToPickup = Math.abs(elevatorPosition - currentCall.floor);
    const distanceToDestination = Math.abs(currentCall.floor - destination);
    return distanceToPickup + distanceToDestination;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-purple-500/30">
        {/* En-tête avec compteur */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            📞 Appel d'ascenseur
          </h3>
          <div className="flex items-center space-x-2">
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              {activeModalIndex + 1}/{pendingCalls.length}
            </span>
            <span className="text-yellow-400 font-bold text-lg">
              {countdown}s
            </span>
          </div>
        </div>

        {/* Barre de progression du countdown */}
        <div className="mb-6">
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(5 - countdown) / 5 * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-300 text-sm text-center">
            Confirmation automatique dans {countdown} seconde{countdown !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Informations de l'appel */}
        <div className="space-y-4 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-xl">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Départ</p>
                <p className="text-2xl font-bold text-white">
                  {currentCall.floor === 0 ? 'RDC' : `Étage ${currentCall.floor}`}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Direction: <span className={`font-bold ${currentCall.direction === 'up' ? 'text-green-400' : 'text-blue-400'}`}>
                    {currentCall.direction === 'up' ? '↑ MONTÉE' : '↓ DESCENTE'}
                  </span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Arrivée</p>
                <div className="relative">
                  <select
                    value={destination}
                    onChange={(e) => setDestination(parseInt(e.target.value))}
                    className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-center text-lg font-bold appearance-none"
                  >
                    {Array.from({ length: floors }, (_, i) => (
                      <option key={i} value={i} disabled={i === currentCall.floor}>
                        {i === 0 ? 'RDC' : `Étage ${i}`}
                        {i === currentCall.floor ? ' (Départ)' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sélecteur de nombre de passagers */}
          <div className="bg-gray-800/50 p-4 rounded-xl">
            <p className="text-gray-400 text-sm mb-3">Nombre de passagers</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  disabled={passengerCount <= 1}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-white w-8 text-center">
                  {passengerCount}
                </span>
                <button
                  onClick={() => setPassengerCount(Math.min(availableSpace, passengerCount + 1))}
                  disabled={passengerCount >= availableSpace}
                  className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Place disponible</p>
                <p className={`text-lg font-bold ${canAcceptPassengers ? 'text-green-400' : 'text-red-400'}`}>
                  {availableSpace}/{maxPassengers}
                </p>
              </div>
            </div>
            {!canAcceptPassengers && (
              <p className="text-red-400 text-sm mt-2">
                ⚠️ Pas assez de place disponible
              </p>
            )}
          </div>

          {/* Informations d'optimisation */}
          <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-400">🤖</span>
              <span className="text-white text-sm font-bold">Optimisation du trajet</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="text-center p-2 bg-black/30 rounded">
                <p className="text-gray-400">Distance totale</p>
                <p className="text-green-400 font-bold">{calculateOptimizedDistance()} étages</p>
              </div>
              <div className="text-center p-2 bg-black/30 rounded">
                <p className="text-gray-400">Sur le chemin</p>
                <p className={`font-bold ${elevatorDirection === currentCall.direction ? 'text-green-400' : 'text-yellow-400'}`}>
                  {elevatorDirection === currentCall.direction ? 'OUI ✓' : 'NON ✗'}
                </p>
              </div>
            </div>
          </div>

          {/* File d'attente (si plusieurs appels) */}
          {pendingCalls.length > 1 && (
            <div className="bg-gray-900/50 p-3 rounded-xl">
              <p className="text-gray-400 text-sm mb-2">File d'attente:</p>
              <div className="flex flex-wrap gap-2">
                {pendingCalls.map((call, index) => (
                  <button
                    key={call.id || index}
                    onClick={() => {
                      setActiveModalIndex(index);
                      setCountdown(5);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                      index === activeModalIndex 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {call.floor}→{call.destination || '?'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
          >
            {pendingCalls.length > 1 ? 'Passer' : 'Annuler'}
          </button>
          <button
            onClick={handleManualConfirm}
            disabled={!canAcceptPassengers || !isValidDestination}
            className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium shadow-lg ${
              canAcceptPassengers && isValidDestination
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }`}
          >
            Confirmer ({countdown}s)
          </button>
        </div>

        {/* Message d'erreur */}
        {(!canAcceptPassengers || !isValidDestination) && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
            <p className="text-red-300 text-sm">
              {!canAcceptPassengers && '❌ Pas assez de place disponible. '}
              {!isValidDestination && '❌ La destination doit être différente du départ. '}
              Ajustez les paramètres pour confirmer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiCallModal;