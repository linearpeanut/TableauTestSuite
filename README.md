# Tableau Test Suite v0.1 Alpha

A comprehensive, self-contained bookmarklet for automated testing and validation of Tableau dashboards against production deployment standards.

## Quick Start

### Installation (30 seconds)

1. **Copy the bookmarklet code:**
   - Open [`bookmarklet-minified.js`](./bookmarklet-minified.js)
   - Copy the entire contents (starts with `javascript:`)

2. **Create a browser bookmark:**
   - Press `Ctrl+D` (Windows/Linux) or `Cmd+D` (Mac)
   - Name it: `Tableau Test Suite`
   - Paste the copied code into the URL field
   - Save

3. **Run tests:**
   - Navigate to any Tableau dashboard
   - Click your new bookmark
   - A floating panel appears on the right side
   - Tests run automatically

### What Gets Tested

**85+ Automated Checks** across:
- ✓ Visual Design & Branding (fonts, colors, alignment, contrast)
- ✓ Data Quality & Validation (nulls, errors, filters, parameters)
- ✓ Performance & Technical (load times, console errors, resources)
- ✓ Accessibility (alt text, ARIA labels, keyboard navigation)
- ✓ Security & Privacy (sensitive data, HTTPS, iframes)
- ✓ Functional Elements (buttons, links, exports, interactivity)
- ✓ Deployment Integrity (component detection, version control)

## Features

### Tabbed Interface
- **Summary** – Overview with pass/fail/warning/info counts
- **Visual** – Design consistency, typography, color palette
- **Data** – Quality checks, filters, parameters, refresh indicators
- **Functional** – Interactive elements, exports, navigation
- **Technical** – Performance, errors, accessibility, security

### Export Reports
- Click **Export** to download a comprehensive JSON report
- Includes metadata, summary statistics, detailed test results, and recommendations
- Perfect for documentation and compliance tracking

### Draggable Panel
- Move the panel anywhere on screen by dragging the header
- Close with the × button
- Runs entirely client-side (no data sent anywhere)

## Files

- **`bookmarklet-minified.js`** – Production-ready minified bookmarklet (copy this)
- **`bookmarklet-readable.js`** – Commented source code (for reference/editing)
- **`README.md`** – This file
- **`CHECKLIST.md`** – Full production deployment checklist
- **`COVERAGE.md`** – Detailed test coverage breakdown

## Usage

### Running Tests
1. Click the bookmark on any Tableau dashboard
2. A floating panel appears (top-right by default)
3. Tests run automatically on load
4. Click **Run Tests** to re-execute anytime
5. Navigate tabs to view results by category

### Understanding Results
- **✓ Pass** – Test met all requirements
- **✗ Fail** – Critical issue requiring immediate attention
- **⚠ Warning** – Potential issue or improvement opportunity
- **ℹ Info** – Informational metric or detection result

### Exporting Results
1. Click **Export** button
2. A JSON file downloads automatically
3. File includes:
   - Execution timestamp and environment
   - Summary statistics (total, passed, failed, warnings, info)
   - Detailed test results with recommendations
   - Success rate percentage

## Test Coverage

**~60% Automated** across all categories:
- Deployment Integrity: ~40%
- Version Control: ~60%
- Visual Design: ~75%
- Data Quality: ~45%
- Functional: ~55%
- Performance: ~80%
- Accessibility: ~70%
- Security: ~45%

**~40% Manual** verification required for:
- Backend data source validation
- Permission and access control testing
- Business logic and threshold verification
- Cross-platform compatibility
- User acceptance testing

## Best Practices

### When to Run Tests
- Before production deployment
- After any dashboard changes
- During QA/UAT phases
- Post-refresh validation
- Periodic health checks

### Testing Strategy
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Validate on different screen sizes (desktop, tablet, mobile)
- Run in both test and production environments
- Compare results over time to track improvements
- Document findings and resolutions

## Troubleshooting

**Panel doesn't appear:**
- Check for z-index conflicts or Content Security Policy restrictions
- Try refreshing the page and running again
- Check browser console for errors

**Tests show unexpected failures:**
- Verify the dashboard is fully loaded
- Custom implementations may require test adjustments
- Check browser console for errors

**Bookmarklet won't run:**
- Ensure you copied the complete code starting with `javascript:`
- Some browsers block bookmarklets on certain sites for security
- Try a different browser to verify

**Export fails:**
- Check browser download permissions
- The export creates a JSON file which may be blocked by popup blockers
- Try allowing downloads for the site

## Customization

The bookmarklet can be extended to include organization-specific tests:
- Custom color palette validation (specific hex codes)
- Brand-specific font validation
- Required element detection (logos, disclaimers)
- Naming convention enforcement
- Performance thresholds specific to your infrastructure
- Compliance checks for regulated industries

Edit `bookmarklet-readable.js` and re-minify for custom versions.

## Version History

### v0.1 Alpha (Current)
- Initial release
- 85+ automated tests
- Tabbed interface
- JSON export
- Draggable panel
- Vanilla JavaScript (no dependencies)

## License

MIT

## Support

For issues, feature requests, or contributions, please open an issue on GitHub.
