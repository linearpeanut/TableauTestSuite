# Tableau Test Suite v0.1-alpha

**Client-side Tableau dashboard validation, reconciliation, and automated testing suite**

## Overview

Tableau Test Suite is a lightweight, self-contained bookmarklet that runs 85+ automated tests on any Tableau dashboard. It validates visual design, data quality, performance, accessibility, and security—all without leaving your browser.

### Key Features

- ✅ **85+ Automated Tests** across 8 categories (Deployment, Version, Visual, Data, Functional, Technical, Accessibility, Security)
- 📊 **Spreadsheet-Based Reconciliation** – Compare dashboard values against expected data from CSV
- ⚙️ **Customizable Rules** – Adjust thresholds and toggle test categories
- 📈 **Exportable Reports** – Download JSON reports for compliance and documentation
- 🚀 **Zero Installation** – Bookmarklet only; works on any Tableau dashboard
- 🔒 **Client-Side Only** – No data leaves your browser
- 🎨 **Modern UI** – Dark theme, responsive design, intuitive tabs

## Quick Start

### Option 1: One-Click Installer (Recommended)

1. Open `installer.html` in your browser (or visit the hosted version)
2. Click **"Install Bookmarklet"**
3. Navigate to any Tableau dashboard
4. Click your new "Tableau Test Suite" bookmark
5. Click **"Run Tests"** to validate the dashboard

### Option 2: Manual Bookmark Creation

1. Copy the bookmarklet code from `bookmarklet-minified.js`
2. Create a new bookmark in your browser
3. Paste the code into the URL field
4. Name it "Tableau Test Suite"
5. Save to your bookmarks bar

## Usage

### Running Tests

1. Click the bookmarklet on any Tableau dashboard
2. A panel appears on the right side
3. Click **"Run Tests"** to execute all enabled tests
4. View results in the **"Summary"** tab
5. Click **"Export"** to download a JSON report

### Reconciliation (Data Validation)

1. Go to the **"Config"** tab
2. Paste a CSV with columns: `dashboard`, `dimension`, `measure`, `expectedValue`
   - Or provide a public CSV URL (e.g., published Google Sheet)
3. Click **"Save Recon"**
4. Go to the **"Reconcile"** tab
5. Click **"Run Reconcile"** to compare dashboard values against your spreadsheet

### Customizing Rules

1. Go to the **"Config"** tab
2. Edit the **"Rule Parameters (JSON)"** section
3. Adjust thresholds (e.g., `maxLoadMs`, `maxUnique` colors)
4. Click **"Save Rules"**
5. Rules persist in browser localStorage

### Toggling Test Categories

1. Go to the **"Tests"** tab
2. Check/uncheck test categories to enable/disable them
3. Click **"Run Tests"** to execute only enabled tests

## Configuration

### CSV Format for Reconciliation

```csv
dashboard,dimension,measure,expectedValue
My Dashboard,Region,Sales,12345
My Dashboard,Region,Profit,2345
Revenue Dashboard,Product Category,Revenue,45678
```

**Required Columns:**
- `dashboard` – Worksheet or sheet name in Tableau
- `dimension` – Grouping/category value (e.g., "Region", "Product")
- `measure` – Metric name (e.g., "Sales", "Profit")
- `expectedValue` – Expected numeric or text value

**Optional Columns:**
- Any additional columns are ignored

### Configuration Schema

See `config-schema.json` for the full configuration structure. Key settings:

```json
{
  "reconciliation": {
    "csvText": "...",  // CSV content (takes priority over csvUrl)
    "csvUrl": "...",   // Public CSV URL
    "numericTolerance": 0.0001  // Tolerance for numeric comparisons
  },
  "rules": {
    "performance": { "maxLoadMs": 5000, "maxDomReadyMs": 3000 },
    "colorCount": { "maxUnique": 50 },
    "contrastToleranceIssues": { "maxIssues": 10 }
  },
  "testToggles": {
    "deployment": true,
    "visual": true,
    "data": true,
    "technical": true,
    "accessibility": true,
    "security": true
  }
}
```

## Test Categories

### Deployment Integrity
- Component dashboard detection
- Container HTML presence
- Test flag identification

### Version Control
- Version number consistency
- Test labels in UI elements

### Visual Design
- Font family consistency
- Margin alignment
- Color palette (unique colors)
- Tooltip usage
- Typography hierarchy
- Spelling checks

