# SpellRight

A minimal, distraction-free spelling trainer built for everyday use.

**The entire experience is one simple loop:**
Hear a word → Type it → Learn from mistakes → Repeat.

---

## How to Run

The app requires a local web server. Pick any option below.

**Python** (recommended — comes pre-installed on most computers)

```bash
cd spelling-trainer
python3 -m http.server 8080
```

Then open your browser and go to:

```
http://localhost:8080
```

**Node.js**

```bash
cd spelling-trainer
npx serve .
```

**VS Code**

Install the Live Server extension.
Right-click `index.html` → Open with Live Server.

> Do not open `index.html` directly as a file (double-clicking it).
> Always use a local server. Browsers block certain features on the file:// protocol.

---

## How to Use

### Home Screen

Shows your current streak, accuracy, daily goal progress, and word counts.

Press **Start Practice** to begin immediately using your saved default settings.

### Practice

Tap **Practice** in the navigation.

**Quick Start** — begins immediately using your defaults.

**Custom Session** — lets you change options just for that session:

| Option | Choices |
|--------|---------|
| Questions | 10, 25, 50, 100, or any custom number |
| Word Source | Mixed, New Words, Wrong Words, Right Words |
| Word Length | All, 1–4, 5–7, 8–10, 11+ letters |
| Mode | Free (no time limit) or Timed (countdown per word) |
| Hints | On shows the first letter on request |

### During Practice

1. The word plays automatically when it appears
2. Tap the speaker button at any time to hear it again
3. Type what you heard
4. Press Enter or tap the arrow to submit
5. Green ✓ = correct, moves on automatically
6. Red ✕ = wrong, shows the correct spelling briefly, then moves on
7. At the end of the session you see your results and can practice wrong words again

### Words

Browse your **Wrong** and **Right** word lists.

Use the search bar to find any word.

Tap a word to hear it pronounced and optionally do a quick 5-round practice on just that word.

### Statistics

Shows your total questions, accuracy, streaks, and daily goal.

Three charts:
- Accuracy over time (per session)
- Words practiced per day (last 14 days)
- Wrong answers per session

Below the charts: **Practice Log** — a complete history of every session you have completed, newest first.

### Settings

| Setting | What it does |
|---------|-------------|
| Theme | Light, Dark, or follow your device |
| Accent colour | 8 colour options — updates the entire UI instantly |
| Voice | Choose from all English voices available on your device |
| Test Voice | Plays a preview sentence with the selected voice and speed |
| Playback speed | 0.75×, 1×, 1.25×, 1.5× |
| Default Practice | Set your preferred defaults for Quick Start |
| Auto-advance | Toggle automatic advancement after each answer |
| Sound effects | Subtle audio tones on correct / wrong answers |
| Keep screen awake | Prevents the display from sleeping during practice |
| Daily Goal | Set how many words you want to practice each day |
| Export Progress | Downloads a backup JSON file |
| Import Progress | Restores from a backup file |
| Reset All Data | Wipes everything and starts fresh |

---

## Word Lists Explained

| List | What goes in it |
|------|----------------|
| Wrong | Every word you misspell. If you later spell it correctly, it moves to Right automatically. |
| Right | Every word you have spelled correctly at least once. |
| New Words | Words from the built-in list that you have not practiced yet. |

The built-in list contains **235 commonly misspelled English words** across all difficulty levels.

---

## Practicing Wrong Words

Go to **Practice → Custom Session → Word Source → Wrong Words**.

The session will contain each wrong word exactly once (no repetition).

If your wrong list has fewer words than the number of questions you selected, the session automatically reduces to match what is available and tells you before it starts.

To make this the default, go to **Settings → Default Practice → Word Source → Wrong Words**.
Then the Home screen **Start Practice** button always uses your wrong words.

---

## Data and Privacy

- Everything is stored in your browser's localStorage
- No account required
- No backend, no cloud, no tracking
- Works offline after the first load (fonts load from Google on first visit)
- To keep a backup: Settings → Export Progress
- To restore: Settings → Import Progress

---

## Folder Structure

```
spelling-trainer/
├── index.html
├── README.md
├── css/
│   ├── variables.css       Design tokens
│   ├── themes.css          Light / dark / accent themes
│   ├── reset.css           CSS reset
│   ├── base.css            Global styles and typography
│   ├── components.css      Shared UI atoms
│   ├── animations.css      Keyframe animations
│   ├── screens.css         Screen-specific visual styles
│   └── responsive.css      All layout and breakpoints
└── js/
    ├── app.js              Router and bootstrap
    ├── data/
    │   └── word-list.js    Built-in word list (235 words)
    ├── utils/
    │   └── helpers.js      Date, text, audio, wake-lock utilities
    ├── services/
    │   ├── storage.js      LocalStorage abstraction
    │   └── speech.js       Web Speech API wrapper
    ├── state/
    │   └── store.js        App state with validation
    └── components/
    │   ├── icons.js        Lucide icons (inline SVG)
    │   ├── toast.js        Toast notifications
    │   ├── modal.js        Accessible modal
    │   ├── navigation.js   Bottom bar + sidebar navigation
    │   └── charts.js       SVG chart renderers
    └── screens/
        ├── home.js
        ├── practice-hub.js
        ├── practice-session.js
        ├── words.js
        ├── statistics.js
        └── settings.js
```

---

## Browser Compatibility

| Browser | Support |
|---------|---------|
| Chrome 90+ | Full |
| Edge 90+ | Full |
| Firefox 88+ | Full |
| Safari 15.4+ | Full |

Voice quality depends on what is installed on your operating system. Chrome on desktop typically has the widest selection of high-quality voices. The app automatically picks the best available English voice and lets you change it in Settings.
