import { useState } from 'react';
import './App.css';
import { useEntries } from './hooks/useEntries';
import DiaryForm from './components/DiaryForm';
import EntryList from './components/EntryList';
import EntryDetail from './components/EntryDetail';
import CalendarView from './components/CalendarView';
import PatternView from './components/PatternView';
import Settings from './components/Settings';

const VIEWS = {
  NEW: 'new',
  LIST: 'list',
  CALENDAR: 'calendar',
  PATTERNS: 'patterns',
  DETAIL: 'detail',
  EDIT: 'edit',
  SETTINGS: 'settings',
};

function App() {
  const { entries, addEntry, updateEntry, deleteEntry, refreshEntries } = useEntries();
  const [view, setView] = useState(VIEWS.NEW);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveNew = (entry) => {
    addEntry(entry);
    showToast('Eintrag gespeichert!');
    setView(VIEWS.LIST);
  };

  const handleSaveEdit = (entry) => {
    updateEntry(selectedEntry.id, entry);
    showToast('Eintrag aktualisiert!');
    setView(VIEWS.LIST);
    setSelectedEntry(null);
  };

  const handleDelete = (id) => {
    deleteEntry(id);
    showToast('Eintrag gelöscht.');
    setView(VIEWS.LIST);
    setSelectedEntry(null);
  };

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
    setView(VIEWS.DETAIL);
  };

  const handleCalendarSelect = (dateKey, entry) => {
    if (entry) {
      setSelectedEntry(entry);
      setView(VIEWS.DETAIL);
    } else {
      setSelectedEntry(null);
      setView(VIEWS.NEW);
    }
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setView(VIEWS.EDIT);
  };

  const navItems = [
    { view: VIEWS.NEW, label: 'Neuer Eintrag' },
    { view: VIEWS.LIST, label: 'Einträge' },
    { view: VIEWS.CALENDAR, label: 'Kalender' },
    { view: VIEWS.PATTERNS, label: 'Muster' },
    { view: VIEWS.SETTINGS, label: 'Einstellungen' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <h1>AutiApp</h1>
        <p>Dein neurodivergentes Tagebuch</p>
      </header>

      <nav className="nav" role="navigation" aria-label="Hauptnavigation">
        {navItems.map(item => (
          <button
            key={item.view}
            className={`nav-btn ${view === item.view || (view === VIEWS.DETAIL && item.view === VIEWS.LIST) || (view === VIEWS.EDIT && item.view === VIEWS.LIST) ? 'active' : ''}`}
            onClick={() => {
              setView(item.view);
              if (item.view !== VIEWS.DETAIL && item.view !== VIEWS.EDIT) {
                setSelectedEntry(null);
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main role="main">
        {view === VIEWS.NEW && (
          <DiaryForm onSave={handleSaveNew} />
        )}

        {view === VIEWS.LIST && (
          <div className="card">
            <h2>Alle Einträge ({entries.length})</h2>
            <EntryList entries={entries} onSelect={handleSelectEntry} />
          </div>
        )}

        {view === VIEWS.DETAIL && selectedEntry && (
          <EntryDetail
            entry={selectedEntry}
            onBack={() => setView(VIEWS.LIST)}
            onEdit={handleEditEntry}
            onDelete={handleDelete}
          />
        )}

        {view === VIEWS.EDIT && selectedEntry && (
          <DiaryForm
            existingEntry={selectedEntry}
            onSave={handleSaveEdit}
            onCancel={() => {
              setView(VIEWS.DETAIL);
            }}
          />
        )}

        {view === VIEWS.CALENDAR && (
          <CalendarView entries={entries} onSelectDate={handleCalendarSelect} />
        )}

        {view === VIEWS.PATTERNS && (
          <PatternView entries={entries} />
        )}

        {view === VIEWS.SETTINGS && (
          <Settings onImport={() => refreshEntries()} />
        )}
      </main>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
    </div>
  );
}

export default App;
