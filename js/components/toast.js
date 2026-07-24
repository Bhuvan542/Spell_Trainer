/* toast.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  SR.showToast = function (message, type, duration) {
    type     = type     || 'info';
    duration = duration || 3000;
    const c = document.getElementById('toast-stack');
    if (!c) return;
    const iconName = type === 'success' ? 'check' : type === 'error' ? 'alert-circle' : 'info';
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = SR.icons.get(iconName) + '<span>' + message + '</span>';
    c.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-visible')));
    setTimeout(() => {
      el.classList.remove('is-visible');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 400);
    }, duration);
  };
})();
