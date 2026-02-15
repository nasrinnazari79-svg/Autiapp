import { useState, useCallback } from 'react';
import { loadEntries, saveEntries, addEntry as addEntryToStorage, updateEntry as updateEntryInStorage, deleteEntry as deleteEntryFromStorage } from '../utils/storage';

export function useEntries() {
  const [entries, setEntries] = useState(() => loadEntries());

  const addEntry = useCallback((entry) => {
    const updated = addEntryToStorage(entry);
    setEntries(updated);
  }, []);

  const updateEntry = useCallback((id, updates) => {
    const updated = updateEntryInStorage(id, updates);
    setEntries(updated);
  }, []);

  const deleteEntry = useCallback((id) => {
    const updated = deleteEntryFromStorage(id);
    setEntries(updated);
  }, []);

  const refreshEntries = useCallback(() => {
    setEntries(loadEntries());
  }, []);

  return { entries, addEntry, updateEntry, deleteEntry, refreshEntries };
}