### Data Quality
- Data table detection
- Null value handling
- Error indicators
- Column width issues (##### errors)
- Filter controls
- Duplicate filters
- Parameter controls
- Date display
- Data refresh indicators
- KPI elements

### Functional
- Export functionality
- Print functionality
- Custom view save
- Feedback tools
- Interactive elements
- Form validation
- Navigation menu
- Dropdown controls
- Link integrity

### Technical / Performance
- Page load time (<5s)
- DOM ready time (<3s)
- Image loading (broken images)
- External script count
- Stylesheet count
- Console errors
- Environment detection
- Tableau API availability

### Accessibility
- Image alt text
- Button labels
- Keyboard navigation
- ARIA landmarks
- Heading structure (single H1)
- Color contrast

### Security
- Sensitive data exposure (SSN, password, API key, etc.)
- HTTPS usage
- External links
- Iframe sandboxing

## Repository Access Control

### Making the Repository Read-Only

To prevent unauthorized edits:

1. **Set Repository to Private** (optional but recommended)
   - Go to Settings > Visibility
   - Select "Private"
   - Only you and invited collaborators can access

2. **Enable Branch Protection Rules**
   - Go to Settings > Branches
   - Click "Add rule"
   - Branch name pattern: `main`
   - Enable:
     - "Require pull request reviews before merging"
     - "Require status checks to pass before merging"
     - "Require branches to be up to date before merging"
     - "Restrict who can push to matching branches" (set to yourself)

3. **Disable Direct Pushes**
   - Go to Settings > Collaborators
   - Set all collaborators to "Read" permission only
   - Only you have "Admin" or "Write" access

## File Structure

```
TableauTestSuite/
├── README.md                          # This file
├── installer.html                     # One-click installer
├── config-template.csv                # Sample reconciliation CSV
├── config-schema.json                 # Configuration schema
├── src/
│   ├── bookmarklet-readable.js        # Full, commented source
│   └── bookmarklet-minified.js        # Minified for bookmarklet use
└── docs/
    ├── DEPLOYMENT_CHECKLIST.md        # Production deployment guide
    └── TEST_COVERAGE.md               # Detailed test coverage analysis
```

## Deployment

### For End Users

1. **Share the installer:**
   - Host `installer.html` on a web server or internal wiki
   - Users open it and click "Install Bookmarklet"
   - Bookmark is created in their browser

2. **Share the bookmarklet code directly:**
   - Copy `bookmarklet-minified.js` content
   - Users create a bookmark and paste the code

3. **Share the readable source:**
   - Users can review `src/bookmarklet-readable.js` for transparency
   - Minified version is production-ready

### For Developers

1. **Clone the repository:**
   ```bash
   git clone https://github.com/linearpeanut/TableauTestSuite.git
   ```

2. **Edit and test:**
   - Modify `src/bookmarklet-readable.js`
   - Test in browser console: `window.TTS.runTests()` or `window.TTS.runReconciliation()`

3. **Minify for production:**
   - Use a JavaScript minifier (e.g., UglifyJS, Terser)
   - Update `bookmarklet-minified.js`
   - Commit and push changes

## Troubleshooting

### Panel doesn't appear
- Check browser console for CSP (Content Security Policy) errors
- Try refreshing the page and clicking the bookmark again
- Ensure JavaScript is enabled

### Tests show unexpected failures
- Verify the dashboard is fully loaded
- Check custom implementations (may require test adjustments)
- Review browser console for errors

### Reconciliation not matching
- Verify CSV column names match expected format
- Check dimension values for case sensitivity (configurable)
- Ensure numeric tolerance is appropriate for your data
- Try using Tableau API (if available) vs. DOM heuristics

### Bookmarklet won't run
- Ensure you copied the complete code starting with `javascript:`
- Some browsers block bookmarklets on certain sites for security
- Try a different browser or site

## Performance

- **Execution Time:** <5 seconds for full test suite
- **Memory Usage:** <10MB
- **Browser Compatibility:** Chrome, Firefox, Safari, Edge (modern versions)
- **Tableau Compatibility:** Tableau Server/Online (any version with JavaScript API)

## Security & Privacy

- ✅ **Client-Side Only** – No data sent to external servers
- ✅ **No Tracking** – No analytics or telemetry
- ✅ **No Credentials** – Bookmarklet doesn't capture passwords or API keys
- ✅ **localStorage Only** – Configuration stored locally in browser
- ⚠️ **CSP Restrictions** – May not work on sites with strict Content Security Policy

## Contributing

This repository is **read-only** for end users. For contributions or feature requests:

1. Open an issue on GitHub
2. Provide detailed description and use case
3. Include test results and configuration

## License

MIT License – See LICENSE file for details

## Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Check existing issues for similar problems
- Review the troubleshooting section above

## Changelog

### v0.1-alpha (Initial Release)
- 85+ automated tests
- Spreadsheet-based reconciliation
- Customizable rules and test toggles
- Exportable JSON reports
- One-click installer
- Dark theme UI
- Full vanilla JavaScript (no dependencies)

---

**Made with ❤️ for Tableau developers**
