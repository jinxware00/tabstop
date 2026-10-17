 <div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=180&color=gradient&text=Tabstop&fontAlign=50&fontAlignY=35&fontSize=48&desc=Code%20Typing%20Trainer%20%E2%80%A2%20Speed%20%E2%80%A2%20Accuracy%20%E2%80%A2%20Precision&descAlign=50&descAlignY=60" />

<a href="https://jinxware00.github.io/tabstop/">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=2500&pause=900&center=true&vCenter=true&width=700&lines=Code.+Type.+Repeat.;10+Languages.+One+Keyboard.;Measure+Your+Typing+Speed;Track+Speed+%26+Accuracy" alt="Tabstop" />
</a>

<br/>

<a href="https://jinxware00.github.io/tabstop/">
  <img src="https://img.shields.io/badge/Play%20Tabstop-Start%20Typing-E0B258?style=for-the-badge&logo=github&logoColor=101114" alt="Play Tabstop" />
</a>
<a href="https://github.com/jinxware00/tabstop">
  <img src="https://img.shields.io/github/stars/jinxware00/tabstop?style=for-the-badge&logo=github&label=Stars" alt="GitHub stars" />
</a>
<a href="https://github.com/jinxware00/tabstop">
  <img src="https://img.shields.io/badge/Platform-Browser-E0B258?style=for-the-badge&logo=googlechrome&logoColor=101114" alt="Browser based" />
</a>

<br/>

**Improve your typing speed.**

</div>

---

## What is Tabstop?

**Tabstop** is a typing-speed trainer built for developers.

Type code snippets across 11 programming languages, race against the clock, and track your speed, accuracy, and progress, all in your browser.

Whether you're writing Lua, working with Python, or getting comfortable with Rust, Tabstop helps you build familiarity with the syntax you use every day.

## Features

| Feature | Description |
| --- | --- |
| **11 languages** | Practise programming and SQL syntax |
| **3 challenge modes** | Copy Code, Complete Snippet, and Error-Free Run |
| **Flexible timers** | Choose 30, 60, or 120 seconds |
| **3 difficulty levels** | Beginner, Intermediate, and Advanced |
| **Live statistics** | Net WPM, raw WPM, accuracy, and mistakes as you type |
| **Personal bests** | Keep track of your strongest sessions |
| **Local progress** | Save session history and preferences in your browser |
| **Focused typing surface** | A quiet, single-row code surface with a live caret |
| **Sound and appearance settings** | Customise sound, accent colour, and motion |

## Play Tabstop

Get started in seconds.

<div align="center">

<a href="https://jinxware00.github.io/tabstop/">
  <img src="https://img.shields.io/badge/1.%20Open%20Tabstop-E0B258?style=for-the-badge&logoColor=101114" alt="Open Tabstop" />
</a>

<br/><br/>

**Start typing.**

</div>

