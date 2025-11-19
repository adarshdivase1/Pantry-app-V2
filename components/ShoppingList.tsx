import React, { useState, useEffect } from 'react';
import { getOrders } from '../services/storageService';
import { Order } from '../types';
import { Clock, CheckCircle, Loader2, XCircle } from 'lucide-react';

interface ShoppingListProps {
  // No specific props needed
}

const ShoppingList: React.FC<ShoppingListProps> = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const refreshOrders = async () => {
      // For demo purposes, we load ALL orders. In a real app, we'd filter by the current user/room session.
      const all = await getOrders();
      setOrders(all);
  };

  useEffect(() => {
    refreshOrders();
    const interval = setInterval(refreshOrders, 3000);
    const handleUpdate = () => refreshOrders();
    window.addEventListener('pantry-update', handleUpdate);
    return () => {
        clearInterval(interval);
        window.removeEventListener('pantry-update', handleUpdate);
    };
  }, []);

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
          case 'preparing': return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
          case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />;
          default: return <XCircle className="w-5 h-5 text-slate-400" />;
      }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full">
       <header>
            <h1 className="text-2xl font-bold text-slate-800">My Orders</h1>
            <p className="text-slate-500">Track the status of your service requests.</p>
      </header>

      <div className="space-y-4">
        {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500">You haven't placed any orders yet.</p>
            </div>
        ) : (
            orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4 border-b border-slate-50 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                {getStatusIcon(order.status)}
                                <span className="font-bold text-slate-800 capitalize">{order.status}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Order #{order.id.slice(0, 8)} • {order.roomNumber}</p>
                        </div>
                        <span className="text-sm text-slate-500">
                            {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <span className="text-slate-700 font-medium">{item.quantity}x {item.name}</span>
                                <span className="text-slate-400">{item.unit}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ShoppingList;