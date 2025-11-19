import React, { useState, useEffect } from 'react';
import { View, PantryItem } from './types';
import { getItems, seedInitialData, addOrUpdateItem, deleteItem } from './services/storageService';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import ShoppingList from './components/ShoppingList';
import AddItemModal from './components/AddItemModal';
import SettingsModal from './components/SettingsModal';
import RoleSelection from './components/RoleSelection';
import ToastNotifications from './components/ToastNotifications';

const App: React.FC = () => {
  // Session State
  const [userRole, setUserRole] = useState<'staff' | 'guest' | null>(null);
  
  const [currentView, setCurrentView] = useState<View>('inventory');
  const [items, setItems] = useState<PantryItem[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Data function
  const loadItems = async () => {
      const data = await getItems();
      setItems(data);
      setIsLoading(false);
  };

  // Initial load and Role Effect
  useEffect(() => {
    // Try to seed data on first load (checks if empty internally)
    seedInitialData().then(() => loadItems());
    
    if (userRole === 'staff') setCurrentView('dashboard');
    else if (userRole === 'guest') setCurrentView('inventory');
  }, [userRole]);

  // Real-time Synchronization
  useEffect(() => {
    const handleStorageChange = () => {
      loadItems();
    };

    window.addEventListener('pantry-update', handleStorageChange);
    return () => {
      window.removeEventListener('pantry-update', handleStorageChange);
    };
  }, []);

  const handleAddItem = async (newItem: Omit<PantryItem, 'id' | 'addedDate'>) => {
    const result = await addOrUpdateItem(newItem);
    if (result.success) {
        loadItems();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Delete this item from the menu?')) {
      await deleteItem(id);
      loadItems();
    }
  };

  // Render logic
  if (!userRole) {
    return <RoleSelection onSelect={setUserRole} />;
  }

  const renderView = () => {
    if (isLoading) return <div className="h-full flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div></div>;

    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory items={items} isStaff={userRole === 'staff'} onDelete={handleDeleteItem} />;
      case 'orders':
        return <ShoppingList />;
      default:
        return <Inventory items={items} isStaff={userRole === 'staff'} onDelete={handleDeleteItem} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      <ToastNotifications />
      
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        onAddClick={() => setIsAddModalOpen(true)}
        isStaff={userRole === 'staff'}
        onLogout={() => setUserRole(null)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto h-full relative">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full h-full flex flex-col">
          {renderView()}
        </div>
      </main>

      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddItem} 
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;