# Test Coverage Analysis

## Overview

The Tableau Test Suite includes **85+ automated tests** organized into **8 categories**. This document details the coverage, test logic, and manual verification requirements.

## Test Categories & Coverage

### 1. Deployment Integrity (~40% automated)

**Automated Tests:**
- Component dashboard detection
- Container HTML presence
- Test flag identification in text/classes
- Environment detection (dev/test/prod)
- Tableau API availability

**Manual Verification:**
- NPE cleanup verification
- Change log updates
- Correct component list deployment
- Fresh container HTML creation

**Test Logic:**
```javascript
// Detect dashboards
const dashboards = document.querySelectorAll('[data-tb-test-id*="dashboard"],.tableau-dashboard,.tab-dashboard');
addTest('deployment', dashboards.length > 0 ? 'pass' : 'fail', 'Component Dashboards Detected', ...);
```

---

### 2. Version Control & Flags (~60% automated)

**Automated Tests:**
- Version number consistency check
- Test flag detection in attributes
- Test labels in UI elements
- Version string extraction

**Manual Verification:**
- Manual version verification in Tableau Server
- Component-by-component version audit

**Test Logic:**
```javascript
// Extract version strings
const versionElements = Array.from(document.querySelectorAll('*'))
  .filter(el => /v?\d+\.\d+(\.\d+)?/i.test(el.textContent));
const versions = new Set(versionElements.map(el => el.textContent.match(/v?\d+\.\d+(\.\d+)?/i)?.[0]));
addTest('version', versions.size <= 1 ? 'pass' : 'warn', 'Version Consistency', ...);
```

---

### 3. Visual Design & Branding (~75% automated)

**Automated Tests:**
- Font family consistency (target: ≤5 unique fonts)
- Font size distribution analysis
- Color palette extraction (target: ≤50 unique colors)
- Brand color detection
- Color contrast ratio calculation (WCAG 4.5:1)
- Typography hierarchy validation
- Margin alignment variance (target: ≤8px)
- Tooltip usage analysis
- Spelling error detection
- Heading structure validation

**Manual Verification:**
- Brand guideline color matching
- AP Red usage verification
- Specific color code validation
- AP Type Text font confirmation
- Professional appearance assessment
- View clutter evaluation

**Test Logic:**
```javascript
// Font consistency
const fonts = new Set();
document.querySelectorAll('*').forEach(el => {
  const style = window.getComputedStyle(el);
  fonts.add(style.fontFamily);
});
addTest('visual', fonts.size <= 5 ? 'pass' : 'warn', 'Font Consistency', ...);

// Color contrast
const contrast = getContrastRatio(foreground, background);
addTest('accessibility', contrast >= 4.5 ? 'pass' : 'warn', 'Color Contrast', ...);
```

---

### 4. Data Quality & Validation (~45% automated)

