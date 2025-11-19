import { PantryItem, Category, Unit, Order } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const ITEMS_KEY = 'pantry_service_items_v2';
const ORDERS_KEY = 'pantry_service_orders_v2';
const SUPABASE_CONFIG_KEY = 'pantry_supabase_config';

let supabase: SupabaseClient | null = null;

// --- Helper for Dates ---
const getFutureDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
};

// --- Default Seed Data ---
const DEFAULT_ITEMS: Omit<PantryItem, 'id' | 'addedDate'>[] = [
    { name: 'Bottled Water', quantity: 24, unit: Unit.BOTTLE, category: Category.BEVERAGES, expiryDate: getFutureDate(365) },
    { name: 'Cola Cans', quantity: 12, unit: Unit.CAN, category: Category.BEVERAGES, expiryDate: getFutureDate(180) },
    { name: 'Potato Chips', quantity: 10, unit: Unit.PACK, category: Category.SNACKS, expiryDate: getFutureDate(60) },
    { name: 'Coffee Pods', quantity: 50, unit: Unit.PIECE, category: Category.BEVERAGES, expiryDate: getFutureDate(90) },
    { name: 'Instant Noodles', quantity: 15, unit: Unit.CUP, category: Category.FOOD, expiryDate: getFutureDate(120) },
    { name: 'Notebooks', quantity: 5, unit: Unit.PIECE, category: Category.STATIONERY, expiryDate: getFutureDate(700) },
    { name: 'Pens (Blue)', quantity: 20, unit: Unit.PIECE, category: Category.STATIONERY, expiryDate: getFutureDate(700) },
    { name: 'Green Tea', quantity: 20, unit: Unit.PACK, category: Category.BEVERAGES, expiryDate: getFutureDate(150) },
    { name: 'Granola Bars', quantity: 18, unit: Unit.PIECE, category: Category.SNACKS, expiryDate: getFutureDate(45) },
    { name: 'Phone Charger (USB-C)', quantity: 2, unit: Unit.PIECE, category: Category.ELECTRONICS, expiryDate: getFutureDate(1000) },
];

// --- Configuration ---

export interface SupabaseConfig {
  url: string;
  key: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  // 1. Check LocalStorage (User manually entered settings)
  const localData = localStorage.getItem(SUPABASE_CONFIG_KEY);
  if (localData) return JSON.parse(localData);

  // 2. Check Environment Variables (Deployment / .env)
  // Fix: Safely access import.meta.env to prevent crash if undefined in certain environments
  const envUrl = import.meta.env?.VITE_SUPABASE_URL;
  const envKey = import.meta.env?.VITE_SUPABASE_KEY;

  if (envUrl && envKey) {
      return { url: envUrl, key: envKey };
  }

  return null;
};

export const initSupabase = (config: SupabaseConfig) => {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
  try {
    supabase = createClient(config.url, config.key);
    setupRealtime();
    return true;
  } catch (e) {
    console.error("Invalid Supabase Config", e);
    return false;
  }
};

export const disconnectSupabase = () => {
    localStorage.removeItem(SUPABASE_CONFIG_KEY);
    supabase = null;
    notifyChange();
}

// --- Event System ---
export const notifyChange = () => {
  window.dispatchEvent(new Event('pantry-update'));
};

export const notifyNotification = (message: string, type: 'info' | 'success' = 'info') => {
    window.dispatchEvent(new CustomEvent('pantry-notification', {
        detail: { message, type }
    }));
};

