import React, { useState, useEffect } from 'react';
import { X, Database, Check, AlertCircle, Lock, Globe } from 'lucide-react';
import { initSupabase, getSupabaseConfig, disconnectSupabase } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
        setUrl(config.url);
        setKey(config.key);
        setIsConnected(true);
    }
  }, [isOpen]);

  const handleConnect = () => {
    setError('');
    if (!url || !key) {
        setError('Please provide both URL and Key.');
        return;
    }
    if (!url.startsWith('http')) {
        setError('Invalid URL.');
        return;
    }

    const success = initSupabase({ url, key });
    if (success) {
        setIsConnected(true);
        // Force a reload to ensure all components re-fetch data with new client
        window.location.reload(); 
    } else {
        setError('Failed to initialize client.');
    }
  };

  const handleDisconnect = () => {
      disconnectSupabase();
      setIsConnected(false);
      setUrl('');
      setKey('');
      window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isConnected ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Database className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Sync Settings</h2>
                    <p className="text-sm text-slate-500">Connect to Supabase for multi-device support</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
            {!isConnected ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <Globe className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-bold mb-1">Go Live across devices</p>
                        <p>To sync data between Staff and Room devices, you need a backend. Create a free project at <a href="https://database.new" target="_blank" className="underline font-bold">Supabase</a>, then paste your credentials below.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 items-center">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-800">Connected to Cloud Database</span>
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Project URL</label>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://xyz.supabase.co"
                        disabled={isConnected}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">API Key (public / anon)</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="eyJh..."
                            disabled={isConnected}
                            className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100 disabled:text-slate-500"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                </div>
                
                {error && (
                    <div className="text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <div className="pt-2">
                    {!isConnected ? (
                        <button 
                            onClick={handleConnect}
                            className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            Connect & Sync
                        </button>
                    ) : (
                        <button 
                            onClick={handleDisconnect}
                            className="w-full py-3 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors"
                        >
                            Disconnect (Return to Local Mode)
                        </button>
                    )}
                </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
                <h3 className="font-bold text-slate-800 mb-2">Database Setup (SQL)</h3>
                <p className="text-xs text-slate-500 mb-3">Copy and run this in your Supabase SQL Editor to create the required tables.</p>
                <div className="bg-slate-900 rounded-xl p-4 relative group">
                    <pre className="text-xs text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
{`-- 1. Create Tables
create table if not exists pantry_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  quantity int default 0,
  unit text,
  category text,
  added_date timestamp with time zone default now(),
  expiry_date timestamp with time zone
);

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  room_number text,
  items jsonb,
  status text,
  timestamp timestamp with time zone default now(),
  completed_at timestamp with time zone
);

-- 2. Enable Realtime
alter publication supabase_realtime add table pantry_items;
alter publication supabase_realtime add table orders;`}
                    </pre>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;