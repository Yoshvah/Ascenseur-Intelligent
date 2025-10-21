import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function ShoppingList() {
  const [manualItem, setManualItem] = useState("");

  const suggestions = [
    {
      id: 1,
      name: "Carottes",
      quantity: "1 kg",
      image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Tomates",
      quantity: "500 g",
      image: "https://images.unsplash.com/photo-1546470427-227b2f7f5a8e?w=300&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Pommes de terre",
      quantity: "1 kg",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Lait",
      quantity: "1 L",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop"
    }
  ];

  const [shoppingList, setShoppingList] = useState([]);

  const addToList = (item) => {
    if (!shoppingList.find(i => i.id === item.id)) {
      setShoppingList([...shoppingList, { ...item, added: true }]);
    }
  };

  const addManualItem = () => {
    if (manualItem.trim()) {
      const newItem = {
        id: Date.now(),
        name: manualItem,
        quantity: "",
        manual: true
      };
      setShoppingList([...shoppingList, newItem]);
      setManualItem("");
    }
  };

  const removeFromList = (id) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">Articles à acheter</h2>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Suggestions Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Suggestions</h3>
            <div className="flex gap-2">
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <button className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50">
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-4 gap-4">
            {suggestions.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 bg-gray-100">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{item.quantity}</p>
                  <button 
                    onClick={() => addToList(item)}
                    disabled={shoppingList.find(i => i.id === item.id)}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                      shoppingList.find(i => i.id === item.id)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Add Section */}
        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter manuellement</h3>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nom de l'article"
              value={manualItem}
              onChange={(e) => setManualItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addManualItem()}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button 
              onClick={addManualItem}
              className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Shopping List */}
        {shoppingList.length > 0 && (
          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ma liste ({shoppingList.length})</h3>
            <div className="space-y-2">
              {shoppingList.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div className="flex items-center gap-3">
                    {!item.manual && item.image && (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      {item.quantity && <p className="text-sm text-gray-600">{item.quantity}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromList(item.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}