const STORAGE_KEY = 'autiapp_entries';

export function loadEntries() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(entry) {
  const entries = loadEntries();
  const newEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  entries.unshift(newEntry);
  saveEntries(entries);
  return entries;
}

export function updateEntry(id, updates) {
  const entries = loadEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...updates };
    saveEntries(entries);
  }
  return entries;
}

export function deleteEntry(id) {
  const entries = loadEntries().filter(e => e.id !== id);
  saveEntries(entries);
  return entries;
}

export function exportEntries() {
  const entries = loadEntries();
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autiapp-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importEntries(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          reject(new Error('Ungültiges Dateiformat'));
          return;
        }
        const existing = loadEntries();
        const existingIds = new Set(existing.map(e => e.id));
        const newEntries = imported.filter(e => !existingIds.has(e.id));
        const merged = [...newEntries, ...existing].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );
        saveEntries(merged);
        resolve(merged);
      } catch {
        reject(new Error('Datei konnte nicht gelesen werden'));
      }
    };
    reader.onerror = () => reject(new Error('Lesefehler'));
    reader.readAsText(file);
  });
}
