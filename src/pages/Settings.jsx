import React, { useState } from 'react';

export default function Settings() {
  const [expirationDays, setExpirationDays] = useState(3);
  const [temperature, setTemperature] = useState(4.0);
  const [category, setCategory] = useState('Fruits');
  const [minStock, setMinStock] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [currentTemp] = useState(4);

  const handleAddThreshold = () => {
    if (category && minStock) {
      alert(`Seuil ajouté: ${category} - ${minStock}`);
      setMinStock('');
    }
  };

  const handleAddCategory = () => {
    if (newCategory) {
      alert(`Catégorie ajoutée: ${newCategory}`);
      setNewCategory('');
    }
  };

  const handleSave = () => {
    alert('Paramètres enregistrés !');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Paramètres du Frigo</h2>
        <p className="text-gray-600">Gérez les alertes, les stocks et les autres paramètres de votre frigo intelligent.</p>
      </div>

      <div className="space-y-6">
        {/* Alertes de Péremption */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Alertes de Péremption</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Nombre de jours avant l'expiration pour l'alerte</label>
              <span className="text-2xl font-bold text-gray-900 ml-4">{expirationDays}</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={expirationDays}
              onChange={(e) => setExpirationDays(parseInt(e.target.value))}
              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-500"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(expirationDays / 7) * 100}%, #dcfce7 ${(expirationDays / 7) * 100}%, #dcfce7 100%)`
              }}
            />
          </div>
        </div>

        {/* Seuils de Stock Minimum */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Seuils de Stock Minimum</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm mb-2">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                <option>Fruits</option>
                <option>Légumes</option>
                <option>Produits laitiers</option>
                <option>Viandes</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm mb-2">Seuil minimum</label>
              <input
                type="number"
                placeholder="Ex: 2"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button 
            onClick={handleAddThreshold}
            className="w-full py-3 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-colors"
          >
            Ajouter un seuil
          </button>
        </div>

        {/* Catégories de Produits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Catégories de Produits</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm mb-2">Nom de la nouvelle catégorie</label>
            <input
              type="text"
              placeholder="Ex: Boissons"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={handleAddCategory}
            className="w-full py-3 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-colors"
          >
            Ajouter une catégorie
          </button>
        </div>

        {/* Température du Frigo */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Température du Frigo</h3>
          
          <div className="space-y-4">
            <div className="text-gray-700">
              Température actuelle: <span className="font-bold text-gray-900">{currentTemp}°C</span>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-gray-700">Température cible (°C)</label>
              <span className="text-2xl font-bold text-gray-900 ml-4">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-500"
              style={{
                background: `linear-gradient(to right, #22c55e 0%, #22c55e ${(temperature / 8) * 100}%, #dcfce7 ${(temperature / 8) * 100}%, #dcfce7 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
        >
          Enregistrer
        </button>
      </div>
    </div>
  );
}