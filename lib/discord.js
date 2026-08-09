'use strict';

// Discord-Interactions ohne Bot-Prozess
// -------------------------------------
// Discord kann Slash-Befehle per HTTP an eine Webseite schicken
// ("Interactions Endpoint URL" im Developer-Portal). Es braucht also
// keinen dauerhaft laufenden Bot - nur:
//  1. die Signaturpruefung jeder Anfrage (Ed25519, Public Key der App)
//  2. die einmalige Registrierung des Slash-Befehls (REST, Bot-Token)
// Beides passiert hier, ohne Fremdpakete.

const crypto = require('crypto');

// Ed25519-Public-Keys von Discord sind 32 Rohbytes (hex). Node will einen
// SPKI-DER-Schluessel - dieser Prefix macht aus den Rohbytes gueltiges DER.
const ED25519_SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

/**
 * Prüft die Signatur einer Interactions-Anfrage.
 * @param {string} publicKeyHex  "Public Key" der App (Developer-Portal)
 * @param {string} signatureHex  Header X-Signature-Ed25519
 * @param {string} timestamp     Header X-Signature-Timestamp
 * @param {string|Buffer} rawBody  unveraenderter Request-Body
 */
function verifySignature(publicKeyHex, signatureHex, timestamp, rawBody) {
  try {
    const key = crypto.createPublicKey({
      key: Buffer.concat([ED25519_SPKI_PREFIX, Buffer.from(publicKeyHex, 'hex')]),
      format: 'der',
      type: 'spki'
    });
    return crypto.verify(
      null,
      Buffer.concat([Buffer.from(String(timestamp)), Buffer.from(rawBody)]),
      key,
      Buffer.from(signatureHex, 'hex')
    );
  } catch {
    return false; // kaputte Header/Schluessel zaehlen als ungueltig
  }
}

/**
 * Registriert den /verknuepfen-Befehl (idempotent - Discord aktualisiert
 * Befehle mit gleichem Namen). Mit guildId ist der Befehl sofort sichtbar,
 * global dauert es bis zu einer Stunde.
 */
async function registerLinkCommand(d) {
  if (!d || !d.botToken || !d.applicationId) {
    throw new Error('botToken und applicationId werden benoetigt');
  }
  const base = `https://discord.com/api/v10/applications/${d.applicationId}`;
  const url = d.guildId ? `${base}/guilds/${d.guildId}/commands` : `${base}/commands`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${d.botToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'verknuepfen',
      description: 'Verknüpft deinen In-Game-Namen – für die Voter-Rolle beim Voten',
      options: [{
        type: 3, // STRING
        name: 'name',
        description: 'Dein In-Game-Name auf PalHeim',
        required: true,
        max_length: 32
      }]
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${body.slice(0, 200)}`);
  }
}

module.exports = { verifySignature, registerLinkCommand };
