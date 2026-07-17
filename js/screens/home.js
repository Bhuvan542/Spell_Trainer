/* home.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  function progressRing(progress) {
    const r = 30, cx = 38, cy = 38, circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.min(1, Math.max(0, progress)));
    const pct = Math.round(progress * 100);
    return `<div class="progress-ring" aria-label="${pct}% of daily goal">
      <svg viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg">
        <circle class="ring-track" cx="${cx}" cy="${cy}" r="${r}"/>
        <circle class="ring-fill" cx="${cx}" cy="${cy}" r="${r}"
          stroke-dasharray="${circ.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
      </svg>
      <div class="progress-ring-label text-caption">${pct}%</div>
    </div>`;
  }

  SR.renderHome = function (container, navigate) {
    const { stats, settings, wordLists } = SR.store.state;
    const todayCount   = SR.store.getTodayCount();
    const goalProgress = todayCount / Math.max(1, settings.dailyGoal);
    const accuracy     = SR.store.getOverallAccuracy();

    container.innerHTML = `
      <div class="screen fade-scale-in">
        <header class="home-header">
          <div class="home-greeting-row">
            <div>
              <h1 class="text-h1">${SR.helpers.greeting()}</h1>
              <p class="home-date text-caption">${SR.helpers.todayLabel()}</p>
            </div>
            ${SR.icons.get('book-marked')}
          </div>
        </header>

        <div class="card home-goal-card">
          ${progressRing(goalProgress)}
          <div class="home-goal-info">
            <p class="text-micro">Daily Goal</p>
            <p class="text-h3">${todayCount} / ${settings.dailyGoal} words</p>
            <div class="progress-bar-track" style="margin-top:8px">
              <div class="progress-bar-fill" style="width:${Math.min(100, Math.round(goalProgress * 100))}%"></div>
            </div>
          </div>
        </div>

        <div class="home-stats-row">
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('flame')}</div>
            <p class="home-stat-value">${stats.streakCurrent}</p>
            <p class="text-caption">Day streak</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('trending-up')}</div>
            <p class="home-stat-value">${accuracy}%</p>
            <p class="text-caption">Accuracy</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon" style="background:var(--success-bg);color:var(--success)">${SR.icons.get('check')}</div>
            <p class="home-stat-value">${wordLists.right.length}</p>
            <p class="text-caption">Learned</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon" style="background:var(--danger-bg);color:var(--danger)">${SR.icons.get('x')}</div>
            <p class="home-stat-value">${wordLists.wrong.length}</p>
            <p class="text-caption">To review</p>
          </div>
        </div>

        <button class="btn btn-primary btn-lg btn-block home-start-btn" id="home-start-btn">
          ${SR.icons.get('zap')} Start Practice
        </button>

        <div class="home-shortcuts">
          <button class="card card-tappable shortcut-card" data-nav="practice">
            <div class="shortcut-card-icon">${SR.icons.get('settings')}</div>
            <p class="text-h3">Custom Session</p>
            <p class="text-caption">Tune your practice</p>
          </button>
          <button class="card card-tappable shortcut-card" data-nav="words">
            <div class="shortcut-card-icon">${SR.icons.get('book-open')}</div>
            <p class="text-h3">Word Lists</p>
            <p class="text-caption">${wordLists.right.length} right · ${wordLists.wrong.length} wrong</p>
          </button>
          <button class="card card-tappable shortcut-card" data-nav="statistics">
            <div class="shortcut-card-icon">${SR.icons.get('bar-chart-2')}</div>
            <p class="text-h3">Statistics</p>
            <p class="text-caption">Track your progress</p>
          </button>
          <button class="card card-tappable shortcut-card" data-nav="settings">
            <div class="shortcut-card-icon">${SR.icons.get('settings')}</div>
            <p class="text-h3">Settings</p>
            <p class="text-caption">Preferences</p>
          </button>
        </div>
      </div>`;

    document.getElementById('home-start-btn').addEventListener('click', function () {
      const s = SR.store.state.settings;
      navigate('practice-session', {
        questions: s.defaultQuestions, wordSource: s.defaultWordSource,
        wordLength: s.defaultWordLength, mode: s.defaultMode,
        timer: s.defaultTimer, hintsEnabled: s.hintsEnabled,
      });
    });
    container.querySelectorAll('[data-nav]').forEach(function (btn) {
      btn.addEventListener('click', function () { navigate(btn.dataset.nav); });
    });
  };
})();
