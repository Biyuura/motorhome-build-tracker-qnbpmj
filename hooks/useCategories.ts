
import { useState, useEffect } from 'react';
import { Category } from '../types';
import { StorageService } from '../data/storage';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      setLoading(true);
      const data = await StorageService.getCategories();
      console.log('Loaded categories:', data.length, data);
      setCategories(data);
    } catch (error) {
      console.log('Error loading categories:', error);
      // Set default categories on error
      const defaultCategories = [
        { id: '1', name: 'Engine & Mechanical', color: '#ef4444' },
        { id: '2', name: 'Electrical', color: '#f59e0b' },
        { id: '3', name: 'Plumbing', color: '#3b82f6' },
        { id: '4', name: 'Interior', color: '#10b981' },
        { id: '5', name: 'Exterior', color: '#8b5cf6' },
        { id: '6', name: 'Tools', color: '#f97316' },
        { id: '7', name: 'Materials', color: '#06b6d4' },
        { id: '8', name: 'Other', color: '#64748b' },
      ];
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Category) => {
    try {
      console.log('Adding category:', category);
      await StorageService.saveCategory(category);
      setCategories(prev => {
        const updated = [...prev, category];
        console.log('Categories after add:', updated.length);
        return updated;
      });
    } catch (error) {
      console.log('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      console.log('Updating category:', category);
      await StorageService.updateCategory(category);
      setCategories(prev => {
        const updated = prev.map(c => c.id === category.id ? category : c);
        console.log('Categories after update:', updated.length);
        return updated;
      });
    } catch (error) {
      console.log('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      console.log('Deleting category:', id);
      await StorageService.deleteCategory(id);
      setCategories(prev => {
        const updated = prev.filter(c => c.id !== id);
        console.log('Categories after delete:', updated.length);
        return updated;
      });
    } catch (error) {
      console.log('Error deleting category:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: loadCategories,
  };
};
