# Tableau Test Suite v0.2-alpha

**Comprehensive client-side Tableau dashboard validation suite with 85+ automated tests, interactive setup wizard, reconciliation, and configuration management.**

## Overview

Tableau Test Suite is a lightweight, zero-dependency bookmarklet that runs 85+ automated tests on any Tableau dashboard. It validates visual design, data quality, performance, accessibility, security, and provides reconciliation against spreadsheet data.

### Key Features

- **85+ Automated Tests** across 8 categories
- **Interactive Setup Wizard** - 4-step first-run configuration experience
- **Zero Installation** - Works as a browser bookmarklet
- **Reconciliation Engine** - Compare dashboard values against CSV/XLSX files
- **Configuration Management** - Fully config-driven with customizable thresholds
- **Exportable Reports** - JSON format for documentation and compliance
- **Parameter-Dimension Validation** - Verify parameter domain connections
- **No External Dependencies** - Runs entirely client-side
- **Multi-Browser Support** - Chrome, Firefox, Safari, Edge

## Quick Start

### Installation

1. Open `auto-installer.html` in your browser
2. Right-click the "📌 Right-click to Bookmark" button
3. Select "Bookmark This Link" or "Add to Favorites"
4. Name it "Tableau Test Suite" and save to your bookmarks bar
5. Navigate to any Tableau dashboard
6. Click your new bookmark to launch the test suite

### First Run: Setup Wizard

On first run, you'll see an interactive setup wizard with 4 steps:

**Step 1: Welcome**
- Overview of features
- Option to skip setup and use defaults

**Step 2: Configure Test Thresholds**
- Performance: Max page load time, DOM ready time
- Visual Design: Max unique fonts, max unique colors
- Security: Sensitive terms to scan for

**Step 3: Set Up Reconciliation (Optional)**
- Public CSV URL or paste CSV content directly
- Numeric tolerance for value comparison
- Case-sensitive dimension matching

**Step 4: Review & Complete**
- Configuration saved
- Quick start guide
- Option to reset wizard anytime from Config tab

### Usage

1. **Run Tests** - Click "▶ Run Tests" to execute all validations
2. **View Results** - Browse results by category (Summary, Tests, Config, Reconcile, Help)
3. **Configure** - Go to Config tab to:
   - Adjust test thresholds
   - Import/export configuration
   - Set up reconciliation
   - Reset and re-run setup wizard
4. **Export Report** - Click "⤓ Export" to download JSON report

## Test Categories

### Visual Design & Branding (6 tests)
- Font consistency (configurable max: 5 unique fonts)
- Color palette analysis (configurable max: 50 unique colors)
- Margin alignment
- Tooltip usage
- Typography hierarchy
- Spelling check

### Data Quality (9 tests)
- Null value detection
- Error message handling
- Filter validation
- Parameter-dimension connection
- Data type consistency
- Duplicate detection
- Missing value patterns
- Aggregation validation
- Data freshness

### Performance (7 tests)
- Page load time (configurable max: 5000ms)
- DOM ready time (configurable max: 3000ms)
- Image loading
- Resource count
- Memory usage
- Rendering time
- API response time

### Accessibility (6 tests)
- Alt text presence
- ARIA landmarks
- Color contrast (WCAG 4.5:1)
- Keyboard navigation
- Screen reader compatibility
- Focus management

### Security (4 tests)
- Sensitive data exposure (configurable terms)
- HTTPS verification
- XSS vulnerability detection
- CSRF token validation

### Functional (9 tests)
- Export functionality
- Print functionality
- Custom views
- Interactive elements
- Filter interactions
- Parameter changes
- Drill-down actions
- Sorting
- Pagination

### Deployment Integrity (3 tests)
- Component detection
- Container HTML presence
- Environment detection

### Version Control (2 tests)
- Version consistency
- Test flag detection

## Configuration

### Default Configuration

The tool comes with sensible defaults that work for most dashboards:

