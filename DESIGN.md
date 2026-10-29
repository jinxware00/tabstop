# Tabstop design notes

Redesigned on 29 October 2026. The brief was to improve the interface and practice experience, take inspiration from typing websites, and substantially expand the snippets and languages.

## References reviewed

- [Monkeytype](https://monkeytype.com): focus on the typing surface, keyboard shortcuts, and controls that recede during a run.
- [keybr](https://www.keybr.com): useful feedback about speed, accuracy, and practice history.
- [typing.io](https://typing.io): real code, punctuation, correction, and language-specific practice.

Live pages were reviewed; local reference captures are in the ignored `.artifacts/` folder. The implementation uses its own code, layout, and exercises.

## Direction

Warm graphite, muted green, clear SF Pro Display typography, and a restrained amount of frosted glass around the controls. The practice editor has a stable layout, line numbers, a visible caret, and a quieter surrounding interface while typing. System monospace is reserved for code.

Language selection is searchable. Difficulty and topic remain visible without turning every choice into another row of buttons. Timers and challenge modes are separate controls. The library supports search, code previews, pagination, and bookmarks; progress and settings have their own spaces.

Graphite, Midnight, and Paper use distinct colour tokens. Motion and sound are optional. Native dialogs handle focus containment and Escape, and native radio groups preserve keyboard navigation. Leaving the typing area pauses the clock, including browser-tab changes. There are no invented performance statistics, user accounts, or remote tracking.

The catalogue grows from 11 to 28 languages and contains 418 distinct snippets, with all three difficulty levels for every language. The old history storage format is retained. Existing snippets were reviewed for misleading titles; the SQL ranking example, a Python retry edge case, and incomplete C# examples were corrected.
