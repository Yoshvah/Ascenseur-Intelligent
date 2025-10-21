import React, { useState } from 'react';
import { Search, Edit2, Trash2, ChevronDown, Plus } from 'lucide-react';
import { useProducts } from '../context/ProductContext';

export default function Inventory({ onAddProduct, onEditProduct }) {
  const { products, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      fresh: { label: 'Frais', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
      expiring: { label: 'Bientôt périmé', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
      expired: { label: 'Périmé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
      low: { label: 'Stock faible', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' }
    };
    return configs[status];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Obtenir toutes les catégories uniques
  const categories = ['all', ...new Set(products.map(p => p.category))];

  // Filtrer et trier les produits
  const getFilteredAndSortedProducts = () => {
    let filtered = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Trier les produits
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date-asc':
          return new Date(a.expiration) - new Date(b.expiration);
        case 'date-desc':
          return new Date(b.expiration) - new Date(a.expiration);
        case 'quantity-asc':
          return a.quantity - b.quantity;
        case 'quantity-desc':
          return b.quantity - a.quantity;
        case 'status':
          const statusOrder = { expired: 0, expiring: 1, low: 2, fresh: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

    return sorted;
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'name': return 'Nom (A-Z)';
      case 'date-asc': return 'Date (plus proche)';
      case 'date-desc': return 'Date (plus loin)';
      case 'quantity-asc': return 'Quantité (croissant)';
      case 'quantity-desc': return 'Quantité (décroissant)';
      case 'status': return 'Statut (urgent)';
      default: return 'Trier par';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Inventaire</h2>
          <p className="text-gray-600">Gérez vos produits et réduisez le gaspillage.</p>
        </div>

        {/* Search and Actions Bar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex-1 max-w-2xl relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-3">
            {/* Filter by Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">
                  {filterCategory === 'all' ? 'Toutes les catégories' : filterCategory}
                </span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFilterCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        filterCategory === category ? 'bg-green-50 text-green-700' : 'text-gray-700'
                      }`}
                    >
                      {category === 'all' ? 'Toutes les catégories' : category}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSortDropdown(!showSortDropdown);
                  setShowCategoryDropdown(false);
                }}
                className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50"
              >
                <span className="text-gray-700">{getSortLabel()}</span>
                <ChevronDown size={18} className="text-gray-500" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[200px]">
                  <button
                    onClick={() => {
                      setSortBy('name');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      sortBy === 'name' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Nom (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('date-asc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      sortBy === 'date-asc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Date (plus proche)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('date-desc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      sortBy === 'date-desc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Date (plus loin)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('quantity-asc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      sortBy === 'quantity-asc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Quantité (croissant)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('quantity-desc');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      sortBy === 'quantity-desc' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Quantité (décroissant)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('status');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                      sortBy === 'status' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    Statut (urgent d'abord)
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={onAddProduct}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            <Plus size={20} />
            Ajouter Produit
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Produit</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Catégorie</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Péremption</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Quantité</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Statut</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredAndSortedProducts().length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Aucun produit trouvé
                  </td>
                </tr>
              ) : (
                getFilteredAndSortedProducts().map((product) => {
                  const statusConfig = getStatusConfig(product.status);
                  return (
                    <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-5 px-6 text-gray-900 font-medium">{product.name}</td>
                      <td className="py-5 px-6 text-gray-600">{product.category}</td>
                      <td className="py-5 px-6 text-gray-600">{formatDate(product.expiration)}</td>
                      <td className="py-5 px-6 text-gray-900 font-medium">{product.quantity}</td>
                      <td className="py-5 px-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.color}`}>
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
                          <span className="text-sm font-medium">{statusConfig.label}</span>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => onEditProduct(product.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${product.name} ?`)) {
                                deleteProduct(product.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-600">
          {getFilteredAndSortedProducts().length} produit(s) affiché(s) sur {products.length} total
        </div>
      </main>
    </div>
  );
}