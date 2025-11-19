import React from 'react';
import { UserCircle, ShieldCheck, Hotel, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: 'staff' | 'guest') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg shadow-emerald-900/20 mb-4">
            <Hotel className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Welcome to PantryApp</h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">Please select your access level to continue to the dashboard.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Guest Card */}
          <button 
            onClick={() => onSelect('guest')}
            className="group relative bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 text-left flex flex-col"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500">
                <UserCircle className="w-32 h-32 text-emerald-600" />
            </div>
            
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UserCircle className="w-8 h-8 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Guest Services</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Browse the amenity menu, request items for your room, and track order status.
            </p>
            
            <div className="mt-auto flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform">
              Enter as Guest <ArrowRight className="w-5 h-5 ml-2" />
            </div>
          </button>

          {/* Staff Card */}
          <button 
            onClick={() => onSelect('staff')}
            className="group relative bg-slate-900 p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-300 text-left flex flex-col overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 opacity-100 z-0"></div>
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 z-0">
                <ShieldCheck className="w-32 h-32 text-white" />
            </div>
            
            <div className="relative z-10 w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            
            <div className="relative z-10">
                <h2 className="text-2xl font-bold text-white mb-2">Staff Portal</h2>
                <p className="text-slate-400 mb-8 leading-relaxed">
                Manage inventory, fulfill incoming orders, and oversee pantry operations.
                </p>
                
                <div className="flex items-center text-emerald-400 font-bold group-hover:translate-x-2 transition-transform">
                Access Dashboard <ArrowRight className="w-5 h-5 ml-2" />
                </div>
            </div>
          </button>
        </div>
        
        <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">System Version 2.0</p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;