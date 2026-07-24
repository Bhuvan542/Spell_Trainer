# SpellRight

A minimal, distraction-free spelling trainer.
**Hear → Type → Learn → Repeat.**

---

## How to Run

The app uses plain `<script>` tags — no bundler, no build step, no dependencies.

**Python** (recommended — pre-installed on most systems):
```bash
cd spelling-trainer
python3 -m http.server 8080
```
Open **http://localhost:8080** in your browser.

**Node.js:**
```bash
cd spelling-trainer
npx serve .
```

**VS Code:** Install the *Live Server* extension → right-click `index.html` → *Open with Live Server*.

> **Important:** Do not open `index.html` directly via `file://`. Always use a local server.

---

## Folder Structure

```
spelling-trainer/
├── index.html
├── README.md
├── vercel.json
├── css/
│   ├── variables.css     Design tokens (spacing, type scale, motion)
│   ├── themes.css        Light / dark themes + 8 accent palettes
│   ├── reset.css         Modern CSS reset
│   ├── base.css          Global body styles and typography
│   ├── components.css    Shared UI atoms
│   ├── animations.css    Keyframe animations
│   ├── screens.css       Screen-specific visual styles
│   ├── keyboard.css      Custom QWERTY keyboard styles
│   ├── responsive.css    All layout, sizing, and breakpoints
│   └── layout.css        (empty — retained for cache compatibility)
└── js/
    ├── app.js                    Router and bootstrap
    ├── data/
    │   └── word-list.js          235 curated commonly misspelled words
    ├── utils/
    │   └── helpers.js            Date, text, audio tones, haptics, wake-lock
    ├── services/
    │   ├── storage.js            LocalStorage abstraction + import/export
    │   └── speech.js             Web Speech API wrapper with voice selection
    ├── state/
    │   └── store.js              Single source of truth with full validation
    └── components/
    │   ├── icons.js              Lucide SVG icons (inline)
    │   ├── toast.js              Toast notifications
    │   ├── modal.js              Accessible modal with focus trap
    │   ├── navigation.js         Bottom bar + desktop sidebar rail
    │   ├── charts.js             Pure SVG chart renderers
    │   └── keyboard.js           Reusable QWERTY keyboard component
    └── screens/
        ├── home.js               Home screen
        ├── practice-hub.js       Practice setup
        ├── practice-session.js   Active session + results
        ├── words.js              Word lists (Right / Wrong)
        ├── statistics.js         Charts and practice log
        └── settings.js           All user preferences
```

---

## Features

**Practice**
- Custom in-app QWERTY keyboard (can be switched off in Settings)
- Free mode and Timed mode
- Hints (reveals first letter on request)
- Auto-advance after each answer
- Word source filtering: Mixed, New, Wrong, Right
- Word length filtering: All, 1–4, 5–7, 8–10, 11+ letters

**Words**
- Searchable Right and Wrong word lists
- Tap any word to hear it and practise it in isolation

**Statistics**
- Accuracy, streak, and daily goal tracking
- Accuracy over time chart
- Words per day chart
- Practice log (full session history)

**Settings**
- Light / Dark / System theme
- 8 accent colour options
- Voice selection from all available English voices
- Voice preview with Test Voice button
- Playback speed (0.75× to 1.5×)
- App Keyboard toggle (custom or native keyboard)
- Haptic feedback toggle (Android/supported browsers)
- Sound effects (audio tones on correct/wrong)
- Auto-advance toggle
- Keep screen awake
- Daily goal (custom number)
- Export, Import, and Reset data

---

## Browser Compatibility

| Browser        | Support | Notes                            |
|---------------|---------|----------------------------------|
| Chrome 90+    | Full    | Best voice selection             |
| Edge 90+      | Full    |                                  |
| Firefox 88+   | Full    | Voice list may differ            |
| Safari 15.4+  | Full    | Haptic feedback not supported    |

**Haptic feedback** requires `navigator.vibrate` — available on Android Chrome,
Samsung Internet, and Firefox for Android. Gracefully disabled on iOS Safari
and desktop browsers with no errors or warnings.

---

## Data & Privacy

- All data is stored in `localStorage` — no account, no backend, no network after first load
- Fonts load from Google Fonts on first visit; system fonts used offline
- **Export:** Settings → Export Progress → saves a JSON backup to Downloads
- **Import:** Settings → Import Progress → restores from a backup file
- **Reset:** Settings → Reset All Data → wipes everything

---

## Deploying to Vercel

The included `vercel.json` configures Vercel to serve the app correctly as a
static site. Push the folder to a GitHub repository and import it into Vercel —
no additional configuration required.
