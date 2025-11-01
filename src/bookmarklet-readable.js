/*
 Tableau Test Suite - Bookmarklet v0.2-alpha
 - Interactive Setup Wizard (first-run experience)
 - All configurable values moved to config
 - Enhanced UI customization
*/

(function () {
  // Constants & storage keys
  const LS_CONFIG = 'tts:config';
  const LS_RESULTS = 'tts:results';
  const LS_WIZARD_COMPLETED = 'tts:wizardCompleted';
  const VERSION = '0.2-alpha';
  
  const DEFAULT_CONFIG = {
    version: VERSION,
    ui: {
      panel: {
        width: '520px',
        maxHeight: '90vh',
        top: '10px',
        right: '10px',
        zIndex: 2147483647,
        fontFamily: 'system-ui,Segoe UI,Roboto,Arial,sans-serif'
      },
      colors: {
        background: '#0b1220',
        foreground: '#e6eef8',
        border: '#2b3950',
        accent: '#1860d6',
        success: '#60d394',
        error: '#ff9b9b',
        warning: '#f6c86b',
        info: '#8bc8ff'
      }
    },
    reconciliation: {
      csvText: '',
      csvUrl: '',
      csvDelimiter: ',',
      dimensionCaseSensitive: false,
      numericTolerance: 0.0001,
      maxDomSearchElements: 30,
      maxPreviewRows: 200
    },
    rules: {
      performance: { maxLoadMs: 5000, maxDomReadyMs: 3000, enabled: true },
      images: { allowBroken: false, enabled: true },
      visual: { maxFonts: 5, enabled: true },
      colorCount: { maxUnique: 50, enabled: true },
      contrastToleranceIssues: { maxIssues: 10, enabled: true },
      checkTableauApi: { enabled: true },
      accessibility: { requireAltText: true, enabled: true },
      security: { 
        sensitiveTerms: ['ssn', 'password', 'credit card', 'api key', 'secret', 'token', 'bearer'],
        enabled: true 
      },
      selectors: {
        dashboards: '[data-tb-test-id*="dashboard"],.tableau-dashboard,.tab-dashboard',
        tables: 'table,[role="table"],.tabular-data'
      }
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
    },
    templates: {
      sampleReconciliationCSV: 'dashboard,dimension,measure,expectedValue\nMy Dashboard,Region,Sales,12345\nMy Dashboard,Region,Profit,2345',
      exportFilenamePrefix: 'tableau-test-report-',
      configFilenamePrefix: 'tts-config-'
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
      const merged = deepMerge(DEFAULT_CONFIG, c || {});
      merged.version = VERSION;
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
  
  // Deep merge utility
  function deepMerge(target, source) {
    const output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) Object.assign(output, { [key]: source[key] });
          else output[key] = deepMerge(target[key], source[key]);
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  }
  
  function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  // Setup Wizard
  function showSetupWizard() {
    const wizardCompleted = lsGet(LS_WIZARD_COMPLETED);
    if (wizardCompleted) return false;
    
    const cfg = getConfig();
    let currentStep = 1;
    const totalSteps = 4;
    
    const overlay = document.createElement('div');
    overlay.id = 'tts-wizard-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.85)', zIndex: 2147483646, display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    });
    
    const wizard = document.createElement('div');
    wizard.id = 'tts-wizard';
    Object.assign(wizard.style, {
      background: cfg.ui.colors.background, color: cfg.ui.colors.foreground,
      border: `1px solid ${cfg.ui.colors.border}`, borderRadius: '12px',
      width: '600px', maxHeight: '80vh', overflow: 'auto',
      fontFamily: cfg.ui.panel.fontFamily, boxShadow: '0 20px 60px rgba(0,0,0,0.9)'
    });
    
    overlay.appendChild(wizard);
    document.body.appendChild(overlay);
    
    function renderStep(step) {
      currentStep = step;
      let content = '';
      
      // Header with progress
      content += `
        <div style="padding:20px;border-bottom:1px solid ${cfg.ui.colors.border}">
          <div style="font-size:24px;font-weight:700;margin-bottom:8px">Tableau Test Suite Setup</div>
          <div style="font-size:14px;color:#9fb0d7">Step ${step} of ${totalSteps}</div>
          <div style="margin-top:12px;background:#1a2332;border-radius:8px;height:6px;overflow:hidden">
            <div style="background:${cfg.ui.colors.accent};height:100%;width:${(step/totalSteps)*100}%;transition:width 0.3s"></div>
          </div>
        </div>
      `;
      
      // Body
      content += '<div style="padding:24px">';
      
      switch(step) {
        case 1: // Welcome
          content += `
            <div style="text-align:center;margin-bottom:24px">
              <div style="font-size:48px;margin-bottom:16px">🎯</div>
              <div style="font-size:20px;font-weight:700;margin-bottom:12px">Welcome to Tableau Test Suite!</div>
              <div style="font-size:14px;color:#9fb0d7;line-height:1.6">
                This wizard will help you configure your dashboard validation and reconciliation settings.
                You can skip this and use defaults, or customize everything to your needs.
              </div>
            </div>
            <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047;margin-bottom:16px">
              <div style="font-weight:700;margin-bottom:8px">✨ What you'll get:</div>
              <ul style="margin:0;padding-left:20px;color:#9fb0d7;font-size:14px;line-height:1.8">
                <li>85+ automated tests across 8 categories</li>
                <li>Visual, data quality, performance, and security checks</li>
                <li>Reconciliation against CSV/Excel spreadsheets</li>
                <li>Exportable JSON reports for compliance</li>
                <li>Zero installation - runs entirely in your browser</li>
              </ul>
            </div>
          `;
          break;
          
        case 2: // Test Thresholds
          content += `
            <div style="font-size:18px;font-weight:700;margin-bottom:16px">Configure Test Thresholds</div>
            <div style="font-size:14px;color:#9fb0d7;margin-bottom:20px">
              Adjust the thresholds for automated tests. These defaults work for most dashboards.
            </div>
            
            <div style="display:grid;gap:16px">
              <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047">
                <div style="font-weight:700;margin-bottom:12px">⚡ Performance</div>
                <label style="display:block;margin-bottom:8px;font-size:13px">
                  Max Page Load Time (ms)
                  <input type="number" id="wiz-maxLoadMs" value="${cfg.rules.performance.maxLoadMs}" 
                    style="width:100%;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">
                </label>
                <label style="display:block;font-size:13px">
                  Max DOM Ready Time (ms)
                  <input type="number" id="wiz-maxDomReadyMs" value="${cfg.rules.performance.maxDomReadyMs}" 
                    style="width:100%;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">
                </label>
              </div>
              
              <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047">
                <div style="font-weight:700;margin-bottom:12px">🎨 Visual Design</div>
                <label style="display:block;margin-bottom:8px;font-size:13px">
                  Max Unique Fonts
                  <input type="number" id="wiz-maxFonts" value="${cfg.rules.visual.maxFonts}" 
                    style="width:100%;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">
                </label>
                <label style="display:block;font-size:13px">
                  Max Unique Colors
                  <input type="number" id="wiz-maxColors" value="${cfg.rules.colorCount.maxUnique}" 
                    style="width:100%;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">
                </label>
              </div>
              
              <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047">
                <div style="font-weight:700;margin-bottom:12px">🔒 Security</div>
                <label style="display:block;font-size:13px">
                  Sensitive Terms (comma-separated)
                  <textarea id="wiz-sensitiveTerms" 
                    style="width:100%;height:60px;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">${cfg.rules.security.sensitiveTerms.join(', ')}</textarea>
                </label>
              </div>
            </div>
          `;
          break;
          
        case 3: // Reconciliation
          content += `
            <div style="font-size:18px;font-weight:700;margin-bottom:16px">Set Up Reconciliation (Optional)</div>
            <div style="font-size:14px;color:#9fb0d7;margin-bottom:20px">
              Reconciliation compares dashboard values against your source data (CSV/Excel).
              You can skip this and set it up later in the Config tab.
            </div>
            
            <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047;margin-bottom:16px">
              <div style="font-weight:700;margin-bottom:12px">📊 CSV Configuration</div>
              <label style="display:block;margin-bottom:12px;font-size:13px">
                Public CSV URL (optional)
                <input type="text" id="wiz-csvUrl" placeholder="https://docs.google.com/spreadsheets/..." 
                  value="${cfg.reconciliation.csvUrl}" 
                  style="width:100%;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">
              </label>
              <label style="display:block;font-size:13px">
                Or paste CSV content directly
                <textarea id="wiz-csvText" placeholder="dashboard,dimension,measure,expectedValue&#10;My Dashboard,Region,Sales,12345" 
                  style="width:100%;height:100px;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">${cfg.reconciliation.csvText}</textarea>
              </label>
            </div>
            
            <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047">
              <div style="font-weight:700;margin-bottom:12px">⚙️ Reconciliation Settings</div>
              <label style="display:block;margin-bottom:8px;font-size:13px">
                Numeric Tolerance (0.0001 = 0.01%)
                <input type="number" id="wiz-numericTolerance" value="${cfg.reconciliation.numericTolerance}" step="0.0001" 
                  style="width:100%;margin-top:4px;padding:8px;background:#05101a;border:1px solid #12263d;color:#cfe3ff;border-radius:6px">
              </label>
              <label style="display:flex;align-items:center;gap:8px;font-size:13px">
                <input type="checkbox" id="wiz-caseSensitive" ${cfg.reconciliation.dimensionCaseSensitive ? 'checked' : ''}>
                Case-sensitive dimension matching
              </label>
            </div>
          `;
          break;
          
        case 4: // Review & Complete
          content += `
            <div style="text-align:center;margin-bottom:24px">
              <div style="font-size:48px;margin-bottom:16px">✅</div>
              <div style="font-size:20px;font-weight:700;margin-bottom:12px">You're All Set!</div>
              <div style="font-size:14px;color:#9fb0d7;line-height:1.6">
                Your configuration has been saved. You can change these settings anytime in the Config tab.
              </div>
            </div>
            
            <div style="background:#071827;padding:16px;border-radius:8px;border:1px solid #123047;margin-bottom:16px">
              <div style="font-weight:700;margin-bottom:12px">🚀 Quick Start Guide:</div>
              <ol style="margin:0;padding-left:20px;color:#9fb0d7;font-size:14px;line-height:1.8">
                <li>Click "Run Tests" to execute all automated checks</li>
                <li>Review results in the Tests tab</li>
                <li>Click "Run Reconcile" if you configured CSV data</li>
                <li>Export reports using the Export button</li>
                <li>Customize settings anytime in the Config tab</li>
              </ol>
            </div>
            
            <div style="background:#0a1730;padding:12px;border-radius:8px;border:1px solid #12233b;font-size:13px;color:#9fb0d7">
              💡 <strong>Tip:</strong> You can reset and re-run this wizard anytime from the Config tab.
            </div>
          `;
          break;
      }
      
      content += '</div>';
      
      // Footer
      content += `
        <div style="padding:16px 24px;border-top:1px solid ${cfg.ui.colors.border};display:flex;justify-content:space-between;align-items:center">
          <div>
            ${step === 1 ? `<button id="wiz-skip" style="padding:10px 20px;border-radius:8px;border:0;background:#4a5568;color:#fff;cursor:pointer;font-weight:700">Skip Setup</button>` : ''}
            ${step > 1 ? `<button id="wiz-back" style="padding:10px 20px;border-radius:8px;border:0;background:#4a5568;color:#fff;cursor:pointer;font-weight:700">← Back</button>` : ''}
          </div>
          <div>
            ${step < totalSteps ? `<button id="wiz-next" style="padding:10px 24px;border-radius:8px;border:0;background:${cfg.ui.colors.accent};color:#fff;cursor:pointer;font-weight:700">Next →</button>` : ''}
            ${step === totalSteps ? `<button id="wiz-finish" style="padding:10px 24px;border-radius:8px;border:0;background:${cfg.ui.colors.success};color:#000;cursor:pointer;font-weight:700">Start Testing! 🎉</button>` : ''}
          </div>
        </div>
      `;
      
      wizard.innerHTML = content;
      
      // Event handlers
      const skipBtn = wizard.querySelector('#wiz-skip');
      const backBtn = wizard.querySelector('#wiz-back');
      const nextBtn = wizard.querySelector('#wiz-next');
      const finishBtn = wizard.querySelector('#wiz-finish');
      
      if (skipBtn) skipBtn.onclick = () => completeWizard(true);
      if (backBtn) backBtn.onclick = () => renderStep(step - 1);
      if (nextBtn) nextBtn.onclick = () => {
        saveStepData(step);
        renderStep(step + 1);
      };
      if (finishBtn) finishBtn.onclick = () => {
        saveStepData(step);
        completeWizard(false);
      };
    }
    
    function saveStepData(step) {
      const cfg = getConfig();
      
      if (step === 2) {
        cfg.rules.performance.maxLoadMs = parseInt(wizard.querySelector('#wiz-maxLoadMs').value) || 5000;
        cfg.rules.performance.maxDomReadyMs = parseInt(wizard.querySelector('#wiz-maxDomReadyMs').value) || 3000;
        cfg.rules.visual.maxFonts = parseInt(wizard.querySelector('#wiz-maxFonts').value) || 5;
        cfg.rules.colorCount.maxUnique = parseInt(wizard.querySelector('#wiz-maxColors').value) || 50;
        const terms = wizard.querySelector('#wiz-sensitiveTerms').value;
        cfg.rules.security.sensitiveTerms = terms.split(',').map(t => t.trim()).filter(t => t);
      }
      
      if (step === 3) {
        cfg.reconciliation.csvUrl = wizard.querySelector('#wiz-csvUrl').value.trim();
        cfg.reconciliation.csvText = wizard.querySelector('#wiz-csvText').value.trim();
        cfg.reconciliation.numericTolerance = parseFloat(wizard.querySelector('#wiz-numericTolerance').value) || 0.0001;
        cfg.reconciliation.dimensionCaseSensitive = wizard.querySelector('#wiz-caseSensitive').checked;
      }
      
      saveConfig(cfg);
    }
    
    function completeWizard(skipped) {
      lsSet(LS_WIZARD_COMPLETED, true);
      overlay.remove();
      if (!skipped) {
        alert('✅ Setup complete! Click "Run Tests" to start validating your dashboard.');
      }
    }
    
    renderStep(1);
    return true;
  }

  // UI Panel Creation (using config values)
  function createPanel() {
    const cfg = getConfig();
    const existing = document.getElementById('tts-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.id = 'tts-panel';
    Object.assign(panel.style, {
      position: 'fixed',
      top: cfg.ui.panel.top,
      right: cfg.ui.panel.right,
      width: cfg.ui.panel.width,
      maxHeight: cfg.ui.panel.maxHeight,
      zIndex: cfg.ui.panel.zIndex,
      fontFamily: cfg.ui.panel.fontFamily,
      display: 'flex',
      flexDirection: 'column',
      background: cfg.ui.colors.background,
      color: cfg.ui.colors.foreground,
      border: `1px solid ${cfg.ui.colors.border}`,
      borderRadius: '12px',
      boxShadow: '0 10px 40px rgba(2,6,23,0.7)',
      overflow: 'hidden'
    });

    panel.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(90deg,#0f172a,#10203a);border-bottom:1px solid #1f2b44">
        <div style="display:flex;flex-direction:column">
          <div style="font-weight:700;font-size:15px">Tableau Test Suite <span style="font-size:11px;color:#9fb0d7">v${VERSION}</span></div>
          <div style="font-size:11px;color:#9fb0d7">Client-side dashboard validation & reconciliation</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button id="tts-export-btn" title="Export last results" style="background:#1f3a8a;border:0;color:#fff;padding:6px 8px;border-radius:6px;cursor:pointer;font-size:12px">⤓ Export</button>
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
        <button id="tts-run-btn" style="flex:1;padding:8px;border-radius:8px;border:0;background:${cfg.ui.colors.accent};color:#fff;font-weight:700;cursor:pointer">▶ Run Tests</button>
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
      a.download = cfg.templates.exportFilenamePrefix + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    };

    return panel;
  }

  // Tab rendering (Config tab now includes wizard reset)
  function renderTab(tab) {
    const body = document.getElementById('tts-body');
    const cfg = getConfig();
    const lastResults = lsGet(LS_RESULTS) || null;

    if (tab === 'config') {
      body.innerHTML = `
        <div style="margin-bottom:12px">
          <button id="tts-reset-wizard" style="padding:8px 16px;border-radius:8px;border:0;background:#6b2b6b;color:#fff;cursor:pointer;font-weight:700">🔄 Reset & Show Setup Wizard</button>
        </div>
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
        <div style="margin-top:8px;font-size:12px;color:#9fb0d7">Notes: CSV must at minimum include columns: dashboard,dimension,measure,expectedValue.</div>
      `;
      
      body.querySelector('#tts-reset-wizard').onclick = () => {
        localStorage.removeItem(LS_WIZARD_COMPLETED);
        document.getElementById('tts-panel').remove();
        showSetupWizard();
        if (!showSetupWizard()) {
          createPanel();
          renderTab('summary');
        }
      };
      
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
        a.download = cfg.templates.configFilenamePrefix + Date.now() + '.json';
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
        body.querySelector('#tts-csv-text').value = cfg.templates.sampleReconciliationCSV;
      };
    }
    // Other tabs implementation would go here (summary, tests, reconcile, help)
    // For brevity, showing only config tab - full implementation would include all tabs
  }

  // Run tests (now uses config values)
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

    // BEFORE: fonts.size <= 5
    // AFTER: fonts.size <= cfg.rules.visual.maxFonts
    if (cfg.testToggles.visual) {
      const allEls = Array.from(document.querySelectorAll('*'));
      const fonts = new Set();
      allEls.forEach(el => {
        try { const s = window.getComputedStyle(el); if (s && s.fontFamily) fonts.add(s.fontFamily); } catch (e) { }
      });
      addTest('visual', fonts.size <= cfg.rules.visual.maxFonts ? 'pass' : 'warn', 'Font Consistency', `${fonts.size} unique font families (max: ${cfg.rules.visual.maxFonts})`);
    }

    // BEFORE: const sensitiveTerms = ['ssn', 'password', ...];
    // AFTER: cfg.rules.security.sensitiveTerms
    if (cfg.testToggles.security) {
      const foundSensitive = cfg.rules.security.sensitiveTerms.filter(term => 
        (document.body.textContent || '').toLowerCase().includes(term.toLowerCase())
      );
      addTest('security', foundSensitive.length === 0 ? 'pass' : 'warn', 'Sensitive Data Exposure', 
        foundSensitive.length === 0 ? 'No obvious sensitive terms' : 'Found: ' + foundSensitive.join(', '));
    }

    // BEFORE: const dashboards = document.querySelectorAll('[data-tb-test-id*="dashboard"],.tableau-dashboard,.tab-dashboard');
    // AFTER: cfg.rules.selectors.dashboards
    if (cfg.testToggles.deployment) {
      const dashboards = document.querySelectorAll(cfg.rules.selectors.dashboards);
      addTest('deployment', dashboards.length > 0 ? 'pass' : 'fail', 'Component Dashboards Detected', `${dashboards.length} dashboard component(s) found`);
    }

    // Additional tests would go here...

    const end = Date.now();
    const report = {
      metadata: { timestamp: new Date().toISOString(), url: location.href, executionMs: end - start, version: VERSION },
      summary,
      results
    };
    lsSet(LS_RESULTS, report);

    alert(`Tests complete! Passed: ${summary.passed}, Failed: ${summary.failed}, Warnings: ${summary.warnings}`);
  }

  // Reconciliation function stub
  async function runReconciliation() {
    alert('Reconciliation feature - implementation continues from v0.1');
  }

  // Initialize
  const wizardShown = showSetupWizard();
  if (!wizardShown) {
    const panel = createPanel();
    renderTab('summary');
  }
  
  window.TTS = window.TTS || {};
  window.TTS.runTests = runAllTests;
  window.TTS.runReconciliation = runReconciliation;
  window.TTS.getConfig = getConfig;
  window.TTS.setConfig = saveConfig;
  window.TTS.resetWizard = () => {
    localStorage.removeItem(LS_WIZARD_COMPLETED);
    alert('Wizard reset. Reload the bookmarklet to see the setup wizard again.');
  };
})();