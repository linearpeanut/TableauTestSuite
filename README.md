# Tableau Test Suite — Bookmarklet v0.1 Alpha

## Overview

A single-file vanilla JavaScript bookmarklet for automated Tableau dashboard validation and reconciliation.

**Key Features:**
- **85+ automated tests** across 6 categories (Visual, Data Quality, Functional, Technical, Accessibility, Security)
- **Spreadsheet reconciliation** — compare dashboard values against CSV/XLSX configs
- **Editable rules** — customize test thresholds and enable/disable individual tests
- **Zero dependencies** — vanilla JS only; SheetJS loaded on-demand for XLSX support
- **Persistent config** — all settings stored in browser localStorage
- **One-click installer** — right-click bookmark link for easy setup

## Files

| File | Purpose |
|------|----------|
| `bookmarklet_readable.js` | Readable source (for editing and reference) |
| `bookmarklet_minified.js` | Single-line minified bookmarklet (copy into bookmark URL) |
| `auto-installer.html` | One-click installer page with copy-to-clipboard |
| `config-template.csv` | CSV template for reconciliation configs |
| `README.md` | This documentation |

## Installation

### Option 1: Auto-Installer (Recommended)

1. Open `auto-installer.html` in your browser (or host it on a web server)
2. Right-click the **"Install Tableau Test Suite"** link and choose **"Add to favorites"** / **"Bookmark link"**
3. Or drag the link to your bookmarks bar

### Option 2: Manual Install

1. Create a new bookmark in your browser (Ctrl+D or Cmd+D)
2. Copy the entire contents of `bookmarklet_minified.js`
3. Paste into the bookmark URL field
4. Save with name "Tableau Test Suite" or similar

## Usage

### Running Tests

1. Navigate to a Tableau dashboard
2. Click the bookmarklet from your bookmarks bar
3. The **TTS panel** appears (top-right corner)
4. Click **"Run Tests"** to execute the suite
5. Results appear in the **Tests** tab

### Reconciliation (Spreadsheet Comparison)

1. In the **Reconcile** tab:
   - **Paste CSV** directly into the text area, OR
   - **Upload CSV/XLSX** file
2. Click **"Parse & Save"**
3. Click **"Run Reconciliation"** to compare dashboard values against your config
4. Results show match/mismatch for each row

**CSV Format:**
```
dashboard,dimension,measure,expectedValue,tolerance
My Dashboard,Region A,Sales,12345,0.5
My Dashboard,Region B,Profit,2345,1.0
```

- `dashboard` — friendly name (optional)
- `dimension` — grouping label (optional)
- `measure` — measure name to match on page (required)
- `expectedValue` — numeric expected value
- `tolerance` — percentage tolerance (e.g., 0.5 = ±0.5%); uses global default if omitted

### Configuration & Rules

1. In the **Config** tab:
   - Edit **Global Rules** (JSON) — adjust thresholds like `maxLoadTimeMs`, `globalTolerancePercent`
   - **Import/Export** full config for sharing standard rule sets
2. In the **Tests** tab:
   - Enable/disable individual tests via checkboxes
   - Settings persist in localStorage

### Exporting Reports

1. Click **"Export Last Report"** in the **Export** tab
2. A JSON file downloads with full test results, timestamps, and metadata

## Configuration Details

### Default Rules

```json
{
  "version": "0.1",
  "testsEnabled": {},
  "rules": {
    "globalTolerancePercent": 0.5,
    "maxLoadTimeMs": 2000,
    "contrastMin": 3.0
  },
  "reconciliation": {
    "sourceType": "paste",
    "rawText": "",
    "records": []
  }
}
```

### Storage

- **Key:** `tts:config` (localStorage)
- **Key:** `tts:report:*` (timestamped reports)
- All data persists in the browser; no external transmission

## Test Categories

| Category | Tests | Examples |
|----------|-------|----------|
| **Performance** | 15+ | Page load time, DOM ready, image loading |
| **Visual** | 15+ | Font consistency, color palette, margin alignment |
| **Data Quality** | 15+ | Null values, error detection, filter config |
| **Functional** | 15+ | Export buttons, links, interactive elements |
| **Accessibility** | 15+ | Alt text, ARIA labels, heading structure, contrast |
| **Security** | 15+ | HTTPS usage, sensitive data, iframe sandboxing |

## SheetJS (XLSX Support)

- Loaded automatically from CDN when user uploads an XLSX file
- URL: `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- No external dependencies otherwise

## Security & Privacy

- **Runs entirely in the browser** — no data transmitted externally
- **localStorage only** — config and reports stored locally
- **No tracking** — no analytics or telemetry
- **CORS-safe** — avoids cross-origin requests

## Extending Tests

To add custom tests:

1. Edit `bookmarklet_readable.js`
2. Add a new test using `registerTest(id, name, category, runFn)`
3. Example:
   ```javascript
   registerTest('custom_check', 'My Custom Check', 'Visual', function(ctx) {
     var passed = document.querySelectorAll('.my-element').length > 0;
     return { passed: passed, info: { found: passed } };
   });
   ```
4. Minify and update the bookmarklet

## Repository & Permissions

**This repository is read-only.** Only the repository owner (linearpeanut) can push changes.

### Branch Protection (main)

- Requires pull requests for all changes
- Status checks required
- Restricted push access (owner only)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Panel doesn't appear | Check browser console for errors; try refreshing page |
| Tests fail unexpectedly | Verify dashboard is fully loaded; check browser console |
| XLSX upload fails | Ensure file is valid .xlsx; check browser download permissions |
| Reconciliation finds no values | Heuristic matching may fail on complex layouts; try manual inspection |
| Bookmarklet won't run | Ensure full code copied; some browsers block bookmarklets on certain sites |

## Next Steps

- [ ] Add Tableau API integration for direct measure extraction
- [ ] Improve reconciliation heuristics (CSS/XPath matching)
- [ ] Add rule templates for common workflows (Finance, Ops, etc.)
- [ ] Provide hosted installer page
- [ ] Add browser extension version

## License

Private repository. All rights reserved.

---

**Version:** 0.1 Alpha  
**Author:** linearpeanut  
**Last Updated:** 2025-11-01