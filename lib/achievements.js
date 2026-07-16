'use strict';

// Erfolge (Achievements)
// ----------------------
// Alle Erfolge werden aus Daten berechnet, die das Backend ohnehin über die
// offizielle REST-API sammelt (Spielzeit, Level, Login-Tage, Uhrzeiten)
// plus der Vote-Historie des Vote-Systems. Keine Mods nötig.
//
// Ein Spieler-Datensatz (aus stats.json) enthält:
//   minutes, level, firstSeen, lastSeen, sessions, daysCount,
//   nightMin, morningMin, ach (Liste freigeschalteter IDs)
// ctx: { voteCount, firstSampleT, peakPlayers }

const DAY_MS = 24 * 3600 * 1000;

const DEFINITIONS = [
  // --- Spielzeit ---
  { id: 'time1h',    icon: '🌱', name: 'Erste Schritte',      desc: '1 Stunde auf dem Server gespielt',
    target: (p) => [Math.round(p.minutes || 0), 60] },
  { id: 'time10h',   icon: '⛺', name: 'Angekommen',          desc: '10 Stunden gespielt',
    target: (p) => [Math.round(p.minutes || 0), 600] },
  { id: 'time50h',   icon: '🏠', name: 'Stammspieler',        desc: '50 Stunden gespielt',
    target: (p) => [Math.round(p.minutes || 0), 3000] },
  { id: 'time100h',  icon: '🏰', name: 'Veteran',             desc: '100 Stunden gespielt',
    target: (p) => [Math.round(p.minutes || 0), 6000] },
  { id: 'time500h',  icon: '👑', name: 'Lebende Legende',     desc: '500 Stunden gespielt',
    target: (p) => [Math.round(p.minutes || 0), 30000] },

  // --- Level ---
  { id: 'level10',   icon: '📈', name: 'Aufsteiger',          desc: 'Level 10 erreicht',
    target: (p) => [p.level || 0, 10] },
  { id: 'level25',   icon: '⚔️', name: 'Kampferprobt',        desc: 'Level 25 erreicht',
    target: (p) => [p.level || 0, 25] },
  { id: 'level50',   icon: '🌟', name: 'Meister-Zähmer',      desc: 'Level 50 erreicht',
    target: (p) => [p.level || 0, 50] },
  { id: 'level80',   icon: '💎', name: 'Maximalstufe',        desc: 'Level 80 erreicht',
    target: (p) => [p.level || 0, 80] },

  // --- Treue ---
  { id: 'days7',     icon: '📅', name: 'Wiederkehrer',        desc: 'An 7 verschiedenen Tagen online',
    target: (p) => [p.daysCount || 0, 7] },
  { id: 'days30',    icon: '🗓️', name: 'Stammgast',           desc: 'An 30 verschiedenen Tagen online',
    target: (p) => [p.daysCount || 0, 30] },
  { id: 'days100',   icon: '🎖️', name: 'Inventar des Servers', desc: 'An 100 verschiedenen Tagen online',
    target: (p) => [p.daysCount || 0, 100] },
  { id: 'sessions100', icon: '🔄', name: 'Immer wieder gern', desc: '100-mal eingeloggt',
    target: (p) => [p.sessions || 0, 100] },

  // --- Uhrzeiten ---
  { id: 'nightowl',  icon: '🦉', name: 'Nachteule',           desc: '5 Stunden zwischen 0 und 5 Uhr gespielt',
    target: (p) => [Math.round(p.nightMin || 0), 300] },
  { id: 'earlybird', icon: '🐓', name: 'Früher Vogel',        desc: '5 Stunden zwischen 5 und 8 Uhr gespielt',
    target: (p) => [Math.round(p.morningMin || 0), 300] },

  // --- Community ---
  { id: 'vote1',     icon: '🗳️', name: 'Unterstützer',        desc: 'Erste Vote-Belohnung abgeholt',
    target: (p, ctx) => [ctx.voteCount || 0, 1] },
  { id: 'vote10',    icon: '📣', name: 'Super-Wähler',        desc: '10 Vote-Belohnungen abgeholt',
    target: (p, ctx) => [ctx.voteCount || 0, 10] },
  { id: 'vote30',    icon: '🏅', name: 'Wahlkampf-Held',      desc: '30 Vote-Belohnungen abgeholt',
    target: (p, ctx) => [ctx.voteCount || 0, 30] },

  // --- Besonderes ---
  { id: 'founder',   icon: '🧭', name: 'Gründungsmitglied',   desc: 'In den ersten 14 Tagen des Servers dabei gewesen',
    target: (p, ctx) => {
      if (!ctx.firstSampleT || !p.firstSeen) return [0, 1];
      const joined = new Date(p.firstSeen).getTime();
      const cutoff = ctx.firstSampleT * 1000 + 14 * DAY_MS;
      return [joined <= cutoff ? 1 : 0, 1];
    } },
  { id: 'peakcrew',  icon: '🎉', name: 'Rekord-Crew',         desc: 'Beim Spielerrekord des Servers dabei gewesen',
    target: (p, ctx) => {
      const crew = (ctx.peakPlayers || []).map((n) => n.toLowerCase());
      return [crew.includes((p._name || '').toLowerCase()) ? 1 : 0, 1];
    } }
];

/**
 * Berechnet alle Erfolge eines Spielers.
 * @returns [{ id, icon, name, desc, unlocked, current, targetValue }]
 */
function evaluate(playerName, record, ctx) {
  const p = { ...record, _name: playerName };
  return DEFINITIONS.map((def) => {
    const [current, targetValue] = def.target(p, ctx);
    return {
      id: def.id,
      icon: def.icon,
      name: def.name,
      desc: def.desc,
      unlocked: current >= targetValue,
      current: Math.min(current, targetValue),
      targetValue
    };
  });
}

module.exports = { DEFINITIONS, evaluate };
