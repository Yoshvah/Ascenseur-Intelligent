import { createContext, useState, useContext } from 'react';

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Lait',
      category: 'Produits laitiers',
      expiration: '2024-07-15',
      quantity: 1,
      status: 'fresh'
    },
    {
      id: 2,
      name: 'Yaourt',
      category: 'Produits laitiers',
      expiration: '2024-07-10',
      quantity: 4,
      status: 'expiring'
    },
    {
      id: 3,
      name: 'Pommes',
      category: 'Fruits & Légumes',
      expiration: '2024-07-20',
      quantity: 5,
      status: 'fresh'
    },
    {
      id: 4,
      name: 'Poulet',
      category: 'Viandes',
      expiration: '2024-07-05',
      quantity: 1,
      status: 'expired'
    },
    {
      id: 5,
      name: 'Carottes',
      category: 'Fruits & Légumes',
      expiration: '2024-07-12',
      quantity: 2,
      status: 'low'
    }
  ]);

  // Fonction pour calculer le statut
  const calculateStatus = (expiration, quantity) => {
    const today = new Date();
    const expirationDate = new Date(expiration);
    const daysUntilExpiration = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) return 'expired';
    if (daysUntilExpiration <= 3) return 'expiring';
    if (quantity <= 2) return 'low';
    return 'fresh';
  };

  // CREATE
  const addProduct = (product) => {
    const newProduct = {
      id: Date.now(),
      ...product,
      status: calculateStatus(product.expiration, product.quantity)
    };
    setProducts([...products, newProduct]);
  };

  // UPDATE
  const updateProduct = (id, updatedProduct) => {
    setProducts(products.map(p => 
      p.id === id 
        ? { ...updatedProduct, id, status: calculateStatus(updatedProduct.expiration, updatedProduct.quantity) }
        : p
    ));
  };

  // DELETE
  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  // GET ONE
  const getProduct = (id) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      getProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};