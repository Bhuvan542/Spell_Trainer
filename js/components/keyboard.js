/* ==========================================================================
   keyboard.js  —  Reusable premium QWERTY keyboard component.

   Layout:
     Row 1: Q W E R T Y U I O P          (full width)
     Row 2:  A S D F G H J K L           (indent 0.5)
     Row 3:    Z X C V B N M         ⌫   (indent 0.75, backspace far right)

   Usage:
     const kb = new SR.SpellKeyboard({ onKey, onBackspace });
     mountEl.appendChild(kb.render());
     kb.destroy();
   ========================================================================== */

(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  /* ── Layout definition ──────────────────────────────────────────────────── */

  const ROWS = [
    { keys: ['q','w','e','r','t','y','u','i','o','p'], indent: 0,    action: null        },
    { keys: ['a','s','d','f','g','h','j','k','l'],     indent: 0.5,  action: null        },
    { keys: ['z','x','c','v','b','n','m'],              indent: 0.75, action: 'backspace' },
  ];

  /* Backspace timing */
  const BS_DELAY  = 380;   // ms before repeat starts
  const BS_REPEAT =  70;   // ms between repeat events

  /* Backspace SVG icon (Lucide delete / backspace shape) */
  const BS_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>' +
      '<line x1="18" y1="9" x2="12" y2="15"/>' +
      '<line x1="12" y1="9" x2="18" y2="15"/>' +
    '</svg>';

  /* ── SpellKeyboard ──────────────────────────────────────────────────────── */

  class SpellKeyboard {
    /**
     * @param {{ onKey: Function, onBackspace: Function }} opts
     */
    constructor(opts) {
      this.onKey       = opts.onKey;
      this.onBackspace = opts.onBackspace;
      this.element     = null;
      this._bsTimeout  = null;
      this._bsInterval = null;
    }

    /* ── render ─────────────────────────────────────────────────────────── */

    render() {
      const kb = document.createElement('div');
      kb.className = 'spell-keyboard';
      kb.setAttribute('role', 'group');
      kb.setAttribute('aria-label', 'Spelling keyboard');

      ROWS.forEach(({ keys, indent, action }) => {
        const row = document.createElement('div');
        row.className = 'kbd-row';

        /* Left stagger spacer */
        if (indent > 0) {
          row.appendChild(this._spacer(indent));
        }

        /* Letter keys */
        keys.forEach(k => row.appendChild(this._makeLetterKey(k)));

        /* Row 2: mirror spacer on right for symmetric centering */
        if (indent > 0 && !action) {
          row.appendChild(this._spacer(indent));
        }

        /* Action key at far right (row 3: backspace) */
        if (action === 'backspace') {
          row.appendChild(this._makeBackspaceKey());
        }

        kb.appendChild(row);
      });

      this.element = kb;
      return kb;
    }

    /* ── destroy ────────────────────────────────────────────────────────── */

    destroy() {
      this._stopBackspace();
      if (this.element) {
        if (this.element.parentNode) this.element.remove();
        this.element = null;
      }
    }

    /* ── Private: key builders ──────────────────────────────────────────── */

    _spacer(flexValue) {
      const sp = document.createElement('div');
      sp.className = 'kbd-spacer';
      sp.style.flex = String(flexValue);
      sp.setAttribute('aria-hidden', 'true');
      return sp;
    }

    _makeLetterKey(letter) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kbd-key';
      btn.textContent = letter.toUpperCase();
      btn.setAttribute('aria-label', letter.toUpperCase());
      btn.setAttribute('tabindex', '-1');

      /* Prevent focus steal from the practice input on mouse press */
      btn.addEventListener('mousedown', e => e.preventDefault());

      /* Instant accent-colour highlight on press */
      btn.addEventListener('pointerdown', () => btn.classList.add('is-active'));

      /* On click: emit letter, then fade highlight after 100 ms */
      btn.addEventListener('click', () => {
        this.onKey(letter);
        setTimeout(() => btn.classList.remove('is-active'), 100);
      });

      /* Cancel highlight if finger/cursor leaves before release */
      btn.addEventListener('pointerleave',  () => btn.classList.remove('is-active'));
      btn.addEventListener('pointercancel', () => btn.classList.remove('is-active'));

      return btn;
    }

    _makeBackspaceKey() {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kbd-key kbd-key--action';
      btn.innerHTML = BS_ICON;
      btn.setAttribute('aria-label', 'Delete');
      btn.setAttribute('tabindex', '-1');

      btn.addEventListener('mousedown', e => e.preventDefault());

      const startBS = e => {
        /* Only primary pointer (left-click / first touch) */
        if (e.pointerType && !e.isPrimary) return;
        btn.classList.add('is-active');
        this.onBackspace();
        this._bsTimeout = setTimeout(() => {
          this._bsInterval = setInterval(() => this.onBackspace(), BS_REPEAT);
        }, BS_DELAY);
      };

      const stopBS = () => {
        btn.classList.remove('is-active');
        this._stopBackspace();
      };

      btn.addEventListener('pointerdown',  startBS);
      btn.addEventListener('pointerup',    stopBS);
      btn.addEventListener('pointerleave', stopBS);
      btn.addEventListener('pointercancel',stopBS);

      /* Physical keyboard accessibility */
      btn.addEventListener('keydown', e => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.onBackspace();
        }
      });

      return btn;
    }

    /* ── Private: helpers ───────────────────────────────────────────────── */

    _stopBackspace() {
      clearTimeout(this._bsTimeout);
      clearInterval(this._bsInterval);
      this._bsTimeout  = null;
      this._bsInterval = null;
    }
  }

  SR.SpellKeyboard = SpellKeyboard;
})();