const setupRealtime = () => {
    if (!supabase) return;
    
    console.log("Setting up Supabase Realtime...");
    // Remove existing channels to prevent duplicates
    supabase.removeAllChannels();

    supabase
        .channel('pantry-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_items' }, (payload) => {
            notifyChange();
        })
        // Listen specifically for NEW orders to trigger notifications
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload: any) => {
            const newOrder = payload.new;
            const roomNum = newOrder.room_number || newOrder.roomNumber || 'Unknown';
            notifyNotification(`New Order: Room ${roomNum}`, 'info');
            notifyChange();
        })
        // Listen for status updates
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload: any) => {
             notifyChange();
             if (payload.new.status === 'delivered' && payload.old.status !== 'delivered') {
                 notifyNotification(`Order for Room ${payload.new.room_number} delivered`, 'success');
             }
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Connected to real-time updates');
            }
        });
}

// Attempt auto-init
const savedConfig = getSupabaseConfig();
if (savedConfig) {
  initSupabase(savedConfig);
}

// --- Helper for Local vs Cloud ---

export const isCloud = () => !!supabase;

// --- Items Management ---

export const getItems = async (): Promise<PantryItem[]> => {
  if (isCloud()) {
      const { data, error } = await supabase!.from('pantry_items').select('*').order('name');
      if (error) {
          console.error("Supabase error getting items:", error);
          return [];
      }
      return data.map((d: any) => ({
          ...d,
          addedDate: d.added_date || d.addedDate,
          expiryDate: d.expiry_date || d.expiryDate
      })) as PantryItem[];
  } else {
    // Local Fallback
    const data = localStorage.getItem(ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  }
};

export const addOrUpdateItem = async (newItem: Omit<PantryItem, 'id' | 'addedDate'>): Promise<{ success: boolean; message: string }> => {
    const items = await getItems();
    
    const normalizedName = newItem.name.trim().toLowerCase();
    const existingItem = items.find(
        i => i.name.trim().toLowerCase() === normalizedName && i.unit === newItem.unit
    );

    if (isCloud()) {
        if (existingItem) {
            const { error } = await supabase!
                .from('pantry_items')
                .update({ 
                    quantity: existingItem.quantity + newItem.quantity,
                    category: newItem.category !== Category.OTHER ? newItem.category : existingItem.category,
                    expiry_date: newItem.expiryDate
                })
                .eq('id', existingItem.id);
            
            if (error) return { success: false, message: error.message };
            notifyChange(); // Local optimistic update trigger
            return { success: true, message: `Restocked ${existingItem.name}` };
        } else {
            const { error } = await supabase!
                .from('pantry_items')
                .insert([{
                    name: newItem.name,
                    quantity: newItem.quantity,
                    unit: newItem.unit,
                    category: newItem.category,
                    added_date: new Date().toISOString(),
                    expiry_date: newItem.expiryDate
                }]);
            if (error) return { success: false, message: error.message };
            notifyChange();
            return { success: true, message: `Added ${newItem.name}` };
        }
    } else {
        // Local Implementation
        if (existingItem) {
            existingItem.quantity += newItem.quantity;
            if (newItem.category !== Category.OTHER) existingItem.category = newItem.category;
            if (newItem.expiryDate) existingItem.expiryDate = newItem.expiryDate;
            
            const updatedItems = items.map(i => i.id === existingItem.id ? existingItem : i);
            localStorage.setItem(ITEMS_KEY, JSON.stringify(updatedItems));
            notifyChange();
            return { success: true, message: `Restocked ${existingItem.name}` };
        } else {
            const item: PantryItem = {
                ...newItem,
                id: crypto.randomUUID(),
                addedDate: new Date().toISOString(),
            };
            items.unshift(item);
            localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
            notifyChange();
            return { success: true, message: `Added new item: ${newItem.name}` };
        }
    }
};

export const deleteItem = async (id: string) => {
    if (isCloud()) {
        await supabase!.from('pantry_items').delete().eq('id', id);
    } else {
        const items = await getItems();
        const updated = items.filter(i => i.id !== id);
        localStorage.setItem(ITEMS_KEY, JSON.stringify(updated));
    }
    notifyChange();
};

// --- Orders Management ---

export const getOrders = async (): Promise<Order[]> => {
  if (isCloud()) {
      const { data, error } = await supabase!.from('orders').select('*').order('timestamp', { ascending: false });
      if (error) {
        console.error("Error fetching orders", error);
        return [];
      }
      return data.map((d: any) => ({
          ...d,
          roomNumber: d.room_number || d.roomNumber,
          completedAt: d.completed_at || d.completedAt
      })) as Order[];
  } else {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  }
};

export const placeOrder = async (order: Order): Promise<{ success: boolean; error?: string }> => {
    const items = await getItems();

    // 1. Validate Stock (Common for both)
    for (const orderItem of order.items) {
        const item = items.find(i => i.id === orderItem.itemId);
        if (!item) {
            return { success: false, error: `Item ${orderItem.name} no longer exists.` };
        }
        if (item.quantity < orderItem.quantity) {
            return { success: false, error: `Not enough stock for ${item.name}. Only ${item.quantity} left.` };
        }
    }

    if (isCloud()) {
        // 1. Insert Order
        const { error: orderError } = await supabase!.from('orders').insert([{
            room_number: order.roomNumber,
            items: order.items,
            status: order.status,
            timestamp: order.timestamp
        }]);
        
        if (orderError) return { success: false, error: orderError.message };

        // 2. Deduct Stock (Best Effort)
        for (const orderItem of order.items) {
            const item = items.find(i => i.id === orderItem.itemId);
            if (item) {
                await supabase!.from('pantry_items')
                    .update({ quantity: item.quantity - orderItem.quantity })
                    .eq('id', item.id);
            }
        }
        notifyChange();
        return { success: true };
    } else {
        // Local
        const orders = await getOrders();
        for (const orderItem of order.items) {
            const item = items.find(i => i.id === orderItem.itemId);
            if (item) item.quantity -= orderItem.quantity;
        }
        orders.unshift(order);
        localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        notifyChange();
        notifyNotification(`New Order (Local): Room ${order.roomNumber}`, 'info');
        return { success: true };
    }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const completedAt = (status === 'delivered' || status === 'cancelled') ? new Date().toISOString() : null;
    
    if (isCloud()) {
        await supabase!.from('orders').update({ 
            status, 
            completed_at: completedAt 
        }).eq('id', orderId);
    } else {
        const orders = await getOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
            orders[index].status = status;
            if (completedAt) orders[index].completedAt = completedAt;
            localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        }
    }
    notifyChange();
    if (status === 'delivered') {
        notifyNotification(`Order delivered`, 'success');
    }
};

