import React from 'react';
import { ArrowLeft, Clock, ChefHat, Utensils, ShoppingCart } from 'lucide-react';

export default function RecipeDetail({ recipe, onBack }) {
  // Données de recette par défaut pour la démo
  const recipeData = {
    title: recipe?.title || 'Soupe de Légumes',
    image: recipe?.image || 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=400&fit=crop',
    type: 'Plat principal',
    time: recipe?.time || '30 min',
    difficulty: recipe?.difficulty || 'Facile',
    availableIngredients: [
      { name: '2 carottes', available: true },
      { name: '3 pommes de terre', available: true },
      { name: '1 oignon', available: true }
    ],
    missingIngredients: [
      { name: '2 poireaux', available: false },
      { name: '1L bouillon de légumes', available: false }
    ],
    steps: [
      'Épluchez et coupez tous les légumes en morceaux de taille égale.',
      'Dans une grande casserole, faites revenir l\'oignon émincé dans un peu d\'huile d\'olive jusqu\'à ce qu\'il soit translucide.',
      'Ajoutez les carottes, les pommes de terre et les poireaux. Faites-les revenir pendant 5 minutes.',
      'Versez le bouillon de légumes jusqu\'à couvrir les légumes. Portez à ébullition, puis baissez le feu et laissez mijoter pendant 20 minutes, jusqu\'à ce que les légumes soient tendres.',
      'Mixez la soupe à l\'aide d\'un mixeur plongeant jusqu\'à obtenir une consistance lisse.',
      'Salez, poivrez et servez chaud.'
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
        >
          <ArrowLeft size={20} />
          Retour aux recettes
        </button>
      </div>

      {/* Recipe Card */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Hero Image */}
          <div className="relative h-64 bg-gray-900">
            <img 
              src={recipeData.image} 
              alt={recipeData.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Title and Meta */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{recipeData.title}</h1>
              <div className="flex items-center gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Utensils size={18} />
                  <span>{recipeData.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} />
                  <span>{recipeData.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat size={18} />
                  <span>{recipeData.difficulty}</span>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Ingredients Section */}
              <div className="md:col-span-1">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ingrédients</h2>
                
                {/* Available Ingredients */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-green-600 mb-3">Disponibles</h3>
                  <div className="space-y-2">
                    {recipeData.availableIngredients.map((ingredient, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-green-600 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{ingredient.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Ingredients */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-orange-600 mb-3">Manquants</h3>
                  <div className="space-y-2">
                    {recipeData.missingIngredients.map((ingredient, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-1 w-5 h-5 rounded-full border-2 border-orange-600 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{ingredient.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add to List Button */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium transition-colors">
                  <ShoppingCart size={18} />
                  Ajouter à la liste
                </button>
              </div>

              {/* Preparation Section */}
              <div className="md:col-span-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Préparation</h2>
                <div className="space-y-4">
                  {recipeData.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-semibold text-gray-700">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}