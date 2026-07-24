/* navigation.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  const NAV_ITEMS = [
    { id:'home',       label:'Home',     icon:'home'        },
    { id:'practice',   label:'Practice', icon:'zap'         },
    { id:'words',      label:'Words',    icon:'book-open'   },
    { id:'statistics', label:'Stats',    icon:'bar-chart-2' },
    { id:'settings',   label:'Settings', icon:'settings'    },
  ];

  let _navigate = null;

  SR.Navigation = {
    init(navigateFn) {
      _navigate = navigateFn;
      this._renderBar();
      this._renderRail();
    },
    setActive(screenId) {
      document.querySelectorAll('[data-nav-id]').forEach((el) => {
        el.setAttribute('aria-current', el.dataset.navId === screenId ? 'page' : 'false');
      });
    },
    _renderBar() {
      const bar = document.getElementById('nav-bar');
      if (!bar) return;
      bar.innerHTML = NAV_ITEMS.map((item) =>
        `<button class="nav-bar-item" data-nav-id="${item.id}" aria-current="false" aria-label="${item.label}">
           ${SR.icons.get(item.icon)}<span>${item.label}</span>
         </button>`
      ).join('');
      bar.querySelectorAll('.nav-bar-item').forEach((btn) => {
        btn.addEventListener('click', () => _navigate(btn.dataset.navId));
      });
    },
    _renderRail() {
      const rail = document.getElementById('nav-rail');
      if (!rail) return;
      rail.innerHTML = `<div class="nav-rail-brand">${SR.icons.get('book-marked')}</div>
        <div class="nav-rail-items">
          ${NAV_ITEMS.map((item) =>
            `<button class="nav-rail-item" data-nav-id="${item.id}" aria-current="false" aria-label="${item.label}">
               ${SR.icons.get(item.icon)}<span>${item.label}</span>
             </button>`
          ).join('')}
        </div>`;
      rail.querySelectorAll('.nav-rail-item').forEach((btn) => {
        btn.addEventListener('click', () => _navigate(btn.dataset.navId));
      });
    },
  };
})();
