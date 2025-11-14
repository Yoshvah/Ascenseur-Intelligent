import React, { useState, useEffect } from 'react';

const CallModal = ({ 
  pendingCall, 
  onConfirm, 
  onCancel, 
  maxCapacity,
  currentPassengers,
  floors 
}) => {
  const [passengers, setPassengers] = useState(1);
  const [destination, setDestination] = useState(0);

  useEffect(() => {
    if (pendingCall) {
      // Définir une destination par défaut différente de l'étage actuel
      const defaultDestination = pendingCall.floor === 0 ? 1 : 0;
      setDestination(defaultDestination);
      setPassengers(1);
    }
  }, [pendingCall]);

  if (!pendingCall) return null;

  const availableSpace = maxCapacity - currentPassengers;
  const maxPassengers = Math.min(availableSpace, 6); // Maximum 6 personnes par appel

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passengers > 0 && destination !== pendingCall.floor) {
      onConfirm(passengers, destination);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          📞 Appel d'ascenseur
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Étage d'appel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Étage d'appel
              </label>
              <div className="bg-gray-100 p-3 rounded-lg font-semibold">
                {pendingCall.floor === 0 ? 'Rez-de-chaussée' : `Étage ${pendingCall.floor}`}
                <span className="ml-2 text-blue-600">
                  ({pendingCall.direction === 'up' ? '↑ Direction haut' : '↓ Direction bas'})
                </span>
              </div>
            </div>

            {/* Nombre de personnes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de personnes
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  disabled={passengers <= 1}
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold disabled:opacity-50"
                >
                  -
                </button>
                
                <span className="text-2xl font-bold w-8 text-center">{passengers}</span>
                
                <button
                  type="button"
                  onClick={() => setPassengers(Math.min(maxPassengers, passengers + 1))}
                  disabled={passengers >= maxPassengers}
                  className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold disabled:opacity-50"
                >
                  +
                </button>
                
                <span className="text-sm text-gray-600 ml-2">
                  Place disponible: {availableSpace}
                </span>
              </div>
              {passengers > availableSpace && (
                <p className="text-red-500 text-sm mt-2">
                  ❌ Pas assez de place disponible
                </p>
              )}
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: floors }, (_, i) => (
                  <option key={i} value={i} disabled={i === pendingCall.floor}>
                    {i === 0 ? 'Rez-de-chaussée' : `Étage ${i}`}
                    {i === pendingCall.floor ? ' (Étage actuel)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Résumé */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-semibold text-blue-800">
                Résumé de l'appel:
              </p>
              <p className="text-blue-700">
                {passengers} personne(s) de l'étage {pendingCall.floor === 0 ? 'RDC' : pendingCall.floor} 
                vers {destination === 0 ? 'RDC' : `étage ${destination}`}
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={passengers > availableSpace || passengers === 0 || destination === pendingCall.floor}
              className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmer l'appel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CallModal;