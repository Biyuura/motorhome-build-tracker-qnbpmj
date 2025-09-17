
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Expense, DiaryEntry, VehicleProfile, Category } from '../types';

const STORAGE_KEYS = {
  EXPENSES: 'expenses',
  DIARY_ENTRIES: 'diary_entries',
  VEHICLE_PROFILE: 'vehicle_profile',
  CATEGORIES: 'categories',
};

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Engine & Mechanical', color: '#ef4444' },
  { id: '2', name: 'Electrical', color: '#f59e0b' },
  { id: '3', name: 'Plumbing', color: '#3b82f6' },
  { id: '4', name: 'Interior', color: '#10b981' },
  { id: '5', name: 'Exterior', color: '#8b5cf6' },
  { id: '6', name: 'Tools', color: '#f97316' },
  { id: '7', name: 'Materials', color: '#06b6d4' },
  { id: '8', name: 'Other', color: '#64748b' },
];

export const StorageService = {
  // Expenses
  async getExpenses(): Promise<Expense[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting expenses:', error);
      return [];
    }
  },

  async saveExpense(expense: Expense): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      expenses.push(expense);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      console.log('Error saving expense:', error);
    }
  },

  async updateExpense(updatedExpense: Expense): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const index = expenses.findIndex(e => e.id === updatedExpense.id);
      if (index !== -1) {
        expenses[index] = updatedExpense;
        await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
      }
    } catch (error) {
      console.log('Error updating expense:', error);
    }
  },

  async deleteExpense(id: string): Promise<void> {
    try {
      const expenses = await this.getExpenses();
      const filtered = expenses.filter(e => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    } catch (error) {
      console.log('Error deleting expense:', error);
    }
  },

  // Diary Entries
  async getDiaryEntries(): Promise<DiaryEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DIARY_ENTRIES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.log('Error getting diary entries:', error);
      return [];
    }
  },

  async saveDiaryEntry(entry: DiaryEntry): Promise<void> {
    try {
      const entries = await this.getDiaryEntries();
      entries.push(entry);
      await AsyncStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.log('Error saving diary entry:', error);
    }
  },

  async updateDiaryEntry(updatedEntry: DiaryEntry): Promise<void> {
    try {
      const entries = await this.getDiaryEntries();
      const index = entries.findIndex(e => e.id === updatedEntry.id);
      if (index !== -1) {
        entries[index] = updatedEntry;
        await AsyncStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(entries));
      }
    } catch (error) {
      console.log('Error updating diary entry:', error);
    }
  },

  async deleteDiaryEntry(id: string): Promise<void> {
    try {
      const entries = await this.getDiaryEntries();
      const filtered = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(filtered));
    } catch (error) {
      console.log('Error deleting diary entry:', error);
    }
  },

  // Vehicle Profile
  async getVehicleProfile(): Promise<VehicleProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.VEHICLE_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.log('Error getting vehicle profile:', error);
      return null;
    }
  },

  async saveVehicleProfile(profile: VehicleProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VEHICLE_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.log('Error saving vehicle profile:', error);
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      } else {
        // Initialize with default categories
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
        return DEFAULT_CATEGORIES;
      }
    } catch (error) {
      console.log('Error getting categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      categories.push(category);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.log('Error saving category:', error);
    }
  },

  async updateCategory(updatedCategory: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      const index = categories.findIndex(c => c.id === updatedCategory.id);
      if (index !== -1) {
        categories[index] = updatedCategory;
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
      }
    } catch (error) {
      console.log('Error updating category:', error);
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filtered = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(filtered));
    } catch (error) {
      console.log('Error deleting category:', error);
    }
  },
};
