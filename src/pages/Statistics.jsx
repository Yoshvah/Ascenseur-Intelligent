import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Statistics() {
  // Données pour le graphique du gaspillage par mois
  const wasteData = [
    { month: 'Jan', value: 8 },
    { month: 'Fév', value: 35 },
    { month: 'Mar', value: 28 },
    { month: 'Avr', value: 32 },
    { month: 'Mai', value: 18 },
    { month: 'Juin', value: 25 }
  ];

  // Données pour la consommation par catégorie
  const categoryData = [
    { name: 'Fruits', value: 35, color: '#22c55e' },
    { name: 'Légumes', value: 75, color: '#22c55e' },
    { name: 'Produits laitiers', value: 25, color: '#22c55e' },
    { name: 'Viandes', value: 15, color: '#22c55e' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900">Statistiques d'Utilisation</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Gaspillage évité */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Gaspillage évité</p>
          <p className="text-4xl font-bold text-green-500">25 kg</p>
        </div>

        {/* Produits les plus consommés */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Produits les plus consommés</p>
          <p className="text-xl font-bold text-gray-900">Tomates, Carottes, Lait</p>
        </div>

        {/* Économies réalisées */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <p className="text-gray-600 text-sm mb-2">Économies réalisées</p>
          <p className="text-4xl font-bold text-green-500">50 €</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gaspillage évité par mois */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Gaspillage évité par mois</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={wasteData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#bbf7d0" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Consommation par catégorie */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Consommation par catégorie</h3>
          <div className="space-y-6 pt-8">
            {categoryData.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-900 font-medium">{category.name}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${category.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}