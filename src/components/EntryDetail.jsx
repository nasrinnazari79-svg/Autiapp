import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { MOOD_LABELS, ENERGY_LABELS, SENSORY_LABELS, SLEEP_LABELS, SOCIAL_LABELS, MOOD_COLORS } from '../utils/constants';

export default function EntryDetail({ entry, onBack, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="detail-header">
        <h2>{format(parseISO(entry.date), 'EEEE, dd. MMMM yyyy', { locale: de })}</h2>
        <div className="btn-group" style={{ marginTop: 0 }}>
          <button className="btn btn-secondary" onClick={onBack}>Zurück</button>
          <button className="btn btn-primary" onClick={() => onEdit(entry)}>Bearbeiten</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Eintrag wirklich löschen?')) {
                onDelete(entry.id);
              }
            }}
          >
            Löschen
          </button>
        </div>
      </div>

      <div className="detail-metrics">
        <MetricCard label="Stimmung" value={MOOD_LABELS[entry.mood]} color={MOOD_COLORS[entry.mood]} />
        <MetricCard label="Energie" value={ENERGY_LABELS[entry.energy]} />
        <MetricCard label="Reizbelastung" value={SENSORY_LABELS[entry.sensoryLoad]} />
        <MetricCard label="Schlafqualität" value={SLEEP_LABELS[entry.sleepQuality]} />
        <MetricCard label="Sozialer Akku" value={SOCIAL_LABELS[entry.socialBattery]} />
      </div>

      {entry.triggers?.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3>Auslöser</h3>
          <div className="tags-container">
            {entry.triggers.map(t => (
              <span key={t} className="tag selected">{t}</span>
            ))}
          </div>
        </div>
      )}

      {entry.stims?.length > 0 && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3>Regulationsstrategien</h3>
          <div className="tags-container">
            {entry.stims.map(s => (
              <span key={s} className="tag selected">{s}</span>
            ))}
          </div>
        </div>
      )}

      {entry.notes && (
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <h3>Notizen</h3>
          <div className="detail-notes">{entry.notes}</div>
        </div>
      )}

      {entry.gratitude && (
        <div>
          <h3>Dankbarkeit</h3>
          <div className="detail-notes">{entry.gratitude}</div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }) {
  return (
    <div className="detail-metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
