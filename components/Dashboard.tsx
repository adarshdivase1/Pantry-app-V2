import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, PantryItem } from '../types';
import { getOrders, updateOrderStatus, getLowStockItems } from '../services/storageService';
import { Clock, CheckCircle, Play, Coffee, AlertTriangle, Package, ArrowUpRight, X } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<PantryItem[]>([]);
  const [filter, setFilter] = useState<'active' | 'completed'>('active');

  const refreshData = async () => {
      const o = await getOrders();
      const l = await getLowStockItems(10);
      setOrders(o);
      setLowStockItems(l);
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Polling backup
    const handleUpdate = () => refreshData();
    window.addEventListener('pantry-update', handleUpdate);
    return () => {
        clearInterval(interval);
        window.removeEventListener('pantry-update', handleUpdate);
    };
  }, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
      await updateOrderStatus(id, status);
      refreshData();
  };

  const filteredOrders = orders.filter(o => {
      if (filter === 'active') return o.status === 'pending' || o.status === 'preparing';
      return o.status === 'delivered' || o.status === 'cancelled';
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Main: Order Queue */}
      <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <header className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
                <h2 className="text-lg font-bold text-slate-800">Order Queue</h2>
                <p className="text-xs text-slate-500">Manage incoming service requests</p>
            </div>
            <div className="flex bg-slate-200 p-1 rounded-lg">
                {['active', 'completed'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full opacity-60">
                    <Coffee className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium">No {filter} orders</p>
                </div>
            ) : (
                filteredOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="bg-slate-900 text-white px-3 py-1 rounded-md font-bold text-sm">{order.roomNumber}</span>
                                    <span className="text-xs text-slate-500 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {new Date(order.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : order.status === 'preparing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <ul className="space-y-1">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-slate-700 flex items-center">
                                        <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold mr-2 text-slate-600">{item.quantity}</span>
                                        {item.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        {filter === 'active' && (
                            <div className="flex md:flex-col gap-2 justify-center min-w-[120px] border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                                {order.status === 'pending' ? (
                                    <button onClick={() => handleStatusChange(order.id, 'preparing')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                                        Start Prep
                                    </button>
                                ) : (
                                    <button onClick={() => handleStatusChange(order.id, 'delivered')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors">
                                        Complete
                                    </button>
                                )}
                                <button onClick={() => handleStatusChange(order.id, 'cancelled')} className="flex-1 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-500 text-sm font-semibold py-2 rounded-lg transition-colors">
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Sidebar Stats */}
      <div className="space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10"><ArrowUpRight className="w-24 h-24" /></div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Today's Activity</h3>
            <div className="flex items-end gap-2 mb-6">
                <span className="text-4xl font-bold">{orders.length}</span>
                <span className="text-slate-400 mb-1">total requests</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-800 rounded-xl p-3">
                    <div className="text-2xl font-bold text-emerald-400">{orders.filter(o => o.status === 'delivered').length}</div>
                    <div className="text-xs text-slate-400">Done</div>
                </div>
                <div className="bg-slate-800 rounded-xl p-3">
                    <div className="text-2xl font-bold text-amber-400">{orders.filter(o => o.status === 'pending').length}</div>
                    <div className="text-xs text-slate-400">Pending</div>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-80">
             <div className="px-5 py-4 border-b border-slate-100 bg-amber-50/50">
                <h2 className="font-bold text-slate-800 flex items-center text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-2" /> Low Stock Alerts
                </h2>
             </div>
             <div className="flex-1 overflow-y-auto p-2">
                {lowStockItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                        <Package className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-sm text-slate-500">Inventory levels healthy</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {lowStockItems.map(item => (
                            <div key={item.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg transition-colors text-sm">
                                <span className="font-medium text-slate-700">{item.name}</span>
                                <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">{item.quantity} {item.unit}</span>
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;