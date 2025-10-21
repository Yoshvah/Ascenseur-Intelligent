import { createContext, useState, useContext } from 'react';

const RecipeContext = createContext();

export const useRecipes = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
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

  // CREATE
  const addRecipe = (recipe) => {
    const newRecipe = {
      id: Date.now(),
      ...recipe
    };
    setRecipes([...recipes, newRecipe]);
  };

  // UPDATE
  const updateRecipe = (id, updatedRecipe) => {
    setRecipes(recipes.map(r => 
      r.id === id ? { ...updatedRecipe, id } : r
    ));
  };

  // DELETE
  const deleteRecipe = (id) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  // GET ONE
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