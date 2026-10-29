# tabstop

Improve your typing speed, whilst learning how to code. **418 snippets across 28 languages**, a focused editor, and progress that stays in your browser.

[Play tabstop](https://jinxware00.github.io/tabstop/) · [Source](https://github.com/jinxware00/tabstop)

## Run locally

Use Node.js 22 or newer:

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. Saved changes reload the preview automatically. The app uses JavaScript modules, so serve it over HTTP instead of opening `index.html` directly.

## Practice

- **Type code:** reproduce real, multiline code with line numbers and a moving caret.
- **Fill the gaps:** type the highlighted section while the rest provides context.
- **Precision:** the session ends after three mistakes, including corrected ones.
- Choose **15, 30, 60, or 120 seconds**, or an **untimed** single snippet.
- Timed sessions continue across snippets. Each matching snippet appears once before the pool reshuffles.
- The timer starts with your first character. Leaving the typing area or switching browser tabs pauses it; focusing the typing area resumes it.
- **Tab** inserts up to four expected indentation spaces, or one literal tab. When no indentation is expected, Tab moves keyboard focus normally. **Shift+Tab** always leaves the typing field.
- **Escape** pauses and leaves focus mode. **Ctrl/Cmd+Enter** restarts the current snippet.
- Pasting is disabled in the practice field. Snippet previews can be selected and copied.

The daily pick selects the same snippet for everyone using the current UTC date and catalogue. It is an untimed practice prompt, with no account or leaderboard.

## Snippet library

Search by title, language, topic, or code. Filter by language and difficulty, preview complete code, or save a snippet to revisit later. Picking an exercise from the library starts an untimed session.

| Area         | Languages                                 |
| ------------ | ----------------------------------------- |
| Scripting    | Lua, Luau, Python, Ruby, Bash, PowerShell |
| Web          | JavaScript, TypeScript, HTML, CSS, PHP    |
| Systems      | C, C++, Rust, Go, Zig                     |
| Applications | C#, Java, Kotlin, Swift, Dart             |
| Data         | SQL, R, Julia                             |
| Functional   | Scala, Haskell, Elixir, Clojure           |

Every language includes beginner, intermediate, and advanced exercises. Snippets cover syntax, collections, strings, functions, types, iteration, async work, error handling, and algorithms. Some examples are functions or expressions intended to be used inside a program, rather than standalone programs. Examples use modern language features, such as C++20, Java records, PHP 8, Dart 3, and Go generics.

## Appearance and progress

- SF Pro Display for the interface; a system code font for the typing surface.
- Graphite, Midnight, and Paper themes, with adjustable accent colour and code size.
- Optional soft typing sounds and mistake locking.
- Motion follows the device preference by default and can be reduced explicitly.
- Results show net/raw WPM, accuracy, mistakes, speed over time, and the keys that needed extra attention.
- Personal-best announcements compare the same language, difficulty, challenge mode, and time limit.
- Progress includes recent sessions, language filtering, a speed chart, and JSON export.

Net WPM is correct characters divided by five and elapsed minutes. Raw WPM counts all entered characters, including mistakes and retyped characters. Accuracy is correct input characters divided by all input characters; fixing a mistake does not erase it from accuracy. Inserted indentation counts as its character length. Speed calculations use a three-second minimum to avoid extreme values at the first keystroke. Paused time is excluded.

## Your data

No account, analytics, remote database, or runtime font service is required. Production loads its scripts, catalogue, and fonts from the site itself.

| Local storage key  | Contents                                                                             |
| ------------------ | ------------------------------------------------------------------------------------ |
| `tabstop.sessions` | Up to 500 completed sessions, including compatible history from the previous version |
| `tabstop.settings` | Theme, accent, sound, code size, mistake locking, and motion                         |
| `tabstop.practice` | Language, level, topic, mode, and time limit                                         |
| `tabstop.saved`    | Bookmarked snippet IDs                                                               |

History is saved once per finished session. Restarting an unfinished attempt does not save it. Clearing history asks for confirmation and keeps preferences and bookmarks. If storage is blocked or corrupted, practice still works; the app explains when results cannot be persisted.

## Editing the catalogue

The original language files are listed in `Snippets/manifest.json`. Additional exercises are in `Snippets/packs/*.json`, and the older built-in exercises are preserved in `Snippets/legacy.json`. Language metadata is in `Snippets/languages.json`.

Each authored record has a language, difficulty, topic, title, and code. Use exactly one `⟦…⟧` pair around a nonempty completion target:

```json
{
  "language": "Lua",
  "level": "Beginner",
  "topic": "Functions",
  "title": "A small greeting",
  "code": "local function greet(name)\n  ⟦return \"Hello, \" .. name⟧\nend"
}
```

Run `npm run build` after editing the source catalogue. It validates records, removes exact duplicates, creates stable content IDs, strips the markers, and writes `assets/catalog.js`. The browser loads this single bundled catalogue rather than fetching hundreds of individual files. Commit the generated catalogue alongside its sources.

## Checks

```sh
npm run build
npm run check
npm test
npx playwright install chromium
npm run test:e2e
```

Unit tests cover scoring, corrections, pausing, multi-snippet sessions, filtering, shuffle integrity, daily selection, legacy history, and catalogue coverage. Browser tests cover desktop/mobile typing, all language and difficulty combinations, timers, results, bookmarks, settings, export, storage failure, and accessibility.

## Deployment

The production app is static HTML, CSS, and JavaScript. Serve the repository root on GitHub Pages or any static host. Assets use relative paths, including under the `/tabstop/` GitHub Pages subdirectory. No application server or production dependency installation is needed. `tools/serve.mjs` is only the development preview server.

See [DESIGN.md](DESIGN.md) for the reference sites and design decisions. Font provenance is recorded in `assets/fonts/README.md`.
