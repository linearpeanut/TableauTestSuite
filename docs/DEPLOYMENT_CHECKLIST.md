# Production Deployment Checklist

Use this checklist before deploying the Tableau Test Suite bookmarklet to production.

## Pre-Deployment

### Code Quality
- [ ] All JavaScript passes syntax validation
- [ ] No console errors in browser dev tools
- [ ] Minified bookmarklet tested in multiple browsers
- [ ] localStorage keys are unique and non-conflicting
- [ ] No hardcoded URLs or credentials

### Testing
- [ ] Bookmarklet runs on test Tableau dashboard
- [ ] All 85+ tests execute without errors
- [ ] Reconciliation CSV parsing works correctly
- [ ] Configuration import/export functions properly
- [ ] Export JSON report is valid and complete
- [ ] UI renders correctly on different screen sizes

### Documentation
- [ ] README.md is complete and accurate
- [ ] Configuration schema is documented
- [ ] Sample CSV template is provided
- [ ] Troubleshooting section covers common issues
- [ ] Setup instructions are clear for end users

### Security
- [ ] No sensitive data in localStorage
- [ ] No external API calls (client-side only)
- [ ] No tracking or telemetry
- [ ] CSP compliance verified
- [ ] No XSS vulnerabilities in DOM manipulation
- [ ] CSV parsing sanitizes input

## Deployment

### Repository Setup
- [ ] Repository is set to Private
- [ ] Branch protection rules enabled on `main`
- [ ] Only you have write access
- [ ] Collaborators have Read-only permission
- [ ] Forking is disabled

### File Distribution
- [ ] `installer.html` is hosted and accessible
- [ ] `bookmarklet-minified.js` is available for direct copy
- [ ] `README.md` is visible in repository
- [ ] Sample files (CSV, schema) are included

### User Communication
- [ ] Installation instructions are clear
- [ ] Support contact information is provided
- [ ] Known limitations are documented
- [ ] Browser compatibility is specified

## Post-Deployment

### Monitoring
- [ ] Users can successfully install bookmarklet
- [ ] No reported CSP or security errors
- [ ] Reconciliation feature is working as expected
- [ ] Export functionality produces valid JSON

### Maintenance
- [ ] Version number is updated in code
- [ ] Changelog is maintained
- [ ] Bug reports are tracked
- [ ] Feature requests are documented

## Version Control

### Commit Messages
```
v0.1-alpha: Initial release
- 85+ automated tests
- Spreadsheet reconciliation
- Configuration management
- One-click installer
```

### Tagging
```bash
git tag -a v0.1-alpha -m "Initial release"
git push origin v0.1-alpha
```

## Rollback Plan

If issues arise:

1. **Identify the problem** from user reports or testing
2. **Create a hotfix branch:**
   ```bash
   git checkout -b hotfix/issue-description
   ```
3. **Fix the issue** in the code
4. **Test thoroughly** before merging
5. **Create PR and merge** to main
6. **Tag new version:**
   ```bash
   git tag -a v0.1.1 -m "Hotfix: issue description"
   ```
7. **Notify users** of the update

## Performance Benchmarks

- **Bookmarklet load time:** <1 second
- **Test suite execution:** <5 seconds
- **Reconciliation run:** <10 seconds (depends on CSV size)
- **Memory usage:** <10MB
- **UI responsiveness:** <100ms for interactions

## Browser Compatibility

- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+

## Known Limitations

- Tableau API may not be available on all dashboards
- CSP restrictions may prevent bookmarklet execution
- Reconciliation relies on DOM heuristics if API unavailable
- localStorage limited to ~5-10MB per domain
- Some Tableau Server configurations may block bookmarklet

## Support Resources

- **Documentation:** README.md, config-schema.json
- **Examples:** config-template.csv
- **Troubleshooting:** README.md > Troubleshooting section
- **Issues:** GitHub Issues (if public)

---

**Last Updated:** October 31, 2025
**Version:** v0.1-alpha
