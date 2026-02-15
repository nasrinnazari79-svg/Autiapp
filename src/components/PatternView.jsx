import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { analyzePatterns, getChartData } from '../utils/patterns';

const CHART_COLORS = {
  Stimmung: '#7c9a8e',
  Energie: '#a0b8c4',
  Reizbelastung: '#c4a0a0',
  Schlaf: '#c4c0a0',
  'Sozialer Akku': '#b0a0c4',
};

export default function PatternView({ entries }) {
  const [timeRange, setTimeRange] = useState(30);

  if (entries.length < 3) {
    return (
      <div className="card">
        <h2>Muster & Trends</h2>
        <div className="empty-state">
          <p>Mindestens 3 Einträge werden benötigt, um Muster zu erkennen.</p>
          <p>Aktuell: {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}</p>
        </div>
      </div>
    );
  }

  const patterns = analyzePatterns(entries, timeRange);
  const chartData = getChartData(entries, timeRange);

  return (
    <div>
      <div className="card">
        <h2>Muster & Trends</h2>

        <div className="time-range">
          {[7, 14, 30, 90].map(days => (
            <button
              key={days}
              className={timeRange === days ? 'active' : ''}
              onClick={() => setTimeRange(days)}
            >
              {days} Tage
            </button>
          ))}
        </div>

        {chartData.length > 1 && (
          <div className="chart-container">
            <h3>Verlauf</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--color-text-light)"
                  fontSize={12}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  stroke="var(--color-text-light)"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)',
                  }}
                />
                <Legend />
                {Object.entries(CHART_COLORS).map(([key, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {patterns && (
        <>
          {/* Averages */}
          <div className="card">
            <h3>Durchschnittswerte ({patterns.entryCount} Einträge)</h3>
            <div className="detail-metrics">
              <AvgMetric label="Stimmung" value={patterns.averages.mood} />
              <AvgMetric label="Energie" value={patterns.averages.energy} />
              <AvgMetric label="Reizbelastung" value={patterns.averages.sensory} />
              <AvgMetric label="Schlaf" value={patterns.averages.sleep} />
              <AvgMetric label="Sozialer Akku" value={patterns.averages.social} />
            </div>
          </div>

          {/* Correlations */}
          {patterns.correlations.length > 0 && (
            <div className="card">
              <h3>Zusammenhänge</h3>
              <p className="hint" style={{ marginBottom: 'var(--space-md)' }}>
                Erkannte Verbindungen zwischen deinen Werten
              </p>
              <div className="correlation-grid">
                {patterns.correlations.map((c, i) => (
                  <div key={i} className="pattern-card">
                    <h4>{c.field1} &harr; {c.field2}</h4>
                    <p>{c.description}</p>
                    <CorrelationBar value={c.correlation} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trends */}
          {patterns.trends.length > 0 && (
            <div className="card">
              <h3>Trends</h3>
              {patterns.trends.map((t, i) => (
                <div key={i} className="pattern-card">
                  <h4>
                    {t.direction === 'up' ? '\u2191' : '\u2193'} {t.field}
                  </h4>
                  <p>{t.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Weekday patterns */}
          {patterns.weekdayPatterns.length > 0 && (
            <div className="card">
              <h3>Wochentags-Muster</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={patterns.weekdayPatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="day" stroke="var(--color-text-light)" fontSize={12} />
                  <YAxis domain={[1, 5]} stroke="var(--color-text-light)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--color-text)',
                    }}
                    formatter={(value) => value.toFixed(1)}
                  />
                  <Bar dataKey="avgMood" name="Stimmung" fill="#7c9a8e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgEnergy" name="Energie" fill="#a0b8c4" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="avgSensory" name="Reizbelastung" fill="#c4a0a0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Trigger frequency */}
          {patterns.triggerFrequency.length > 0 && (
            <div className="card">
              <h3>Häufige Auslöser</h3>
              <p className="hint" style={{ marginBottom: 'var(--space-md)' }}>
                Auslöser sortiert nach Häufigkeit mit durchschnittlicher Stimmung
              </p>
              {patterns.triggerFrequency.slice(0, 10).map((t, i) => (
                <div key={i} className="pattern-card">
                  <h4>{t.trigger} ({t.count}x)</h4>
                  <p>
                    Durchschn. Stimmung: {t.avgMood.toFixed(1)} / 5 &middot;
                    Durchschn. Energie: {t.avgEnergy.toFixed(1)} / 5
                  </p>
                  <FrequencyBar count={t.count} max={patterns.triggerFrequency[0].count} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AvgMetric({ label, value }) {
  return (
    <div className="detail-metric">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value.toFixed(1)}</div>
    </div>
  );
}

function CorrelationBar({ value }) {
  const width = Math.abs(value) * 100;
  const color = value > 0 ? '#a0c4a8' : '#c4a0a0';
  return (
    <div style={{
      marginTop: 'var(--space-sm)',
      height: '6px',
      background: 'var(--color-border)',
      borderRadius: '3px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${width}%`,
        height: '100%',
        background: color,
        borderRadius: '3px',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}

function FrequencyBar({ count, max }) {
  const width = (count / max) * 100;
  return (
    <div style={{
      marginTop: 'var(--space-sm)',
      height: '6px',
      background: 'var(--color-border)',
      borderRadius: '3px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${width}%`,
        height: '100%',
        background: 'var(--color-accent)',
        borderRadius: '3px',
        transition: 'width 0.3s ease',
      }} />
    </div>
  );
}
