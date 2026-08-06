/* PalHeim – Vote & Belohnung
   Blendet die Vote-Sektion ein, wenn das Backend sie aktiviert hat,
   und wickelt das Abholen der Belohnung ab. */

(() => {
  'use strict';

  const section = document.getElementById('voten');
  const navLink = document.getElementById('navVote');
  if (!section) return;

  const form = document.getElementById('voteForm');
  const input = document.getElementById('voteName');
  const button = document.getElementById('voteClaim');
  const message = document.getElementById('voteMessage');
  const voteLink = document.getElementById('voteLink');
  const voteLinks = document.getElementById('voteLinks');

  function showMessage(text, ok) {
    message.textContent = text;
    message.classList.toggle('is-ok', ok);
    message.classList.toggle('is-error', !ok);
    message.hidden = false;
  }

  async function init() {
    try {
      const res = await fetch('/api/vote/info', { cache: 'no-store' });
      if (!res.ok) return;
      const info = await res.json();
      if (!info.enabled) return;

      // Ein Vote-Button je Serverliste; Fallback: der statische Einzel-Link
      if (Array.isArray(info.providers) && info.providers.length && voteLinks) {
        voteLinks.textContent = '';
        for (const p of info.providers) {
          const a = document.createElement('a');
          a.className = 'btn btn--accent';
          a.href = p.voteUrl;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = `Jetzt voten (${p.label || 'Serverliste'})`;
          voteLinks.appendChild(a);
        }
      } else if (info.voteUrl) {
        voteLink.href = info.voteUrl;
      }

      // Belohnung kommt ausserhalb des Spiels an (z. B. Discord-Rolle)?
      // Dann entfaellt der "einloggen"-Schritt
      if (info.requireOnline === false) {
        const step = document.getElementById('voteStepLogin');
        if (step) step.remove();
        // Schritt-Nummern wieder lueckenlos machen (1, 2 statt 1, 3)
        section.querySelectorAll('.vote-steps__num').forEach((el, i) => {
          el.textContent = String(i + 1);
        });
      }
      section.hidden = false;
      if (navLink) navLink.hidden = false;

      // Zuletzt genutzten Namen vorschlagen
      try {
        const saved = localStorage.getItem('palheim.voteName');
        if (saved) input.value = saved;
      } catch { /* localStorage kann gesperrt sein */ }
    } catch {
      /* Backend nicht erreichbar – Sektion bleibt ausgeblendet */
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (name.length < 2) return;

    try {
      localStorage.setItem('palheim.voteName', name);
    } catch { /* egal */ }

    button.disabled = true;
    button.textContent = 'Wird geprüft …';
    message.hidden = true;

    try {
      const res = await fetch('/api/vote/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const result = await res.json();
      showMessage(result.message || 'Unbekannte Antwort.', Boolean(result.ok));
      // Voter-Rolle möglich, aber noch keine Discord-ID hinterlegt?
      // (auch bei "heute schon abgeholt" anbieten)
      const discordBox = document.getElementById('voteDiscord');
      if (discordBox) {
        discordBox.hidden = !result.suggestLink;
      }
    } catch {
      showMessage('Server nicht erreichbar – versuch es gleich nochmal.', false);
    } finally {
      button.disabled = false;
      button.textContent = 'Belohnung abholen';
    }
  });

  // ---- Discord-ID nachreichen (Voter-Rolle) ----
  const discordForm = document.getElementById('voteDiscordForm');
  if (discordForm) {
    const discordMsg = document.getElementById('voteDiscordMsg');
    discordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const discordId = document.getElementById('voteDiscordId').value.trim();
      const name = input.value.trim();
      if (!discordId || name.length < 2) return;
      try {
        const res = await fetch('/api/vote/discord-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, discordId })
        });
        const result = await res.json();
        discordMsg.textContent = result.message || 'Unbekannte Antwort.';
        discordMsg.classList.toggle('is-ok', Boolean(result.ok));
        discordMsg.classList.toggle('is-error', !result.ok);
        discordMsg.hidden = false;
        if (result.ok) discordForm.hidden = true; // erledigt
      } catch {
        discordMsg.textContent = 'Server nicht erreichbar – versuch es gleich nochmal.';
        discordMsg.classList.add('is-error');
        discordMsg.hidden = false;
      }
    });
  }

  init();
})();
