import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { MOOD_COLORS, DAY_NAMES_SHORT, MONTH_NAMES } from '../utils/constants';

export default function CalendarView({ entries, onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday = 0 in our grid (German week starts on Monday)
  const startDay = (getDay(monthStart) + 6) % 7;
  const emptyDays = Array.from({ length: startDay }, (_, i) => i);

  const entryMap = {};
  for (const entry of entries) {
    const dateKey = entry.date;
    entryMap[dateKey] = entry;
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="card">
      <div className="calendar">
        <div className="calendar-header">
          <h3>
            {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <div className="calendar-nav">
            <button onClick={prevMonth} aria-label="Vorheriger Monat">&larr;</button>
            <button onClick={() => setCurrentMonth(new Date())} aria-label="Heute">Heute</button>
            <button onClick={nextMonth} aria-label="Nächster Monat">&rarr;</button>
          </div>
        </div>

        <div className="calendar-grid">
          {DAY_NAMES_SHORT.map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}

          {emptyDays.map(i => (
            <div key={`empty-${i}`} className="calendar-day empty" />
          ))}

          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const entry = entryMap[dateKey];
            const today = isToday(day);

            return (
              <div
                key={dateKey}
                className={`calendar-day ${entry ? 'has-entry' : ''} ${today ? 'today' : ''}`}
                onClick={() => onSelectDate(dateKey, entry)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && onSelectDate(dateKey, entry)}
                aria-label={`${format(day, 'dd. MMMM', { locale: de })}${entry ? ' - Eintrag vorhanden' : ''}`}
                style={entry ? { backgroundColor: MOOD_COLORS[entry.mood] + '30' } : undefined}
              >
                {day.getDate()}
                {entry && (
                  <span
                    className="mood-dot"
                    style={{ backgroundColor: MOOD_COLORS[entry.mood] }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
