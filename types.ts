export enum Category {
  BEVERAGES = 'Beverages',
  SNACKS = 'Snacks',
  FOOD = 'Food',
  STATIONERY = 'Stationery',
  ELECTRONICS = 'Electronics',
  OTHER = 'Other'
}

export enum Unit {
  PIECE = 'pc',
  PACK = 'pack',
  BOTTLE = 'bottle',
  CAN = 'can',
  CUP = 'cup',
  PLATE = 'plate'
}

export interface PantryItem {
  id: string;
  name: string;
  quantity: number; // Used as "Available Stock" or just availability flag
  unit: Unit | string;
  category: Category | string;
  addedDate: string;
  expiryDate: string; // Less relevant for service but kept for compatibility
  notes?: string;
  imageUrl?: string; // Placeholder for future
}

export type OrderStatus = 'pending' | 'preparing' | 'delivered' | 'cancelled';

export interface OrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  roomNumber: string;
  items: OrderItem[];
  status: OrderStatus;
  timestamp: string;
  completedAt?: string;
}

export interface Recipe {
  id?: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  calories?: number;
}

export type View = 'dashboard' | 'inventory' | 'orders' | 'menu';