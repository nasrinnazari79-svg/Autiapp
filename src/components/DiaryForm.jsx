import { useState } from 'react';
import { MOOD_LABELS, ENERGY_LABELS, SENSORY_LABELS, SLEEP_LABELS, SOCIAL_LABELS, TRIGGER_OPTIONS, STIM_OPTIONS } from '../utils/constants';

const defaultEntry = {
  date: new Date().toISOString().split('T')[0],
  mood: 3,
  energy: 3,
  sensoryLoad: 3,
  sleepQuality: 3,
  socialBattery: 3,
  triggers: [],
  stims: [],
  notes: '',
  gratitude: '',
};

export default function DiaryForm({ onSave, existingEntry, onCancel }) {
  const [entry, setEntry] = useState(existingEntry || defaultEntry);
  const [showStims, setShowStims] = useState(
    existingEntry?.stims?.length > 0 || false
  );

  const updateField = (field, value) => {
    setEntry(prev => ({ ...prev, [field]: value }));
  };

  const toggleTag = (field, tag) => {
    setEntry(prev => {
      const current = prev[field] || [];
      const updated = current.includes(tag)
        ? current.filter(t => t !== tag)
        : [...current, tag];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>{existingEntry ? 'Eintrag bearbeiten' : 'Neuer Eintrag'}</h2>

      <div className="form-group">
        <label htmlFor="date">Datum</label>
        <input
          type="date"
          id="date"
          value={entry.date}
          onChange={(e) => updateField('date', e.target.value)}
          style={{
            padding: 'var(--space-sm)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text)',
            background: 'var(--color-bg)',
          }}
        />
      </div>

      <SliderField
        label="Stimmung"
        id="mood"
        value={entry.mood}
        onChange={(v) => updateField('mood', v)}
        labels={MOOD_LABELS}
        min="1"
        max="5"
        leftLabel="Sehr schlecht"
        rightLabel="Sehr gut"
      />

      <SliderField
        label="Energie"
        id="energy"
        value={entry.energy}
        onChange={(v) => updateField('energy', v)}
        labels={ENERGY_LABELS}
        min="1"
        max="5"
        leftLabel="Erschöpft"
        rightLabel="Sehr energiegeladen"
      />

      <SliderField
        label="Reizbelastung"
        hint="Wie stark warst du heute Reizen ausgesetzt?"
        id="sensoryLoad"
        value={entry.sensoryLoad}
        onChange={(v) => updateField('sensoryLoad', v)}
        labels={SENSORY_LABELS}
        min="1"
        max="5"
        leftLabel="Kaum Reize"
        rightLabel="Überladen"
      />

      <SliderField
        label="Schlafqualität"
        hint="Wie hast du letzte Nacht geschlafen?"
        id="sleepQuality"
        value={entry.sleepQuality}
        onChange={(v) => updateField('sleepQuality', v)}
        labels={SLEEP_LABELS}
        min="1"
        max="5"
        leftLabel="Sehr schlecht"
        rightLabel="Sehr gut"
      />

      <SliderField
        label="Sozialer Akku"
        hint="Wie voll ist deine soziale Batterie?"
        id="socialBattery"
        value={entry.socialBattery}
        onChange={(v) => updateField('socialBattery', v)}
        labels={SOCIAL_LABELS}
        min="1"
        max="5"
        leftLabel="Leer"
        rightLabel="Voll"
      />

      <div className="form-group">
        <label>Auslöser / Herausforderungen</label>
        <p className="hint">Was hat dich heute belastet? (optional)</p>
        <div className="tags-container">
          {TRIGGER_OPTIONS.map(trigger => (
            <button
              key={trigger}
              type="button"
              className={`tag ${entry.triggers.includes(trigger) ? 'selected' : ''}`}
              onClick={() => toggleTag('triggers', trigger)}
            >
              {trigger}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowStims(!showStims)}
          style={{ marginBottom: 'var(--space-sm)' }}
        >
          {showStims ? 'Regulationsstrategien ausblenden' : 'Regulationsstrategien hinzufügen'}
        </button>

        {showStims && (
          <>
            <p className="hint" style={{ marginTop: 'var(--space-sm)' }}>
              Was hat dir heute geholfen?
            </p>
            <div className="tags-container">
              {STIM_OPTIONS.map(stim => (
                <button
                  key={stim}
                  type="button"
                  className={`tag ${entry.stims.includes(stim) ? 'selected' : ''}`}
                  onClick={() => toggleTag('stims', stim)}
                >
                  {stim}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notizen</label>
        <p className="hint">Schreib auf, was dich heute bewegt hat (optional)</p>
        <textarea
          id="notes"
          value={entry.notes}
          onChange={(e) => updateField('notes', e.target.value)}
          placeholder="Wie war dein Tag? Was ist passiert?"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label htmlFor="gratitude">Dankbarkeit</label>
        <p className="hint">Worüber freust du dich heute? (optional)</p>
        <textarea
          id="gratitude"
          value={entry.gratitude}
          onChange={(e) => updateField('gratitude', e.target.value)}
          placeholder="Was war heute schön?"
          rows={2}
        />
      </div>

      <div className="btn-group">
        <button type="submit" className="btn btn-primary">
          {existingEntry ? 'Speichern' : 'Eintrag erstellen'}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Abbrechen
          </button>
        )}
      </div>
    </form>
  );
}

function SliderField({ label, hint, id, value, onChange, labels, min, max, leftLabel, rightLabel }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="hint">{hint}</p>}
      <div className="slider-container">
        <input
          type="range"
          id={id}
          min={min}
          max={max}
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
        />
        <div className="slider-labels">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <div className="slider-value" aria-live="polite">
          {labels[value]}
        </div>
      </div>
    </div>
  );
}
