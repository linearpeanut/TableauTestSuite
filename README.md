# Tableau Test Suite v0.1 Alpha

**Comprehensive client-side Tableau dashboard validation suite with 85+ automated tests, reconciliation, and configuration management.**

## Overview

Tableau Test Suite is a lightweight, zero-dependency bookmarklet that runs 85+ automated tests on any Tableau dashboard. It validates visual design, data quality, performance, accessibility, security, and provides reconciliation against spreadsheet data.

### Key Features

- **85+ Automated Tests** across 8 categories
- **Zero Installation** - Works as a browser bookmarklet
- **Reconciliation Engine** - Compare dashboard values against CSV/XLSX files
- **Configuration Management** - Upload and manage test rules
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

### Usage

1. **Run Tests** - Click "▶ Run Tests" to execute all validations
2. **View Results** - Browse results by category (Summary, Visual, Data, Functional, Technical)
3. **Upload Config** - Go to Config tab to upload reconciliation rules (CSV/XLSX)
4. **Export Report** - Click "⤓ Export" to download JSON report

## Test Categories

### Visual Design & Branding (6 tests)
- Font consistency
- Color palette analysis
- Margin alignment
- Tooltip usage
- Typography hierarchy
- Spelling check

### Data Quality & Validation (9 tests)
- Null value handling
- Error detection
- Filter configuration
- Parameter controls
- Duplicate filter detection
- Data refresh indicators
- KPI element detection
- **Parameter-Dimension Connection** (NEW)

### Deployment Integrity (3 tests)
- Component dashboard detection
- Container HTML presence
- Test flag identification

### Version Control (2 tests)
- Version consistency
- Test label detection

### Functional & Interactivity (9 tests)
- Export functionality
- Print capabilities
- Custom view save
- Feedback tools
- Interactive elements
- Form validation
- Navigation menu
- Dropdown controls
- Link integrity

### Performance & Technical (7 tests)
- Page load time (<5s)
- DOM ready time
- Image loading
- External script count
- Stylesheet count
- Console error detection
- Environment detection
- Tableau API availability

### Accessibility (6 tests)
- Image alt text coverage
- Button labels
- Keyboard navigation
- ARIA landmarks
- Heading structure
- Color contrast ratios (WCAG 4.5:1)

### Security & Privacy (4 tests)
- Sensitive data exposure
- HTTPS usage
- External link analysis
- Iframe sandboxing

## Reconciliation Configuration

### CSV Format

```csv
name,worksheet,dimension,dimensionValue,measure,expectedValue,tolerance
Revenue Check,Revenue Data,Region,North America,Total Revenue,1500000,50000
Customer Count,Customer Summary,Status,Active,Customer Count,5000,100
```

### XLSX Format

Same columns as CSV, first sheet is used.

### Configuration Fields

| Field | Description | Example |
|-------|-------------|----------|
| name | Rule identifier | "Revenue Check" |
| worksheet | Tableau worksheet name | "Revenue Data" |
| dimension | Optional dimension to filter by | "Region" |
| dimensionValue | Value to match in dimension | "North America" |
| measure | Measure name to validate | "Total Revenue" |
| expectedValue | Expected value from source | "1500000" |
| tolerance | Acceptable variance | "50000" |

## Parameter-Dimension Connection Test

Automatically verifies that parameters with dimension-based domains are properly connected to their source dimensions. This test:

- Detects all parameters in the workbook
- Identifies parameters with dimension-based domains
- Verifies dimension field presence in worksheets
- Reports connection status for each parameter

## Export Report Format

```json
{
  "metadata": {
    "timestamp": "2025-11-01T10:30:00.000Z",
    "url": "https://tableau.example.com/dashboard",
    "userAgent": "Mozilla/5.0...",
    "executionTime": 2547
  },
  "summary": {
    "total": 87,
    "passed": 64,
    "failed": 3,
    "warnings": 15,
    "info": 5,
    "successRate": 78
  },
  "results": [...],
  "reconciliation": {...},
  "parameterTests": {...},
  "recommendations": [...]
}
```

## Files

- **bookmarklet_v0.1_alpha.js** - Complete bookmarklet code (minified)
- **auto-installer.html** - One-click installation interface
- **config-template.csv** - Example reconciliation configuration
- **README.md** - This file

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Recommended |
| Firefox | ✅ Full | Recommended |
| Safari | ✅ Full | Recommended |
| Edge | ✅ Full | Recommended |
| IE 11 | ❌ Not supported | Use modern browser |

## Limitations

- Tests run on visible DOM elements only
- Some Tableau API features require Embedding API v3
- Reconciliation requires Tableau API access
- XLSX support requires dynamic SheetJS loading
- Results are stored in browser localStorage (5-10MB limit)

## Storage

The bookmarklet uses browser localStorage for configuration and results:

- `tts:config` - General configuration
- `tts:reconcile:config` - Reconciliation rules
- `tts:reconcile:data` - Reconciliation results
- `tts:custom:rules` - Custom test rules (future)
- `tts:report:*` - Test reports

## Security

- ✅ Runs entirely client-side
- ✅ No data sent to external servers
- ✅ No credentials stored
- ✅ Uses browser's Content Security Policy
- ✅ HTTPS recommended for production

## Performance

- Execution time: ~2-3 seconds for full test suite
- Memory usage: ~5-10MB
- No impact on dashboard performance
- Tests run asynchronously

## Roadmap

### v0.2
- [ ] Custom rule builder UI
- [ ] Batch dashboard testing
- [ ] Scheduled test runs
- [ ] Slack/email notifications
- [ ] Historical trend analysis

### v0.3
- [ ] Server-side report storage
- [ ] Team collaboration features
- [ ] Advanced reconciliation logic
- [ ] Custom test plugins
- [ ] API for CI/CD integration

## Contributing

This repository is read-only. For feature requests or bug reports, please contact the maintainer.

## License

Proprietary - All rights reserved

## Support

For issues or questions, please refer to the GitHub repository issues page.

---

**Version:** 0.1 Alpha  
**Last Updated:** November 2025  
**Maintainer:** @linearpeanut