export const getLowStockItems = async (threshold = 10): Promise<PantryItem[]> => {
    const items = await getItems();
    return items.filter(i => i.quantity <= threshold && i.quantity > 0);
};

// --- Enhanced Seeding Function ---

export const seedInitialData = async () => {
    const currentItems = await getItems();
    
    // Only seed if empty
    if (currentItems.length > 0) {
        console.log("Data already exists, skipping seed.");
        return;
    }

    console.log("Initializing default inventory...");

    if (isCloud()) {
        // Cloud Seeding
        const { error } = await supabase!.from('pantry_items').insert(
            DEFAULT_ITEMS.map(item => ({
                name: item.name,
                quantity: item.quantity,
                unit: item.unit,
                category: item.category,
                added_date: new Date().toISOString(),
                expiry_date: item.expiryDate
            }))
        );
        if (error) {
            console.error("Failed to seed cloud database. Ensure tables exist and RLS policies allow insert.", error);
        } else {
            console.log("Cloud seeding complete.");
            notifyChange();
        }
    } else {
        // Local Seeding
        const seedItems = DEFAULT_ITEMS.map(item => ({
            ...item,
            id: crypto.randomUUID(),
            addedDate: new Date().toISOString(),
        }));
        localStorage.setItem(ITEMS_KEY, JSON.stringify(seedItems));
        console.log("Local seeding complete.");
        notifyChange();
    }
};