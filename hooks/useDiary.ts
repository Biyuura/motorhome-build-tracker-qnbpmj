
import { useState, useEffect } from 'react';
import { DiaryEntry } from '../types';
import { StorageService } from '../data/storage';

export const useDiary = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getDiaryEntries();
      setEntries(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.log('Error loading diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: DiaryEntry) => {
    try {
      await StorageService.saveDiaryEntry(entry);
      setEntries(prev => [entry, ...prev]);
    } catch (error) {
      console.log('Error adding diary entry:', error);
    }
  };

  const updateEntry = async (entry: DiaryEntry) => {
    try {
      await StorageService.updateDiaryEntry(entry);
      setEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
    } catch (error) {
      console.log('Error updating diary entry:', error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      await StorageService.deleteDiaryEntry(id);
      setEntries(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.log('Error deleting diary entry:', error);
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
