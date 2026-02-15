import { useRef } from 'react';
import { exportEntries, importEntries } from '../utils/storage';

export default function Settings({ onImport }) {
  const fileInputRef = useRef(null);

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const entries = await importEntries(file);
      onImport(entries);
      alert('Daten erfolgreich importiert!');
    } catch (err) {
      alert('Fehler beim Import: ' + err.message);
    }

    fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    if (window.confirm('Wirklich alle Daten löschen? Das kann nicht rückgängig gemacht werden!')) {
      if (window.confirm('Bist du dir sicher? Alle Einträge werden unwiderruflich gelöscht.')) {
        localStorage.removeItem('autiapp_entries');
        onImport([]);
      }
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Einstellungen</h2>

        <div className="form-group">
          <h3>Daten exportieren</h3>
          <p className="hint" style={{ marginBottom: 'var(--space-md)' }}>
            Speichere alle deine Einträge als JSON-Datei auf deinem Gerät.
          </p>
          <button className="btn btn-primary" onClick={exportEntries}>
            Daten exportieren
          </button>
        </div>

        <div className="form-group">
          <h3>Daten importieren</h3>
          <p className="hint" style={{ marginBottom: 'var(--space-md)' }}>
            Importiere Einträge aus einer zuvor exportierten Datei. Bestehende Einträge bleiben erhalten.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            id="import-file"
          />
          <button
            className="btn btn-secondary"
            onClick={() => fileInputRef.current.click()}
          >
            JSON-Datei importieren
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Datenschutz</h3>
        <div className="pattern-card">
          <h4>Deine Daten gehören dir</h4>
          <p>
            Alle Daten werden ausschließlich lokal auf deinem Gerät gespeichert (im Browser-Speicher).
            Es werden keine Daten an Server gesendet.
            Du kannst jederzeit alle Daten exportieren oder löschen.
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Gefahrenzone</h3>
        <p className="hint" style={{ marginBottom: 'var(--space-md)' }}>
          Erstelle vorher einen Export, falls du die Daten behalten möchtest.
        </p>
        <button className="btn btn-danger" onClick={handleClearAll}>
          Alle Daten löschen
        </button>
      </div>
    </div>
  );
}