**Automated Tests:**
- Data table detection
- Null value detection (target: <5% of cells)
- Empty cell identification
- Error indicator detection
- Column width issues (##### errors)
- Filter control detection
- Duplicate filter identification
- Parameter control detection
- Date format validation
- Data refresh indicator presence
- KPI element detection
- Grand total detection

**Manual Verification:**
- Source system data matching
- Calculation verification
- Independent calculation validation
- Historical trend review
- Sanity check on key figures
- Support calculation implementation
- Hardcoded value removal
- Custom SQL review

**Test Logic:**
```javascript
// Null value detection
const cells = document.querySelectorAll('td,[role="cell"]');
const nullCells = Array.from(cells).filter(c => {
  const t = c.textContent.trim().toLowerCase();
  return t === 'null' || t === 'n/a' || t === '' || t === '#n/a' || t === 'nan';
});
addTest('data', nullCells.length < cells.length * 0.05 ? 'pass' : 'warn', 'Null Value Handling', ...);
```

---

### 5. Functional & Interactivity (~55% automated)

**Automated Tests:**
- Export button detection
- Print button detection
- Custom view save button detection
- Feedback tool detection
- Interactive element count
- Button/link functionality check
- Dropdown control presence
- Navigation element detection
- Form validation field detection
- Link integrity (no placeholder links)

**Manual Verification:**
- Filter combination testing
- Parameter interaction testing
- Action functionality (Filter, Highlight, URL)
- Chained action verification
- User flow validation
- Drill-down capability testing
- Export quality verification

**Test Logic:**
```javascript
// Export button detection
const exportButtons = document.querySelectorAll('[title*="download" i],[aria-label*="download" i]');
addTest('functional', exportButtons.length > 0 ? 'pass' : 'warn', 'Export Functionality', ...);

// Link integrity
const brokenLinks = Array.from(document.querySelectorAll('a[href]'))
  .filter(l => l.href === '#' || l.href.endsWith('#'));
addTest('functional', brokenLinks.length < links.length * 0.1 ? 'pass' : 'warn', 'Link Integrity', ...);
```

---

### 6. Performance & Technical (~80% automated)

**Automated Tests:**
- Page load time (target: <5s)
- DOM ready time (target: <3s)
- Image loading status (broken images)
- External script count (target: <30)
- Stylesheet count (target: <20)
- Console error detection
- Environment detection (dev/test/prod)
- Tableau API availability
- Resource loading efficiency

**Manual Verification:**
- Invalid input handling
- Error message clarity
- Corrupt data handling
- Expected load volume testing
- Complex interaction responsiveness

**Test Logic:**
```javascript
// Load time measurement
const timing = performance.timing;
const loadTime = timing.loadEventEnd - timing.navigationStart;
const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
addTest('technical', loadTime < 5000 ? 'pass' : 'warn', 'Page Load Time', loadTime + 'ms');
addTest('technical', domReady < 3000 ? 'pass' : 'warn', 'DOM Ready Time', domReady + 'ms');

// Broken images
const brokenImages = Array.from(document.querySelectorAll('img'))
  .filter(img => !img.complete || img.naturalHeight === 0);
addTest('technical', brokenImages.length === 0 ? 'pass' : 'fail', 'Image Loading', ...);
```

---

### 7. Accessibility (WCAG 2.1 AA) (~70% automated)

**Automated Tests:**
- Image alt text coverage (target: 100%)
- Button label presence
- Heading structure (single H1)
- ARIA landmark detection
- Color contrast ratio (4.5:1 minimum)
- Focusable element identification
- Keyboard navigation support
- Semantic HTML validation

**Manual Verification:**
- Screen reader testing
- Keyboard-only navigation
- Focus indicator visibility
- Tab order verification
- Skip link functionality

**Test Logic:**
```javascript
// Alt text verification
const images = document.querySelectorAll('img');
const imagesNoAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
addTest('accessibility', imagesNoAlt.length === 0 ? 'pass' : 'fail', 'Image Alt Text', ...);

// Heading structure
const h1Count = document.querySelectorAll('h1').length;
addTest('accessibility', h1Count === 1 ? 'pass' : 'warn', 'Heading Structure', h1Count + ' H1 heading(s)');
```

---

### 8. Security & Privacy (~45% automated)

**Automated Tests:**
- Sensitive data exposure detection (SSN, password, API key, etc.)
- HTTPS usage verification
- External link identification
- Iframe sandbox checking
- Authentication indicator detection

**Manual Verification:**
- Role-based access testing
- Audit log verification
- PII redaction validation
- Secure download link testing
- Export permission verification

**Test Logic:**
```javascript
// Sensitive data detection
const sensitiveTerms = ['ssn', 'password', 'credit card', 'api key', 'secret'];
const foundSensitive = sensitiveTerms.filter(term => 
  document.body.textContent.toLowerCase().includes(term)
);
addTest('security', foundSensitive.length === 0 ? 'pass' : 'warn', 'Sensitive Data Exposure', ...);

// HTTPS verification
const httpsUrls = Array.from(document.querySelectorAll('[src],[href]'))
  .map(el => el.src || el.href)
  .filter(url => url.startsWith('http://'));
addTest('security', httpsUrls.length === 0 ? 'pass' : 'warn', 'HTTPS Usage', ...);
```

---

## Reconciliation Testing

### CSV Format
```csv
dashboard,dimension,measure,expectedValue
My Dashboard,Region,Sales,12345
My Dashboard,Region,Profit,2345
```

### Matching Logic

1. **Tableau API Lookup** (preferred)
   - Query worksheet summary data
   - Match dimension value
   - Extract measure value
   - Compare with expected value

2. **DOM Heuristic Fallback**
   - Search for dimension text in DOM
   - Find nearby numeric values
   - Compare with expected value

3. **Numeric Tolerance**
   - Default: 0.0001 (0.01% tolerance)
   - Configurable per deployment
   - Applies to numeric comparisons only

### Test Results
- ✅ **Match** – Found value equals expected value
- ❌ **Mismatch** – Found value differs from expected
- ❓ **Not Located** – Could not find dimension/measure

---

## Configuration & Customization

### Adjustable Thresholds

```json
{
  "rules": {
    "performance": {
      "maxLoadMs": 5000,
      "maxDomReadyMs": 3000
    },
    "colorCount": {
      "maxUnique": 50
    },
    "contrastToleranceIssues": {
      "maxIssues": 10
    }
  }
}
```

### Test Toggles

```json
{
  "testToggles": {
    "deployment": true,
    "version": true,
    "visual": true,
    "data": true,
    "functional": true,
    "technical": true,
    "accessibility": true,
    "security": true,
    "reconciliation": true
  }
}
```

---

## Overall Coverage Summary

| Category | Automated | Manual | Total |
|----------|-----------|--------|-------|
| Deployment | 40% | 60% | 100% |
| Version | 60% | 40% | 100% |
| Visual | 75% | 25% | 100% |
| Data | 45% | 55% | 100% |
| Functional | 55% | 45% | 100% |
| Technical | 80% | 20% | 100% |
| Accessibility | 70% | 30% | 100% |
| Security | 45% | 55% | 100% |
| **OVERALL** | **~58%** | **~42%** | **100%** |

---

## Recommendations

1. **Use automated tests for rapid feedback** during development
2. **Perform manual verification** before production deployment
3. **Reconciliation is critical** – always validate key metrics
4. **Customize thresholds** based on your organization's standards
5. **Export reports** for compliance and audit trails
6. **Review results regularly** to catch regressions early

---

**Last Updated:** October 31, 2025
**Version:** v0.1-alpha
