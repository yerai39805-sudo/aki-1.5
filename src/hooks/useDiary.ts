import { useCallback } from 'react';
import { DiaryEntry } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { INITIAL_DIARY_ENTRIES } from '../data/initialMemory';

export function useDiary() {
  const [entries, setEntries] = useLocalStorage<DiaryEntry[]>('yeikon_diary_entries', INITIAL_DIARY_ENTRIES);

  const addEntry = useCallback((entry: Omit<DiaryEntry, 'id' | 'createdAt'>) => {
    const newEntry: DiaryEntry = {
      ...entry,
      id: `entry-${Date.now()}`,
      createdAt: Date.now(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  }, [setEntries]);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [setEntries]);

  const toggleStar = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e))
    );
  }, [setEntries]);

  return {
    entries,
    addEntry,
    deleteEntry,
    toggleStar
  };
}
