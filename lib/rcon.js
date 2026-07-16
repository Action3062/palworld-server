'use strict';

// Minimaler Source-RCON-Client (Valve-Protokoll), ohne Abhängigkeiten.
// Palworld: RCONEnabled=True, RCONPort=25575 in der PalWorldSettings.ini.
// Für Item-Belohnungen braucht der Server einen Mod wie PalDefender,
// der zusätzliche Befehle (z. B. giveitem) über RCON bereitstellt.

const net = require('net');

const TYPE_AUTH = 3;
const TYPE_AUTH_RESPONSE = 2;
const TYPE_EXEC = 2;

function buildPacket(id, type, body) {
  const bodyBuf = Buffer.from(body, 'utf8');
  const packet = Buffer.alloc(14 + bodyBuf.length);
  packet.writeInt32LE(10 + bodyBuf.length, 0); // Größe ohne dieses Feld
  packet.writeInt32LE(id, 4);
  packet.writeInt32LE(type, 8);
  bodyBuf.copy(packet, 12);
  // zwei Null-Terminatoren sind durch alloc bereits gesetzt
  return packet;
}

/**
 * Führt nacheinander RCON-Befehle aus und liefert die Antworten zurück.
 * Wirft bei Verbindungs-/Auth-Fehlern.
 */
function rconExec({ host, port, password, timeoutMs = 5000 }, commands) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const responses = [];
    let buffer = Buffer.alloc(0);
    let authed = false;
    let commandIndex = 0;
    let finished = false;

    const timer = setTimeout(() => fail(new Error('RCON-Timeout')), timeoutMs);

    function fail(err) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      socket.destroy();
      reject(err);
    }

    function done() {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      socket.end();
      resolve(responses);
    }

    function sendNext() {
      if (commandIndex >= commands.length) {
        done();
        return;
      }
      socket.write(buildPacket(100 + commandIndex, TYPE_EXEC, commands[commandIndex]));
    }

    socket.on('connect', () => {
      socket.write(buildPacket(1, TYPE_AUTH, password));
    });

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (buffer.length >= 4) {
        const size = buffer.readInt32LE(0);
        if (buffer.length < 4 + size) break;
        const id = buffer.readInt32LE(4);
        const type = buffer.readInt32LE(8);
        const body = buffer.toString('utf8', 12, 4 + size - 2);
        buffer = buffer.subarray(4 + size);

        if (!authed) {
          if (type !== TYPE_AUTH_RESPONSE) continue; // manche Server senden erst ein Leerpaket
          if (id === -1) {
            fail(new Error('RCON-Authentifizierung fehlgeschlagen (AdminPassword prüfen)'));
            return;
          }
          authed = true;
          sendNext();
        } else {
          responses.push(body);
          commandIndex += 1;
          sendNext();
        }
      }
    });

    socket.on('error', fail);
    socket.on('close', () => {
      if (!finished) fail(new Error('RCON-Verbindung geschlossen'));
    });
  });
}

module.exports = { rconExec };
