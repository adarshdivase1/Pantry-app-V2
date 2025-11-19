// AI Features have been removed as per request.
import { PantryItem } from "../types";

export const analyzeGroceryImage = async () => {
  console.warn("AI features are disabled.");
  return null;
};

export const generateRecipes = async (items: PantryItem[]) => {
  console.warn("AI features are disabled.");
  return [];
};

export const autoCategorizeItem = async () => {
  return { category: 'Other', expiryDays: 7 };
};