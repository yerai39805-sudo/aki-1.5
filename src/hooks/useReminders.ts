import { useCallback } from 'react';
import { Reminder } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { INITIAL_REMINDERS } from '../data/initialMemory';

export function useReminders() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('yeikon_reminders', INITIAL_REMINDERS);

  const addReminder = useCallback((item: Omit<Reminder, 'id' | 'createdAt' | 'completed'>) => {
    const newReminder: Reminder = {
      ...item,
      id: `rem-${Date.now()}`,
      completed: false,
      createdAt: Date.now(),
    };
    setReminders((prev) => [newReminder, ...prev]);
  }, [setReminders]);

  const toggleComplete = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  }, [setReminders]);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, [setReminders]);

  return {
    reminders,
    addReminder,
    toggleComplete,
    deleteReminder
  };
}
