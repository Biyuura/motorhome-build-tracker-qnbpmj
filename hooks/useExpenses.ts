
import { useState, useEffect } from 'react';
import { Expense } from '../types';
import { StorageService } from '../data/storage';

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getExpenses();
      setExpenses(data);
    } catch (error) {
      console.log('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Expense) => {
    try {
      await StorageService.saveExpense(expense);
      setExpenses(prev => [...prev, expense]);
    } catch (error) {
      console.log('Error adding expense:', error);
    }
  };

  const updateExpense = async (expense: Expense) => {
    try {
      await StorageService.updateExpense(expense);
      setExpenses(prev => prev.map(e => e.id === expense.id ? expense : e));
    } catch (error) {
      console.log('Error updating expense:', error);
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await StorageService.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.log('Error deleting expense:', error);
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return categoryTotals;
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotalExpenses,
    getExpensesByCategory,
    refreshExpenses: loadExpenses,
  };
};
