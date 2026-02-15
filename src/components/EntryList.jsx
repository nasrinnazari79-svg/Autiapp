import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { MOOD_LABELS, MOOD_COLORS } from '../utils/constants';

export default function EntryList({ entries, onSelect }) {
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p>Noch keine Einträge vorhanden.</p>
        <p>Erstelle deinen ersten Eintrag, um Muster zu entdecken.</p>
      </div>
    );
  }

  return (
    <div className="entry-list">
      {entries.map(entry => (
        <div
          key={entry.id}
          className="entry-card"
          onClick={() => onSelect(entry)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect(entry)}
          aria-label={`Eintrag vom ${format(parseISO(entry.date), 'dd. MMMM yyyy', { locale: de })}`}
        >
          <div className="entry-card-header">
            <span className="entry-card-date">
              {format(parseISO(entry.date), 'EEEE, dd. MMMM yyyy', { locale: de })}
            </span>
            <span
              className="entry-card-mood"
              style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
              title={MOOD_LABELS[entry.mood]}
            />
          </div>

          <div className="entry-card-metrics">
            <span>Stimmung: {MOOD_LABELS[entry.mood]}</span>
            <span>Energie: {entry.energy}/5</span>
            <span>Reize: {entry.sensoryLoad}/5</span>
          </div>

          {entry.notes && (
            <div className="entry-card-notes">{entry.notes}</div>
          )}

          {entry.triggers?.length > 0 && (
            <div className="entry-card-tags">
              {entry.triggers.map(t => (
                <span key={t} className="mini-tag">{t}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
