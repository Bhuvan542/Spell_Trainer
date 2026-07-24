/* practice-hub.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  function chipGroup(name, options, selected) {
    return `<div class="chip-group" role="group">${options.map(function(o){
      return `<button class="chip" data-name="${name}" data-value="${o.value}" aria-pressed="${String(o.value == selected)}">${o.label}</button>`;
    }).join('')}</div>`;
  }

  function wireChips(container, name, onChange) {
    container.querySelectorAll('.chip[data-name="' + name + '"]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        container.querySelectorAll('.chip[data-name="' + name + '"]').forEach(function(c){ c.setAttribute('aria-pressed','false'); });
        chip.setAttribute('aria-pressed','true');
        onChange(chip.dataset.value);
      });
    });
  }

  SR.renderPracticeHub = function (container, navigate) {
    const s = SR.store.state.settings;
    const cfg = {
      questions: s.defaultQuestions, wordSource: s.defaultWordSource,
      wordLength: s.defaultWordLength, mode: s.defaultMode,
      timer: s.defaultTimer, hintsEnabled: s.hintsEnabled,
    };

    container.innerHTML = `
      <div class="screen fade-scale-in">
        <div class="practice-hub-hero">
          <div class="icon-circle">${SR.icons.get('zap')}</div>
          <h1 class="text-h1">Practice</h1>
          <p class="text-body text-secondary" style="margin-top:8px">Hear a word. Type it. Learn.</p>
        </div>

        <button class="btn btn-primary btn-lg btn-block" id="quick-start-btn">
          ${SR.icons.get('zap')} Quick Start
        </button>
        <p class="text-caption" style="text-align:center;margin-top:8px;margin-bottom:32px">Uses your default settings</p>

        <h2 class="text-h3" style="margin-bottom:20px">Custom Session</h2>

        <div class="option-group">
          <p class="option-group-label text-micro">Questions</p>
          ${chipGroup('questions',[{value:10,label:'10'},{value:25,label:'25'},{value:50,label:'50'},{value:100,label:'100'}], cfg.questions)}
          <div style="margin-top:10px;display:flex;align-items:center;gap:8px">
            <label for="custom-q" class="text-caption">Custom:</label>
            <input id="custom-q" class="input" type="number" min="1" max="500" placeholder="e.g. 75"
              style="width:100px;height:40px;border-radius:8px;text-align:center">
          </div>
        </div>

        <div class="option-group">
          <p class="option-group-label text-micro">Word Source</p>
          ${chipGroup('wordSource',[{value:'mixed',label:'Mixed'},{value:'new',label:'New Words'},{value:'wrong',label:'Wrong Words'},{value:'right',label:'Right Words'}], cfg.wordSource)}
        </div>

        <div class="option-group">
          <p class="option-group-label text-micro">Word Length</p>
          ${chipGroup('wordLength',[{value:'all',label:'All'},{value:'1-4',label:'1–4'},{value:'5-7',label:'5–7'},{value:'8-10',label:'8–10'},{value:'11+',label:'11+'}], cfg.wordLength)}
        </div>

        <div class="option-group">
          <p class="option-group-label text-micro">Mode</p>
          ${chipGroup('mode',[{value:'free',label:'Free'},{value:'timed',label:'Timed'}], cfg.mode)}
          <div id="timer-opt" style="margin-top:12px;${cfg.mode !== 'timed' ? 'display:none' : ''}">
            <p class="text-caption text-secondary" style="margin-bottom:6px">Seconds per word</p>
            ${chipGroup('timer',[{value:5,label:'5s'},{value:10,label:'10s'},{value:15,label:'15s'},{value:30,label:'30s'},{value:60,label:'60s'}], cfg.timer)}
          </div>
        </div>

        <div class="option-group">
          <p class="option-group-label text-micro">Hints</p>
          ${chipGroup('hints',[{value:'on',label:'On'},{value:'off',label:'Off'}], cfg.hintsEnabled ? 'on' : 'off')}
        </div>

        <button class="btn btn-primary btn-lg btn-block" id="custom-start-btn" style="margin-top:8px">
          ${SR.icons.get('arrow-right')} Start Custom Session
        </button>
        <div style="height:24px"></div>
      </div>`;

    wireChips(container,'questions', function(v){ cfg.questions = parseInt(v,10); });
    wireChips(container,'wordSource', function(v){ cfg.wordSource = v; });
    wireChips(container,'wordLength', function(v){ cfg.wordLength = v; });
    wireChips(container,'mode', function(v){
      cfg.mode = v;
      document.getElementById('timer-opt').style.display = v === 'timed' ? '' : 'none';
    });
    wireChips(container,'timer', function(v){ cfg.timer = parseInt(v,10); });
    wireChips(container,'hints', function(v){ cfg.hintsEnabled = v === 'on'; });

    document.getElementById('custom-q').addEventListener('input', function(e){
      const v = parseInt(e.target.value,10);
      if (v > 0) { cfg.questions = v; container.querySelectorAll('.chip[data-name="questions"]').forEach(function(c){ c.setAttribute('aria-pressed','false'); }); }
    });

    document.getElementById('quick-start-btn').addEventListener('click', function(){
      const d = SR.store.state.settings;
      navigate('practice-session',{questions:d.defaultQuestions,wordSource:d.defaultWordSource,wordLength:d.defaultWordLength,mode:d.defaultMode,timer:d.defaultTimer,hintsEnabled:d.hintsEnabled});
    });

    document.getElementById('custom-start-btn').addEventListener('click', function(){
      if (!cfg.questions || cfg.questions < 1) { SR.showToast('Set a valid number of questions','error'); return; }
      navigate('practice-session', Object.assign({}, cfg));
    });
  };
})();
