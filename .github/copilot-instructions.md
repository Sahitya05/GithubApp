# Copilot Instructions — Bucket List App

## Project Overview

A **personal bucket list web application** for tracking life goals and dreams. This is a beginner-friendly project designed to teach attendees how to use Copilot Agent Mode effectively.

---

## Tech Stack (MUST follow)

- **Frontend:** HTML, CSS, JavaScript (vanilla — no frameworks, keep it simple)
- **Styling:** Modern CSS with CSS variables, dark theme
- **Storage:** Browser localStorage (no backend needed — zero setup!)
- **No build tools required** — just open `index.html` in a browser

---

## Design System

- **Theme:** Dark mode inspired by GitHub
  - Background: `#0d1117`
  - Cards: `#161b22`
  - Borders: `#30363d`
  - Text: `#e6edf3`
  - Muted text: `#8b949e`
- **Accent colors:**
  - Blue: `#58a6ff` (links, active states)
  - Green: `#3fb950` (success, completed goals)
  - Red: `#f85149` (delete, adventure category)
  - Yellow: `#d29922` (learning category)
  - Purple: `#bc8cff` (personal category)
- **Border radius:** 12px for cards, 8px for buttons/inputs
- **Transitions:** 0.2s ease on all interactive elements

---

## Features to Build

1. **Add bucket list goals** with a title and optional category (Travel / Learning / Adventure / Personal)
2. **Mark goals as achieved** (strikethrough + green check)
3. **Delete goals** with a confirmation
4. **Filter goals** by: All / Not Started / Achieved
5. **Progress counter** showing "X of Y goals achieved"
6. **Persist goals** in localStorage so they survive page refresh
7. **Target dates** (optional) showing when to complete each goal
8. **Clean, responsive UI** that works on both desktop and mobile

---

## Code Style

- Use semantic HTML5 elements
- CSS custom properties (variables) for theming
- JavaScript ES6+ features (arrow functions, template literals, destructuring)
- Event delegation for dynamic elements
- No inline styles — all styling in CSS
- Functions should be small and do one thing

---

## File Structure

```
bucket-list/
├── index.html      # Main HTML structure
├── style.css       # All styles with CSS variables
└── app.js          # Application logic
```

Keep it to 3 files only. Simple, clean, and easy to understand.

---

## localStorage Schema

Goals should be stored in localStorage under the key `goals` as a JSON array:

```javascript
[
  {
    id: "unique-id",
    title: "Visit Paris",
    achieved: false,
    category: "Travel", // "Travel", "Learning", "Adventure", or "Personal"
    targetDate: "2026-12-31", // optional
    createdAt: "2026-03-28T10:00:00Z"
  }
]
```
