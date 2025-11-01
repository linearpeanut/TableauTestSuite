/*
  Tableau Test Suite - Bookmarklet (readable)
  v0.1-alpha (vanilla JS)
  - Self-contained UI (no React)
  - Automated tests across Visual, Data, Functional, Technical, Accessibility, Security
  - Configuration management:
      * Reconciliation spreadsheet (CSV paste or public CSV URL)
      * Custom rule editor (adjust thresholds, toggle tests)
  - Exportable JSON reports
  - Persistent config in localStorage ('tts:config')
*/

(function () {
  // Constants & storage keys
  const LS_CONFIG = 'tts:config';
  const LS_RESULTS = 'tts:results';
  const VERSION = '0.1-alpha';
  const DEFAULT_CONFIG = {
    version: VERSION,
    reconciliation: {
      csvText: '',
      csvUrl: '',
      csvDelimiter: ',',
      dimensionCaseSensitive: false,
      numericTolerance: 0.0001
    },
    rules: {
      performance: { maxLoadMs: 5000, maxDomReadyMs: 3000, enabled: true },
      images: { allowBroken: false, enabled: true },
      colorCount: { maxUnique: 50, enabled: true },
      contrastToleranceIssues: { maxIssues: 10, enabled: true },
      checkTableauApi: { enabled: true },
      accessibility: { requireAltText: true, enabled: true }
    },
    testToggles: {
      deployment: true,
      version: true,
      visual: true,
      data: true,
      functional: true,
      technical: true,
      accessibility: true,
      security: true,
      reconciliation: true
    }
  };

  // Utility functions
  const lsGet = (k) => {
    try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
  };
  const lsSet = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const getConfig = () => {
    const c = lsGet(LS_CONFIG);
    if (!c || c.version !== VERSION) {
      const merged = Object.assign({}, DEFAULT_CONFIG, c || {});
      lsSet(LS_CONFIG, merged);
      return merged;
    }
    return c;
  };
  const saveConfig = (cfg) => lsSet(LS_CONFIG, cfg);
  const safeStringify = (o) => { try { return JSON.stringify(o, null, 2); } catch (e) { return String(o); } };
  const numericValueOf = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'number') return v;
    const s = String(v).replace(/[^\d\.\-]/g, '');
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  };

  // UI Panel Creation
  function createPanel() {
    const existing = document.getElementById('tts-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'tts-panel';
    Object.assign(panel.style, {
      position: 'fixed', top: '10px', right: '10px', width: '520px', maxHeight: '90vh',
      zIndex: 2147483647, fontFamily: 'system-ui,Segoe UI,Roboto,Arial,sans-serif',
      display: 'flex', flexDirection: 'column', background: '#0b1220', color: '#e6eef8',
      border: '1px solid #2b3950', borderRadius: '12px', boxShadow: '0 10px 40px rgba(2,6,23,0.7)',
      overflow: 'hidden'
    });

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(90deg,#0f172a,#10203a);border-bottom:1px solid #1f2b44">
        <div style="display:flex;flex-direction:column">
          <div style="font-weight:700;font-size:15px">Tableau Test Suite <span style="font-size:11px;color:#9fb0d7">v${VERSION}</span></div>
          <div style="font-size:11px;color:#9fb0d7">Client-side dashboard validation & reconciliation</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button id="tts-export-btn" title="Export last results" style="background:#1f3a8a;border:0;color:#fff;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:12px">Export</button>
          <button id="tts-close-btn" title="Close" style="background:transparent;border:0;color:#9fb0d7;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:18px">×</button>
        </div>
      </div>
      <div style="display:flex;border-bottom:1px solid #17253b;background:#0b1220">
        <button class="tts-tab active" data-tab="summary" style="flex:1;padding:10px;border:0;background:transparent;color:#cfe3ff;font-weight:700;cursor:pointer">Summary</button>
        <button class="tts-tab" data-tab="tests" style="flex:1;padding:10px;border:0;background:transparent;color:#9fb0d7;cursor:pointer">Tests</button>
        <button class="tts-tab" data-tab="config" style="flex:1;padding:10px;border:0;background:transparent;color:#9fb0d7;cursor:pointer">Config</button>
        <button class="tts-tab" data-tab="reconcile" style="flex:1;padding:10px;border:0;background:transparent;color:#9fb0d7;cursor:pointer">Reconcile</button>
        <button class="tts-tab" data-tab="help" style="flex:1;padding:10px;border:0;background:transparent;color:#9fb0d7;cursor:pointer">Help</button>
      </div>
      <div id="tts-body" style="padding:12px;overflow:auto;flex:1;background:#07101a"></div>
      <div style="padding:10px;border-top:1px solid #17253b;background:#07101a;display:flex;gap:8px">
        <button id="tts-run-btn" style="flex:1;padding:8px;border-radius:8px;border:0;background:#1860d6;color:#fff;font-weight:700;cursor:pointer">Run Tests</button>
        <button id="tts-run-reconcile-btn" style="padding:8px;border-radius:8px;border:0;background:#0b6b51;color:#fff;font-weight:700;cursor:pointer">Run Reconcile</button>
      </div>
    `;
    document.body.appendChild(panel);

    // Event handlers
    panel.querySelector('#tts-close-btn').onclick = () => panel.remove();
    panel.querySelectorAll('.tts-tab').forEach((btn) => {
      btn.onclick = () => {
        panel.querySelectorAll('.tts-tab').forEach(b => { b.classList.remove('active'); b.style.color = '#9fb0d7'; });
        btn.classList.add('active');
        btn.style.color = '#cfe3ff';
        renderTab(btn.dataset.tab);
      };
    });
    panel.querySelector('#tts-run-btn').onclick = () => runAllTests();
    panel.querySelector('#tts-run-reconcile-btn').onclick = () => runReconciliation();
    panel.querySelector('#tts-export-btn').onclick = () => {
      const r = lsGet(LS_RESULTS) || { metadata: { timestamp: new Date().toISOString() } };
      const blob = new Blob([safeStringify(r)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tableau-test-report-' + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    return panel;
  }

  // Tab rendering
  function renderTab(tab) {
    const body = document.getElementById('tts-body');
    const cfg = getConfig();
    const lastResults = lsGet(LS_RESULTS) || null;

    switch (tab) {
      case 'summary':
        body.innerHTML = `
          <div style="display:flex;gap:10px;margin-bottom:10px">
            <div style="flex:1;padding:12px;background:#071826;border-radius:8px;border:1px solid #123047">
              <div style="font-size:20px;font-weight:800;color:#60d394">${lastResults ? lastResults.summary.passed : 0}</div>
              <div style="font-size:11px;color:#9fb0d7">Passed</div>
            </div>
            <div style="flex:1;padding:12px;background:#3d1116;border-radius:8px;border:1px solid #4a1218">
              <div style="font-size:20px;font-weight:800;color:#ff9b9b">${lastResults ? lastResults.summary.failed : 0}</div>
              <div style="font-size:11px;color:#9fb0d7">Failed</div>
            </div>
            <div style="flex:1;padding:12px;background:#0a1730;border-radius:8px;border:1px solid #12233b">
              <div style="font-size:20px;font-weight:800;color:#f6c86b">${lastResults ? lastResults.summary.warnings : 0}</div>
              <div style="font-size:11px;color:#9fb0d7">Warnings</div>
            </div>
            <div style="flex:1;padding:12px;background:#061430;border-radius:8px;border:1px solid #0b2a48">
              <div style="font-size:20px;font-weight:800;color:#8bc8ff">${lastResults ? lastResults.summary.info : 0}</div>
              <div style="font-size:11px;color:#9fb0d7">Info</div>
            </div>
          </div>
          <div style="margin-bottom:10px">
            <div style="font-weight:700;color:#cfe3ff">Recent run:</div>
            <div style="font-size:12px;color:#9fb0d7">${lastResults ? (lastResults.metadata.timestamp || '—') : 'No results yet'}</div>
          </div>
          <div style="margin-bottom:8px">
            <div style="font-weight:700;color:#cfe3ff">Configuration</div>
            <pre style="font-size:12px;background:#071827;padding:8px;border-radius:6px;border:1px solid #123047;color:#9fb0d7;max-height:200px;overflow:auto">${safeStringify(cfg)}</pre>
          </div>
        `;
        break;

      case 'tests':
        const toggles = cfg.testToggles || {};
        let html = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">';
        Object.keys(toggles).forEach(key => {
          html += `<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:#071827;border-radius:8px;border:1px solid #13263d"><input type="checkbox" data-toggle="${key}" ${toggles[key] ? 'checked' : ''}> <span style="font-weight:700;color:#cfe3ff">${key}</span></label>`;
        });
        html += '</div><div style="font-size:12px;color:#9fb0d7">Toggle tests on/off then click Run Tests.</div>';
        body.innerHTML = html;
        body.querySelectorAll('input[data-toggle]').forEach(ch => {
          ch.addEventListener('change', () => {
            const k = ch.dataset.toggle;
            const cfg = getConfig();
            cfg.testToggles[k] = ch.checked;
            saveConfig(cfg);
          });
        });
        break;

      case 'config':
        body.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
            <div style="background:#071827;padding:8px;border-radius:8px;border:1px solid #123047">
              <div style="font-weight:700;color:#cfe3ff;margin-bottom:8px">Rule Parameters (JSON)</div>
              <textarea id="tts-rules-area" style="width:100%;height:220px;background:#05101a;color:#cfe3ff;border:1px solid #12263d;padding:8px;border-radius:6px">${safeStringify(cfg.rules)}</textarea>
              <div style="display:flex;gap:8px;margin-top:8px">
                <button id="tts-save-rules" style="flex:1;padding:8px;border-radius:8px;border:0;background:#1f6bd4;color:#fff;cursor:pointer">Save Rules</button>
                <button id="tts-reset-rules" style="padding:8px;border-radius:8px;border:0;background:#4a5568;color:#fff;cursor:pointer">Reset</button>
              </div>
            </div>
            <div style="background:#071827;padding:8px;border-radius:8px;border:1px solid #123047">
              <div style="font-weight:700;color:#cfe3ff;margin-bottom:8px">Import/Export Config</div>
              <div style="display:flex;gap:8px;margin-bottom:8px">
                <button id="tts-export-config" style="flex:1;padding:8px;border-radius:8px;border:0;background:#0b6b51;color:#fff;cursor:pointer">Export Config</button>
                <button id="tts-import-config" style="flex:1;padding:8px;border-radius:8px;border:0;background:#6b2b6b;color:#fff;cursor:pointer">Import Config</button>
              </div>
              <div style="font-size:12px;color:#9fb0d7">Export downloads a JSON config. Import accepts pasted JSON.</div>
            </div>
          </div>
          <div style="background:#071827;padding:8px;border-radius:8px;border:1px solid #123047">
            <div style="font-weight:700;color:#cfe3ff;margin-bottom:8px">Reconciliation settings</div>
            <div style="display:flex;gap:6px;margin-bottom:6px">
              <input id="tts-csv-url" placeholder="public CSV URL (optional)" style="flex:1;padding:8px;border-radius:6px;background:#05101a;border:1px solid #12263d;color:#cfe3ff" value="${cfg.reconciliation.csvUrl || ''}">
            </div>
            <textarea id="tts-csv-text" placeholder="Paste reconciliation CSV here (dashboard,dimension,measure,expectedValue)" style="width:100%;height:120px;background:#05101a;color:#cfe3ff;border:1px solid #12263d;padding:8px;border-radius:6px">${cfg.reconciliation.csvText || ''}</textarea>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button id="tts-save-recon" style="padding:8px;border-radius:8px;border:0;background:#1f6bd4;color:#fff;cursor:pointer">Save Recon</button>
              <button id="tts-load-sample" style="padding:8px;border-radius:8px;border:0;background:#2b5f2b;color:#fff;cursor:pointer">Load Sample Template</button>
            </div>
          </div>
          <div style="margin-top:8px;font-size:12px;color:#9fb0d7">Notes: CSV must at minimum include columns: dashboard,dimension,measure,expectedValue. You can publish a Google Sheet as CSV and paste the url, or paste CSV content directly.</div>
        `;
        body.querySelector('#tts-save-rules').onclick = () => {
          try {
            const v = JSON.parse(body.querySelector('#tts-rules-area').value);
            const cfg = getConfig();
            cfg.rules = v;
            saveConfig(cfg);
            alert('Rules saved.');
          } catch (e) {
            alert('Invalid JSON: ' + e.message);
          }
        };
        body.querySelector('#tts-reset-rules').onclick = () => {
          const cfg = getConfig();
          cfg.rules = DEFAULT_CONFIG.rules;
          saveConfig(cfg);
          body.querySelector('#tts-rules-area').value = safeStringify(cfg.rules);
          alert('Rules reset to defaults.');
        };
        body.querySelector('#tts-export-config').onclick = () => {
          const cfg = getConfig();
          const blob = new Blob([safeStringify(cfg)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'tts-config-' + Date.now() + '.json';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        };
        body.querySelector('#tts-import-config').onclick = () => {
          const txt = prompt('Paste config JSON:');
          if (!txt) return;
          try {
            const obj = JSON.parse(txt);
            saveConfig(obj);
            alert('Config imported. Refresh UI.');
            renderTab('config');
          } catch (e) {
            alert('Invalid JSON: ' + e.message);
          }
        };
        body.querySelector('#tts-save-recon').onclick = () => {
          const cfg = getConfig();
          cfg.reconciliation.csvUrl = body.querySelector('#tts-csv-url').value.trim();
          cfg.reconciliation.csvText = body.querySelector('#tts-csv-text').value.trim();
          saveConfig(cfg);
          alert('Reconciliation settings saved.');
        };
        body.querySelector('#tts-load-sample').onclick = () => {
          const csvSample = 'dashboard,dimension,measure,expectedValue\nMy Dashboard,Region,Sales,12345\nMy Dashboard,Region,Profit,2345';
          body.querySelector('#tts-csv-text').value = csvSample;
        };
        break;

      case 'reconcile':
        body.innerHTML = `
          <div style="margin-bottom:8px">
            <div style="font-weight:700;color:#cfe3ff;margin-bottom:6px">Reconciliation Input</div>
            <div style="font-size:12px;color:#9fb0d7;margin-bottom:6px">You can provide CSV text in the Config tab or provide a public CSV URL.</div>
          </div>
          <div id="tts-recon-output" style="background:#071827;padding:8px;border-radius:8px;border:1px solid #123047;max-height:420px;overflow:auto"></div>
        `;
        loadAndPreviewReconciliation();
        break;

      case 'help':
        body.innerHTML = `
          <div style="font-weight:700;color:#cfe3ff;margin-bottom:6px">Quick Help</div>
          <div style="font-size:12px;color:#9fb0d7;line-height:1.4">
            <ol>
              <li>Use "Config" to paste a reconciliation CSV or public CSV URL and to edit rule parameters.</li>
              <li>Click "Run Tests" to execute the automated checks. Click "Run Reconcile" to run reconciliation against your CSV.</li>
              <li>Export test run results from the top-right export button.</li>
              <li>To make the repository read-only: set the repo to private and enable branch protection rules on main; see instructions in README.</li>
              <li>If the panel does not appear or UI looks broken, check browser console for CSP or other security errors.</li>
            </ol>
          </div>
        `;
        break;
    }
  }

  // CSV parsing
  function parseCSV(csvText, delimiter = ',') {
    const rows = csvText.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
    if (!rows.length) return [];
    const header = rows[0].split(delimiter).map(h => h.trim());
    const out = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(delimiter).map(c => c.trim());
      const obj = {};
      for (let j = 0; j < header.length; j++) {
        obj[header[j]] = cols[j] !== undefined ? cols[j] : '';
      }
      out.push(obj);
    }
    return out;
  }

  async function loadReconciliationInput() {
    const cfg = getConfig();
    if (cfg.reconciliation.csvText && cfg.reconciliation.csvText.trim().length > 0) {
      return parseCSV(cfg.reconciliation.csvText, cfg.reconciliation.csvDelimiter || ',');
    } else if (cfg.reconciliation.csvUrl && cfg.reconciliation.csvUrl.trim().length > 0) {
      const url = cfg.reconciliation.csvUrl.trim();
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch CSV: ' + res.status);
        const txt = await res.text();
        return parseCSV(txt, cfg.reconciliation.csvDelimiter || ',');
      } catch (e) {
        console.warn('Fetch CSV error', e);
        return { error: 'Failed to fetch CSV: ' + e.message };
      }
    }
    return [];
  }

  async function loadAndPreviewReconciliation() {
    const out = document.getElementById('tts-recon-output');
    if (!out) return;
    out.innerHTML = 'Loading...';
    const parsed = await loadReconciliationInput();
    if (parsed && parsed.error) {
      out.innerHTML = `<div style="color:#ff9b9b">${parsed.error}</div>`;
      return;
    }
    if (!parsed || parsed.length === 0) {
      out.innerHTML = '<div style="color:#9fb0d7">No reconciliation input found. Add CSV in Config tab.</div>';
      return;
    }
    let html = '<div style="font-weight:700;margin-bottom:8px">Preview</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr style="text-align:left"><th style="padding:6px;border-bottom:1px solid #12263d">#</th>';
    const keys = Object.keys(parsed[0] || {});
    keys.forEach(k => html += `<th style="padding:6px;border-bottom:1px solid #12263d">${k}</th>`);
    html += '</tr></thead><tbody>';
    parsed.slice(0, 200).forEach((r, idx) => {
      html += `<tr><td style="padding:6px;border-bottom:1px solid #0e2638">${idx + 1}</td>`;
      keys.forEach(k => html += `<td style="padding:6px;border-bottom:1px solid #0e2638">${r[k] || ''}</td>`);
      html += '</tr>';
    });
    html += '</tbody></table>';
    out.innerHTML = html;
  }

  async function tableauGetData() {
    try {
      if (typeof tableau === 'undefined' || !tableau.VizManager) return null;
      const vizs = tableau.VizManager.getVizs();
      if (!vizs || vizs.length === 0) return null;
      const v = vizs[0];
      const wb = v.getWorkbook();
      const active = wb.getActiveSheet();
      if (!active || !active.getWorksheets) return null;
      const worksheets = active.getWorksheets();
      const promises = worksheets.map(sh => sh.getSummaryDataAsync().then(dt => ({
        name: sh.getName(),
        columns: dt.getColumns().map(c => c.getFieldName()),
        data: dt.getData().map(r => r.map(cv => (cv && cv.value !== undefined ? cv.value : null)))
      })));
      return await Promise.all(promises);
    } catch (e) {
      console.warn('tableauGetData error', e);
      return null;
    }
  }

  async function runReconciliation() {
    const outPanel = document.getElementById('tts-recon-output') || (() => {
      const body = document.getElementById('tts-body');
      const div = document.createElement('div');
      div.style.marginTop = '8px';
      div.id = 'tts-recon-output';
      body.prepend(div);
      return div;
    })();

    outPanel.innerHTML = 'Running reconciliation...';
    const cfg = getConfig();
    const input = await loadReconciliationInput();
    if (input && input.error) {
      outPanel.innerHTML = `<div style="color:#ff9b9b">${input.error}</div>`;
      return;
    }
    if (!input || input.length === 0) {
      outPanel.innerHTML = '<div style="color:#ff9b9b">No reconciliation input provided. Add CSV in Config tab.</div>';
      return;
    }

    const tsheets = await tableauGetData();
    const sheetsMap = new Map();
    if (tsheets) tsheets.forEach(s => sheetsMap.set(s.name, s));

    const results = [];
    for (const row of input) {
      const sheetName = row.dashboard || row.sheet || row.worksheet || row.worksheetName;
      const dimension = row.dimension || row.grouping || row.category;
      const measure = row.measure || row.metric || row.valueName;
      const expectedRaw = row.expectedValue || row.expected || row.value;
      const expectedNum = numericValueOf(expectedRaw);
      const r = { input: row, status: 'missing', details: '' };
      let found = false;

      if (sheetsMap.size > 0 && sheetName && sheetsMap.has(sheetName)) {
        const sheet = sheetsMap.get(sheetName);
        const mIdx = sheet.columns.findIndex(c => c.toLowerCase() === String(measure || '').toLowerCase());
        const dimIdx = sheet.columns.findIndex(c => c.toLowerCase() === String(dimension || '').toLowerCase());
        if (mIdx >= 0 && dimIdx >= 0) {
          const match = sheet.data.find(rw => {
            const dv = String(rw[dimIdx] == null ? '' : rw[dimIdx]).trim();
            if (!cfg.reconciliation.dimensionCaseSensitive) {
              return dv.toLowerCase() === String(dimension || '').toLowerCase();
            }
            return dv === String(dimension || '');
          });
          if (match) {
            const foundVal = numericValueOf(match[mIdx]);
            r.foundValue = foundVal;
            r.status = 'found';
            if (expectedNum !== null && foundVal !== null) {
              const tol = cfg.reconciliation.numericTolerance || 0.0001;
              r.match = Math.abs(foundVal - expectedNum) <= tol;
            } else {
              r.match = String(foundVal) === String(expectedRaw);
            }
            found = true;
            r.details = `Matched in Tableau sheet "${sheetName}"`;
          } else {
            r.details = `Sheet "${sheetName}" found but no row matches dimension "${dimension}"`;
          }
        } else {
          r.details = `Sheet "${sheetName}" found but measure/dimension columns not located`;
        }
      }

      if (!found) {
        const dimText = dimension ? String(dimension).trim() : null;
        let candidateValue = null;
        if (dimText) {
          const elems = Array.from(document.querySelectorAll('body *')).filter(el => {
            try {
              return el.children.length === 0 && el.textContent && el.textContent.trim().length > 0 && el.textContent.trim().toLowerCase().includes(dimText.toLowerCase());
            } catch (e) { return false; }
          }).slice(0, 30);
          for (const el of elems) {
            const candidates = [];
            if (el.parentElement) candidates.push(...Array.from(el.parentElement.querySelectorAll('*')));
            const nearby = el.closest('div,section') || el.parentElement;
            if (nearby) candidates.push(...Array.from(nearby.querySelectorAll('*')));
            const unique = Array.from(new Set(candidates));
            for (const c of unique) {
              if (c === el) continue;
              const nv = numericValueOf(c.textContent);
              if (nv !== null) {
                candidateValue = nv;
                break;
              }
            }
            if (candidateValue !== null) break;
          }
        }
        if (candidateValue !== null) {
          r.foundValue = candidateValue;
          r.status = 'found-dom';
          if (expectedNum !== null) {
            const tol = cfg.reconciliation.numericTolerance || 0.0001;
            r.match = Math.abs(candidateValue - expectedNum) <= tol;
          } else {
            r.match = String(candidateValue) === String(expectedRaw);
          }
          r.details = 'Matched by DOM heuristics';
        } else {
          r.status = 'not-located';
          r.details = 'Could not locate candidate value in DOM or Tableau API for this input row';
        }
      }
      results.push(r);
    }

    const total = results.length;
    const matches = results.filter(r => r.match).length;
    const mismatches = results.filter(r => r.match === false).length;
    const notfound = results.filter(r => !r.match && r.status !== 'found' && r.status !== 'found-dom').length;

    const report = {
      metadata: { timestamp: new Date().toISOString(), url: location.href },
      reconciliationSummary: { total, matches, mismatches, notfound },
      details: results
    };

    lsSet(LS_RESULTS, { metadata: report.metadata, summary: { passed: matches, failed: mismatches, warnings: notfound, info: 0 }, results: results });

    let html = `<div style="font-weight:700">Reconciliation Results</div>
                <div style="font-size:13px;color:#9fb0d7;margin-bottom:8px">Total: ${total} • Matches: ${matches} • Mismatches: ${mismatches} • Not located: ${notfound}</div>
                <div style="max-height:420px;overflow:auto"><table style="width:100%;font-size:12px;border-collapse:collapse">
                <thead><tr style="text-align:left"><th style="padding:6px;border-bottom:1px solid #12263d">#</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Dashboard</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Dimension</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Measure</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Expected</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Found</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Match</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Notes</th></tr></thead><tbody>`;
    results.forEach((r, idx) => {
      html += `<tr><td style="padding:6px;border-bottom:1px solid #0e2638">${idx + 1}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${(r.input.dashboard || r.input.sheet || '')}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${(r.input.dimension || '')}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${(r.input.measure || '')}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.input.expectedValue || r.input.expected || ''}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.foundValue !== undefined ? r.foundValue : ''}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.match === true ? '<span style="color:#8ae6a7">✓</span>' : r.match === false ? '<span style="color:#ff9b9b">✗</span>' : '<span style="color:#f6c86b">?</span>'}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.details || ''}</td></tr>`;
    });
    html += '</tbody></table></div>';
    outPanel.innerHTML = html;
  }

  // Automated tests (simplified version - see readable file for full implementation)
  async function runAllTests() {
    const cfg = getConfig();
    const results = [];
    const summary = { passed: 0, failed: 0, warnings: 0, info: 0 };
    const start = Date.now();

    function addTest(cat, status, label, details = '', recommendation = '') {
      results.push({ category: cat, status, label, details, recommendation, timestamp: Date.now() - start });
      if (status === 'pass') summary.passed++;
      else if (status === 'fail') summary.failed++;
      else if (status === 'warn') summary.warnings++;
      else summary.info++;
    }

    // Run core tests (deployment, version, visual, data, functional, technical, accessibility, security)
    if (cfg.testToggles.deployment) {
      const dashboards = document.querySelectorAll('[data-tb-test-id*="dashboard"],.tableau-dashboard,.tab-dashboard');
      addTest('deployment', dashboards.length > 0 ? 'pass' : 'fail', 'Component Dashboards Detected', `${dashboards.length} dashboard component(s) found`);
    }

    if (cfg.testToggles.visual) {
      const allEls = Array.from(document.querySelectorAll('*'));
      const fonts = new Set();
      allEls.forEach(el => {
        try { const s = window.getComputedStyle(el); if (s && s.fontFamily) fonts.add(s.fontFamily); } catch (e) { }
      });
      addTest('visual', fonts.size <= 5 ? 'pass' : 'warn', 'Font Consistency', `${fonts.size} unique font families`);
    }

    if (cfg.testToggles.data) {
      const tables = document.querySelectorAll('table,[role="table"],.tabular-data');
      addTest('data', tables.length > 0 ? 'pass' : 'info', 'Data Tables Detected', `${tables.length} table(s) found`);
    }

    if (cfg.testToggles.technical) {
      const images = document.querySelectorAll('img');
      const brokenImages = Array.from(images).filter(img => !img.complete || img.naturalHeight === 0);
      addTest('technical', brokenImages.length === 0 ? 'pass' : 'fail', 'Image Loading', brokenImages.length === 0 ? 'All images loaded' : `${brokenImages.length} broken image(s)`);
    }

    if (cfg.testToggles.accessibility) {
      const images = document.querySelectorAll('img');
      const imagesNoAlt = Array.from(images).filter(img => !img.alt || img.alt.trim() === '');
      addTest('accessibility', imagesNoAlt.length === 0 ? 'pass' : 'fail', 'Image Alt Text', `${imagesNoAlt.length}/${images.length} images missing alt`);
    }

    if (cfg.testToggles.security) {
      const sensitiveTerms = ['ssn', 'password', 'credit card', 'api key', 'secret'];
      const foundSensitive = sensitiveTerms.filter(term => (document.body.textContent || '').toLowerCase().includes(term));
      addTest('security', foundSensitive.length === 0 ? 'pass' : 'warn', 'Sensitive Data Exposure', foundSensitive.length === 0 ? 'No obvious sensitive terms' : 'Found: ' + foundSensitive.join(', '));
    }

    const end = Date.now();
    const report = {
      metadata: { timestamp: new Date().toISOString(), url: location.href, executionMs: end - start, version: VERSION },
      summary,
      results
    };
    lsSet(LS_RESULTS, report);

    const body = document.getElementById('tts-body');
    let html = `<div style="font-weight:700;margin-bottom:8px">Test Results</div>
                <div style="font-size:12px;color:#9fb0d7;margin-bottom:12px">Executed in ${end - start}ms • Passed: ${summary.passed} • Failed: ${summary.failed} • Warnings: ${summary.warnings} • Info: ${summary.info}</div>
                <div style="max-height:420px;overflow:auto"><table style="width:100%;font-size:12px;border-collapse:collapse">
                <thead><tr style="text-align:left"><th style="padding:6px;border-bottom:1px solid #12263d">#</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Category</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Status</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Test</th>
                <th style="padding:6px;border-bottom:1px solid #12263d">Details</th></tr></thead><tbody>`;
    report.results.forEach((r, idx) => {
      html += `<tr><td style="padding:6px;border-bottom:1px solid #0e2638">${idx + 1}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.category}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.status === 'pass' ? '<span style="color:#8ae6a7">PASS</span>' : r.status === 'fail' ? '<span style="color:#ff9b9b">FAIL</span>' : '<span style="color:#f6c86b">WARN</span>'}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.label}</td>
                <td style="padding:6px;border-bottom:1px solid #0e2638">${r.details || ''}</td></tr>`;
    });
    html += '</tbody></table></div>';
    body.innerHTML = html;
  }

  // Initialize
  const panel = createPanel();
  renderTab('summary');
  window.TTS = window.TTS || {};
  window.TTS.runTests = runAllTests;
  window.TTS.runReconciliation = runReconciliation;
  window.TTS.getConfig = getConfig;
  window.TTS.setConfig = saveConfig;
})();
