
import { useState, useEffect } from 'react';
import { Category } from '../types';
import { StorageService } from '../data/storage';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getCategories();
      setCategories(data);
    } catch (error) {
      console.log('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (category: Category) => {
    try {
      await StorageService.saveCategory(category);
      setCategories(prev => [...prev, category]);
    } catch (error) {
      console.log('Error adding category:', error);
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      await StorageService.updateCategory(category);
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    } catch (error) {
      console.log('Error updating category:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await StorageService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.log('Error deleting category:', error);
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
