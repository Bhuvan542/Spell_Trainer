/* store.js — single source of truth with validation */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  const DEFAULT_STATE = {
    wordLists: { right: [], wrong: [] },
    stats: {
      sessions: [],
      totalQuestions: 0, totalCorrect: 0, totalWrong: 0,
      streakCurrent: 0, streakLongest: 0, lastPracticeDate: null,
    },
    settings: {
      theme: 'system', accent: 'sapphire',
      defaultQuestions: 25, defaultWordSource: 'mixed',
      defaultWordLength: 'all', defaultMode: 'free',
      defaultTimer: 15, hintsEnabled: true, playbackSpeed: 1.0,
      autoNext: true, soundEffects: false,
      keepScreenAwake: false, dailyGoal: 50,
      useAppKeyboard: true,     // use custom in-app keyboard during practice
      hapticFeedback: true,      // light vibration on key press (where supported)
      selectedVoiceName: '',     // '' = auto, otherwise explicit voice name
    },
  };

  /* ── Validation helpers ────────────────────────────────────────────────── */

  function isValidWord(w) { return typeof w === 'string' && /^[a-zA-Z]{1,40}$/.test(w.trim()); }
  function isNonNegInt(n) { return Number.isFinite(n) && n >= 0 && Math.floor(n) === n; }
  function isDateStr(s)   { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s); }

  function validateState(raw) {
    const s = deepMerge(DEFAULT_STATE, raw || {});

    // Word lists — unique valid lowercase words; right list wins duplicates
    s.wordLists.right = dedup(asArray(s.wordLists.right).map(w=>String(w).toLowerCase().trim()).filter(isValidWord));
    s.wordLists.wrong = dedup(asArray(s.wordLists.wrong).map(w=>String(w).toLowerCase().trim()).filter(isValidWord));
    const rightSet = new Set(s.wordLists.right);
    s.wordLists.wrong = s.wordLists.wrong.filter((w) => !rightSet.has(w));

    // Stats
    s.stats.sessions       = asArray(s.stats.sessions).filter(isValidSession);
    s.stats.totalQuestions = Math.max(0, safeInt(s.stats.totalQuestions));
    s.stats.totalCorrect   = Math.max(0, safeInt(s.stats.totalCorrect));
    s.stats.totalWrong     = Math.max(0, safeInt(s.stats.totalWrong));
    s.stats.streakCurrent  = Math.max(0, safeInt(s.stats.streakCurrent));
    s.stats.streakLongest  = Math.max(0, safeInt(s.stats.streakLongest));
    if (!isDateStr(s.stats.lastPracticeDate)) s.stats.lastPracticeDate = null;

    // Settings
    s.settings.defaultQuestions = Math.min(500, Math.max(1, safeInt(s.settings.defaultQuestions, 25)));
    s.settings.defaultTimer     = Math.min(60,  Math.max(3, safeInt(s.settings.defaultTimer, 15)));
    s.settings.playbackSpeed    = Math.min(3,   Math.max(0.1, safeFloat(s.settings.playbackSpeed, 1.0)));
    s.settings.dailyGoal        = Math.min(9999, Math.max(1, safeInt(s.settings.dailyGoal, 50)));
    s.settings.selectedVoiceName = typeof s.settings.selectedVoiceName === 'string'
      ? s.settings.selectedVoiceName : '';
    if (!['system','light','dark'].includes(s.settings.theme)) s.settings.theme = 'system';
    if (!['sapphire','emerald','crimson','amber','violet','cyan','rose','graphite'].includes(s.settings.accent))
      s.settings.accent = 'sapphire';
    if (!['mixed','new','wrong','right'].includes(s.settings.defaultWordSource)) s.settings.defaultWordSource = 'mixed';
    if (!['all','1-4','5-7','8-10','11+'].includes(s.settings.defaultWordLength)) s.settings.defaultWordLength = 'all';
    if (!['free','timed'].includes(s.settings.defaultMode)) s.settings.defaultMode = 'free';

    return s;
  }

  function isValidSession(s) {
    return s && isDateStr(s.date) &&
      isNonNegInt(s.questions) && s.questions > 0 &&
      isNonNegInt(s.correct)   && isNonNegInt(s.wrong) &&
      Number.isFinite(s.accuracy) && s.accuracy >= 0 && s.accuracy <= 100;
  }

  function asArray(v)        { return Array.isArray(v) ? v : []; }
  function dedup(arr)        { return [...new Set(arr)]; }
  function safeInt(v, def)   { const n = Math.round(Number(v)); return Number.isFinite(n) ? n : (def || 0); }
  function safeFloat(v, def) { const n = Number(v); return Number.isFinite(n) ? n : (def || 1); }

  function deepMerge(defaults, saved) {
    const result = JSON.parse(JSON.stringify(defaults));
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return result;
    for (const key of Object.keys(saved)) {
      if (!(key in result)) continue;
      const dv = result[key], sv = saved[key];
      if (dv !== null && typeof dv === 'object' && !Array.isArray(dv) &&
          sv !== null && typeof sv === 'object' && !Array.isArray(sv)) {
        result[key] = deepMerge(dv, sv);
      } else {
        result[key] = sv;
      }
    }
    return result;
  }

  /* ── Store ─────────────────────────────────────────────────────────────── */

  class _Store {
    constructor() { this.state = null; }

    init() {
      let raw = null;
      try { raw = SR.StorageService.load(); } catch (_) {}
      this.state = validateState(raw);
      return this;
    }

    persist() {
      try { SR.StorageService.save(this.state); } catch (_) {}
    }

    /* Word lists */
    markCorrect(word) {
      const w = word.toLowerCase().trim();
      this.state.wordLists.wrong = this.state.wordLists.wrong.filter((x) => x !== w);
      if (!this.state.wordLists.right.includes(w)) this.state.wordLists.right.push(w);
      this.persist();
    }

    markWrong(word) {
      const w = word.toLowerCase().trim();
      if (this.state.wordLists.right.includes(w)) {
        this.state.wordLists.right = this.state.wordLists.right.filter((x) => x !== w);
      }
      if (!this.state.wordLists.wrong.includes(w)) this.state.wordLists.wrong.push(w);
      this.persist();
    }

    /* Sessions */
    saveSession(result) {
      const q = Math.max(0, safeInt(result.questions));
      if (q === 0) return null;
      const c = Math.min(q, Math.max(0, safeInt(result.correct)));
      const w = Math.min(q, Math.max(0, safeInt(result.wrong)));
      const today    = SR.helpers.todayString();
      const accuracy = Math.round((c / q) * 100);
      const entry    = { date: today, questions: q, correct: c, wrong: w, accuracy };
      this.state.stats.sessions.push(entry);
      this.state.stats.totalQuestions += q;
      this.state.stats.totalCorrect   += c;
      this.state.stats.totalWrong     += w;
      this._updateStreak(today);
      this.persist();
      return entry;
    }

    _updateStreak(today) {
      const last = this.state.stats.lastPracticeDate;
      if      (last === today)                      { /* same day, no change */ }
      else if (last === SR.helpers.yesterdayString()) { this.state.stats.streakCurrent++; }
      else                                          { this.state.stats.streakCurrent = 1; }
      if (this.state.stats.streakCurrent > this.state.stats.streakLongest)
        this.state.stats.streakLongest = this.state.stats.streakCurrent;
      this.state.stats.lastPracticeDate = today;
    }

    /* Settings */
    updateSetting(key, value) {
      if (!(key in DEFAULT_STATE.settings)) return;
      this.state.settings[key] = value;
      this.persist();
    }

    /* Derived */
    getTodayCount() {
      const today = SR.helpers.todayString();
      return this.state.stats.sessions
        .filter((s) => s.date === today)
        .reduce((sum, s) => sum + s.questions, 0);
    }

    getOverallAccuracy() {
      const { totalQuestions: q, totalCorrect: c } = this.state.stats;
      return q === 0 ? 0 : Math.round((c / q) * 100);
    }

    /**
     * Build a word queue for a practice session.
     *
     * For MIXED source: words are shuffled and repeated to fill `count`.
     *
     * For LIMITED sources (wrong / right / new):
     *   - Each available word is used EXACTLY ONCE.
     *   - If fewer words are available than `count`, the session is silently
     *     reduced. The caller reads `result.truncated` and shows a message.
     *
     * @returns {{ words, usedFallback, truncated, availableCount, requestedCount }}
     */
    buildWordQueue(source, lengthFilter, count) {
      const { right, wrong } = this.state.wordLists;
      const practiced = new Set([...right, ...wrong]);

      // Determine whether source has a finite, non-repeating pool
      const isLimited = ['wrong', 'right', 'new'].includes(source);
      let pool;

      switch (source) {
        case 'new':   pool = SR.WORD_LIST.filter((w) => !practiced.has(w)); break;
        case 'wrong': pool = [...wrong]; break;
        case 'right': pool = [...right]; break;
        default:      pool = [...SR.WORD_LIST]; // mixed
      }

      // Apply length filter
      if (lengthFilter !== 'all')
        pool = pool.filter((w) => SR.getLengthCategory(w) === lengthFilter);

      let usedFallback = false;

      // Empty pool → fall back to full word list (treat as mixed)
      if (pool.length === 0) {
        pool = lengthFilter !== 'all'
          ? SR.WORD_LIST.filter((w) => SR.getLengthCategory(w) === lengthFilter)
          : [...SR.WORD_LIST];
        if (pool.length === 0) pool = [...SR.WORD_LIST];
        usedFallback = true;
      }

      SR.helpers.shuffle(pool);

      const n = Math.max(1, Math.min(count, 9999));

      if (!isLimited || usedFallback) {
        // Mixed or fallback: repeat pool to fill requested count
        const words = [];
        while (words.length < n) words.push(...pool);
        return {
          words: words.slice(0, n),
          usedFallback,
          truncated: false,
          availableCount: pool.length,
          requestedCount: n,
        };
      }

      // Limited source: each word exactly once, cap at what's available
      const actualCount = Math.min(n, pool.length);
      return {
        words: pool.slice(0, actualCount),
        usedFallback: false,
        truncated: actualCount < n,
        availableCount: pool.length,
        requestedCount: n,
      };
    }

    /* Import / Export / Reset */
    exportData() { SR.StorageService.exportJSON(this.state); }
    importData(raw) { this.state = validateState(raw); this.persist(); }
    resetData()  { this.state = JSON.parse(JSON.stringify(DEFAULT_STATE)); SR.StorageService.clear(); }
  }

  SR.store = new _Store();
})();
