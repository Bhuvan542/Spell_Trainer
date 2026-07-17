/* app.js — bootstrap and router */
(function () {
  'use strict';
  const SR = window.SpellRight = window.SpellRight || {};

  const NAV_SCREENS = { home:1, practice:1, words:1, statistics:1, settings:1 };
  let _activeSession   = null;
  let _screenContainer = null;

  function navigate(screenId, params) {
    params = params || {};

    if (_activeSession) { _activeSession.destroy(); _activeSession = null; }
    if (SR.Modal && SR.Modal.isOpen) SR.Modal.close();

    const shell = document.getElementById('app');
    if (!shell || !_screenContainer) return;

    if (screenId === 'practice-session') shell.classList.add('practice-active');
    else shell.classList.remove('practice-active');

    if (NAV_SCREENS[screenId]) SR.Navigation.setActive(screenId);
    _screenContainer.scrollTop = 0;

    switch (screenId) {
      case 'home':       SR.renderHome(_screenContainer, navigate);        break;
      case 'practice':   SR.renderPracticeHub(_screenContainer, navigate); break;
      case 'words':      SR.renderWords(_screenContainer, navigate);       break;
      case 'statistics': SR.renderStatistics(_screenContainer);            break;
      case 'settings':   SR.renderSettings(_screenContainer, navigate);   break;
      case 'practice-session': {
        const session = new SR.PracticeSession(params, navigate, _screenContainer);
        _activeSession = session;
        session.mount();
        break;
      }
      default: SR.renderHome(_screenContainer, navigate);
    }
  }

  function init() {
    // 1. Load persisted state
    try { SR.store.init(); } catch (e) { console.warn('Store init error:', e); }

    // 2. Apply persisted theme + accent before first paint
    try { SR.applyTheme(SR.store.state.settings.theme); } catch (_) {}
    try { document.documentElement.dataset.accent = SR.store.state.settings.accent; } catch (_) {}

    // 3. System colour-scheme listener
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
      if (SR.store.state.settings.theme === 'system') SR.applyTheme('system');
    });

    // 4. Initialise speech service, then restore saved voice preference
    if (SR.SpeechService) {
      SR.SpeechService.init().then(function () {
        var savedVoice = SR.store.state.settings.selectedVoiceName;
        if (savedVoice) SR.SpeechService.setVoiceByName(savedVoice);
      }).catch(function () {});
    }

    // 5. Wire navigation
    _screenContainer = document.getElementById('screen-container');
    SR.Navigation.init(navigate);

    // 6. Show home
    navigate('home');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
