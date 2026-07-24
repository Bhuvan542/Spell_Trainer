/* helpers.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  SR.helpers = {
    todayString() {
      return new Date().toISOString().slice(0, 10);
    },
    yesterdayString() {
      const d = new Date(); d.setDate(d.getDate() - 1);
      return d.toISOString().slice(0, 10);
    },
    formatDate(dateStr) {
      const [y, m, d] = dateStr.split('-').map(Number);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${d} ${months[m - 1]} ${y}`;
    },
    formatDateShort(dateStr) {
      const [, m, d] = dateStr.split('-').map(Number);
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return `${months[m - 1]} ${d}`;
    },
    lastNDays(n) {
      const days = [];
      for (let i = n - 1; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
      }
      return days;
    },
    greeting() {
      const h = new Date().getHours();
      if (h < 12) return 'Good morning';
      if (h < 18) return 'Good afternoon';
      return 'Good evening';
    },
    todayLabel() {
      return new Date().toLocaleDateString('en-GB', {
        weekday:'long', day:'numeric', month:'long', year:'numeric'
      });
    },
    capitalise(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    hintDisplay(word) {
      return word.split('').map((ch, i) => (i === 0 ? ch : '_')).join(' ');
    },
    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
    clamp(value, min, max) { return Math.min(max, Math.max(min, value)); },
    playCorrectTone() {
      try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start(); osc.stop(ctx.currentTime + 0.25);
        osc.onended = () => ctx.close();
      } catch (_) {}
    },
    playWrongTone() {
      try {
        const ctx  = new (window.AudioContext || window.webkitAudioContext)();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
        osc.onended = () => ctx.close();
      } catch (_) {}
    },
    _wakeLock: null,
    async requestWakeLock() {
      if ('wakeLock' in navigator) {
        try { this._wakeLock = await navigator.wakeLock.request('screen'); } catch (_) {}
      }
    },
    async releaseWakeLock() {
      if (this._wakeLock) {
        try { await this._wakeLock.release(); } catch (_) {}
        this._wakeLock = null;
      }
    },
  /* ── Haptic feedback (navigator.vibrate — Android/supported browsers) ──── */
  haptic: {
    /* Test once at load time; safe to call on any device */
    _supported: (function() {
      try { return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'; }
      catch(_) { return false; }
    })(),
    _ok() {
      return this._supported &&
        window.SpellRight &&
        window.SpellRight.store &&
        window.SpellRight.store.state &&
        window.SpellRight.store.state.settings.hapticFeedback;
    },
    /** Single short pulse — letter key press or backspace */
    key()     { if (this._ok()) { try { navigator.vibrate(12); } catch(_) {} } },
    /** Single pulse — submit button pressed */
    submit()  { if (this._ok()) { try { navigator.vibrate(15); } catch(_) {} } },
    /** Slightly longer pulse — correct answer confirmed */
    correct() { if (this._ok()) { try { navigator.vibrate(25); } catch(_) {} } },
    /** Two quick pulses — wrong answer */
    wrong()   { if (this._ok()) { try { navigator.vibrate([18, 55, 18]); } catch(_) {} } },
  },
  };
})();
