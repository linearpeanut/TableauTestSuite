(function(){ 
  // Tableau Test Suite - Readable Vanilla JS Bookmarklet
  // Supports CSV and XLSX config input, reconciliation, custom rules, JSON export
  // Version: 0.1.0
  // Storage key
  const STORAGE_KEY = 'tts:config';

  // Default config structure
  const defaultState = {
    version: '0.1.0',
    configRows: [], // {dashboard,dimension,measure,expectedValue,tolerance}
    rules: {
      enableVisualChecks: true,
      enableDataChecks: true,
      toleranceDefaultPct: 0.5
    },
    lastReport: null
  };

  // Utilities
  function $(sel, root=document) { return root.querySelector(sel); }
  function $all(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }
  function fmt(num) { return (Number.isFinite(num) ? Number(num).toLocaleString() : String(num)); }
  function parseNumber(str) {
    if (str == null) return NaN;
    const cleaned = String(str).replace(/[^0-9.\-eE,+]/g,'').replace(/,/g,'');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : NaN;
  }

  // Storage
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultState));
      const obj = JSON.parse(raw);
      return Object.assign(JSON.parse(JSON.stringify(defaultState)), obj);
    } catch (e) {
      console.warn('tts: failed to load state', e);
      return JSON.parse(JSON.stringify(defaultState));
    }
  }
  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('tts: failed to save state', e);
    }
  }

  // CSV parsing (simple)
  function parseCSV(text) {
    const lines = text.split(/\r?\n/).filter(l=>l.trim()!=='');
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h=>h.trim());
    const rows = [];
    for (let i=1;i<lines.length;i++){
      const cols = lines[i].split(',').map(c=>c.trim());
      if (cols.length === 0) continue;
      const obj = {};
      for (let j=0;j<headers.length;j++){
        obj[headers[j]] = cols[j] !== undefined ? cols[j] : '';
      }
      rows.push(obj);
    }
    return rows;
  }

  // XLSX loading (dynamically load SheetJS). Returns Promise that resolves to array of row objects.
  function loadXLSXFile(file) {
    return new Promise((resolve,reject)=>{
      function proceed() {
        try {
          const reader = new FileReader();
          reader.onload = (e)=>{
            const data = e.target.result;
            const workbook = XLSX.read(data, {type: 'binary'});
            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, {defval:''});
            resolve(rows);
          };
          reader.onerror = (err)=>reject(err);
          reader.readAsBinaryString(file);
        } catch (err) { reject(err); }
      }

      if (window.XLSX) {
        proceed();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
        script.onload = () => {
          setTimeout(proceed,50);
        };
        script.onerror = (e)=>reject(new Error('Failed to load XLSX library: '+e));
        document.head.appendChild(script);
      }
    });
  }

  // UI creation
  function createPanel() {
    const existing = document.getElementById('tts-panel');
    if (existing) {
      existing.style.display = 'block';
      existing.style.zIndex = 9999999;
      return existing;
    }

    const panel = document.createElement('div');
    panel.id = 'tts-panel';
    panel.style.position = 'fixed';
    panel.style.right = '10px';
    panel.style.top = '10px';
    panel.style.width = '420px';
    panel.style.maxHeight = '80vh';
    panel.style.overflow = 'auto';
    panel.style.background = '#fff';
    panel.style.border = '1px solid #ccc';
    panel.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.fontSize = '13px';
    panel.style.color = '#222';
    panel.style.zIndex = 9999999;
    panel.style.padding = '8px';
    panel.style.borderRadius = '6px';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.innerHTML = `<strong>Tableau Test Suite</strong> <span id="tts-version" style="color:#666;font-size:12px"></span>`;
    panel.appendChild(header);

    const close = document.createElement('button');
    close.textContent = '×';
    close.title = 'Close panel';
    close.style.border = 'none';
    close.style.background = 'transparent';
    close.style.cursor = 'pointer';
    close.style.fontSize = '20px';
    close.style.lineHeight = '1';
    close.onclick = ()=>panel.remove();
    header.appendChild(close);

    const tabs = document.createElement('div');
    tabs.style.display = 'flex';
    tabs.style.marginTop = '8px';
    tabs.style.gap = '6px';
    panel.appendChild(tabs);

    const tabNames = ['Run','Config','Rules','Reconcile','Report','Help'];
    const tabButtons = {};
    const tabContents = {};
    const contentWrap = document.createElement('div');
    contentWrap.style.marginTop = '10px';
    panel.appendChild(contentWrap);

    function makeTab(name, renderFn) {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.style.padding = '6px 8px';
      btn.style.border = '1px solid #ddd';
      btn.style.background = '#f9f9f9';
      btn.style.cursor = 'pointer';
      btn.onclick = ()=>activateTab(name);
      tabs.appendChild(btn);
      tabButtons[name] = btn;

      const cont = document.createElement('div');
      cont.style.display = 'none';
      cont.style.padding = '6px 2px';
      tabContents[name] = cont;
      renderFn(cont);
      contentWrap.appendChild(cont);
    }

    function activateTab(name) {
      for (const n of tabNames) {
        tabContents[n].style.display = 'none';
        tabButtons[n].style.background = '#f9f9f9';
      }
      tabContents[name].style.display = 'block';
      tabButtons[name].style.background = '#fff';
    }

    let state = loadState();
    $('#tts-version', panel)&&($('#tts-version', panel).textContent = state.version);

    // Run tab
    makeTab('Run', (root)=>{
      const runBtn = document.createElement('button');
      runBtn.textContent = 'Run All Tests';
      runBtn.style.padding = '8px';
      runBtn.style.marginBottom = '8px';
      runBtn.onclick = async ()=>{
        root.querySelectorAll('.tts-output').forEach(n=>n.remove());
        const out = document.createElement('div');
        out.className = 'tts-output';
        out.innerHTML = '<em>Running tests...</em>';
        root.appendChild(out);
        try {
          const report = await runAllTests(state);
          state.lastReport = report;
          saveState(state);
          out.innerHTML = `<strong>Completed:</strong> ${report.summary.summaryText}`;
        } catch (e) {
          out.innerHTML = `<strong>Error:</strong> ${e.message}`;
        }
      };
      root.appendChild(runBtn);

      const runReconcileBtn = document.createElement('button');
      runReconcileBtn.textContent = 'Run Reconciliation Only';
      runReconcileBtn.style.marginLeft = '8px';
      runReconcileBtn.onclick = async ()=>{
        root.querySelectorAll('.tts-output').forEach(n=>n.remove());
        const out = document.createElement('div');
        out.className = 'tts-output';
        out.innerHTML = '<em>Running reconcile...</em>';
        root.appendChild(out);
        try {
          const recon = await reconcileDashboardWithConfig(state);
          state.lastReport = {reconcile: recon, timestamp: new Date().toISOString()};
          saveState(state);
          out.innerHTML = `<strong>Reconcile completed:</strong> ${recon.matches}/${recon.total} matches`;
        } catch (e) {
          out.innerHTML = `<strong>Error:</strong> ${e.message}`;
        }
      };
      root.appendChild(runReconcileBtn);

      const exportBtn = document.createElement('button');
      exportBtn.textContent = 'Export Last Report';
      exportBtn.style.marginLeft = '8px';
      exportBtn.onclick = ()=> {
        if (!state.lastReport) { alert('No report available'); return; }
        downloadJSON(state.lastReport, `tts-report-${(new Date()).toISOString().replace(/[:.]/g,'-')}.json`);
      };
      root.appendChild(exportBtn);
    });

    // Config tab
    makeTab('Config', (root)=>{
      const info = document.createElement('div');
      info.innerHTML = `<div style="margin-bottom:6px">Import reconciliation configuration (CSV or XLSX). Required columns: dashboard,dimension,measure,expectedValue [optional: tolerancePct]</div>`;
      root.appendChild(info);

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv, .xlsx, .xls';
      root.appendChild(fileInput);

      const pasteArea = document.createElement('textarea');
      pasteArea.placeholder = 'Or paste CSV contents here';
      pasteArea.style.width = '100%';
      pasteArea.style.height = '120px';
      pasteArea.style.marginTop = '6px';
      root.appendChild(pasteArea);

      const importBtn = document.createElement('button');
      importBtn.textContent = 'Import';
      importBtn.style.marginTop = '6px';
      importBtn.onclick = async ()=>{
        try {
          if (fileInput.files && fileInput.files.length>0) {
            const file = fileInput.files[0];
            if (file.name.toLowerCase().endsWith('.csv')) {
              const text = await file.text();
              const rows = parseCSV(text);
              state.configRows = normalizeConfigRows(rows);
              saveState(state);
              renderConfigTable();
              alert('Imported CSV file with '+state.configRows.length+' rows');
            } else {
              const rows = await loadXLSXFile(file);
              state.configRows = normalizeConfigRows(rows);
              saveState(state);
              renderConfigTable();
              alert('Imported XLSX file with '+state.configRows.length+' rows');
            }
          } else if (pasteArea.value.trim()!=='') {
            const rows = parseCSV(pasteArea.value);
            state.configRows = normalizeConfigRows(rows);
            saveState(state);
            renderConfigTable();
            alert('Imported pasted CSV with '+state.configRows.length+' rows');
          } else {
            alert('No input provided');
          }
        } catch (e) {
          alert('Import failed: '+e.message);
        }
      };
      root.appendChild(importBtn);

      const clearBtn = document.createElement('button');
      clearBtn.textContent = 'Clear Config';
      clearBtn.style.marginLeft = '8px';
      clearBtn.onclick = ()=>{
        if (!confirm('Clear all config rows?')) return;
        state.configRows = [];
        saveState(state);
        renderConfigTable();
      };
      root.appendChild(clearBtn);

      const tableWrap = document.createElement('div');
      tableWrap.style.marginTop = '10px';
      tableWrap.style.maxHeight = '300px';
      tableWrap.style.overflow = 'auto';
      root.appendChild(tableWrap);

      function normalizeConfigRows(rows) {
        return rows.map(r=>{
          return {
            dashboard: (r.dashboard||r.Dashboard||r['Dashboard Name']||'').trim(),
            dimension: (r.dimension||r.Dimension||r['Dimension']||'').trim(),
            measure: (r.measure||r.Measure||r['Measure']||'').trim(),
            expectedValue: (r.expectedValue||r.ExpectedValue||r.Expected||r['Expected Value']||'').toString().trim(),
            tolerancePct: (r.tolerancePct||r.tolerance||r.Tolerance||'').toString().trim()
          };
        });
      }

      function renderConfigTable() {
        tableWrap.innerHTML = '';
        if (!state.configRows || state.configRows.length===0) {
          tableWrap.innerHTML = '<em>No config rows</em>';
          return;
        }
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        const thead = document.createElement('thead');
        thead.innerHTML = '<tr><th style="text-align:left">Dashboard</th><th style="text-align:left">Dimension</th><th style="text-align:left">Measure</th><th style="text-align:left">Expected</th><th style="text-align:left">Tol %</th><th></th></tr>';
        table.appendChild(thead);
        const tbody = document.createElement('tbody');
        state.configRows.forEach((r, idx)=>{
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${escapeHTML(r.dashboard)}</td><td>${escapeHTML(r.dimension)}</td><td>${escapeHTML(r.measure)}</td><td>${escapeHTML(r.expectedValue)}</td><td>${escapeHTML(r.tolerancePct||'')}</td><td></td>`;
          const del = document.createElement('button');
          del.textContent = 'Delete';
          del.onclick = ()=>{
            if (!confirm('Delete this row?')) return;
            state.configRows.splice(idx,1);
            saveState(state);
            renderConfigTable();
          };
          tr.children[5].appendChild(del);
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        tableWrap.appendChild(table);
      }

      renderConfigTable();
    });

    // Rules tab
    makeTab('Rules', (root)=>{
      const info = document.createElement('div');
      info.innerHTML = 'Edit JSON rules for the tests (be careful).';
      root.appendChild(info);

      const ta = document.createElement('textarea');
      ta.style.width = '100%';
      ta.style.height = '200px';
      ta.value = JSON.stringify(state.rules, null, 2);
      root.appendChild(ta);

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save Rules';
      saveBtn.onclick = ()=>{
        try {
          const parsed = JSON.parse(ta.value);
          state.rules = parsed;
          saveState(state);
          alert('Rules saved');
        } catch (e) {
          alert('Invalid JSON: '+e.message);
        }
      };
      root.appendChild(saveBtn);
    });

    // Reconcile tab
    makeTab('Reconcile', (root)=>{
      const info = document.createElement('div');
      info.innerHTML = 'Run reconciliation between dashboard values and configuration.';
      root.appendChild(info);

      const runBtn = document.createElement('button');
      runBtn.textContent = 'Run Reconcile';
      runBtn.onclick = async ()=>{
        root.querySelectorAll('.tts-recon').forEach(n=>n.remove());
        const out = document.createElement('div');
        out.className = 'tts-recon';
        out.innerHTML = '<em>Reconciling...</em>';
        root.appendChild(out);
        try {
          const res = await reconcileDashboardWithConfig(state);
          state.lastReport = {reconcile: res, timestamp: new Date().toISOString()};
          saveState(state);
          out.innerHTML = `<strong>Completed:</strong> ${res.matches}/${res.total} matches<br>`;
          const list = document.createElement('div');
          list.style.maxHeight = '220px';
          list.style.overflow = 'auto';
          list.style.marginTop = '8px';
          for (const item of res.details) {
            const div = document.createElement('div');
            div.style.borderBottom = '1px solid #eee';
            div.style.padding = '6px 0';
            div.innerHTML = `<b>${escapeHTML(item.dashboard)}</b> / ${escapeHTML(item.dimension)} / ${escapeHTML(item.measure)} => expected: ${escapeHTML(item.expected)} actual: ${escapeHTML(item.actualText)} status: <strong>${item.status}</strong>`;
            list.appendChild(div);
          }
          out.appendChild(list);
        } catch (e) {
          out.innerHTML = `<strong>Error:</strong> ${e.message}`;
        }
      };
      root.appendChild(runBtn);
    });

    // Report tab
    makeTab('Report', (root)=>{
      const info = document.createElement('div');
      info.innerHTML = 'Export last result as JSON report for audits.';
      root.appendChild(info);

      const viewBtn = document.createElement('button');
      viewBtn.textContent = 'View Last Report';
      viewBtn.onclick = ()=>{
        root.querySelectorAll('.tts-report-viewer').forEach(n=>n.remove());
        const wrap = document.createElement('div');
        wrap.className = 'tts-report-viewer';
        wrap.style.maxHeight = '380px';
        wrap.style.overflow = 'auto';
        wrap.style.marginTop = '8px';
        wrap.style.whiteSpace = 'pre-wrap';
        wrap.style.background = '#fafafa';
        wrap.style.border = '1px solid #efefef';
        wrap.style.padding = '8px';
        if (!state.lastReport) wrap.textContent = 'No report';
        else wrap.textContent = JSON.stringify(state.lastReport, null, 2);
        root.appendChild(wrap);
      };
      root.appendChild(viewBtn);

      const exportBtn = document.createElement('button');
      exportBtn.textContent = 'Export JSON';
      exportBtn.style.marginLeft = '8px';
      exportBtn.onclick = ()=>{
        if (!state.lastReport) { alert('No report to export'); return; }
        downloadJSON(state.lastReport, `tts-report-${(new Date()).toISOString().replace(/[:.]/g,'-')}.json`);
      };
      root.appendChild(exportBtn);
    });

    // Help tab
    makeTab('Help', (root)=>{
      root.innerHTML = `<div>
        <strong>Usage</strong>
        <ul>
          <li>Install bookmarklet (paste minified script into bookmark URL).</li>
          <li>Open a Tableau dashboard and click the bookmark.</li>
          <li>Use Config tab to import reconciliation CSV/XLSX.</li>
          <li>Run Reconcile to compare dashboard values to expected ones.</li>
          <li>Edit Rules to toggle test categories and tolerances.</li>
        </ul>
        <strong>CSV Template</strong>
        <pre>dashboard,dimension,measure,expectedValue,tolerancePct</pre>
        </div>`;
    });

    document.body.appendChild(panel);
    activateTab('Run');
    return panel;
  }

  function escapeHTML(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  async function extractValueFor(dashboardName, dimension, measure) {
    try {
      if (window.tableau && typeof window.tableau.Viz === 'function') {
        const vizs = document.querySelectorAll('object,iframe,div#tableauViz,div.tableauViz,div.vizContainer');
        if (vizs.length > 0 && window.tableau.VizManager && window.tableau.VizManager.getVizs) {
          const vizsArr = window.tableau.VizManager.getVizs();
          for (const v of vizsArr) {
            try {
              const sheet = v.getWorkbook().getActiveSheet();
            } catch (e) {}
          }
        }
      }
    } catch (e) {}

    const candidates = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, null, false);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.tagName && ['SCRIPT','STYLE','NOSCRIPT','IFRAME','OBJECT'].includes(node.tagName)) continue;
      try {
        const txt = node.innerText || node.textContent || '';
        if (!txt) continue;
        if (dimension && measure && txt.toLowerCase().includes(dimension.toLowerCase()) && txt.toLowerCase().includes(measure.toLowerCase())) {
          candidates.push({node,txt});
          continue;
        }
        if (dimension && txt.toLowerCase().includes(dimension.toLowerCase())) {
          const numeric = findNumericNear(node);
          if (numeric) candidates.push({node:numeric.node,txt:numeric.text});
        }
        if (measure && txt.toLowerCase().includes(measure.toLowerCase())) {
          const numeric = findNumericNear(node);
          if (numeric) candidates.push({node:numeric.node,txt:numeric.text});
        }
      } catch (e) {}
      if (candidates.length >= 8) break;
    }

    if (candidates.length===0) {
      const numNodes = Array.from(document.querySelectorAll('span,div,td,th')).filter(n=>/\d/.test(n.innerText||n.textContent||''));
      for (const n of numNodes) {
        const context = (n.previousElementSibling && (n.previousElementSibling.innerText||'') ) || (n.parentElement && (n.parentElement.innerText||''));
        if (context && (context.toLowerCase().includes(measure.toLowerCase()) || context.toLowerCase().includes(dimension.toLowerCase()))) {
          candidates.push({node:n, txt: n.innerText||n.textContent||''});
        }
        if (candidates.length>5) break;
      }
    }

    for (const c of candidates) {
      const val = parseNumber(c.node.innerText || c.node.textContent || c.txt);
      if (Number.isFinite(val)) {
        return {value: val, element: c.node, actualText: (c.node.innerText||c.node.textContent||'').trim()};
      }
    }
    return {value: NaN, element: null, actualText: ''};
  }

  function findNumericNear(node) {
    const checks = [];
    checks.push(node);
    checks.push(...Array.from(node.children||[]));
    if (node.nextElementSibling) checks.push(node.nextElementSibling);
    if (node.previousElementSibling) checks.push(node.previousElementSibling);
    if (node.parentElement) {
      checks.push(node.parentElement);
      checks.push(...Array.from(node.parentElement.children||[]));
    }
    for (const n of checks) {
      const txt = (n.innerText||n.textContent||'').trim();
      if (!txt) continue;
      if (/\d/.test(txt)) {
        const num = parseNumber(txt);
        if (Number.isFinite(num)) return {node:n, text:txt};
      }
    }
    return null;
  }

  async function reconcileDashboardWithConfig(state) {
    const rows = state.configRows || [];
    const details = [];
    let matches = 0;
    for (const r of rows) {
      const dash = r.dashboard || detectDashboardName();
      const dimension = r.dimension || '';
      const measure = r.measure || '';
      const expectedRaw = r.expectedValue;
      const expectedNum = parseNumber(expectedRaw);
      const tolerancePct = (r.tolerancePct && !isNaN(parseFloat(r.tolerancePct))) ? parseFloat(r.tolerancePct) : (state.rules && state.rules.toleranceDefaultPct ? state.rules.toleranceDefaultPct : 0.5);
      const extracted = await extractValueFor(dash, dimension, measure);
      const actual = extracted.value;
      let status = 'NOT_FOUND';
      if (Number.isFinite(actual) && Number.isFinite(expectedNum)) {
        const diff = Math.abs(actual - expectedNum);
        const pct = (expectedNum === 0 ? (diff === 0 ? 0 : 100) : (diff / Math.abs(expectedNum) * 100));
        const pass = pct <= Number(tolerancePct);
        status = pass ? 'MATCH' : 'MISMATCH';
        if (pass) matches++;
      } else if (!Number.isFinite(actual)) {
        status = 'NOT_FOUND';
      } else if (!Number.isFinite(expectedNum)) {
        status = 'INVALID_EXPECTED';
      }
      details.push({
        dashboard: dash,
        dimension,
        measure,
        expected: expectedRaw,
        expectedNum: Number.isFinite(expectedNum) ? expectedNum : null,
        actual: Number.isFinite(actual) ? actual : null,
        actualText: extracted.actualText || '',
        tolerancePct,
        status
      });
    }
    return {total: rows.length, matches, details, timestamp: new Date().toISOString()};
  }

  function detectDashboardName() {
    const title = document.title || '';
    if (title) return title;
    const h1 = document.querySelector('h1, h2, .dashboardTitle, .title');
    if (h1) return (h1.innerText||h1.textContent||'').trim();
    return 'unknown';
  }

  async function runAllTests(state) {
    const recon = await reconcileDashboardWithConfig(state);
    const summary = {
      summaryText: `${recon.matches}/${recon.total} reconciliation matches`,
      totalChecks: recon.total,
      passed: recon.matches,
      failed: recon.total - recon.matches
    };
    const report = {
      generatedAt: new Date().toISOString(),
      summary,
      reconcile: recon,
      rules: state.rules,
      version: state.version
    };
    return {summary, report, raw: report};
  }

  function downloadJSON(obj, filename) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'tts-report.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  }

  createPanel();
})();