/* practice-session.js — core spelling loop with custom keyboard */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  SR.PracticeSession = class PracticeSession {
    constructor(config, navigate, container) {
      this.cfg       = config;
      this.navigate  = navigate;
      this.container = container;
      this.queue     = [];
      this.index     = 0;
      this.correct   = [];
      this.wrong     = [];
      this._locked          = false;
      this._destroyed       = false;
      this._timerInterval   = null;
      this._timerRemaining  = 0;
      this._autoNextTimeout = null;
      this._keyboard        = null;   // SpellKeyboard instance
    }

    /* ── Mount ───────────────────────────────────────────────────────────── */

    async mount() {
      if (this.cfg.wordOverride) {
        this.queue = this.cfg.wordOverride.slice();
      } else {
        const _qResult = SR.store.buildWordQueue(
          this.cfg.wordSource, this.cfg.wordLength, this.cfg.questions
        );
        this.queue = _qResult.words;
        if (_qResult.truncated) {
          const n = _qResult.words.length;
          SR.showToast(
            'Only ' + n + ' ' + (n === 1 ? 'word' : 'words') + ' available. ' +
            'Session reduced to ' + n + ' ' + (n === 1 ? 'question' : 'questions') + '.',
            'info', 5000
          );
        } else if (_qResult.usedFallback) {
          SR.showToast('Using mixed words for this filter', 'info');
        }
      }

      if (!this.queue.length) {
        SR.showToast('No words available for this selection', 'error');
        this.navigate('practice');
        return;
      }

      SR.SpeechService.setRate(SR.store.state.settings.playbackSpeed);
      if (SR.store.state.settings.keepScreenAwake) SR.helpers.requestWakeLock();

      this._render();
      this._mountKeyboard();
      this._showQuestion();
    }

    /* ── Render shell ─────────────────────────────────────────────────────── */

    _render() {
      this.container.innerHTML = `
        <div class="practice-session" id="ps-root">

          <div class="practice-top-bar">
            <button class="btn-icon" id="ps-quit" aria-label="Quit session">
              ${SR.icons.get('x')}
            </button>
            <span class="practice-progress-text text-caption" id="ps-progress"
              aria-live="polite" aria-atomic="true">1 / ${this.queue.length}</span>
            <span class="practice-timer text-body" id="ps-timer"
              aria-live="polite" aria-label="Time remaining"
              ${this.cfg.mode !== 'timed' ? 'style="visibility:hidden"' : ''}
            >${this.cfg.timer}</span>
          </div>

          <div class="practice-progress-track" role="progressbar"
            aria-valuemin="0" aria-valuemax="${this.queue.length}" aria-valuenow="0">
            <div class="practice-progress-fill" id="ps-fill" style="width:0%"></div>
          </div>

          <div class="practice-stage" id="ps-stage" aria-live="polite"></div>

          <div class="practice-input-area">
            <div class="practice-input-row">
              <input
                id="ps-input"
                class="practice-input"
                type="text"
                inputmode="none"
                enterkeyhint="send"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="none"
                spellcheck="false"
                placeholder="Type the word…"
                aria-label="Type the word you heard"
                readonly
              >
              <button class="practice-submit-btn" id="ps-submit"
                aria-label="Submit answer" disabled>
                ${SR.icons.get('arrow-right')}
              </button>
            </div>
          </div>

          <!-- Custom keyboard mounts here -->
          <div id="ps-keyboard-mount" class="practice-keyboard-wrap"></div>

        </div>`;

      this._wireInputEvents();
      document.getElementById('ps-quit')
        .addEventListener('click', () => this._quit());
    }

    /* ── Mount keyboard ───────────────────────────────────────────────────── */

    _mountKeyboard() {
      const mount = document.getElementById('ps-keyboard-mount');
      if (!mount) return;

      this._keyboard = new SR.SpellKeyboard({
        onKey:       (letter) => this._typeChar(letter),
        onBackspace: ()       => this._deleteChar(),
      });
      mount.appendChild(this._keyboard.render());
    }

    /* ── Wire input events ────────────────────────────────────────────────── */

    _wireInputEvents() {
      const input  = document.getElementById('ps-input');
      const submit = document.getElementById('ps-submit');
      if (!input || !submit) return;

      /* Enable / disable submit based on value */
      input.addEventListener('input', () => {
        submit.disabled = !input.value.trim().length;
      });

      /* Enter key on physical / desktop keyboard */
      input.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === 'Go') && !this._locked) {
          e.preventDefault();
          this._handleSubmit();
        }
      });

      submit.addEventListener('click', () => {
        if (!this._locked) this._handleSubmit();
      });
    }

    /* ── Custom keyboard handlers ─────────────────────────────────────────── */

    /** Insert one lowercase letter from the custom keyboard. */
    _typeChar(letter) {
      if (this._locked || this._destroyed) return;
      const input = document.getElementById('ps-input');
      if (!input) return;

      /* Temporarily lift readonly so we can set the value */
      input.removeAttribute('readonly');
      input.value += letter;
      input.setAttribute('readonly', '');

      /* Notify the existing input listener so submit button updates */
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /** Remove the last character from the custom keyboard. */
    _deleteChar() {
      if (this._locked || this._destroyed) return;
      const input = document.getElementById('ps-input');
      if (!input || !input.value.length) return;

      input.removeAttribute('readonly');
      input.value = input.value.slice(0, -1);
      input.setAttribute('readonly', '');

      input.dispatchEvent(new Event('input', { bubbles: true }));
    }

    /* ── Question flow ────────────────────────────────────────────────────── */

    _showQuestion() {
      if (this._destroyed) return;
      this._locked = false;

      const word   = this.queue[this.index];
      const total  = this.queue.length;
      const input  = document.getElementById('ps-input');
      const submit = document.getElementById('ps-submit');
      const prog   = document.getElementById('ps-progress');
      const fill   = document.getElementById('ps-fill');
      const track  = document.querySelector('.practice-progress-track');

      if (prog)  prog.textContent = (this.index + 1) + ' / ' + total;
      if (fill)  fill.style.width = ((this.index / total) * 100) + '%';
      if (track) track.setAttribute('aria-valuenow', this.index);

      if (input) {
        input.removeAttribute('readonly');
        input.value     = '';
        input.className = 'practice-input';
        input.setAttribute('readonly', '');
      }
      if (submit) submit.disabled = true;

      const hintHtml = this.cfg.hintsEnabled
        ? `<button class="hint-button" id="ps-hint" aria-label="Show first letter">
             ${SR.icons.get('eye')} Show first letter
           </button>
           <div class="hint-reveal" id="ps-hint-reveal" aria-live="polite" hidden></div>`
        : '';

      const stage = document.getElementById('ps-stage');
      if (!stage) return;
      stage.innerHTML = `
        <button class="speaker-button" id="ps-speaker"
          aria-label="Play word pronunciation">
          ${SR.icons.get('volume-2')}
        </button>
        ${hintHtml}`;

      document.getElementById('ps-speaker')
        .addEventListener('click', () => this._playWord(word));

      if (this.cfg.hintsEnabled) {
        let hintUsed = false;
        document.getElementById('ps-hint').addEventListener('click', () => {
          if (hintUsed) return;
          hintUsed = true;
          const btn = document.getElementById('ps-hint');
          const rev = document.getElementById('ps-hint-reveal');
          if (rev) { rev.hidden = false; rev.textContent = SR.helpers.hintDisplay(word); }
          if (btn) { btn.style.opacity = '0.4'; btn.disabled = true; }
          /* Pre-fill first letter via the same path as the custom keyboard */
          if (input && !input.value) {
            this._typeChar(word[0]);
            if (submit) submit.disabled = false;
          }
        });
      }

      setTimeout(() => { if (!this._destroyed) this._playWord(word); }, 300);
      if (this.cfg.mode === 'timed') this._startTimer();
    }

    async _playWord(word) {
      if (this._destroyed) return;
      const btn = document.getElementById('ps-speaker');
      if (btn) btn.classList.add('is-playing');
      await SR.SpeechService.speak(word);
      if (this._destroyed) return;
      const btn2 = document.getElementById('ps-speaker');
      if (btn2) btn2.classList.remove('is-playing');
    }

    /* ── Answer handling ──────────────────────────────────────────────────── */

    _handleSubmit() {
      if (this._locked || this._destroyed) return;
      const input    = document.getElementById('ps-input');
      const typed    = input ? input.value.trim() : '';
      const expected = this.queue[this.index];
      if (!typed || !expected) return;

      this._locked = true;
      this._stopTimer();
      SR.SpeechService.cancel();

      const isCorrect = typed.toLowerCase() === expected.toLowerCase();

      if (isCorrect) { SR.store.markCorrect(expected); this.correct.push(expected); }
      else           { SR.store.markWrong(expected);   this.wrong.push(expected);   }

      if (SR.store.state.settings.soundEffects) {
        isCorrect ? SR.helpers.playCorrectTone() : SR.helpers.playWrongTone();
      }

      if (input) {
        input.removeAttribute('readonly');
        input.disabled  = true;
        input.className = 'practice-input ' + (isCorrect ? 'is-correct' : 'is-wrong');
        input.setAttribute('readonly', '');
      }

      this._showFeedback(isCorrect, expected);
    }

    _showFeedback(isCorrect, word) {
      const stage = document.getElementById('ps-stage');
      if (!stage) return;

      if (isCorrect) {
        stage.innerHTML = `
          <div class="practice-feedback">
            <div class="practice-feedback-icon is-correct" aria-label="Correct">
              ${SR.icons.get('check')}
            </div>
          </div>`;
      } else {
        stage.innerHTML = `
          <div class="practice-feedback">
            <div class="practice-feedback-icon is-wrong" aria-label="Wrong">
              ${SR.icons.get('x')}
            </div>
            <div class="practice-feedback-word" aria-live="assertive">
              ${SR.helpers.capitalise(word)}
            </div>
          </div>`;
      }

      if (SR.store.state.settings.autoNext) {
        const delay = isCorrect ? 600 : 1100;
        this._autoNextTimeout = setTimeout(() => this._advance(), delay);
      } else {
        const btn = document.createElement('button');
        btn.className   = 'btn btn-secondary';
        btn.style.marginTop = '24px';
        btn.innerHTML   = 'Next ' + SR.icons.get('arrow-right');
        btn.addEventListener('click', () => this._advance());
        const fb = stage.querySelector('.practice-feedback');
        if (fb) fb.appendChild(btn);
        setTimeout(() => { if (btn && !this._destroyed) btn.focus(); }, 50);
      }
    }

    _advance() {
      if (this._destroyed) return;
      clearTimeout(this._autoNextTimeout);
      this._stopTimer();
      SR.SpeechService.cancel();
      this.index++;
      if (this.index >= this.queue.length) this._finish();
      else this._showQuestion();
    }

    /* ── Timer ────────────────────────────────────────────────────────────── */

    _startTimer() {
      this._stopTimer();
      this._timerRemaining = this.cfg.timer;
      this._updateTimerDisplay();

      this._timerInterval = setInterval(() => {
        if (this._destroyed || this._locked) { this._stopTimer(); return; }
        this._timerRemaining--;
        this._updateTimerDisplay();

        if (this._timerRemaining <= 0) {
          this._stopTimer();
          if (this._locked) return;
          const input = document.getElementById('ps-input');
          const typed = input ? input.value.trim() : '';
          if (typed) {
            this._handleSubmit();
          } else {
            this._locked = true;
            const word = this.queue[this.index];
            SR.store.markWrong(word);
            this.wrong.push(word);
            if (input) {
              input.removeAttribute('readonly');
              input.disabled  = true;
              input.className = 'practice-input is-wrong';
              input.setAttribute('readonly', '');
            }
            this._showFeedback(false, word);
          }
        }
      }, 1000);
    }

    _stopTimer() {
      if (this._timerInterval) {
        clearInterval(this._timerInterval);
        this._timerInterval = null;
      }
    }

    _updateTimerDisplay() {
      const el = document.getElementById('ps-timer');
      if (!el) return;
      el.textContent = this._timerRemaining;
      el.classList.toggle('is-urgent', this._timerRemaining <= 5);
    }

    /* ── Finish / Results ─────────────────────────────────────────────────── */

    _finish() {
      this._stopTimer();
      SR.helpers.releaseWakeLock();

      const questions = this.queue.length;
      const correct   = this.correct.length;
      const wrong     = this.wrong.length;
      const accuracy  = questions > 0 ? Math.round((correct / questions) * 100) : 0;

      SR.store.saveSession({ questions, correct, wrong });
      this._showResults({ questions, correct, wrong, accuracy });
    }

    _showResults({ questions, correct, wrong, accuracy }) {
      const color       = accuracy >= 80 ? 'var(--success)' : accuracy >= 50 ? 'var(--accent)' : 'var(--danger)';
      const uniqueWrong = [...new Set(this.wrong)];

      /* Results replaces the whole container — keyboard naturally unmounts */
      this.container.innerHTML = `
        <div class="screen fade-scale-in">
          <div class="results-hero">
            <div class="results-accuracy" style="color:${color}">${accuracy}%</div>
            <p class="text-body text-secondary" style="margin-top:8px">Accuracy</p>
          </div>

          <div class="results-grid">
            <div class="card"><div class="value">${questions}</div><p class="text-caption">Questions</p></div>
            <div class="card" style="border-color:var(--success-bg)">
              <div class="value" style="color:var(--success)">${correct}</div>
              <p class="text-caption">Correct</p>
            </div>
            <div class="card" style="border-color:var(--danger-bg)">
              <div class="value" style="color:var(--danger)">${wrong}</div>
              <p class="text-caption">Wrong</p>
            </div>
          </div>

          ${wrong > 0
            ? `<div style="margin-bottom:24px">
                 <p class="text-micro" style="margin-bottom:12px">Words to review</p>
                 <div class="list">
                   ${uniqueWrong.map((w) =>
                     `<div class="list-row">
                        <span class="text-body" style="font-weight:500">${SR.helpers.capitalise(w)}</span>
                        <span class="badge badge-wrong">${SR.icons.get('x')} Wrong</span>
                      </div>`
                   ).join('')}
                 </div>
               </div>`
            : `<div class="card" style="text-align:center;margin-bottom:24px;padding:32px">
                 ${SR.icons.get('check-circle')}
                 <p class="text-body" style="margin-top:12px;font-weight:600">Perfect round!</p>
               </div>`}

          <div class="stack">
            ${uniqueWrong.length > 0
              ? `<button class="btn btn-primary btn-lg btn-block" id="res-wrong">
                   ${SR.icons.get('rotate-ccw')} Practice Wrong Words Again
                 </button>` : ''}
            <button class="btn btn-secondary btn-lg btn-block" id="res-new">
              ${SR.icons.get('zap')} New Session
            </button>
            <button class="btn btn-ghost btn-block" id="res-home">
              ${SR.icons.get('home')} Back to Home
            </button>
          </div>
        </div>`;

      document.getElementById('res-home').addEventListener('click', () => this.navigate('home'));
      document.getElementById('res-new').addEventListener('click',  () => this.navigate('practice'));

      const wrongBtn = document.getElementById('res-wrong');
      if (wrongBtn) {
        wrongBtn.addEventListener('click', () => {
          const doubled = [...uniqueWrong, ...uniqueWrong];
          SR.helpers.shuffle(doubled);
          this.navigate('practice-session', {
            questions:    doubled.length,
            wordOverride: doubled,
            wordSource:   'wrong', wordLength: 'all',
            mode:         this.cfg.mode,
            timer:        this.cfg.timer,
            hintsEnabled: this.cfg.hintsEnabled,
          });
        });
      }
    }

    /* ── Quit ─────────────────────────────────────────────────────────────── */

    _quit() {
      SR.Modal.open({
        label: 'Quit confirmation',
        content: `
          <div style="text-align:center;padding:8px 0 24px">
            <p class="text-h3">Quit practice?</p>
            <p class="text-body text-secondary" style="margin-top:8px">
              Session progress will not be saved.
            </p>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <button class="btn btn-block" id="q-yes"
              style="background:var(--danger);color:#fff;height:48px;border-radius:999px;font-size:17px;font-weight:600">
              Yes, quit
            </button>
            <button class="btn btn-secondary btn-block" id="q-no">Keep going</button>
          </div>`,
      });

      document.getElementById('q-yes').addEventListener('click', () => {
        SR.Modal.close();
        this.destroy();
        this.navigate('home');
      });
      document.getElementById('q-no').addEventListener('click', () => SR.Modal.close());
    }

    /* ── Destroy ──────────────────────────────────────────────────────────── */

    destroy() {
      this._destroyed = true;
      this._stopTimer();
      clearTimeout(this._autoNextTimeout);
      SR.SpeechService.cancel();
      SR.helpers.releaseWakeLock();
      if (this._keyboard) {
        this._keyboard.destroy();
        this._keyboard = null;
      }
    }
  };
})();
