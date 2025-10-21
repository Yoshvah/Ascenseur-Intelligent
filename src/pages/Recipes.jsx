import React, { useState, useEffect, createContext, useContext } from 'react';
import { Search, Edit2, Trash2, ChevronDown, Plus, ArrowLeft, X, Clock, TrendingUp } from 'lucide-react';

// Recipe Context
const RecipeContext = createContext();

const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

const RecipeProvider = ({ children }) => {
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      title: 'Soupe de Légumes',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&h=300&fit=crop',
      type: 'Plat principal',
      time: '30 min',
      difficulty: 'Facile',
      availableIngredients: ['Carottes', 'Pommes de terre', 'Oignons'],
      missingIngredients: ['Poireaux', 'Bouillon de légumes'],
      steps: [
        'Épluchez et coupez tous les légumes en morceaux de taille égale.',
        'Dans une grande casserole, faites revenir l\'oignon émincé dans un peu d\'huile d\'olive jusqu\'à ce qu\'il soit translucide.',
        'Ajoutez les carottes, les pommes de terre et les poireaux. Faites-les revenir pendant 5 minutes.',
        'Versez le bouillon de légumes jusqu\'à couvrir les légumes. Portez à ébullition, puis baissez le feu et laissez mijoter pendant 20 minutes.',
        'Mixez la soupe à l\'aide d\'un mixeur plongeant jusqu\'à obtenir une consistance lisse.',
        'Salez, poivrez et servez chaud.'
      ]
    },
    {
      id: 2,
      title: 'Salade de Quinoa et Légumes',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&h=300&fit=crop',
      type: 'Entrée',
      time: '25 min',
      difficulty: 'Facile',
      availableIngredients: ['Quinoa', 'Concombre', 'Tomates'],
      missingIngredients: ['Poivron', 'Vinaigrette citron'],
      steps: [
        'Rincez le quinoa à l\'eau froide.',
        'Faites cuire le quinoa dans de l\'eau bouillante pendant 15 minutes.',
        'Coupez les légumes en petits dés.',
        'Mélangez le quinoa refroidi avec les légumes.',
        'Ajoutez la vinaigrette et mélangez bien.',
        'Servez frais.'
      ]
    },
    {
      id: 3,
      title: 'Quiche Lorraine',
      image: 'https://images.unsplash.com/photo-1476124369491-b79d2aedb8f6?w=500&h=300&fit=crop',
      type: 'Plat principal',
      time: '45 min',
      difficulty: 'Moyen',
      availableIngredients: ['Pâte brisée', 'Lardons', 'Œufs', 'Crème'],
      missingIngredients: [],
      steps: [
        'Préchauffez le four à 180°C.',
        'Étalez la pâte brisée dans un moule à tarte.',
        'Faites revenir les lardons dans une poêle.',
        'Battez les œufs avec la crème fraîche.',
        'Répartissez les lardons sur la pâte et versez le mélange œufs-crème.',
        'Enfournez pour 35-40 minutes jusqu\'à ce que la quiche soit dorée.'
      ]
    },
    {
      id: 4,
      title: 'Omelette aux champignons',
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&h=300&fit=crop',
      type: 'Plat principal',
      time: '10 min',
      difficulty: 'Facile',
      availableIngredients: ['Œufs', 'Champignons'],
      missingIngredients: ['Fromage râpé'],
      steps: [
        'Émincez les champignons.',
        'Faites revenir les champignons dans une poêle avec un peu de beurre.',
        'Battez les œufs dans un bol.',
        'Versez les œufs dans la poêle avec les champignons.',
        'Laissez cuire quelques minutes en remuant délicatement.',
        'Servez chaud avec du fromage râpé.'
      ]
    }
  ]);

  const addRecipe = (recipe) => {
    const newRecipe = {
      id: Date.now(),
      ...recipe
    };
    setRecipes([...recipes, newRecipe]);
  };

  const updateRecipe = (id, updatedRecipe) => {
    setRecipes(recipes.map(r => 
      r.id === id ? { ...updatedRecipe, id } : r
    ));
  };

  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const getRecipe = (id) => {
    return recipes.find(r => r.id === id);
  };

  return (
    <RecipeContext.Provider value={{
      recipes,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      getRecipe
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

// Recipe List Component
function RecipeList({ onAddRecipe, onEditRecipe, onViewRecipe }) {
  const { recipes, deleteRecipe } = useRecipes();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

  const types = ['all', ...new Set(recipes.map(r => r.type))];
  const difficulties = ['all', 'Facile', 'Moyen', 'Difficile'];

  const getFilteredRecipes = () => {
    return recipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesDifficulty = filterDifficulty === 'all' || r.difficulty === filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-700';
      case 'Moyen': return 'bg-yellow-100 text-yellow-700';
      case 'Difficile': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Recettes</h2>
          <p className="text-gray-600">Découvrez et gérez vos recettes favorites.</p>
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher une recette..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <button 
                onClick={() => {
                  setShowTypeDropdown(!showTypeDropdown);
                  setShowDifficultyDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {filterType === 'all' ? 'Tous les types' : filterType}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              
              {showTypeDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  {types.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setFilterType(type);
                        setShowTypeDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        filterType === type ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {type === 'all' ? 'Tous les types' : type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setShowDifficultyDropdown(!showDifficultyDropdown);
                  setShowTypeDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {filterDifficulty === 'all' ? 'Toutes difficultés' : filterDifficulty}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              
              {showDifficultyDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  {difficulties.map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => {
                        setFilterDifficulty(difficulty);
                        setShowDifficultyDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        filterDifficulty === difficulty ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {difficulty === 'all' ? 'Toutes difficultés' : difficulty}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={onAddRecipe}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            <Plus size={20} />
            Ajouter Recette
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredRecipes().length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">
              Aucune recette trouvée
            </div>
          ) : (
            getFilteredRecipes().map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="h-48 bg-cover bg-center cursor-pointer"
                  style={{ backgroundImage: `url(${recipe.image})` }}
                  onClick={() => onViewRecipe(recipe.id)}
                />
                <div className="p-5">
                  <h3 
                    className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-green-600"
                    onClick={() => onViewRecipe(recipe.id)}
                  >
                    {recipe.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {recipe.time}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{recipe.type}</p>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onViewRecipe(recipe.id)}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium text-sm"
                    >
                      Voir détails
                    </button>
                    <button 
                      onClick={() => onEditRecipe(recipe.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?`)) {
                          deleteRecipe(recipe.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 text-sm text-gray-600">
          {getFilteredRecipes().length} recette(s) affichée(s) sur {recipes.length} total
        </div>
      </main>
    </div>
  );
}

// Add/Edit Recipe Form Component
function RecipeForm({ recipeId, onBack }) {
  const { getRecipe, addRecipe, updateRecipe } = useRecipes();
  const [form, setForm] = useState({
    title: "",
    type: "",
    time: "",
    difficulty: "",
    image: "",
    availableIngredients: [],
    missingIngredients: [],
    steps: []
  });

  const [currentIngredient, setCurrentIngredient] = useState("");
  const [currentMissingIngredient, setCurrentMissingIngredient] = useState("");
  const [currentStep, setCurrentStep] = useState("");

  useEffect(() => {
    if (recipeId) {
      const recipe = getRecipe(recipeId);
      if (recipe) {
        setForm(recipe);
      }
    }
  }, [recipeId, getRecipe]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setForm({
        ...form,
        availableIngredients: [...form.availableIngredients, currentIngredient.trim()]
      });
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index) => {
    setForm({
      ...form,
      availableIngredients: form.availableIngredients.filter((_, i) => i !== index)
    });
  };

  const addMissingIngredient = () => {
    if (currentMissingIngredient.trim()) {
      setForm({
        ...form,
        missingIngredients: [...form.missingIngredients, currentMissingIngredient.trim()]
      });
      setCurrentMissingIngredient("");
    }
  };

  const removeMissingIngredient = (index) => {
    setForm({
      ...form,
      missingIngredients: form.missingIngredients.filter((_, i) => i !== index)
    });
  };

  const addStep = () => {
    if (currentStep.trim()) {
      setForm({
        ...form,
        steps: [...form.steps, currentStep.trim()]
      });
      setCurrentStep("");
    }
  };

  const removeStep = (index) => {
    setForm({
      ...form,
      steps: form.steps.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.title && form.type && form.time && form.difficulty) {
      if (recipeId) {
        updateRecipe(recipeId, form);
        alert(`Recette modifiée : ${form.title}`);
      } else {
        addRecipe(form);
        alert(`Recette ajoutée : ${form.title}`);
      }
      onBack();
    } else {
      alert("Veuillez remplir tous les champs obligatoires");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeft size={20} />
        Retour aux recettes
      </button>

      <div className="bg-white shadow-md rounded-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          {recipeId ? 'Modifier la recette' : 'Ajouter une recette'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Titre de la recette *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Tarte aux pommes"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Type de plat *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="">Sélectionnez un type</option>
                <option value="Entrée">Entrée</option>
                <option value="Plat principal">Plat principal</option>
                <option value="Dessert">Dessert</option>
                <option value="Accompagnement">Accompagnement</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Temps de préparation *</label>
              <input
                type="text"
                name="time"
                value={form.time}
                onChange={handleChange}
                placeholder="Ex: 30 min"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">Difficulté *</label>
              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              >
                <option value="">Sélectionnez une difficulté</option>
                <option value="Facile">Facile</option>
                <option value="Moyen">Moyen</option>
                <option value="Difficile">Difficile</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">URL de l'image</label>
            <input
              type="url"
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ingrédients disponibles</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
                placeholder="Ex: Carottes, Pommes de terre..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addIngredient}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.availableIngredients.map((ingredient, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className="hover:text-green-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Ingrédients manquants (optionnel)</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentMissingIngredient}
                onChange={(e) => setCurrentMissingIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMissingIngredient())}
                placeholder="Ex: Poireaux, Fromage..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addMissingIngredient}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 font-medium"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.missingIngredients.map((ingredient, index) => (
                <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeMissingIngredient(index)}
                    className="hover:text-orange-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">Étapes de préparation</label>
            <div className="flex gap-2 mb-3">
              <textarea
                value={currentStep}
                onChange={(e) => setCurrentStep(e.target.value)}
                placeholder="Décrivez une étape..."
                rows="2"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium self-start"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {form.steps.map((step, index) => (
                <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-700">{step}</p>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
            >
              {recipeId ? 'Enregistrer les modifications' : 'Ajouter la recette'}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-xl"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Recipe Detail Component
function RecipeDetail({ recipeId, onBack, onEdit }) {
  const { getRecipe, deleteRecipe } = useRecipes();
  const recipe = getRecipe(recipeId);

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
        >
          <ArrowLeft size={20} />
          Retour aux recettes
        </button>
        <div className="text-center py-12 text-gray-500">Recette non trouvée</div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Facile': return 'bg-green-100 text-green-700';
      case 'Moyen': return 'bg-yellow-100 text-yellow-700';
      case 'Difficile': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium mb-6"
      >
        <ArrowLeft size={20} />
        Retour aux recettes
      </button>

      <div className="bg-white shadow-md rounded-2xl overflow-hidden">
        {recipe.image && (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${recipe.image})` }}
          />
        )}
        
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{recipe.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Clock size={18} />
                  {recipe.time}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                  {recipe.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {recipe.type}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onEdit(recipe.id)}
                className="flex items-center gap-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg font-medium"
              >
                <Edit2 size={18} />
                Modifier
              </button>
              <button 
                onClick={() => {
                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${recipe.title}" ?`)) {
                    deleteRecipe(recipe.id);
                    onBack();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <Trash2 size={18} />
                Supprimer
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingrédients disponibles</h3>
              <ul className="space-y-2">
                {recipe.availableIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {recipe.missingIngredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingrédients manquants</h3>
                <ul className="space-y-2">
                  {recipe.missingIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Étapes de préparation</h3>
            <div className="space-y-4">
              {recipe.steps.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <p className="flex-1 text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main App Component
export default function App() {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit', 'detail'
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  const handleAddRecipe = () => {
    setSelectedRecipeId(null);
    setView('add');
  };

  const handleEditRecipe = (id) => {
    setSelectedRecipeId(id);
    setView('edit');
  };

  const handleViewRecipe = (id) => {
    setSelectedRecipeId(id);
    setView('detail');
  };

  const handleBack = () => {
    setView('list');
    setSelectedRecipeId(null);
  };

  return (
    <RecipeProvider>
      <div className="min-h-screen bg-gray-50">
        {view === 'list' && (
          <RecipeList 
            onAddRecipe={handleAddRecipe}
            onEditRecipe={handleEditRecipe}
            onViewRecipe={handleViewRecipe}
          />
        )}
        {view === 'add' && (
          <RecipeForm 
            onBack={handleBack}
          />
        )}
        {view === 'edit' && (
          <RecipeForm 
            recipeId={selectedRecipeId}
            onBack={handleBack}
          />
        )}
        {view === 'detail' && (
          <RecipeDetail 
            recipeId={selectedRecipeId}
            onBack={handleBack}
            onEdit={handleEditRecipe}
          />
        )}
      </div>
    </RecipeProvider>
  );
}