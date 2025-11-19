import React, { useState } from 'react';
import { X, Plus, Box, Layers } from 'lucide-react';
import { Category, Unit, PantryItem } from '../types';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<PantryItem, 'id' | 'addedDate'>) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>(Unit.PIECE);
  const [category, setCategory] = useState<string>(Category.OTHER);

  if (!isOpen) return null;

  const handleSubmit = () => {
      if (!name) return;
      const today = new Date();
      const expiryDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
      
      onAdd({ name, quantity, unit, category, expiryDate });
      setName('');
      setQuantity(1);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Add Inventory Item</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Item Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Apples"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                    autoFocus
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Unit</label>
                    <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                    >
                        {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-500 outline-none bg-white"
                >
                    {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <button 
                onClick={handleSubmit}
                disabled={!name}
                className="w-full py-3 mt-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
                Add Item
            </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;