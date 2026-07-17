/* ==========================================================================
   keyboard.js  —  Reusable custom QWERTY keyboard component.

   Usage:
     const kb = new SR.SpellKeyboard({ onKey, onBackspace });
     mountEl.appendChild(kb.render());
     // later:
     kb.destroy();

   The component is fully decoupled from the practice session.
   It emits characters and backspace signals via callbacks; all input
   state and validation logic stays in practice-session.js unchanged.
   ========================================================================== */

(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  /* ── Layout ─────────────────────────────────────────────────────────────── */

  const ROWS = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['backspace','z','x','c','v','b','n','m'],
  ];

  /* Timing for hold-to-delete */
  const BS_DELAY  = 380;  // ms before repeat begins
  const BS_REPEAT =  75;  // ms between repeat deletions

  /* Backspace SVG (Lucide delete / backspace icon) */
  const BS_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>' +
      '<line x1="18" y1="9" x2="12" y2="15"/>' +
      '<line x1="12" y1="9" x2="18" y2="15"/>' +
    '</svg>';

  /* ── SpellKeyboard class ─────────────────────────────────────────────────── */

  class SpellKeyboard {
    /**
     * @param {Object}   opts
     * @param {Function} opts.onKey       Called with a single lowercase letter.
     * @param {Function} opts.onBackspace Called to remove the last character.
     */
    constructor(opts) {
      this.onKey       = opts.onKey;
      this.onBackspace = opts.onBackspace;
      this.element     = null;
      this._bsTimeout  = null;
      this._bsInterval = null;
    }

    /* ── Public: render ───────────────────────────────────────────────────── */

    /**
     * Builds the keyboard DOM tree and returns the root element.
     * Does NOT insert it into the document — the caller does that.
     * @returns {HTMLElement}
     */
    render() {
      const kb = document.createElement('div');
      kb.className = 'spell-keyboard';
      kb.setAttribute('role', 'group');
      kb.setAttribute('aria-label', 'Spelling keyboard');

      ROWS.forEach((row) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'kbd-row';

        row.forEach((key) => {
          rowEl.appendChild(
            key === 'backspace'
              ? this._makeBackspaceKey()
              : this._makeLetterKey(key)
          );
        });

        kb.appendChild(rowEl);
      });

      this.element = kb;
      return kb;
    }

    /* ── Public: destroy ──────────────────────────────────────────────────── */

    /**
     * Cancels any in-progress backspace repeat and removes the element from
     * the DOM (safe to call even if the element was already removed).
     */
    destroy() {
      this._stopBackspace();
      if (this.element) {
        if (this.element.parentNode) this.element.remove();
        this.element = null;
      }
    }

    /* ── Private: key factories ───────────────────────────────────────────── */

    _makeLetterKey(letter) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kbd-key';
      btn.textContent = letter.toUpperCase();
      btn.setAttribute('aria-label', letter.toUpperCase());
      btn.setAttribute('tabindex', '-1'); // keeps tab order on input / submit

      /* Prevent mousedown from stealing focus from the practice input */
      btn.addEventListener('mousedown', (e) => e.preventDefault());

      /* Instant visual feedback */
      btn.addEventListener('pointerdown', () => btn.classList.add('is-active'));
      btn.addEventListener('pointerup',   () => btn.classList.remove('is-active'));
      btn.addEventListener('pointerleave',() => btn.classList.remove('is-active'));
      btn.addEventListener('pointercancel',()=> btn.classList.remove('is-active'));

      /* Emit the letter on click (handles mouse, touch, and Enter/Space
         when the button has keyboard focus for accessibility) */
      btn.addEventListener('click', () => this.onKey(letter));

      return btn;
    }

    _makeBackspaceKey() {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kbd-key kbd-key--action';
      btn.innerHTML  = BS_ICON;
      btn.setAttribute('aria-label', 'Delete');
      btn.setAttribute('tabindex', '-1');

      /* Prevent focus steal */
      btn.addEventListener('mousedown', (e) => e.preventDefault());

      /* Instant visual feedback */
      const activate   = () => btn.classList.add('is-active');
      const deactivate = () => btn.classList.remove('is-active');

      /* --- Tap + hold logic via Pointer Events (covers mouse & touch) --- */

      const startBS = (e) => {
        /* Only respond to primary pointer (left-click / first touch) */
        if (e.pointerType && !e.isPrimary) return;
        activate();
        /* Immediate first delete */
        this.onBackspace();
        /* After BS_DELAY, start repeating */
        this._bsTimeout = setTimeout(() => {
          this._bsInterval = setInterval(() => this.onBackspace(), BS_REPEAT);
        }, BS_DELAY);
      };

      const stopBS = () => {
        deactivate();
        this._stopBackspace();
      };

      btn.addEventListener('pointerdown',  startBS);
      btn.addEventListener('pointerup',    stopBS);
      btn.addEventListener('pointerleave', stopBS);
      btn.addEventListener('pointercancel',stopBS);

      /* Keyboard accessibility: Space / Enter when button has focus */
      btn.addEventListener('keydown', (e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.onBackspace();
        }
      });

      return btn;
    }

    /* ── Private: helpers ─────────────────────────────────────────────────── */

    _stopBackspace() {
      clearTimeout(this._bsTimeout);
      clearInterval(this._bsInterval);
      this._bsTimeout  = null;
      this._bsInterval = null;
    }
  }

  /* Expose on the global SpellRight namespace */
  SR.SpellKeyboard = SpellKeyboard;
})();
