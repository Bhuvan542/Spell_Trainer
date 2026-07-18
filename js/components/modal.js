/* modal.js — accessible modal with focus trap */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

  let _overlay = null, _panel = null, _onClose = null;
  let _prevFocus = null;  // element that had focus before modal opened

  function els() {
    if (!_overlay) _overlay = document.getElementById('modal-overlay');
    if (!_panel)   _panel   = document.getElementById('modal');
    return { overlay: _overlay, panel: _panel };
  }

  function trapFocus(e) {
    if (!_panel) return;
    const focusable = Array.from(_panel.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
    }
  }

  function handleKey(e) {
    if (e.key === 'Escape') SR.Modal.close();
    trapFocus(e);
  }

  SR.Modal = {
    open(opts) {
      opts = opts || {};
      if (this.isOpen) this.close(); // prevent stacking

      const { overlay, panel } = els();
      _onClose   = opts.onClose || null;
      _prevFocus = document.activeElement;

      panel.innerHTML = '<div class="modal-grabber" role="presentation"></div>' + (opts.content || '');
      panel.setAttribute('aria-label', opts.label || 'Dialog');

      overlay.onclick = () => SR.Modal.close();
      // Prevent panel clicks from closing via overlay
      panel.onclick = (e) => e.stopPropagation();

      overlay.classList.add('is-visible');
      panel.classList.add('is-visible');
      document.body.style.overflow = 'hidden';

      document.addEventListener('keydown', handleKey);

      // Focus first focusable element inside modal
      requestAnimationFrame(() => {
        const first = panel.querySelector(FOCUSABLE);
        if (first) first.focus();
      });
    },

    close() {
      if (!this.isOpen) return;
      const { overlay, panel } = els();
      overlay.classList.remove('is-visible');
      panel.classList.remove('is-visible');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKey);

      // Restore focus to triggering element
      if (_prevFocus && typeof _prevFocus.focus === 'function') {
        try { _prevFocus.focus(); } catch (_) {}
      }
      _prevFocus = null;

      const cb = _onClose;
      _onClose = null;
      if (cb) cb();
    },

    get isOpen() { return _panel ? _panel.classList.contains('is-visible') : false; },
  };
})();
