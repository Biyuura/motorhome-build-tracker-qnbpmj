
import { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { StorageService } from '../data/storage';

export const useDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      console.log('Loading diary entries...');
      setLoading(true);
      const data = await StorageService.getDiaryEntries();
      console.log('Loaded diary entries:', data.length);
      
      // Sort entries by date, with error handling for invalid dates
      const sortedEntries = data.sort((a, b) => {
        try {
          const dateA = new Date(a.createdAt || a.date);
          const dateB = new Date(b.createdAt || b.date);
          
          // Check if dates are valid
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            console.log('Invalid date found in diary entries');
            return 0;
          }
          
          return dateB.getTime() - dateA.getTime();
        } catch (error) {
          console.log('Error sorting diary entries by date:', error);
          return 0;
        }
      });
      
      setEntries(sortedEntries);
    } catch (error) {
      console.log('Error loading diary entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: DiaryEntry) => {
    try {
      console.log('Adding diary entry:', entry.title);
      await StorageService.saveDiaryEntry(entry);
      setEntries(prev => [entry, ...prev]);
    } catch (error) {
      console.log('Error adding diary entry:', error);
      throw error;
    }
  };

  const updateEntry = async (entry: DiaryEntry) => {
    try {
      console.log('Updating diary entry:', entry.id);
      await StorageService.updateDiaryEntry(entry);
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    } catch (error) {
      console.log('Error updating diary entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      console.log('Deleting diary entry:', id);
      await StorageService.deleteDiaryEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.log('Error deleting diary entry:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  return {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: loadEntries,
  };
};
