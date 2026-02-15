import { subDays, parseISO, isWithinInterval, format } from 'date-fns';
import { de } from 'date-fns/locale';

export function analyzePatterns(entries, days = 30) {
  if (entries.length < 3) return null;

  const cutoff = subDays(new Date(), days);
  const recent = entries.filter(e => {
    const d = parseISO(e.date);
    return isWithinInterval(d, { start: cutoff, end: new Date() });
  });

  if (recent.length < 3) return null;

  const avgMood = avg(recent.map(e => e.mood));
  const avgEnergy = avg(recent.map(e => e.energy));
  const avgSensory = avg(recent.map(e => e.sensoryLoad));
  const avgSleep = avg(recent.map(e => e.sleepQuality));
  const avgSocial = avg(recent.map(e => e.socialBattery));

  const correlations = calculateCorrelations(recent);
  const trends = calculateTrends(recent);
  const weekdayPatterns = analyzeWeekdays(recent);
  const triggerFrequency = analyzeTriggers(recent);

  return {
    averages: { mood: avgMood, energy: avgEnergy, sensory: avgSensory, sleep: avgSleep, social: avgSocial },
    correlations,
    trends,
    weekdayPatterns,
    triggerFrequency,
    entryCount: recent.length,
  };
}

function avg(nums) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function calculateCorrelations(entries) {
  const fields = ['mood', 'energy', 'sensoryLoad', 'sleepQuality', 'socialBattery'];
  const labels = {
    mood: 'Stimmung',
    energy: 'Energie',
    sensoryLoad: 'Reizbelastung',
    sleepQuality: 'Schlaf',
    socialBattery: 'Sozialer Akku',
  };

  const results = [];

  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const a = entries.map(e => e[fields[i]]);
      const b = entries.map(e => e[fields[j]]);
      const r = pearsonCorrelation(a, b);

      if (Math.abs(r) > 0.3) {
        results.push({
          field1: labels[fields[i]],
          field2: labels[fields[j]],
          correlation: r,
          description: describeCorrelation(labels[fields[i]], labels[fields[j]], r),
        });
      }
    }
  }

  return results.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
}

function pearsonCorrelation(x, y) {
  const n = x.length;
  if (n < 3) return 0;

  const avgX = avg(x);
  const avgY = avg(y);

  let num = 0;
  let denX = 0;
  let denY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - avgX;
    const dy = y[i] - avgY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }

  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : num / den;
}

function describeCorrelation(field1, field2, r) {
  const strength = Math.abs(r) > 0.7 ? 'stark' : Math.abs(r) > 0.5 ? 'deutlich' : 'leicht';

  if (r > 0) {
    return `${field1} und ${field2} steigen und fallen ${strength} zusammen.`;
  } else {
    return `Wenn ${field1} steigt, sinkt ${field2} tendenziell (${strength}).`;
  }
}

function calculateTrends(entries) {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sorted.length < 5) return [];

  const half = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, half);
  const secondHalf = sorted.slice(half);

  const fields = [
    { key: 'mood', label: 'Stimmung' },
    { key: 'energy', label: 'Energie' },
    { key: 'sensoryLoad', label: 'Reizbelastung' },
    { key: 'sleepQuality', label: 'Schlaf' },
    { key: 'socialBattery', label: 'Sozialer Akku' },
  ];

  const trends = [];

  for (const { key, label } of fields) {
    const avgFirst = avg(firstHalf.map(e => e[key]));
    const avgSecond = avg(secondHalf.map(e => e[key]));
    const diff = avgSecond - avgFirst;

    if (Math.abs(diff) > 0.3) {
      trends.push({
        field: label,
        direction: diff > 0 ? 'up' : 'down',
        magnitude: Math.abs(diff),
        description: `${label} ist ${diff > 0 ? 'gestiegen' : 'gesunken'} (${diff > 0 ? '+' : ''}${diff.toFixed(1)}).`,
      });
    }
  }

  return trends;
}

function analyzeWeekdays(entries) {
  const dayNames = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const byDay = {};

  for (const entry of entries) {
    const day = new Date(entry.date).getDay();
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(entry);
  }

  const results = [];
  for (const [day, dayEntries] of Object.entries(byDay)) {
    if (dayEntries.length >= 2) {
      results.push({
        day: dayNames[day],
        avgMood: avg(dayEntries.map(e => e.mood)),
        avgEnergy: avg(dayEntries.map(e => e.energy)),
        avgSensory: avg(dayEntries.map(e => e.sensoryLoad)),
        count: dayEntries.length,
      });
    }
  }

  return results.sort((a, b) => a.day.localeCompare(b.day));
}

function analyzeTriggers(entries) {
  const allTriggers = {};

  for (const entry of entries) {
    if (entry.triggers) {
      for (const trigger of entry.triggers) {
        if (!allTriggers[trigger]) {
          allTriggers[trigger] = { count: 0, totalMood: 0, totalEnergy: 0, totalSensory: 0 };
        }
        allTriggers[trigger].count++;
        allTriggers[trigger].totalMood += entry.mood;
        allTriggers[trigger].totalEnergy += entry.energy;
        allTriggers[trigger].totalSensory += entry.sensoryLoad;
      }
    }
  }

  return Object.entries(allTriggers)
    .map(([trigger, data]) => ({
      trigger,
      count: data.count,
      avgMood: data.totalMood / data.count,
      avgEnergy: data.totalEnergy / data.count,
      avgSensory: data.totalSensory / data.count,
    }))
    .sort((a, b) => b.count - a.count);
}

export function getChartData(entries, days = 30) {
  const cutoff = subDays(new Date(), days);
  return entries
    .filter(e => parseISO(e.date) >= cutoff)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(e => ({
      date: format(parseISO(e.date), 'dd.MM', { locale: de }),
      Stimmung: e.mood,
      Energie: e.energy,
      Reizbelastung: e.sensoryLoad,
      Schlaf: e.sleepQuality,
      'Sozialer Akku': e.socialBattery,
    }));
}