1. Open the [Tabstop web app](https://jinxware00.github.io/tabstop/).
2. Select a language and challenge mode.
3. Choose a timer and difficulty.
4. Type the displayed code as accurately as possible.
5. Review your results and try to beat your personal best.

## Supported languages

Tabstop includes eleven languages for practising a variety of syntax styles.

| Category | Languages |
| --- | --- |
| **Programming** | C, C++, C#, Go, Java, JavaScript, Lua, Python, Rust, TypeScript |
| **Query** | SQL |

## Challenge modes

### Copy Code

Reproduce the displayed code as accurately as possible. Focus on punctuation, indentation, brackets, and consistency.

### Complete Snippet

Work through incomplete code and fill in the missing parts. Test your familiarity with common programming patterns.

### Error-Free Run

Challenge yourself to type code with as few mistakes as possible. Accuracy matters just as much as speed.

## Difficulty levels

- **Beginner:** Short snippets and familiar syntax.
- **Intermediate:** Longer snippets, functions, loops, and more complex expressions.
- **Advanced:** More demanding syntax, nested logic, and challenging code patterns.

## How scoring works

Tabstop tracks your typing performance throughout each session.

- **Net WPM:** Correct characters ÷ 5 ÷ minutes elapsed.
- **Raw WPM:** All characters typed ÷ 5 ÷ minutes elapsed.
- **Accuracy:** Correct keystrokes ÷ all keystrokes.
- **Mistakes:** Incorrect keystrokes, including ones you correct.
- **Completion:** Correct characters as a share of the target.
- **Personal best:** Your highest net WPM across saved sessions.
- **Average:** Your mean performance across saved sessions.

Your results help you see how your typing develops over time.

## Progress and settings

Tabstop stores your session history and preferences in your browser using `localStorage`.

| Storage key | Purpose |
| --- | --- |
| `tabstop.sessions` | Up to 500 recent sessions |
| `tabstop.settings` | Sound, accent, and reduced-motion preferences |

A session is saved once when it ends. Choosing **Retry** starts a new session.

Additional details:

- **Personal best:** Calculated from saved sessions.
- **Average:** Calculated across saved sessions.
- **Sound:** Off by default.
- **Reduced motion:** Follows your operating-system preference unless overridden.

Your locally stored progress is tied to your browser and device. It does not automatically sync across devices.

## Snippets

Tabstop uses code snippets to provide realistic typing practice across supported languages.

Snippets are loaded from the `Snippets/` folder at runtime. Each language has its own
directory with one file per difficulty:

```text
Snippets/
├── manifest.json
├── C/
│   ├── easy.c
│   ├── medium.c
│   └── hard.c
├── C++/
│   ├── easy.cpp
│   ├── medium.cpp
│   └── hard.cpp
├── C#/
│   ├── easy.cs
│   ├── medium.cs
│   └── hard.cs
├── Go/
├── Java/
├── JavaScript/
├── Lua/
├── Python/
├── Rust/
├── SQL/
└── TypeScript/
```

Each language directory contains `easy.<ext>`, `medium.<ext>`, and `hard.<ext>`
matching the Beginner, Intermediate, and Advanced difficulty levels.

### manifest.json

`Snippets/manifest.json` lists which files belong to each language and difficulty.
The app fetches it first, then loads every listed file:

```json
{
  "Lua": {
    "Beginner": ["Lua/easy.lua"],
    "Intermediate": ["Lua/medium.lua"],
    "Advanced": ["Lua/hard.lua"]
  }
}
```

Add a language by creating its directory and files, then adding an entry to
`manifest.json`. No application code changes are required.

### Gap markers

**Complete Snippet** mode requires a snippet to contain a gap the player fills in.
Mark the gap with a matched pair of `⟦` and `⟧` characters:

```lua
local function add(a, b)
  ⟦return a + b⟧
end
```

The text between the markers is the part the player types; everything outside is
shown as read-only context. A file with no marker pair is used in Copy Code and
Error-Free Run mode only.

### Fallback behaviour

If the `Snippets/` folder or `manifest.json` cannot be loaded, Tabstop falls back to
built-in snippets and shows a notice, so the app still works offline or from a plain
`file://` URL. On `file://`, browsers block folder requests, so the built-in snippets
are always used.

## Technology

Tabstop is designed to run as a browser-based application, with no installation required for players.

- **HTML** for structure.
- **CSS** for the interface and visual styling.
- **JavaScript** for typing challenges, timing, scoring, and local progress.
- **GitHub Pages** for hosting the web app.

## Contributing

Contributions, suggestions, and bug reports are welcome.

You can help by:

- Adding useful snippets in supported languages.
- Improving existing challenges.
- Reporting bugs or incorrect scoring.
- Suggesting new languages or challenge modes.
- Improving accessibility and the typing experience.

To contribute:

1. Fork the repository.
2. Create a branch for your changes.
3. Make and test your changes.
4. Open a pull request with a clear description.

Repository: [github.com/jinxware00/tabstop](https://github.com/jinxware00/tabstop)

## License

See the repository's `LICENSE` file for the terms under which Tabstop is distributed.

---

<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=gradient" />

**Tabstop**

*Every keystroke counts.*

<a href="https://jinxware00.github.io/tabstop/">Start typing →</a>

</div>
