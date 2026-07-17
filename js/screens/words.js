/* words.js */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  let _activeTab = 'wrong';

  SR.renderWords = function (container, navigate) {
    const { wordLists } = SR.store.state;

    function filter(list, q) {
      return q ? list.filter((w) => w.toLowerCase().includes(q.toLowerCase())) : list;
    }

    function buildList(words) {
      if (!words.length) {
        return `<div class="empty-state">
          ${SR.icons.get('book-open')}
          <p class="text-body-sm">No words here yet</p>
          <p class="text-caption">Words appear after you practise</p>
        </div>`;
      }
      return `<div class="list" role="list">
        ${words.map((word) => `
          <button class="list-row list-row-tappable word-row" data-word="${word}"
            role="listitem" aria-label="${SR.helpers.capitalise(word)}">
            <span class="word-row-text">${SR.helpers.capitalise(word)}</span>
            ${SR.icons.get('chevron-right')}
          </button>`).join('')}
      </div>`;
    }

    function render(q) {
      q = q || '';
      const right = filter([...wordLists.right].sort(), q);
      const wrong = filter([...wordLists.wrong].sort(), q);
      const list  = _activeTab === 'right' ? right : wrong;

      container.innerHTML = `
        <div class="screen fade-scale-in">
          <h1 class="text-h1" style="margin-bottom:20px">Words</h1>

          <div class="input-search-wrap" style="margin-bottom:16px">
            ${SR.icons.get('search')}
            <input id="words-search" class="input input-search" type="search"
              placeholder="Search words…" value="${q.replace(/"/g, '&quot;')}"
              aria-label="Search words" autocomplete="off">
          </div>

          <div style="margin-bottom:16px">
            <div class="segmented" role="tablist" aria-label="Word lists">
              <button class="segmented-item" role="tab"
                data-tab="wrong"
                aria-selected="${_activeTab === 'wrong'}"
                aria-pressed="${String(_activeTab === 'wrong')}">
                Wrong
                <span class="badge badge-wrong" style="margin-left:4px">
                  ${wordLists.wrong.length}
                </span>
              </button>
              <button class="segmented-item" role="tab"
                data-tab="right"
                aria-selected="${_activeTab === 'right'}"
                aria-pressed="${String(_activeTab === 'right')}">
                Right
                <span class="badge badge-right" style="margin-left:4px">
                  ${wordLists.right.length}
                </span>
              </button>
            </div>
          </div>

          <div id="words-list">${buildList(list)}</div>
        </div>`;

      // Search
      const searchInput = document.getElementById('words-search');
      searchInput.addEventListener('input', (e) => render(e.target.value));
      if (q) {
        searchInput.focus();
        searchInput.setSelectionRange(q.length, q.length);
      }

      // Tab switching
      container.querySelectorAll('[data-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
          _activeTab = btn.dataset.tab;
          render(document.getElementById('words-search')?.value || '');
        });
      });

      // Word tap → detail modal
      container.querySelectorAll('.word-row').forEach((row) => {
        row.addEventListener('click', () => openDetail(row.dataset.word, navigate));
      });
    }

    render();
  };

  function openDetail(word, navigate) {
    if (!word) return;
    SR.SpeechService.setRate(SR.store.state.settings.playbackSpeed);
    const isWrong = SR.store.state.wordLists.wrong.includes(word);

    SR.Modal.open({
      label: word + ' detail',
      content: `
        <div class="word-detail-word">
          <p class="text-display" style="text-align:center">
            ${SR.helpers.capitalise(word)}
          </p>
          <p class="text-caption" style="text-align:center;margin-top:8px">
            ${word.length} letter${word.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style="display:flex;justify-content:center;margin-bottom:24px">
          ${isWrong
            ? `<span class="badge badge-wrong">${SR.icons.get('x')} In wrong list</span>`
            : `<span class="badge badge-right">${SR.icons.get('check')} In right list</span>`}
        </div>
        <div class="word-detail-actions">
          <button class="btn btn-secondary btn-block" id="wd-replay">
            ${SR.icons.get('volume-2')} Replay pronunciation
          </button>
          <button class="btn btn-primary btn-block" id="wd-practice">
            ${SR.icons.get('zap')} Practice this word
          </button>
        </div>`,
      // Cancel speech when modal closes (user dismisses without pressing anything)
      onClose: () => SR.SpeechService.cancel(),
    });

    // Auto-play on open
    setTimeout(() => SR.SpeechService.speak(word), 250);

    document.getElementById('wd-replay').addEventListener('click', () => {
      SR.SpeechService.cancel();
      setTimeout(() => SR.SpeechService.speak(word), 50);
    });

    document.getElementById('wd-practice').addEventListener('click', () => {
      SR.SpeechService.cancel();
      SR.Modal.close();
      navigate('practice-session', {
        questions:    5,
        wordOverride: Array(5).fill(word),
        wordSource:   'mixed', wordLength: 'all',
        mode:         SR.store.state.settings.defaultMode,
        timer:        SR.store.state.settings.defaultTimer,
        hintsEnabled: SR.store.state.settings.hintsEnabled,
      });
    });
  }
})();
