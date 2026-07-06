/* speech.js — production-grade TTS wrapper with voice selection */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  class _SpeechService {
    constructor() {
      this._voice              = null;
      this._rate               = 1.0;
      this._ready              = false;
      this._initPromise        = null;
      this._currentUtterance   = null;
      this._selectedVoiceName  = ''; // '' = auto, otherwise explicit name
    }

    /* ── Initialisation ─────────────────────────────────────────────────── */

    init() {
      if (this._initPromise) return this._initPromise;
      this._initPromise = this._loadVoices();
      return this._initPromise;
    }

    _loadVoices() {
      return new Promise((resolve) => {
        if (!this.isSupported) { resolve(); return; }

        const done = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length) {
            // Honour any explicit selection that was set before voices loaded
            this._applyVoiceSelection(voices);
            this._ready = true;
          }
          resolve();
        };

        if (window.speechSynthesis.getVoices().length > 0) { done(); return; }

        let settled = false;
        const onChanged = () => {
          if (settled) return;
          settled = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
          done();
        };
        window.speechSynthesis.addEventListener('voiceschanged', onChanged);

        // Poll as fallback (Firefox sometimes fires before listener attaches)
        let polls = 0;
        const poll = setInterval(() => {
          polls++;
          if (window.speechSynthesis.getVoices().length > 0 || polls > 20) {
            clearInterval(poll);
            if (!settled) {
              settled = true;
              window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
              done();
            }
          }
        }, 100);

        // Hard timeout — degrade gracefully
        setTimeout(() => {
          clearInterval(poll);
          if (!settled) {
            settled = true;
            window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
            done();
          }
        }, 2000);
      });
    }

    _applyVoiceSelection(voices) {
      if (this._selectedVoiceName) {
        const found = voices.find((v) => v.name === this._selectedVoiceName);
        this._voice = found || this._pickBest(voices);
      } else {
        this._voice = this._pickBest(voices);
      }
    }

    _pickBest(voices) {
      const quality = ['natural','premium','enhanced','neural','hd',
                       'samantha','daniel','karen','moira','alex','aria'];
      const has = (v) => quality.some((k) => v.name.toLowerCase().includes(k));
      const us  = voices.filter((v) => v.lang.startsWith('en-US'));
      const gb  = voices.filter((v) => v.lang.startsWith('en-GB'));
      const en  = voices.filter((v) => /^en\b/i.test(v.lang));
      return us.find(has) || us[0] || gb.find(has) || gb[0] || en[0] || voices[0] || null;
    }

    /* ── Public speak API ────────────────────────────────────────────────── */

    async speak(text) {
      if (!this.isSupported) return;
      if (!this._ready) await this.init();

      return new Promise((resolve) => {
        try { window.speechSynthesis.cancel(); } catch (_) {}
        this._currentUtterance = null;

        const u = new SpeechSynthesisUtterance(text);
        if (this._voice) u.voice = this._voice;
        u.lang   = (this._voice && this._voice.lang) ? this._voice.lang : 'en-US';
        u.rate   = this._rate;
        u.pitch  = 1;
        u.volume = 1;

        const finish = () => { this._currentUtterance = null; resolve(); };
        const TIMEOUT = Math.max(10000, text.length * 500);
        const guard = setTimeout(finish, TIMEOUT);
        u.onend   = () => { clearTimeout(guard); finish(); };
        u.onerror = () => { clearTimeout(guard); finish(); };
        this._currentUtterance = u;

        // Small delay after cancel for Safari stability
        setTimeout(() => {
          try { window.speechSynthesis.speak(u); } catch (_) { finish(); }
        }, 30);
      });
    }

    cancel() {
      if (!this.isSupported) return;
      try { window.speechSynthesis.cancel(); } catch (_) {}
      this._currentUtterance = null;
    }

    setRate(r) { this._rate = Math.min(3, Math.max(0.1, Number(r) || 1)); }

    /* ── Voice selection API ─────────────────────────────────────────────── */

    /**
     * Returns all available English voices sorted alphabetically.
     * Safe to call before init() — returns [] if voices not yet loaded.
     */
    getEnglishVoices() {
      if (!this.isSupported) return [];
      const voices = window.speechSynthesis.getVoices();
      return voices
        .filter((v) => /^en\b/i.test(v.lang))
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Select a voice by name. Pass '' or null to revert to auto-selection.
     * Safe to call at any time — if voices aren't loaded yet the preference
     * is stored and applied once they load.
     */
    setVoiceByName(name) {
      this._selectedVoiceName = name || '';
      if (!this.isSupported) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return; // will be applied in _loadVoices → _applyVoiceSelection
      this._applyVoiceSelection(voices);
    }

    /** Returns the display name of the currently active voice. */
    getSelectedVoiceName() {
      return this._voice ? this._voice.name : '';
    }

    /** Returns the explicitly saved voice name ('' = auto). */
    getSavedVoiceName() {
      return this._selectedVoiceName;
    }

    get isSupported() { return typeof window !== 'undefined' && 'speechSynthesis' in window; }
    get isSpeaking()  { return this.isSupported && window.speechSynthesis.speaking; }
  }

  SR.SpeechService = new _SpeechService();
})();
