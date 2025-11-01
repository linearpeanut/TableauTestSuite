# Tableau Test Suite v0.1 Alpha

**Client-side Tableau dashboard validation and reconciliation bookmarklet**

## Overview

Tableau Test Suite is a lightweight, zero-dependency bookmarklet that enables:

- **Reconciliation Testing**: Compare dashboard values against expected values from CSV/XLSX configs
- **Custom Rules**: Edit JSON rules to customize test behavior and tolerances
- **Configuration Management**: Import/export reconciliation configs in CSV or XLSX format
- **JSON Reports**: Export detailed test results for audits and compliance
- **localStorage Persistence**: All config and rules saved locally in the browser

## Quick Start

### Installation

1. Visit the **auto-installer.html** in your browser
2. Click "Copy Bookmarklet"
3. Create a new browser bookmark (Ctrl+D / Cmd+D)
4. Paste the code into the bookmark URL field
5. Name it "Tableau Test Suite"
6. Save and use on any Tableau dashboard

### Usage

1. Open a Tableau dashboard
2. Click your "Tableau Test Suite" bookmark
3. A panel appears on the right side
4. Use the tabs to:
   - **Run**: Execute all tests or reconciliation only
   - **Config**: Import CSV/XLSX reconciliation data
   - **Rules**: Edit JSON test rules
   - **Reconcile**: Run reconciliation and view results
   - **Report**: View and export JSON reports
   - **Help**: Quick reference

## Configuration Format

### CSV Template

```csv
dashboard,dimension,measure,expectedValue,tolerancePct
Sales Dashboard,North Region,Total Sales,125000,1.0
Revenue Dashboard,Q1 2025,Revenue,450000,0.5
```

**Columns:**
- `dashboard`: Dashboard name (auto-detected if empty)
- `dimension`: Dimension/filter value
- `measure`: Measure/metric name
- `expectedValue`: Expected numeric value
- `tolerancePct`: Tolerance percentage (optional, defaults to 0.5%)

### XLSX Support

The bookmarklet automatically loads SheetJS from CDN when you select an XLSX file. Same column structure as CSV.

## Features

✓ **Vanilla JavaScript** - No React, no build tools required
✓ **CSV & XLSX Support** - Flexible configuration import
✓ **Tolerance-Based Matching** - Configurable percentage tolerances
✓ **Custom Rules** - Edit JSON to customize test behavior
✓ **JSON Export** - Detailed reports for compliance and audits
✓ **localStorage Persistence** - Config saved between sessions
✓ **Zero External Dependencies** - Except optional SheetJS for XLSX
✓ **Minified Bookmarklet** - Single-line, copy-paste ready

## Files

- **bookmarklet-readable.js** - Full source code with comments (development)
- **bookmarklet-minified.txt** - Minified single-line bookmarklet (production)
- **auto-installer.html** - One-click installer page
- **config-template.csv** - Example reconciliation configuration
- **README.md** - This file

## Configuration Rules

Edit the Rules tab to customize test behavior:

```json
{
  "enableVisualChecks": true,
  "enableDataChecks": true,
  "toleranceDefaultPct": 0.5
}
```

## Reconciliation Logic

For each config row:

1. Extract the expected value from the config
2. Search the dashboard DOM for matching dimension + measure text
3. Extract the actual numeric value from nearby elements
4. Compare: `|actual - expected| / |expected| * 100 <= tolerancePct`
5. Report: MATCH, MISMATCH, NOT_FOUND, or INVALID_EXPECTED

## Report Export

JSON reports include:

```json
{
  "generatedAt": "2025-11-01T10:30:00.000Z",
  "summary": {
    "summaryText": "5/5 reconciliation matches",
    "totalChecks": 5,
    "passed": 5,
    "failed": 0
  },
  "reconcile": {
    "total": 5,
    "matches": 5,
    "details": [...]
  },
  "rules": {...},
  "version": "0.1.0"
}
```

## Troubleshooting

**Bookmarklet won't run?**
- Ensure you copied the entire code starting with `javascript:`
- Some browsers block bookmarklets on certain sites for security
- Try refreshing the page and clicking again

**XLSX not loading?**
- The bookmarklet loads SheetJS from CDN on demand
- Ensure you have internet access
- Check browser console for errors

**Values not matching?**
- Verify dashboard, dimension, and measure names exactly match the dashboard
- Check tolerance percentage settings
- Review the reconciliation details for NOT_FOUND status

**Config not persisting?**
- localStorage is saved per domain
- Clearing browser data will reset config
- Export reports regularly for backup

## Development

To extend the bookmarklet:

1. Edit `bookmarklet-readable.js`
2. Add new test functions or reconciliation logic
3. Minify using a tool like [terser](https://terser.org/)
4. Update `bookmarklet-minified.txt`
5. Test thoroughly on various dashboards

## Version History

### v0.1.0 (Alpha)
- Initial release
- CSV/XLSX config import
- Reconciliation testing
- Custom rules (JSON editable)
- JSON report export
- localStorage persistence

## License

Private repository - Read-only for end users.

## Support

For issues or feature requests, contact the repository owner.
