#!/usr/bin/env node
'use strict';

// Diagnose für die Vote-API-Anbindung.
// Auf dem Web-Server ausführen:
//   node tools/test-vote.js              → zeigt die letzten Votes der Serverliste
//   node tools/test-vote.js SpielerName  → prüft zusätzlich, ob dieser Name als
//                                          gültiger Vote erkannt würde

const fs = require('fs');
const path = require('path');
const { VoteSystem } = require('../lib/votes');

const configFile = path.join(__dirname, '..', 'config.json');
if (!fs.existsSync(configFile)) {
  console.error('config.json nicht gefunden – bitte im Projektverzeichnis anlegen.');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
const votesCfg = config.votes || {};

if (!votesCfg.check || !votesCfg.check.url) {
  console.error('votes.check.url ist nicht konfiguriert.');
  process.exit(1);
}

const vs = new VoteSystem(votesCfg, {
  dataFile: '/dev/null',
  palworldGet: async () => ({}),
  palworldPost: async () => ({})
});

(async () => {
  console.log(`Vote-API: ${votesCfg.check.url.replace(votesCfg.check.apiKey || '§§', '***')}`);
  let list;
  try {
    list = await vs.fetchVoteList();
  } catch (err) {
    console.error(`FEHLER beim Abruf: ${err.message}`);
    console.error('→ URL/API-Key prüfen; bei HTTP 403 blockt evtl. ein Bot-Schutz der Liste.');
    process.exit(1);
  }

  console.log(`\n${list.length} Votes erhalten. Die ersten 3 Einträge (roh):`);
  console.log(JSON.stringify(list.slice(0, 3), null, 2));

  if (list.length > 0) {
    console.log('\nErkannte Felder des ersten Eintrags:');
    console.log(`  Name: "${VoteSystem.entryName(list[0], votesCfg.check.nameField)}"`);
    const t = VoteSystem.entryTime(list[0], votesCfg.check.timeField);
    console.log(`  Zeit: ${t ? new Date(t).toISOString() : 'KEIN Zeitfeld erkannt (Votes gelten dann unbegrenzt!)'}`);
  }

  const name = process.argv[2];
  if (name) {
    const voted = await vs.hasVoted(name);
    console.log(`\nGültiger Vote für "${name}" (letzte ${votesCfg.check.maxAgeHours || 24} h): ${voted ? 'JA ✓' : 'NEIN ✗'}`);
  } else {
    console.log('\nTipp: node tools/test-vote.js DeinName  → prüft einen konkreten Spieler.');
  }
})();
