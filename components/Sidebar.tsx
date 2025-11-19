import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Coffee, ShoppingBag, Settings, PlusCircle, LogOut, Package } from 'lucide-react';
import { View } from '../types';
import { isCloud } from '../services/storageService';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  onAddClick: () => void;
  isStaff: boolean;
  onLogout: () => void;
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, onAddClick, isStaff, onLogout, onSettingsClick }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(isCloud());
    const handleUpdate = () => setConnected(isCloud());
    window.addEventListener('pantry-update', handleUpdate);
    return () => window.removeEventListener('pantry-update', handleUpdate);
  }, []);

  const staffNavItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
  ];

  const roomNavItems = [
    { id: 'inventory', label: 'Service Menu', icon: Coffee },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
  ];

  const navItems = isStaff ? staffNavItems : roomNavItems;

  return (
    <div className="w-20 lg:w-64 h-full bg-slate-900 text-slate-300 flex flex-col justify-between transition-all duration-300 z-20 shadow-xl border-r border-slate-800">
      <div>
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/50">
            P
          </div>
          <div className="ml-3 hidden lg:block">
            <h1 className="font-bold text-white text-lg leading-none tracking-tight">PantryApp</h1>
            <div className="flex items-center mt-1">
                 <div className={`w-2 h-2 rounded-full mr-1.5 ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-500'}`}></div>
                 <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {connected ? 'Live Sync' : 'Local Mode'}
                </span>
            </div>
          </div>
        </div>

        <nav className="mt-8 px-3 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={`w-full flex items-center px-3 lg:px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                <span className="ml-3 hidden lg:block font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4 space-y-3 border-t border-slate-800 bg-slate-900">
        {isStaff && (
            <button
            onClick={onAddClick}
            className="w-full flex items-center justify-center bg-white text-slate-900 hover:bg-slate-200 py-3 rounded-lg shadow-md transition-all active:scale-95 font-semibold"
            >
            <PlusCircle className="w-5 h-5" />
            <span className="ml-2 hidden lg:block">Add Item</span>
            </button>
        )}

        <div className="flex gap-2">
            <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white py-2.5 rounded-lg transition-all text-sm font-medium border border-slate-700 hover:border-slate-600"
                title="Logout / Change Role"
            >
                <LogOut className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Exit</span>
            </button>
            <button
                onClick={onSettingsClick}
                className="flex items-center justify-center px-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700 hover:border-slate-600"
                title="Settings"
            >
                <Settings className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;