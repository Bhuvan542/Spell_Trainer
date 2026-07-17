/* settings.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  const ACCENTS = [
    { id:'sapphire', hex:'#0A84FF', label:'Sapphire' },
    { id:'emerald',  hex:'#27C66B', label:'Emerald'  },
    { id:'crimson',  hex:'#F4373E', label:'Crimson'  },
    { id:'amber',    hex:'#FF9F0A', label:'Amber'    },
    { id:'violet',   hex:'#A056F7', label:'Violet'   },
    { id:'cyan',     hex:'#2FB8E6', label:'Cyan'     },
    { id:'rose',     hex:'#FB4570', label:'Rose'     },
    { id:'graphite', hex:'#8A8A92', label:'Graphite' },
  ];

  SR.applyTheme = function (pref) {
    const resolved = (pref === 'system')
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    document.documentElement.dataset.theme = resolved;
  };

  function chips(name, opts, sel) {
    return `<div class="chip-group" role="group" aria-label="${name}">
      ${opts.map((o) => `<button class="chip" data-name="${name}" data-value="${o.value}"
        aria-pressed="${String(o.value == sel)}">${o.label}</button>`).join('')}
    </div>`;
  }

  function wireChips(container, name, key) {
    container.querySelectorAll(`.chip[data-name="${name}"]`).forEach((chip) => {
      chip.addEventListener('click', () => {
        container.querySelectorAll(`.chip[data-name="${name}"]`).forEach((c) =>
          c.setAttribute('aria-pressed', 'false')
        );
        chip.setAttribute('aria-pressed', 'true');
        let v = chip.dataset.value;
        if (!isNaN(v) && v !== '') v = Number(v);
        SR.store.updateSetting(key, v);
      });
    });
  }

  function tog(checked, id, label) {
    return `<button class="toggle" role="switch" id="${id}"
      aria-checked="${String(!!checked)}" aria-label="${label}"></button>`;
  }

  function wireTog(id, key, cb) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', () => {
      const newVal = el.getAttribute('aria-checked') !== 'true';
      el.setAttribute('aria-checked', String(newVal));
      SR.store.updateSetting(key, newVal);
      if (cb) cb(newVal);
    });
  }

  /* ── Voice section builder ─────────────────────────────────────────────── */

  function buildVoiceSection(s) {
    return `
      <div class="settings-section">
        <p class="text-micro settings-section-title">Voice</p>
        <div class="card">
          <p class="text-caption" style="margin-bottom:10px">Pronunciation voice</p>
          <select id="voice-select" class="input voice-select" aria-label="Select voice"
            style="height:52px;padding:0 40px 0 16px;border-radius:12px;cursor:pointer;font-size:15px">
            <option value="">Auto (best available)</option>
          </select>
          <button class="btn btn-secondary btn-block" id="test-voice-btn" style="margin-top:12px">
            ${SR.icons.get('volume-2')} Test Voice
          </button>
        </div>
      </div>`;
  }

  function wireVoiceSection(s) {
    const select = document.getElementById('voice-select');
    if (!select) return;

    const voices = SR.SpeechService.getEnglishVoices();
    const savedName   = s.selectedVoiceName || '';
    const currentName = SR.SpeechService.getSelectedVoiceName();

    if (voices.length === 0) {
      const opt = document.createElement('option');
      opt.textContent = 'No voices available';
      opt.disabled = true;
      select.appendChild(opt);
    } else {
      voices.forEach((voice) => {
        const opt = document.createElement('option');
        opt.value = voice.name;
        opt.textContent = voice.name + (voice.lang ? '  (' + voice.lang + ')' : '');
        select.appendChild(opt);
      });

      // Select the saved voice; fall back to showing the auto-selected one
      if (savedName && voices.find((v) => v.name === savedName)) {
        select.value = savedName;
      } else if (!savedName && currentName) {
        // Auto mode — highlight which voice is being used, but keep value='' (Auto option)
        select.value = '';
        // Update Auto label to show which voice it picked
        const autoOpt = select.querySelector('option[value=""]');
        if (autoOpt && currentName) {
          autoOpt.textContent = 'Auto — ' + currentName;
        }
      } else {
        select.value = '';
      }
    }

    select.addEventListener('change', () => {
      const name = select.value;
      SR.SpeechService.setVoiceByName(name);
      SR.store.updateSetting('selectedVoiceName', name);
    });

    document.getElementById('test-voice-btn').addEventListener('click', () => {
      SR.SpeechService.cancel();
      setTimeout(() => {
        SR.SpeechService.speak(
          'Welcome to Spelling Trainer. This is a preview of the selected voice. Happy learning.'
        );
      }, 80);
    });
  }

  /* ── Main render ────────────────────────────────────────────────────────── */

  SR.renderSettings = function (container, navigate) {
    const s = SR.store.state.settings;

    container.innerHTML = `
      <div class="screen fade-scale-in">
        <h1 class="text-h1" style="margin-bottom:28px">Settings</h1>

        <!-- Appearance -->
        <div class="settings-section">
          <p class="text-micro settings-section-title">Appearance</p>
          <div class="card" style="margin-bottom:16px">
            <p class="text-caption" style="margin-bottom:12px">Theme</p>
            <div class="theme-option-row" role="group" aria-label="Theme">
              <button class="theme-option" data-theme="light"
                aria-pressed="${String(s.theme === 'light')}" aria-label="Light theme">
                ${SR.icons.get('sun')}<span class="text-caption">Light</span>
              </button>
              <button class="theme-option" data-theme="system"
                aria-pressed="${String(s.theme === 'system')}" aria-label="System theme">
                ${SR.icons.get('monitor')}<span class="text-caption">System</span>
              </button>
              <button class="theme-option" data-theme="dark"
                aria-pressed="${String(s.theme === 'dark')}" aria-label="Dark theme">
                ${SR.icons.get('moon')}<span class="text-caption">Dark</span>
              </button>
            </div>
          </div>
          <div class="card">
            <p class="text-caption" style="margin-bottom:16px">Accent colour</p>
            <div class="accent-swatch-row" role="group" aria-label="Accent colour">
              ${ACCENTS.map((a) => `
                <button class="accent-swatch" data-accent="${a.id}"
                  aria-pressed="${String(s.accent === a.id)}"
                  aria-label="${a.label}" style="background:${a.hex}">
                </button>`).join('')}
            </div>
          </div>
        </div>

        <!-- Voice -->
        ${buildVoiceSection(s)}

        <!-- Default Practice -->
        <div class="settings-section">
          <p class="text-micro settings-section-title">Default Practice</p>
          <div class="list">
            <div class="list-row" style="flex-direction:column;align-items:flex-start;gap:10px;padding:16px 20px">
              <span class="text-body-sm" style="font-weight:600">Questions</span>
              ${chips('s-q',[{value:10,label:'10'},{value:25,label:'25'},{value:50,label:'50'},{value:100,label:'100'}], s.defaultQuestions)}
            </div>
            <div class="list-row" style="flex-direction:column;align-items:flex-start;gap:10px;padding:16px 20px">
              <span class="text-body-sm" style="font-weight:600">Word Source</span>
              ${chips('s-ws',[{value:'mixed',label:'Mixed'},{value:'new',label:'New'},{value:'wrong',label:'Wrong'},{value:'right',label:'Right'}], s.defaultWordSource)}
            </div>
            <div class="list-row" style="flex-direction:column;align-items:flex-start;gap:10px;padding:16px 20px">
              <span class="text-body-sm" style="font-weight:600">Word Length</span>
              ${chips('s-wl',[{value:'all',label:'All'},{value:'1-4',label:'1–4'},{value:'5-7',label:'5–7'},{value:'8-10',label:'8–10'},{value:'11+',label:'11+'}], s.defaultWordLength)}
            </div>
            <div class="list-row" style="flex-direction:column;align-items:flex-start;gap:10px;padding:16px 20px">
              <span class="text-body-sm" style="font-weight:600">Mode</span>
              ${chips('s-m',[{value:'free',label:'Free'},{value:'timed',label:'Timed'}], s.defaultMode)}
            </div>
            <div class="list-row" style="justify-content:space-between;padding:16px 20px">
              <span class="text-body-sm" style="font-weight:600">Hints</span>
              ${tog(s.hintsEnabled, 'tog-hints', 'Enable hints')}
            </div>
          </div>
        </div>

        <!-- Playback -->
        <div class="settings-section">
          <p class="text-micro settings-section-title">Playback</p>
          <div class="list">
            <div class="list-row" style="flex-direction:column;align-items:flex-start;gap:10px;padding:16px 20px">
              <span class="text-body-sm" style="font-weight:600">Playback speed</span>
              ${chips('s-spd',[{value:0.75,label:'0.75×'},{value:1.0,label:'1×'},{value:1.25,label:'1.25×'},{value:1.5,label:'1.5×'}], s.playbackSpeed)}
            </div>
          </div>
        </div>

        <!-- Session -->
        <div class="settings-section">
          <p class="text-micro settings-section-title">Session</p>
          <div class="list">
            <div class="list-row" style="justify-content:space-between;padding:16px 20px">
              <div>
                <p class="text-body-sm" style="font-weight:600">Auto-advance</p>
                <p class="text-caption">Move to next word automatically</p>
              </div>
              ${tog(s.autoNext, 'tog-auto', 'Auto-advance to next word')}
            </div>
            <div class="list-row" style="justify-content:space-between;padding:16px 20px">
              <div>
                <p class="text-body-sm" style="font-weight:600">Sound effects</p>
                <p class="text-caption">Tone on correct / wrong answer</p>
              </div>
              ${tog(s.soundEffects, 'tog-sfx', 'Enable sound effects')}
            </div>
            <div class="list-row" style="justify-content:space-between;padding:16px 20px">
              <div>
                <p class="text-body-sm" style="font-weight:600">Keep screen awake</p>
                <p class="text-caption">Prevent display from sleeping</p>
              </div>
              ${tog(s.keepScreenAwake, 'tog-wake', 'Keep screen awake')}
            </div>
          </div>
        </div>

        <!-- Daily Goal -->
        <div class="settings-section">
          <p class="text-micro settings-section-title">Daily Goal</p>
          <div class="card">
            <p class="text-caption" style="margin-bottom:12px">Questions to answer per day</p>
            ${chips('s-dg',[{value:20,label:'20'},{value:50,label:'50'},{value:100,label:'100'},{value:250,label:'250'}], s.dailyGoal)}
            <div style="margin-top:12px;display:flex;align-items:center;gap:8px">
              <label for="custom-goal" class="text-caption">Custom:</label>
              <input id="custom-goal" class="input" type="number" min="1" max="9999"
                placeholder="Any number"
                style="width:130px;height:40px;border-radius:8px;text-align:center;font-size:15px">
            </div>
          </div>
        </div>

        <!-- Data -->
        <div class="settings-section">
          <p class="text-micro settings-section-title">Data</p>
          <div class="list">
            <button class="list-row list-row-tappable" id="btn-export" style="width:100%;text-align:left">
              ${SR.icons.get('download')}
              <span class="text-body-sm" style="font-weight:500;flex:1">Export Progress</span>
              ${SR.icons.get('chevron-right')}
            </button>
            <button class="list-row list-row-tappable" id="btn-import" style="width:100%;text-align:left">
              ${SR.icons.get('upload')}
              <span class="text-body-sm" style="font-weight:500;flex:1">Import Progress</span>
              ${SR.icons.get('chevron-right')}
            </button>
            <button class="list-row list-row-tappable" id="btn-reset" style="width:100%;text-align:left">
              ${SR.icons.get('trash-2')}
              <span class="text-body-sm" style="font-weight:500;flex:1;color:var(--danger)">Reset All Data</span>
              ${SR.icons.get('chevron-right')}
            </button>
          </div>
          <input type="file" accept=".json" id="import-file-input"
            style="display:none" aria-label="Import JSON backup file">
        </div>

        <div style="height:24px"></div>
      </div>`;

    /* Voice section */
    wireVoiceSection(s);

    /* Theme */
    container.querySelectorAll('[data-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('[data-theme]').forEach((b) =>
          b.setAttribute('aria-pressed', String(b.dataset.theme === btn.dataset.theme))
        );
        SR.store.updateSetting('theme', btn.dataset.theme);
        SR.applyTheme(btn.dataset.theme);
      });
    });

    /* Accent */
    container.querySelectorAll('[data-accent]').forEach((sw) => {
      sw.addEventListener('click', () => {
        container.querySelectorAll('[data-accent]').forEach((s2) =>
          s2.setAttribute('aria-pressed', String(s2.dataset.accent === sw.dataset.accent))
        );
        SR.store.updateSetting('accent', sw.dataset.accent);
        document.documentElement.dataset.accent = sw.dataset.accent;
      });
    });

    /* Practice defaults */
    wireChips(container, 's-q',   'defaultQuestions');
    wireChips(container, 's-ws',  'defaultWordSource');
    wireChips(container, 's-wl',  'defaultWordLength');
    wireChips(container, 's-m',   'defaultMode');
    wireChips(container, 's-dg',  'dailyGoal');
    wireChips(container, 's-spd', 'playbackSpeed');
    container.querySelectorAll('.chip[data-name="s-spd"]').forEach((c) => {
      c.addEventListener('click', () => SR.SpeechService.setRate(parseFloat(c.dataset.value)));
    });

    /* Toggles */
    wireTog('tog-hints', 'hintsEnabled');
    wireTog('tog-auto',  'autoNext');
    wireTog('tog-sfx',   'soundEffects');
    wireTog('tog-wake',  'keepScreenAwake');

    /* Custom daily goal */
    document.getElementById('custom-goal').addEventListener('change', (e) => {
      const v = parseInt(e.target.value, 10);
      if (v > 0 && v <= 9999) {
        SR.store.updateSetting('dailyGoal', v);
        container.querySelectorAll('.chip[data-name="s-dg"]').forEach((c) =>
          c.setAttribute('aria-pressed', 'false')
        );
      }
    });

    /* Export */
    document.getElementById('btn-export').addEventListener('click', () => {
      try { SR.store.exportData(); SR.showToast('Progress exported', 'success'); }
      catch (_) { SR.showToast('Export failed', 'error'); }
    });

    /* Import */
    const fileInput = document.getElementById('import-file-input');
    document.getElementById('btn-import').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      try {
        const data = await SR.StorageService.importJSON(file);
        SR.store.importData(data);
        // Restore voice from imported settings
        SR.SpeechService.setVoiceByName(SR.store.state.settings.selectedVoiceName);
        SR.showToast('Progress imported successfully', 'success');
        SR.renderSettings(container, navigate);
      } catch (_) {
        SR.showToast('Invalid or corrupted file', 'error');
      } finally { fileInput.value = ''; }
    });

    /* Reset */
    document.getElementById('btn-reset').addEventListener('click', () => {
      SR.Modal.open({
        label: 'Reset confirmation',
        content: `
          <div style="text-align:center;padding:8px 0 24px">
            <div style="width:56px;height:56px;margin:0 auto 16px;border-radius:50%;
              background:var(--danger-bg);color:var(--danger);
              display:flex;align-items:center;justify-content:center">
              ${SR.icons.get('trash-2')}
            </div>
            <p class="text-h3">Reset all data?</p>
            <p class="text-body text-secondary" style="margin-top:8px">
              Permanently erases word lists, statistics, and practice history.
              This cannot be undone.
            </p>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <button class="btn btn-block" id="r-yes"
              style="background:var(--danger);color:#fff;height:48px;border-radius:999px;font-size:17px;font-weight:600">
              Yes, reset everything
            </button>
            <button class="btn btn-secondary btn-block" id="r-no">Cancel</button>
          </div>`,
      });
      document.getElementById('r-yes').addEventListener('click', () => {
        SR.Modal.close();
        SR.store.resetData();
        SR.SpeechService.setVoiceByName(''); // reset to auto
        SR.showToast('All data has been reset', 'info');
        navigate('home');
      });
      document.getElementById('r-no').addEventListener('click', () => SR.Modal.close());
    });
  };
})();
