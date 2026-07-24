/* storage.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};
  const STORAGE_KEY = 'spellright_v1';

  SR.StorageService = {
    load() {
      try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
      catch (_) { return null; }
    },
    save(state) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); return true; }
      catch (_) { return false; }
    },
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); return true; }
      catch (_) { return false; }
    },
    exportJSON(state) {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `spellright-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a); URL.revokeObjectURL(url);
    },
    importJSON(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = (e) => { try { resolve(JSON.parse(e.target.result)); } catch (_) { reject(new Error('Invalid JSON')); } };
        reader.onerror = ()  => reject(new Error('Could not read file'));
        reader.readAsText(file);
      });
    },
  };
})();
