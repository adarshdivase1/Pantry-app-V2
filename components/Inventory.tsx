import React, { useState } from 'react';
import { PantryItem, Category, OrderItem } from '../types';
import { Search, Filter, Trash2, Plus, Minus, ShoppingCart, Loader2, Box, PackageOpen, Tag } from 'lucide-react';
import { placeOrder } from '../services/storageService';

interface InventoryProps {
  items: PantryItem[];
  isStaff: boolean;
  onDelete: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, isStaff, onDelete }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Cart State
  const [cart, setCart] = useState<{item: PantryItem, qty: number}[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: PantryItem) => {
    const inCart = cart.find(i => i.item.id === item.id);
    const currentQty = inCart ? inCart.qty : 0;
    if (currentQty >= item.quantity) {
        alert(`Only ${item.quantity} available.`);
        return;
    }
    setCart(prev => {
        const existing = prev.find(i => i.item.id === item.id);
        if (existing) return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
        return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(i => i.item.id !== itemId));

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => {
        return prev.map(i => {
            if (i.item.id === itemId) {
                const newQty = i.qty + delta;
                if (newQty > i.item.quantity) return i;
                return newQty > 0 ? { ...i, qty: newQty } : i;
            }
            return i;
        });
    });
  };

  const submitOrder = async () => {
      if (!roomNumber) return alert("Please enter a room number");
      setSubmitting(true);
      
      const orderItems: OrderItem[] = cart.map(c => ({
          itemId: c.item.id,
          name: c.item.name,
          quantity: c.qty,
          unit: c.item.unit
      }));

      try {
        const result = await placeOrder({
          id: crypto.randomUUID(),
          roomNumber,
          items: orderItems,
          status: 'pending',
          timestamp: new Date().toISOString()
        });
        
        if (result.success) {
            setCart([]);
            setIsCheckingOut(false);
            setRoomNumber('');
            alert("Order placed successfully!");
        } else {
            alert(result.error || "Failed.");
            setIsCheckingOut(false);
        }
      } catch (e) {
        alert("An error occurred");
      } finally {
        setSubmitting(false);
      }
  };

  return (
    <div className="h-full flex flex-col relative">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {isStaff ? 'Inventory Management' : 'Pantry Menu'}
            </h1>
            <p className="text-slate-500 text-sm">
                {isStaff ? 'Track and manage stock levels.' : 'Select items to order for your room.'}
            </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none w-full bg-white shadow-sm text-sm"
                />
            </div>
            <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-4 pr-8 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-sm font-medium text-slate-700 shadow-sm"
            >
                <option value="All">All Categories</option>
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 pr-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => {
                const isLow = item.quantity <= 5 && item.quantity > 0;
                const isOut = item.quantity === 0;

                return (
                <div key={item.id} className={`bg-white rounded-xl border transition-all flex flex-col justify-between group ${isOut ? 'border-slate-100 opacity-75' : 'border-slate-200 hover:shadow-lg hover:border-emerald-200'}`}>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-xs font-medium text-slate-500 border border-slate-100">
                                {item.category}
                            </span>
                            {isStaff && (
                                <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        
                        <h3 className="font-bold text-slate-800 text-lg mb-1 leading-snug">{item.name}</h3>
                        
                        <div className="flex items-center mt-4 space-x-2">
                            <div className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold flex items-center ${isOut ? 'bg-slate-100 text-slate-500' : isLow ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                <PackageOpen className="w-4 h-4 mr-2 opacity-75" />
                                {isOut ? 'Out of Stock' : `${item.quantity} ${item.unit}`}
                            </div>
                        </div>
                    </div>
                    
                    {!isStaff && !isOut && (
                        <button 
                            onClick={() => addToCart(item)}
                            className="w-full py-3 bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-600 font-medium text-sm transition-colors rounded-b-xl border-t border-slate-100 flex items-center justify-center group-hover:border-emerald-500"
                        >
                            <Plus className="w-4 h-4 mr-1.5" /> Add to Order
                        </button>
                    )}
                    {!isStaff && isOut && (
                        <div className="w-full py-3 bg-slate-50 text-slate-400 text-xs font-medium text-center rounded-b-xl border-t border-slate-100">
                            Unavailable
                        </div>
                    )}
                </div>
            )})}
          </div>
      </div>

      {/* Cart Footer */}
      {!isStaff && cart.length > 0 && (
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-xl z-30">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between ring-1 ring-white/10">
                <div className="flex items-center gap-4">
                    <div className="relative bg-emerald-500 p-2 rounded-lg">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900">
                            {cart.reduce((acc, i) => acc + i.qty, 0)}
                        </span>
                    </div>
                    <div>
                        <p className="font-bold text-sm">Current Order</p>
                        <p className="text-xs text-slate-400">{cart.length} items selected</p>
                    </div>
                </div>
                <button 
                    onClick={() => setIsCheckingOut(true)}
                    className="px-5 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors"
                >
                    Checkout
                </button>
            </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckingOut && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h2 className="font-bold text-slate-800">Checkout</h2>
                      <button onClick={() => setIsCheckingOut(false)} className="text-slate-400 hover:text-slate-600"><Minus className="w-5 h-5 rotate-45" /></button>
                  </div>
                  <div className="p-5 overflow-y-auto">
                      <div className="space-y-3 mb-6">
                          {cart.map((c, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <div>
                                      <p className="font-medium text-slate-800 text-sm">{c.item.name}</p>
                                      <p className="text-xs text-slate-500">{c.item.unit}</p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                      <button onClick={() => updateQty(c.item.id, -1)} className="p-1 hover:bg-slate-200 rounded"><Minus className="w-3 h-3" /></button>
                                      <span className="text-sm font-bold w-4 text-center">{c.qty}</span>
                                      <button onClick={() => updateQty(c.item.id, 1)} disabled={c.qty >= c.item.quantity} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30"><Plus className="w-3 h-3" /></button>
                                      <button onClick={() => removeFromCart(c.item.id)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3 h-3" /></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                      <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Room Number</label>
                          <input 
                              type="text" 
                              value={roomNumber}
                              onChange={(e) => setRoomNumber(e.target.value)}
                              placeholder="e.g. 101"
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                              autoFocus
                          />
                      </div>
                  </div>
                  <div className="p-5 border-t border-slate-100">
                      <button 
                        onClick={submitOrder}
                        disabled={!roomNumber || submitting}
                        className="w-full py-3 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center justify-center disabled:opacity-70 shadow-lg shadow-emerald-500/30"
                      >
                          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Order'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default Inventory;