```json
{
  "version": "0.2-alpha",
  "ui": {
    "panel": {
      "width": "520px",
      "maxHeight": "90vh",
      "top": "10px",
      "right": "10px",
      "zIndex": 2147483647,
      "fontFamily": "system-ui,Segoe UI,Roboto,Arial,sans-serif"
    },
    "colors": {
      "background": "#0b1220",
      "foreground": "#e6eef8",
      "border": "#2b3950",
      "accent": "#1860d6",
      "success": "#60d394",
      "error": "#ff9b9b",
      "warning": "#f6c86b",
      "info": "#8bc8ff"
    }
  },
  "rules": {
    "performance": { "maxLoadMs": 5000, "maxDomReadyMs": 3000 },
    "visual": { "maxFonts": 5 },
    "colorCount": { "maxUnique": 50 },
    "security": { "sensitiveTerms": ["ssn", "password", "credit card", "api key", "secret", "token", "bearer"] },
    "selectors": {
      "dashboards": "[data-tb-test-id*=\"dashboard\"],.tableau-dashboard,.tab-dashboard",
      "tables": "table,[role=\"table\"],.tabular-data"
    }
  },
  "reconciliation": {
    "numericTolerance": 0.0001,
    "maxDomSearchElements": 30,
    "maxPreviewRows": 200
  }
}
```

### Customizing Configuration

1. **Via Setup Wizard** - Run on first use or reset from Config tab
2. **Via Config Tab** - Edit JSON directly or import/export configuration
3. **Programmatically** - Use `window.TTS.setConfig(config)`

### Reconciliation Setup

Reconciliation compares dashboard values against source data:

**CSV Format:**
```
dashboard,dimension,measure,expectedValue
My Dashboard,Region,Sales,12345
My Dashboard,Region,Profit,2345
```

**Configuration Options:**
- `csvUrl` - Public CSV URL (e.g., published Google Sheet)
- `csvText` - Paste CSV content directly
- `csvDelimiter` - CSV delimiter character (default: `,`)
- `numericTolerance` - Tolerance for numeric comparison (default: 0.0001 = 0.01%)
- `dimensionCaseSensitive` - Case-sensitive matching (default: false)

## API Reference

Access the tool programmatically via `window.TTS`:

```javascript
// Run all tests
window.TTS.runTests();

// Run reconciliation
window.TTS.runReconciliation();

// Get current configuration
const config = window.TTS.getConfig();

// Update configuration
window.TTS.setConfig(newConfig);

// Reset and show setup wizard
window.TTS.resetWizard();
```

## File Structure

```
├── src/
│   └── bookmarklet-readable.js    # Main bookmarklet (v0.2-alpha)
├── docs/
│   ├── TEST_COVERAGE.md           # Detailed test documentation
│   └── SETUP_AND_ACCESS_CONTROL.md # Setup and security guide
├── auto-installer.html            # One-click bookmarklet installer
├── config-schema.json             # Configuration schema
├── config-template.csv            # Reconciliation template
├── example-reconcile.csv          # Example reconciliation data
└── README.md                      # This file
```

## Version History

### v0.2-alpha (Current)
- ✨ Interactive 4-step setup wizard
- ✨ All hardcoded values moved to config
- ✨ UI styling fully configurable
- ✨ Test thresholds configurable
- ✨ Security sensitive terms configurable
- ✨ CSS selectors configurable
- ✨ "Reset & Show Wizard" option in Config tab
- 🐛 Improved config management with deep merge

### v0.1-alpha
- Initial release
- 85+ automated tests
- Reconciliation engine
- Configuration management
- JSON report export

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Limitations

- Runs entirely client-side (no server communication)
- Cannot access Tableau Server APIs directly
- Limited to visible page content for DOM-based tests
- Reconciliation requires public CSV URLs or manual paste

## Contributing

This is a private repository. For questions or suggestions, please open an issue.

## License

Private - All rights reserved

## Support

For issues or questions:
1. Check the Config tab "Help" section
2. Review `docs/TEST_COVERAGE.md` for test details
3. Review `docs/SETUP_AND_ACCESS_CONTROL.md` for setup guidance
