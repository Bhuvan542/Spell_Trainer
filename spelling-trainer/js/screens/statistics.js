/* statistics.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  SR.renderStatistics = function (container) {
    const { stats, wordLists, settings } = SR.store.state;
    const accuracy = SR.store.getOverallAccuracy();
    const today    = SR.store.getTodayCount();
    const sessions = stats.sessions;
    const last14s  = sessions.slice(-14);
    const accVals  = last14s.map(function(s){ return s.accuracy; });
    const accLbls  = last14s.map(function(s){ return SR.helpers.formatDateShort(s.date); });
    const wrongVals= last14s.map(function(s){ return s.wrong; });

    const last14d  = SR.helpers.lastNDays(14);
    const dayMap   = {};
    sessions.forEach(function(s){ dayMap[s.date] = (dayMap[s.date]||0) + s.questions; });
    const barData  = last14d.map(function(d){ return { label: d.slice(8), value: dayMap[d]||0 }; });

    const logEntries = sessions.slice().reverse();

    container.innerHTML = `
      <div class="screen screen--wide fade-scale-in">
        <h1 class="text-h1" style="margin-bottom:24px">Statistics</h1>

        <div class="stats-grid">
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('list')}</div>
            <p class="home-stat-value">${stats.totalQuestions}</p>
            <p class="text-caption">Total questions</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon" style="background:var(--success-bg);color:var(--success)">${SR.icons.get('check')}</div>
            <p class="home-stat-value" style="color:var(--success)">${stats.totalCorrect}</p>
            <p class="text-caption">Correct</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon" style="background:var(--danger-bg);color:var(--danger)">${SR.icons.get('x')}</div>
            <p class="home-stat-value" style="color:var(--danger)">${stats.totalWrong}</p>
            <p class="text-caption">Wrong</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('trending-up')}</div>
            <p class="home-stat-value">${accuracy}%</p>
            <p class="text-caption">Accuracy</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('flame')}</div>
            <p class="home-stat-value">${stats.streakCurrent}</p>
            <p class="text-caption">Current streak</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('target')}</div>
            <p class="home-stat-value">${stats.streakLongest}</p>
            <p class="text-caption">Longest streak</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('target')}</div>
            <p class="home-stat-value">${today}&nbsp;/&nbsp;${settings.dailyGoal}</p>
            <p class="text-caption">Today's goal</p>
          </div>
          <div class="card home-stat-card">
            <div class="home-stat-icon">${SR.icons.get('book-open')}</div>
            <p class="home-stat-value">${wordLists.right.length}&nbsp;/&nbsp;${wordLists.wrong.length}</p>
            <p class="text-caption">Right / Wrong</p>
          </div>
        </div>

        <div class="card chart-card">
          <div class="chart-card-header"><h2 class="text-h3">Accuracy over time</h2>
            <p class="text-caption">Last ${Math.min(14, last14s.length)} sessions</p></div>
          <div id="chart-acc"></div>
        </div>
        <div class="card chart-card">
          <div class="chart-card-header"><h2 class="text-h3">Words per day</h2>
            <p class="text-caption">Last 14 days</p></div>
          <div id="chart-day"></div>
        </div>
        <div class="card chart-card">
          <div class="chart-card-header"><h2 class="text-h3">Wrong answers per session</h2>
            <p class="text-caption">Last ${Math.min(14, last14s.length)} sessions</p></div>
          <div id="chart-wrg"></div>
        </div>

        <div style="margin-top:40px;margin-bottom:12px">
          <h2 class="text-h2">Practice Log</h2>
          <p class="text-caption" style="margin-top:4px">${logEntries.length} session${logEntries.length !== 1 ? 's' : ''} completed</p>
        </div>

        ${logEntries.length === 0
          ? `<div class="empty-state">${SR.icons.get('list')}
               <p class="text-body-sm">No sessions yet</p>
               <p class="text-caption">Completed sessions appear here</p></div>`
          : `<div class="list">${logEntries.map(function(e){
              const c = e.accuracy >= 80 ? 'var(--success)' : e.accuracy >= 50 ? 'var(--accent)' : 'var(--danger)';
              return `<div class="list-row" style="flex-direction:column;align-items:flex-start;gap:4px;padding:16px 20px">
                <div style="display:flex;justify-content:space-between;align-items:center;width:100%">
                  <span class="text-body-sm" style="font-weight:600">${SR.helpers.formatDate(e.date)}</span>
                  <span class="text-h3" style="color:${c}">${e.accuracy}%</span>
                </div>
                <div style="display:flex;align-items:center;gap:16px;margin-top:2px">
                  <span class="text-caption" style="color:var(--text-secondary)">${e.questions} question${e.questions!==1?'s':''}</span>
                  <span class="text-caption" style="color:var(--success)">${e.correct}&nbsp;✓</span>
                  <span class="text-caption" style="color:var(--danger)">${e.wrong}&nbsp;✕</span>
                </div>
              </div>`;
            }).join('')}</div>`}

        <div style="height:24px"></div>
      </div>`;

    requestAnimationFrame(function(){
      SR.Charts.line(document.getElementById('chart-acc'), accVals,  { labels: accLbls, maxY: 100 });
      SR.Charts.bar( document.getElementById('chart-day'), barData);
      SR.Charts.line(document.getElementById('chart-wrg'), wrongVals, { labels: accLbls });
    });
  };
})();
