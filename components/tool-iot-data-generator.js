class ToolIoTDataGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Load external stylesheet
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '../styles/tool-iot-data-generator.css');
    
    // STATE
    this.activeTab = 'schemas'; // 'schemas' or 'generation'
    this.expandedSchemaId = null; // Track which schema card is expanded
    this.showInstrumentLookup = false; // Track instrument lookup modal
    
    // ISA S5.1 Instrument Tag Reference
    this.instrumentCodes = {
      'A': { variable: 'Analysis', examples: ['pH', 'Conductivity', 'O2', 'CO2'], unit: 'varies' },
      'F': { variable: 'Flow Rate', examples: ['Liquid', 'Gas', 'Steam'], unit: 'L/min, m³/h, gal/min' },
      'L': { variable: 'Level', examples: ['Tank', 'Vessel', 'Sump'], unit: 'm, ft, %' },
      'P': { variable: 'Pressure', examples: ['Process', 'Differential', 'Vacuum'], unit: 'kPa, psi, bar' },
      'T': { variable: 'Temperature', examples: ['Process', 'Ambient', 'Surface'], unit: '°C, °F, K' },
      'S': { variable: 'Speed/Frequency', examples: ['Motor', 'Pump', 'Vibration'], unit: 'rpm, Hz' },
      'W': { variable: 'Weight/Force', examples: ['Load Cell', 'Strain Gauge'], unit: 'kg, lb, N' },
      'V': { variable: 'Vibration', examples: ['Machinery', 'Structural'], unit: 'mm/s, g' },
      'E': { variable: 'Voltage', examples: ['Power Supply', 'Signal'], unit: 'V, mV' },
      'I': { variable: 'Current', examples: ['4-20mA', 'Power'], unit: 'mA, A' },
      'Q': { variable: 'Quantity/Totalizer', examples: ['Flow Total', 'Count'], unit: 'varies' }
    };
    
    this.deviceSchemas = this.loadSavedSchemas() || [
      {
        id: 1,
        name: 'Process Control Loop',
        serialPrefix: 'PT-',
        manufacturer: 'Emerson Process',
        deviceType: 'Pressure Transmitter',
        firmwareVersion: 'v2.3.1',
        selected: true,
        channels: [
          { id: 101, name: 'Process_Pressure', unit: 'kPa', min: 0, max: 1000, decimals: 2, distribution: 'normal' },
          { id: 102, name: 'Differential_Pressure', unit: 'kPa', min: -50, max: 50, decimals: 2, distribution: 'normal' },
          { id: 103, name: 'Static_Pressure', unit: 'kPa', min: 80, max: 120, decimals: 2, distribution: 'normal' },
          { id: 104, name: 'Ambient_Temperature', unit: '°C', min: -10, max: 50, decimals: 1, distribution: 'normal' }
        ]
      },
      {
        id: 2,
        name: 'Temperature Monitoring',
        serialPrefix: 'TT-',
        manufacturer: 'Yokogawa',
        deviceType: 'Temperature Transmitter',
        firmwareVersion: 'v1.8.4',
        selected: true,
        channels: [
          { id: 201, name: 'Process_Temperature', unit: '°C', min: 0, max: 200, decimals: 1, distribution: 'normal' },
          { id: 202, name: 'RTD_Temperature', unit: '°C', min: -40, max: 150, decimals: 2, distribution: 'normal' },
          { id: 203, name: 'Thermocouple_TC', unit: '°C', min: 0, max: 500, decimals: 1, distribution: 'normal' },
          { id: 204, name: 'Cold_Junction_Temp', unit: '°C', min: 15, max: 35, decimals: 1, distribution: 'normal' }
        ]
      },
      {
        id: 3,
        name: 'Level Measurement',
        serialPrefix: 'LT-',
        manufacturer: 'Endress+Hauser',
        deviceType: 'Level Transmitter',
        firmwareVersion: 'v3.1.0',
        selected: true,
        channels: [
          { id: 301, name: 'Tank_Level', unit: 'm', min: 0, max: 10, decimals: 2, distribution: 'normal' },
          { id: 302, name: 'Level_Percent', unit: '%', min: 0, max: 100, decimals: 1, distribution: 'normal' },
          { id: 303, name: 'Interface_Level', unit: 'm', min: 0, max: 5, decimals: 2, distribution: 'normal' },
          { id: 304, name: 'Ullage_Distance', unit: 'm', min: 0, max: 10, decimals: 2, distribution: 'uniform' }
        ]
      },
      {
        id: 4,
        name: 'Flow Measurement',
        serialPrefix: 'FT-',
        manufacturer: 'Rosemount',
        deviceType: 'Flow Transmitter',
        firmwareVersion: 'v4.2.0',
        selected: false,
        channels: [
          { id: 401, name: 'Volumetric_Flow', unit: 'm³/h', min: 0, max: 500, decimals: 1, distribution: 'normal' },
          { id: 402, name: 'Mass_Flow', unit: 'kg/h', min: 0, max: 1000, decimals: 2, distribution: 'normal' },
          { id: 403, name: 'Flow_Velocity', unit: 'm/s', min: 0, max: 5, decimals: 2, distribution: 'normal' },
          { id: 404, name: 'Totalizer', unit: 'm³', min: 0, max: 99999, decimals: 0, distribution: 'uniform' }
        ]
      }
    ];
    
    this.config = {
      channels: [
        {
          id: Date.now(),
          name: 'Process_Pressure',
          unit: 'kPa',
          min: 0,
          max: 1000,
          decimals: 2,
          distribution: 'normal'
        },
        {
          id: Date.now() + 1,
          name: 'Process_Temperature',
          unit: '°C',
          min: 0,
          max: 200,
          decimals: 1,
          distribution: 'normal'
        },
        {
          id: Date.now() + 2,
          name: 'Tank_Level',
          unit: '%',
          min: 0,
          max: 100,
          decimals: 1,
          distribution: 'normal'
        }
      ],
      timeSeries: {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        interval: 'daily'
      },
      advanced: {
        timestampFormat: 'iso8601',
        csvDelimiter: ',',
        includeHeader: true,
        quoteStrings: false,
        fixedChannelCount: true,
        maxChannels: 15,
        deviceMode: 'single', // 'single' or 'multiple'
        deviceCount: 2
      }
    };
    
    this.generatedData = [];
    this.presets = this.loadPresets();
    
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="container">
        <div class="main-content">
          <h1>🔬 IoT Test Data Generator</h1>
          <p>Generate CSV datasets for industrial IoT device testing using ISA S5.1 standards</p>
          
          <div class="tab-navigation">
            <button class="tab-btn active" data-tab="schemas">📋 Device Schemas</button>
            <button class="tab-btn" data-tab="generation">⚡ Data Generation</button>
          </div>
          
          <div class="tab-content" data-tab-content="schemas">
            <div class="config-section">
              <div class="section-header">
                <h2>📋 Device Schema Management</h2>
                <span class="schema-count">${this.deviceSchemas.length} schemas</span>
              </div>
              <div class="schema-buttons">
                <button id="add-schema-btn" class="add-button">+ Add Device Schema</button>
                <button id="import-schema-btn" class="import-button">📥 Import Schemas</button>
                <button id="instrument-lookup-btn" class="secondary-button">ℹ️ Instrument Codes</button>
                <button id="clear-storage-btn" class="secondary-button" title="Clear all page localStorage and reload initial starting defaults">🗑️ Clear Storage</button>
              </div>
              <div id="schemas-container"></div>
            </div>
            
            <div class="config-section">
              <div class="section-header">
                <h2>🔧 JSON Export Configuration</h2>
              </div>
              <p class="section-description" style="text-align: left; min-width: 100%;">Map device schema properties to custom JSON field names for external system integration</p>
              
              <div class="export-config-grid">
                <div class="config-field">
                  <label for="json-field-1">Schema Name Field</label>
                  <input type="text" id="json-field-1" placeholder="e.g., site, location, device_name" value="name">
                </div>
                <div class="config-field">
                  <label for="json-field-2">Identifier Field</label>
                  <input type="text" id="json-field-2" placeholder="e.g., id, key, identifier" value="id">
                </div>
                <div class="config-field">
                  <label for="json-field-3">Tag Number Field</label>
                  <input type="text" id="json-field-3" placeholder="e.g., tag, instrument_tag, loop_id" value="tag">
                </div>
                <div class="config-field">
                  <label for="json-field-4">Display Name Field</label>
                  <input type="text" id="json-field-4" placeholder="e.g., label, display, title" value="label">
                </div>
                <div class="config-field">
                  <label for="json-field-5">Timestamp Field</label>
                  <input type="text" id="json-field-5" placeholder="e.g., time, timestamp, date" value="timestamp">
                </div>
                <div class="config-field">
                  <label for="json-field-6">Value Field</label>
                  <input type="text" id="json-field-6" placeholder="e.g., value, data, measurement" value="value">
                </div>
              </div>
              
              <div class="json-options">
                <label class="checkbox-option">
                  <input type="checkbox" id="include-units" checked>
                  <span>Include units in value field names</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" id="include-metadata" checked>
                  <span>Include device metadata (manufacturer, type, firmware)</span>
                </label>
              </div>
              
              <div class="json-actions">
                <button id="preview-json-btn" class="primary-button">👁️ Generate Preview</button>
                <button id="copy-json-btn" class="secondary-button" disabled>📋 Copy JSON</button>
                <button id="download-json-btn" class="secondary-button" disabled>💾 Download JSON</button>
              </div>
            </div>
            
            <div class="config-section json-preview-section" id="json-preview-section" style="display: none;">
              <div class="section-header">
                <h2>📄 JSON Preview</h2>
                <button id="close-json-preview" class="action-button">Close</button>
              </div>
              <div class="json-preview-info">
                <span id="json-count-info">0 items</span>
              </div>
              <div class="json-preview-container">
                <pre id="json-preview-content" class="json-preview-content"></pre>
              </div>
            </div>
          </div>
          
          <div class="tab-content" data-tab-content="generation" style="display: none;">
          
          <div class="config-section">
            <div class="section-header">
              <h2>📋 Device Selection</h2>
            </div>
            <div class="device-mode-selection">
              <label class="radio-option">
                <input type="radio" name="gen-device-mode" value="single" checked>
                <span>Single Device (select one schema)</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="gen-device-mode" value="multiple">
                <span>Multiple Devices (use all selected schemas)</span>
              </label>
            </div>
            <div id="device-selection-container"></div>
          </div>
          
          <div class="config-section">
            <div class="section-header">
              <h2>⏱️ Time Series Configuration</h2>
            </div>
            <div class="config-grid">
              <div class="config-field">
                <label for="start-date">Start Date</label>
                <input type="date" id="start-date" value="${this.config.timeSeries.startDate}">
              </div>
              <div class="config-field">
                <label for="end-date">End Date</label>
                <input type="date" id="end-date" value="${this.config.timeSeries.endDate}">
              </div>
              <div class="config-field">
                <label for="interval">Interval</label>
                <select id="interval">
                  <option value="15-minutes">15 Minutes</option>
                  <option value="30-minutes">30 Minutes</option>
                  <option value="1-hour">1 Hour</option>
                  <option value="2-hours">2 Hours</option>
                  <option value="6-hours">6 Hours</option>
                  <option value="12-hours">12 Hours</option>
                  <option value="daily" selected>Daily (24 Hours)</option>
                </select>
              </div>
              <div class="config-field">
                <label>Total Rows</label>
                <div class="row-count" id="total-rows">Calculating...</div>
              </div>
            </div>
          </div>
          
          
          <div class="config-section">
            <div class="section-header">
              <h2>⚙️ CSV Format Options</h2>
            </div>
            <div class="advanced-options">
              <div class="option-group">
                <h3>CSV Format Options</h3>
                <label class="checkbox-option">
                  <input type="checkbox" id="fixed-channel-count" checked>
                  <span>Fixed 15 Channel Columns (for CR6 compatibility)</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" id="quote-strings">
                  <span>Quote String Values</span>
                </label>
                <label class="checkbox-option">
                  <input type="checkbox" id="include-header" checked>
                  <span>Include Header Row</span>
                </label>
                <div class="inline-options">
                  <label>
                    Delimiter: 
                    <select id="csv-delimiter">
                      <option value="," selected>Comma (,)</option>
                      <option value=";">Semicolon (;)</option>
                      <option value="\t">Tab</option>
                      <option value="|">Pipe (|)</option>
                    </select>
                  </label>
                  <label>
                    Timestamp: 
                    <select id="timestamp-format">
                      <option value="iso8601" selected>ISO 8601</option>
                      <option value="unix">Unix (seconds)</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="action-buttons">
            <button id="generate-btn" class="primary-button">🎲 Generate Data</button>
            <button id="copy-btn" class="secondary-button" disabled>📋 Copy CSV</button>
            <button id="download-btn" class="secondary-button" disabled>💾 Download CSV</button>
          </div>
          
          <div class="preview-section" style="display: none;">
            <div class="section-header">
              <h2>📝 Generated Data Preview</h2>
              <button id="clear-preview-btn" class="action-button">Clear</button>
            </div>
            <div class="preview-container">
              <pre id="data-preview" class="data-preview"></pre>
            </div>
            <div class="preview-info">
              <span id="preview-rows-info">Showing first 10 rows</span>
            </div>
          </div>
          
          <div class="stats-section" style="display: none;">
            <div class="section-header">
              <h2>📊 Statistics</h2>
            </div>
            <div id="statistics" class="statistics-grid"></div>
          </div>
          
          </div>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(linkElem);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
  
  connectedCallback() {
    this.attachEventListeners();
    this.renderSchemas();
    this.renderDeviceSelection();
    this.calculateTotalRows();
  }
  
  loadSavedSchemas() {
    try {
      const saved = localStorage.getItem('iotDeviceSchemas');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }
  
  saveSchemas() {
    try {
      localStorage.setItem('iotDeviceSchemas', JSON.stringify(this.deviceSchemas));
    } catch (e) {
      console.error('Failed to save schemas:', e);
    }
  }
  
  loadPresets() {
    return {
      pressureTransmitter: {
        deviceType: 'Pressure Transmitter',
        channels: [
          { name: 'Process_Pressure', unit: 'kPa', min: 0, max: 1000, decimals: 2, distribution: 'normal' },
          { name: 'Differential_Pressure', unit: 'kPa', min: -50, max: 50, decimals: 2, distribution: 'normal' },
          { name: 'Static_Pressure', unit: 'kPa', min: 80, max: 120, decimals: 2, distribution: 'normal' }
        ]
      },
      temperatureTransmitter: {
        deviceType: 'Temperature Transmitter',
        channels: [
          { name: 'Process_Temperature', unit: '°C', min: 0, max: 200, decimals: 1, distribution: 'normal' },
          { name: 'Ambient_Temperature', unit: '°C', min: -10, max: 50, decimals: 1, distribution: 'normal' },
          { name: 'Cold_Junction', unit: '°C', min: 15, max: 35, decimals: 1, distribution: 'normal' }
        ]
      },
      levelTransmitter: {
        deviceType: 'Level Transmitter',
        channels: [
          { name: 'Tank_Level', unit: 'm', min: 0, max: 10, decimals: 2, distribution: 'normal' },
          { name: 'Level_Percent', unit: '%', min: 0, max: 100, decimals: 1, distribution: 'normal' },
          { name: 'Ullage', unit: 'm', min: 0, max: 10, decimals: 2, distribution: 'uniform' }
        ]
      },
      flowTransmitter: {
        deviceType: 'Flow Transmitter',
        channels: [
          { name: 'Volumetric_Flow', unit: 'm³/h', min: 0, max: 500, decimals: 1, distribution: 'normal' },
          { name: 'Mass_Flow', unit: 'kg/h', min: 0, max: 1000, decimals: 2, distribution: 'normal' },
          { name: 'Flow_Velocity', unit: 'm/s', min: 0, max: 5, decimals: 2, distribution: 'normal' }
        ]
      }
    };
  }
  
  attachEventListeners() {
    // Tab switching
    this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    
    // Add schema button
    this.shadowRoot.getElementById('add-schema-btn')?.addEventListener('click', () => this.addSchema());
    
    // Instrument lookup button
    this.shadowRoot.getElementById('instrument-lookup-btn')?.addEventListener('click', () => this.showInstrumentCodeLookup());
    
    // Import schema button
    this.shadowRoot.getElementById('import-schema-btn')?.addEventListener('click', () => this.openImportModal());
    
    // Clear storage buttons
    this.shadowRoot.getElementById('clear-storage-btn')?.addEventListener('click', () => this.clearStorage());
    this.shadowRoot.getElementById('clear-storage-footer-btn')?.addEventListener('click', () => this.clearStorage());
    
    // JSON Preview buttons
    this.shadowRoot.getElementById('preview-json-btn')?.addEventListener('click', () => this.previewJSON());
    this.shadowRoot.getElementById('copy-json-btn')?.addEventListener('click', () => this.copyJSONToClipboard());
    this.shadowRoot.getElementById('download-json-btn')?.addEventListener('click', () => this.downloadJSONPreview());
    this.shadowRoot.getElementById('close-json-preview')?.addEventListener('click', () => this.closeJSONPreview());
    
    // Time series inputs
    this.shadowRoot.getElementById('start-date').addEventListener('change', e => {
      this.config.timeSeries.startDate = e.target.value;
      this.calculateTotalRows();
    });
    this.shadowRoot.getElementById('end-date').addEventListener('change', e => {
      this.config.timeSeries.endDate = e.target.value;
      this.calculateTotalRows();
    });
    this.shadowRoot.getElementById('interval').addEventListener('change', e => {
      this.config.timeSeries.interval = e.target.value;
      this.calculateTotalRows();
    });
    
    // Advanced options - Device generation mode
    this.shadowRoot.querySelectorAll('input[name="gen-device-mode"]').forEach(radio => {
      radio.addEventListener('change', e => {
        this.config.advanced.deviceMode = e.target.value;
        this.renderDeviceSelection();
      });
    });
    
    // Advanced options - CSV format
    this.shadowRoot.getElementById('fixed-channel-count')?.addEventListener('change', e => {
      this.config.advanced.fixedChannelCount = e.target.checked;
    });
    
    this.shadowRoot.getElementById('quote-strings')?.addEventListener('change', e => {
      this.config.advanced.quoteStrings = e.target.checked;
    });
    
    this.shadowRoot.getElementById('include-header')?.addEventListener('change', e => {
      this.config.advanced.includeHeader = e.target.checked;
    });
    
    this.shadowRoot.getElementById('csv-delimiter')?.addEventListener('change', e => {
      this.config.advanced.csvDelimiter = e.target.value;
    });
    
    this.shadowRoot.getElementById('timestamp-format')?.addEventListener('change', e => {
      this.config.advanced.timestampFormat = e.target.value;
    });
    
    // Action buttons
    this.shadowRoot.getElementById('generate-btn').addEventListener('click', () => this.generateData());
    this.shadowRoot.getElementById('copy-btn').addEventListener('click', () => this.copyToClipboard());
    this.shadowRoot.getElementById('download-btn').addEventListener('click', () => this.downloadCSV());
    this.shadowRoot.getElementById('clear-preview-btn')?.addEventListener('click', () => {
      this.generatedData = [];
      this.shadowRoot.querySelector('.preview-section').style.display = 'none';
      this.shadowRoot.querySelector('.stats-section').style.display = 'none';
      this.shadowRoot.getElementById('copy-btn').disabled = true;
      this.shadowRoot.getElementById('download-btn').disabled = true;
    });
  }
  
  showInstrumentCodeLookup() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
          <h3>📖 ISA S5.1 Instrument Identification Codes</h3>
          <button class="modal-close" id="close-lookup-modal">×</button>
        </div>
        <div class="modal-body">
          <div style="background: #e7f3ff; border: 1px solid #2196F3; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: #0d47a1;">ISA S5.1 Standard Reference</h4>
            <p style="margin: 0; font-size: 0.875rem; color: #1565c0;">
              Instrument tags consist of a measured variable letter followed by function letters. 
              For example: <strong>PT</strong> = Pressure Transmitter, <strong>LIC</strong> = Level Indicating Controller
            </p>
          </div>
          
          <div class="instrument-code-grid" style="display: grid; gap: 1rem; max-height: 500px; overflow-y: auto;">
            ${Object.entries(this.instrumentCodes).map(([code, info]) => `
              <div class="instrument-code-card" style="background: #f5f5dc; border: 1px solid #9c9c7e; border-radius: 0.5rem; padding: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                  <div style="background: #8B7355; color: white; width: 3rem; height: 3rem; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold;">
                    ${code}
                  </div>
                  <div>
                    <h4 style="margin: 0; color: #5d4e37;">${info.variable}</h4>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #8B7355;">Unit: ${info.unit}</p>
                  </div>
                </div>
                <div style="margin-top: 0.5rem;">
                  <p style="margin: 0; font-size: 0.875rem; color: #5d4e37;"><strong>Examples:</strong></p>
                  <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #8B7355;">${info.examples.join(', ')}</p>
                </div>
                <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <span style="background: #fff; border: 1px solid #9c9c7e; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; color: #5d4e37;">${code}T = Transmitter</span>
                  <span style="background: #fff; border: 1px solid #9c9c7e; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; color: #5d4e37;">${code}I = Indicator</span>
                  <span style="background: #fff; border: 1px solid #9c9c7e; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; color: #5d4e37;">${code}C = Controller</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 0.5rem;">
            <h4 style="margin: 0 0 0.5rem 0;">Common Function Letters:</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; font-size: 0.875rem;">
              <div><strong>T</strong> - Transmitter</div>
              <div><strong>I</strong> - Indicator</div>
              <div><strong>C</strong> - Controller</div>
              <div><strong>E</strong> - Element (sensor)</div>
              <div><strong>S</strong> - Switch</div>
              <div><strong>A</strong> - Alarm</div>
              <div><strong>R</strong> - Recorder</div>
              <div><strong>V</strong> - Valve</div>
              <div><strong>Y</strong> - Relay/Compute</div>
              <div><strong>H</strong> - High (modifier)</div>
              <div><strong>L</strong> - Low (modifier)</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-button modal-cancel" id="close-lookup-footer">Close</button>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(modal);
    
    // Event listeners
    modal.querySelector('#close-lookup-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#close-lookup-footer').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
    }, { once: true });
  }
  
  calculateTotalRows() {
    const timestamps = this.generateTimestamps();
    const totalRows = timestamps.length;
    const rowCountEl = this.shadowRoot.getElementById('total-rows');
    if (rowCountEl) {
      rowCountEl.textContent = `~${totalRows.toLocaleString()}`;
    }
  }
  
  generateTimestamps() {
    const timestamps = [];
    const start = new Date(this.config.timeSeries.startDate);
    const end = new Date(this.config.timeSeries.endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return timestamps;
    }
    
    let current = new Date(start);
    
    while (current <= end) {
      timestamps.push(new Date(current));
      
      switch(this.config.timeSeries.interval) {
        case '15-minutes':
          current.setMinutes(current.getMinutes() + 15);
          break;
        case '30-minutes':
          current.setMinutes(current.getMinutes() + 30);
          break;
        case '1-hour':
          current.setHours(current.getHours() + 1);
          break;
        case '2-hours':
          current.setHours(current.getHours() + 2);
          break;
        case '6-hours':
          current.setHours(current.getHours() + 6);
          break;
        case '12-hours':
          current.setHours(current.getHours() + 12);
          break;
        case 'daily':
          current.setDate(current.getDate() + 1);
          break;
      }
    }
    
    return timestamps;
  }
  
  generateData() {
    const startTime = performance.now();
    this.generatedData = [];
    
    const timestamps = this.generateTimestamps();
    
    if (timestamps.length === 0) {
      this.showNotification('Invalid date range', 'error');
      return;
    }
    
    const selectedSchemas = this.deviceSchemas.filter(s => s.selected);
    
    if (selectedSchemas.length === 0) {
      this.showNotification('No device schemas selected. Please select at least one schema in the Device Schemas tab.', 'error');
      return;
    }
    
    let schemasToUse = [];
    
    if (this.config.advanced.deviceMode === 'single') {
      schemasToUse = [selectedSchemas[0]];
    } else {
      schemasToUse = selectedSchemas;
    }
    
    const estimatedRows = timestamps.length * schemasToUse.length;
      
    if (estimatedRows > 10000) {
      this.showNotification('Warning: Generating large dataset, this may take a moment...', 'warning');
    }
    
    schemasToUse.forEach((schema, schemaIndex) => {
      timestamps.forEach((timestamp, timestampIndex) => {
        const row = this.generateRowFromSchema(timestamp, schema, schemaIndex + 1, timestampIndex, timestamps.length);
        this.generatedData.push(row);
      });
    });
    
    const endTime = performance.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(2);
    
    this.renderPreview();
    this.updateStatistics(generationTime);
    this.showNotification(`Generated ${this.generatedData.length.toLocaleString()} rows in ${generationTime}s`, 'success');
    
    this.shadowRoot.getElementById('copy-btn').disabled = false;
    this.shadowRoot.getElementById('download-btn').disabled = false;
    
    this.shadowRoot.querySelector('.preview-section').style.display = 'block';
    this.shadowRoot.querySelector('.stats-section').style.display = 'block';
  }
  
  generateRowFromSchema(timestamp, schema, deviceNum, rowIndex, totalRows) {
    const serialNumber = `${schema.serialPrefix}${String(deviceNum).padStart(3, '0')}`;
    
    const row = {
      InstrumentTag: serialNumber,
      Manufacturer: schema.manufacturer,
      DeviceType: schema.deviceType,
      FirmwareVersion: schema.firmwareVersion,
      TimeStamp: this.formatTimestamp(timestamp)
    };
    
    if (this.config.advanced.fixedChannelCount) {
      for (let i = 1; i <= 15; i++) {
        row[`Channel_${i}`] = '';
      }
    }
    
    schema.channels.forEach((channel, idx) => {
      const value = this.generateChannelValue(channel, rowIndex, totalRows);
      row[`Channel_${idx + 1}`] = value;
    });
    
    return row;
  }
  
  generateChannelValue(channel, rowIndex, totalRows) {
    let value;
    
    if (channel.distribution === 'normal') {
      value = this.normalRandom(channel.min, channel.max);
    } else {
      value = this.uniformRandom(channel.min, channel.max);
    }
    
    value = Math.max(channel.min, Math.min(channel.max, value));
    
    return value.toFixed(channel.decimals);
  }
  
  normalRandom(min, max) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 6;
    return mean + z0 * stdDev;
  }
  
  uniformRandom(min, max) {
    return Math.random() * (max - min) + min;
  }
  
  formatTimestamp(date) {
    if (this.config.advanced.timestampFormat === 'iso8601') {
      return date.toISOString();
    } else {
      return Math.floor(date.getTime() / 1000);
    }
  }
  
  toCSV() {
    if (this.generatedData.length === 0) return '';
    
    const delimiter = this.config.advanced.csvDelimiter;
    const quote = this.config.advanced.quoteStrings;
    
    const headers = Object.keys(this.generatedData[0]);
    let csv = '';
    
    if (this.config.advanced.includeHeader) {
      csv += headers.map(h => quote ? `"${h}"` : h).join(delimiter) + '\n';
    }
    
    this.generatedData.forEach(row => {
      const values = headers.map(h => {
        const value = row[h];
        return quote && typeof value === 'string' ? `"${value}"` : value;
      });
      csv += values.join(delimiter) + '\n';
    });
    
    return csv;
  }
  
  renderPreview() {
    const preview = this.shadowRoot.getElementById('data-preview');
    const csv = this.toCSV();
    const lines = csv.split('\n').slice(0, 11);
    preview.textContent = lines.join('\n');
    
    const info = this.shadowRoot.getElementById('preview-rows-info');
    if (info) {
      const shownRows = Math.min(10, this.generatedData.length);
      info.textContent = `Showing first ${shownRows} of ${this.generatedData.length.toLocaleString()} rows`;
    }
  }
  
  updateStatistics(generationTime) {
    const stats = this.shadowRoot.getElementById('statistics');
    const csv = this.toCSV();
    const fileSize = new Blob([csv]).size;
    
    const selectedSchemas = this.deviceSchemas.filter(s => s.selected);
    const devicesUsed = this.config.advanced.deviceMode === 'single' ? 1 : selectedSchemas.length;
    
    stats.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Total Rows</span>
        <span class="stat-value">${this.generatedData.length.toLocaleString()}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Devices Used</span>
        <span class="stat-value">${devicesUsed}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Date Range</span>
        <span class="stat-value">${this.config.timeSeries.startDate} to ${this.config.timeSeries.endDate}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">File Size</span>
        <span class="stat-value">${(fileSize / 1024).toFixed(2)} KB</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Generation Time</span>
        <span class="stat-value">${generationTime}s</span>
      </div>
    `;
  }
  
  copyToClipboard() {
    const csv = this.toCSV();
    navigator.clipboard.writeText(csv).then(() => {
      this.showNotification('CSV copied to clipboard', 'success');
    }).catch(() => {
      this.showNotification('Failed to copy to clipboard', 'error');
    });
  }
  
  downloadCSV() {
    const csv = this.toCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iot_data_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('CSV downloaded', 'success');
  }
  
  switchTab(tabName) {
    this.activeTab = tabName;
    
    this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    this.shadowRoot.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = content.dataset.tabContent === tabName ? 'block' : 'none';
    });
  }
  
  renderSchemas() {
    const container = this.shadowRoot.getElementById('schemas-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    this.deviceSchemas.forEach(schema => {
      const isExpanded = this.expandedSchemaId === schema.id;
      
      const schemaCard = document.createElement('div');
      schemaCard.className = `schema-card ${isExpanded ? 'expanded' : ''}`;
      schemaCard.innerHTML = `
        <div class="schema-header">
          <div class="schema-title-row">
            <input type="checkbox" class="schema-select" data-id="${schema.id}" ${schema.selected ? 'checked' : ''}>
            <span class="schema-title">${schema.name}</span>
            <span class="schema-badge">${schema.serialPrefix}</span>
          </div>
          <div class="schema-actions">
            <button class="icon-button expand-schema-btn" data-id="${schema.id}" title="${isExpanded ? 'Collapse' : 'Expand'}">
              ${isExpanded ? '▼ Collapse' : '▶ Expand'}
            </button>
            <div class="actions-dropdown">
              <button class="icon-button actions-menu-btn" data-id="${schema.id}" title="Actions">⋮</button>
              <div class="actions-dropdown-menu" data-id="${schema.id}">
                <button class="dropdown-item duplicate-schema-btn" data-id="${schema.id}">
                  <span class="dropdown-icon">📋</span>
                  <span>Duplicate</span>
                </button>
                <button class="dropdown-item delete-schema-btn" data-id="${schema.id}">
                  <span class="dropdown-icon">🗑️</span>
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="schema-info ${isExpanded ? 'hidden' : ''}">
          <div class="schema-info-row">
            <span><strong>Manufacturer:</strong> ${schema.manufacturer}</span>
            <span><strong>Type:</strong> ${schema.deviceType}</span>
            <span><strong>Firmware:</strong> ${schema.firmwareVersion}</span>
          </div>
          <div class="schema-channels">
            <span><strong>Channels (${schema.channels.length}):</strong> ${schema.channels.map(ch => ch.name).join(', ')}</span>
          </div>
        </div>
        <div class="schema-editor" style="display: ${isExpanded ? 'block' : 'none'};">
          <div class="editor-section">
            <h4>Schema Details</h4>
            <div class="editor-grid">
              <div class="form-group">
                <label>Schema Name</label>
                <input type="text" class="edit-name" data-id="${schema.id}" value="${schema.name}">
              </div>
              <div class="form-group">
                <label>Serial Prefix</label>
                <input type="text" class="edit-prefix" data-id="${schema.id}" value="${schema.serialPrefix}">
              </div>
              <div class="form-group">
                <label>Manufacturer</label>
                <input type="text" class="edit-manufacturer" data-id="${schema.id}" value="${schema.manufacturer}">
              </div>
              <div class="form-group">
                <label>Device Type</label>
                <input type="text" class="edit-type" data-id="${schema.id}" value="${schema.deviceType}">
              </div>
              <div class="form-group">
                <label>Firmware Version</label>
                <input type="text" class="edit-firmware" data-id="${schema.id}" value="${schema.firmwareVersion}">
              </div>
            </div>
          </div>
          
          <div class="editor-section">
            <div class="section-header-small">
              <h4>Channels (${schema.channels.length}/15)</h4>
              <button class="add-button-small add-channel-inline-btn" data-schema-id="${schema.id}">+ Add Channel</button>
            </div>
            <div class="channels-list" data-schema-id="${schema.id}">
              ${schema.channels.map((channel, idx) => `
                <div class="channel-inline-card">
                  <div class="channel-inline-header">
                    <span class="channel-number">#${idx + 1}</span>
                    <button class="remove-button-small remove-channel-inline-btn" data-schema-id="${schema.id}" data-channel-id="${channel.id}">×</button>
                  </div>
                  <div class="channel-inline-fields">
                    <div class="form-group">
                      <label>Name</label>
                      <input type="text" class="edit-channel-name" data-schema-id="${schema.id}" data-channel-id="${channel.id}" value="${channel.name}">
                    </div>
                    <div class="form-group">
                      <label>Unit</label>
                      <input type="text" class="edit-channel-unit" data-schema-id="${schema.id}" data-channel-id="${channel.id}" value="${channel.unit}">
                    </div>
                    <div class="form-group">
                      <label>Min</label>
                      <input type="number" step="any" class="edit-channel-min" data-schema-id="${schema.id}" data-channel-id="${channel.id}" value="${channel.min}">
                    </div>
                    <div class="form-group">
                      <label>Max</label>
                      <input type="number" step="any" class="edit-channel-max" data-schema-id="${schema.id}" data-channel-id="${channel.id}" value="${channel.max}">
                    </div>
                    <div class="form-group">
                      <label>Decimals</label>
                      <input type="number" min="0" max="6" class="edit-channel-decimals" data-schema-id="${schema.id}" data-channel-id="${channel.id}" value="${channel.decimals}">
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="editor-actions">
            <button class="secondary-button cancel-edit-btn" data-id="${schema.id}">Cancel</button>
            <button class="primary-button save-edit-btn" data-id="${schema.id}">Save Changes</button>
          </div>
        </div>
      `;
      
      container.appendChild(schemaCard);
    });
    
    this.attachSchemaEventListeners();
    
    const countEl = this.shadowRoot.querySelector('.schema-count');
    if (countEl) {
      countEl.textContent = `${this.deviceSchemas.length} schemas`;
    }
  }
  
  attachSchemaEventListeners() {
    this.shadowRoot.querySelectorAll('.schema-select').forEach(checkbox => {
      checkbox.addEventListener('change', e => {
        const id = parseInt(e.target.dataset.id);
        const schema = this.deviceSchemas.find(s => s.id === id);
        if (schema) {
          schema.selected = e.target.checked;
          this.saveSchemas();
          this.renderDeviceSelection();
        }
      });
    });
    
    this.shadowRoot.querySelectorAll('.expand-schema-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        if (this.expandedSchemaId === id) {
          this.expandedSchemaId = null;
        } else {
          this.expandedSchemaId = id;
        }
        this.renderSchemas();
      });
    });
    
    this.shadowRoot.querySelectorAll('.actions-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const dropdown = this.shadowRoot.querySelector(`.actions-dropdown-menu[data-id="${id}"]`);
        
        this.shadowRoot.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
          if (menu !== dropdown) {
            menu.classList.remove('show');
          }
        });
        
        dropdown.classList.toggle('show');
      });
    });
    
    document.addEventListener('click', () => {
      this.shadowRoot.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
      });
    });
    
    this.shadowRoot.querySelectorAll('.duplicate-schema-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        this.duplicateSchema(id);
        this.shadowRoot.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
          menu.classList.remove('show');
        });
      });
    });
    
    this.shadowRoot.querySelectorAll('.delete-schema-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        this.deleteSchema(id);
        this.shadowRoot.querySelectorAll('.actions-dropdown-menu').forEach(menu => {
          menu.classList.remove('show');
        });
      });
    });
    
    const attachDetailInput = (selector, field) => {
      this.shadowRoot.querySelectorAll(selector).forEach(input => {
        input.addEventListener('input', e => {
          const id = parseInt(input.dataset.id);
          const schema = this.deviceSchemas.find(s => s.id === id);
          if (schema) {
            schema[field] = e.target.value;
          }
        });
      });
    };
    
    attachDetailInput('.edit-name', 'name');
    attachDetailInput('.edit-prefix', 'serialPrefix');
    attachDetailInput('.edit-manufacturer', 'manufacturer');
    attachDetailInput('.edit-type', 'deviceType');
    attachDetailInput('.edit-firmware', 'firmwareVersion');
    
    const attachChannelInput = (selector, field, type = 'value') => {
      this.shadowRoot.querySelectorAll(selector).forEach(input => {
        input.addEventListener('input', e => {
          const schemaId = parseInt(input.dataset.schemaId);
          const channelId = parseInt(input.dataset.channelId);
          const schema = this.deviceSchemas.find(s => s.id === schemaId);
          if (schema) {
            const channel = schema.channels.find(c => c.id === channelId);
            if (channel) {
              channel[field] = type === 'number' ? parseFloat(e.target.value) : e.target.value;
            }
          }
        });
      });
    };
    
    attachChannelInput('.edit-channel-name', 'name');
    attachChannelInput('.edit-channel-unit', 'unit');
    attachChannelInput('.edit-channel-min', 'min', 'number');
    attachChannelInput('.edit-channel-max', 'max', 'number');
    attachChannelInput('.edit-channel-decimals', 'decimals', 'number');
    
    this.shadowRoot.querySelectorAll('.add-channel-inline-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const schemaId = parseInt(btn.dataset.schemaId);
        const schema = this.deviceSchemas.find(s => s.id === schemaId);
        if (schema) {
          if (schema.channels.length >= 15) {
            this.showNotification('Maximum 15 channels allowed', 'error');
            return;
          }
          schema.channels.push({
            id: Date.now() + Math.random(),
            name: `Channel_${schema.channels.length + 1}`,
            unit: '',
            min: 0,
            max: 100,
            decimals: 2,
            distribution: 'normal'
          });
          this.renderSchemas();
        }
      });
    });
    
    this.shadowRoot.querySelectorAll('.remove-channel-inline-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const schemaId = parseInt(btn.dataset.schemaId);
        const channelId = parseInt(btn.dataset.channelId);
        const schema = this.deviceSchemas.find(s => s.id === schemaId);
        if (schema) {
          if (schema.channels.length <= 1) {
            this.showNotification('Cannot remove the last channel', 'error');
            return;
          }
          schema.channels = schema.channels.filter(c => c.id !== channelId);
          this.renderSchemas();
        }
      });
    });
    
    this.shadowRoot.querySelectorAll('.cancel-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.expandedSchemaId = null;
        const savedSchemas = this.loadSavedSchemas();
        if (savedSchemas) {
          this.deviceSchemas = savedSchemas;
        }
        this.renderSchemas();
        this.renderDeviceSelection();
      });
    });
    
    this.shadowRoot.querySelectorAll('.save-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.expandedSchemaId = null;
        this.saveSchemas();
        this.renderSchemas();
        this.renderDeviceSelection();
        this.showNotification('Schema saved successfully', 'success');
      });
    });
  }
  
  renderDeviceSelection() {
    const container = this.shadowRoot.getElementById('device-selection-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    const selectedSchemas = this.deviceSchemas.filter(s => s.selected);
    const isSingleMode = this.config.advanced.deviceMode === 'single';
    
    if (selectedSchemas.length === 0) {
      container.innerHTML = '<p class="info-message">⚠️ No device schemas selected. Go to Device Schemas tab to select schemas.</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="selected-schemas-list ${isSingleMode ? 'single-device-mode' : ''}">
        <div class="selected-schemas-header">
          <h4>Selected Schemas (${selectedSchemas.length})</h4>
          <button class="add-more-btn" id="add-more-schemas-btn">+ Add More</button>
        </div>
        ${selectedSchemas.map((schema, index) => `
          <div class="selected-schema-item ${isSingleMode && index > 0 ? 'dimmed' : ''}">
            <span class="schema-name">${schema.name}</span>
            <span class="schema-prefix">${schema.serialPrefix}</span>
            <span class="schema-channel-count">${schema.channels.length} channels</span>
            <button class="remove-selected-btn" data-schema-id="${schema.id}" title="Remove from selection">×</button>
          </div>
        `).join('')}
      </div>
    `;
    
    this.attachDeviceSelectionListeners();
  }
  
  attachDeviceSelectionListeners() {
    this.shadowRoot.querySelectorAll('.remove-selected-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const schemaId = parseInt(btn.dataset.schemaId);
        const schema = this.deviceSchemas.find(s => s.id === schemaId);
        if (schema) {
          schema.selected = false;
          this.saveSchemas();
          this.renderSchemas();
          this.renderDeviceSelection();
          this.showNotification(`Removed ${schema.name} from selection`, 'info');
        }
      });
    });
    
    const addMoreBtn = this.shadowRoot.getElementById('add-more-schemas-btn');
    if (addMoreBtn) {
      addMoreBtn.addEventListener('click', () => {
        this.switchTab('schemas');
        this.showNotification('Select schemas by checking the checkbox next to each one', 'info');
      });
    }
  }
  
  addSchema() {
    const newSchema = {
      id: Date.now(),
      name: 'New Device Schema',
      serialPrefix: 'DEV-',
      manufacturer: 'Manufacturer',
      deviceType: 'Generic',
      firmwareVersion: 'v1.0.0',
      selected: false,
      channels: [
        { id: Date.now() + 1, name: 'Channel_1', unit: '', min: 0, max: 100, decimals: 2, distribution: 'normal' }
      ]
    };
    
    this.deviceSchemas.push(newSchema);
    this.saveSchemas();
    this.expandedSchemaId = newSchema.id;
    this.renderSchemas();
  }
  
  duplicateSchema(schemaId) {
    const schema = this.deviceSchemas.find(s => s.id === schemaId);
    if (!schema) return;
    
    const duplicate = {
      ...schema,
      id: Date.now(),
      name: schema.name + ' (Copy)',
      selected: false,
      channels: schema.channels.map(ch => ({
        ...ch,
        id: Date.now() + Math.random()
      }))
    };
    
    this.deviceSchemas.push(duplicate);
    this.saveSchemas();
    this.renderSchemas();
    this.renderDeviceSelection();
    this.showNotification('Schema duplicated successfully', 'success');
  }
  
  deleteSchema(schemaId) {
    const schema = this.deviceSchemas.find(s => s.id === schemaId);
    if (!schema) return;
    
    if (this.deviceSchemas.length <= 1) {
      this.showNotification('Cannot delete the last schema', 'error');
      return;
    }
    
    if (confirm(`Delete schema "${schema.name}"?`)) {
      this.deviceSchemas = this.deviceSchemas.filter(s => s.id !== schemaId);
      this.saveSchemas();
      this.renderSchemas();
      this.renderDeviceSelection();
      this.showNotification('Schema deleted', 'success');
    }
  }
  
  previewJSON() {
    const selectedSchemas = this.deviceSchemas.filter(s => s.selected);
    
    if (selectedSchemas.length === 0) {
      this.showNotification('No schemas selected. Please select at least one schema to preview.', 'error');
      return;
    }
    
    const config = {
      nameField: this.shadowRoot.getElementById('json-field-1').value || 'name',
      idField: this.shadowRoot.getElementById('json-field-2').value || 'id',
      serialField: this.shadowRoot.getElementById('json-field-3').value || 'tag',
      labelField: this.shadowRoot.getElementById('json-field-4').value || 'label',
      timestampField: this.shadowRoot.getElementById('json-field-5').value || 'timestamp',
      valueField: this.shadowRoot.getElementById('json-field-6').value || 'value',
      includeUnits: this.shadowRoot.getElementById('include-units').checked,
      includeMetadata: this.shadowRoot.getElementById('include-metadata').checked
    };
    
    const result = [];
    selectedSchemas.forEach(schema => {
      schema.channels.forEach(channel => {
        const item = {
          [config.nameField]: schema.name,
          [config.idField]: `${schema.deviceType}_${channel.name.replace(/[^a-zA-Z0-9]/g, '')}`,
          [config.serialField]: `${schema.serialPrefix}${channel.name}`,
          [config.labelField]: `${schema.name} - ${channel.name}`
        };
        
        item[config.timestampField] = `${schema.name} - ${channel.name} Timestamp`;
        
        if (config.includeUnits && channel.unit) {
          item[config.valueField] = `${schema.name} - ${channel.name} (${channel.unit})`;
        } else {
          item[config.valueField] = `${schema.name} - ${channel.name}`;
        }
        
        if (config.includeMetadata) {
          item.manufacturer = schema.manufacturer;
          item.deviceType = schema.deviceType;
          item.firmware = schema.firmwareVersion;
          item.unit = channel.unit;
        }
        
        result.push(item);
      });
    });
    
    this.currentJSON = result;
    
    const previewSection = this.shadowRoot.getElementById('json-preview-section');
    const previewContent = this.shadowRoot.getElementById('json-preview-content');
    const countInfo = this.shadowRoot.getElementById('json-count-info');
    
    previewContent.textContent = JSON.stringify(result, null, 2);
    countInfo.textContent = `${result.length} items (${selectedSchemas.length} schemas × ${result.length / selectedSchemas.length} channels each)`;
    
    previewSection.style.display = 'block';
    
    this.shadowRoot.getElementById('copy-json-btn').disabled = false;
    this.shadowRoot.getElementById('download-json-btn').disabled = false;
    
    this.showNotification('JSON preview generated successfully', 'success');
  }
  
  copyJSONToClipboard() {
    if (!this.currentJSON) {
      this.showNotification('No JSON to copy. Generate a preview first.', 'error');
      return;
    }
    
    const json = JSON.stringify(this.currentJSON, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      this.showNotification('JSON copied to clipboard', 'success');
    }).catch(() => {
      this.showNotification('Failed to copy to clipboard', 'error');
    });
  }
  
  downloadJSONPreview() {
    if (!this.currentJSON) {
      this.showNotification('No JSON to download. Generate a preview first.', 'error');
      return;
    }
    
    const json = JSON.stringify(this.currentJSON, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `device_schemas_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showNotification('JSON downloaded successfully', 'success');
  }
  
  closeJSONPreview() {
    const previewSection = this.shadowRoot.getElementById('json-preview-section');
    previewSection.style.display = 'none';
    
    this.shadowRoot.getElementById('copy-json-btn').disabled = true;
    this.shadowRoot.getElementById('download-json-btn').disabled = true;
  }
  
  openImportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>📥 Import Device Schemas</h3>
          <button class="modal-close" id="close-import-modal">×</button>
        </div>
        <div class="modal-body">
          <div class="import-instructions" style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="margin: 0 0 0.5rem 0; color: #856404; font-size: 1rem;">📋 Required Headers</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; font-size: 0.875rem; color: #856404;">
              <div><strong>Name</strong><br>Schema name</div>
              <div><strong>Prefix</strong><br>Instrument tag</div>
              <div><strong>Type</strong><br>Device type</div>
              <div><strong>Manufacturer</strong><br>Maker</div>
            </div>
            <h4 style="margin: 1rem 0 0.5rem 0; color: #856404; font-size: 1rem; width: 100%; text-align: left;">Optional Channel Headers</h4>
            <p style="margin: 0; font-size: 0.875rem; color: #856404;">
              Add channels using patterns like:
              <code>Channel1</code>, <code>Channel_1</code>, <code>Channel-1</code>, <code>Channel 1</code><br>
              Or:
              <code>Unit1</code>, <code>Min1</code>, <code>Max1</code><br>
              Short forms also work:
              <code>Ch1</code>, <code>Ch02</code>, <code>C1</code>, <code>C3</code>
            </p>
          </div>
          
          <div class="form-group">
            <label>Data Format</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" name="import-format" value="auto" checked>
                <span>Auto-detect</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="import-format" value="csv">
                <span>CSV (comma)</span>
              </label>
              <label class="radio-option">
                <input type="radio" name="import-format" value="tsv">
                <span>TSV (tab)</span>
              </label>
            </div>
          </div>
          
          <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
            <button id="copy-template-btn" class="secondary-button" style="flex: 1; font-size: 0.875rem; padding: 0.5rem 1rem;">
              📋 Copy Template
            </button>
            <button id="load-example-btn" class="secondary-button" style="flex: 1; font-size: 0.875rem; padding: 0.5rem 1rem;">
              📝 Load Example
            </button>
          </div>
          
          <div class="form-group">
            <label>Paste Data</label>
            <textarea id="import-data-input" rows="10" placeholder="Paste CSV/TSV data here, or click 'Load Example' to see a sample..." style="width: 100%; font-family: monospace; font-size: 0.875rem; padding: 0.75rem; border: 2px solid #9c9c7e; border-radius: 0.375rem;"></textarea>
          </div>
          
          <div id="import-preview" style="display: none;">
            <h4>Preview (first 3 schemas)</h4>
            <div id="import-preview-content" style="max-height: 200px; overflow-y: auto; background: #f5f5dc; padding: 1rem; border-radius: 0.375rem; font-family: monospace; font-size: 0.875rem;"></div>
            <p id="import-stats" style="margin-top: 0.5rem; color: #9c9c7e; font-size: 0.875rem;"></p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="secondary-button modal-cancel" id="cancel-import">Cancel</button>
          <button class="primary-button modal-save" id="process-import" disabled>Import Schemas</button>
        </div>
      </div>
    `;
    
    this.shadowRoot.appendChild(modal);
    
    const dataInput = modal.querySelector('#import-data-input');
    const processBtn = modal.querySelector('#process-import');
    const preview = modal.querySelector('#import-preview');
    
    dataInput.addEventListener('input', () => {
      const text = dataInput.value.trim();
      if (text) {
        this.previewImportData(text, preview, modal);
        processBtn.disabled = false;
      } else {
        preview.style.display = 'none';
        processBtn.disabled = true;
      }
    });
    
    modal.querySelector('#copy-template-btn').addEventListener('click', () => {
      const template = 'Name,Prefix,Type,Manufacturer,Firmware,Channel1,Unit1,Min1,Max1,Channel2,Unit2,Min2,Max2';
      navigator.clipboard.writeText(template).then(() => {
        this.showNotification('Template copied to clipboard! Paste it in Excel/Sheets and fill in your data.', 'success');
      }).catch(() => {
        this.showNotification('Failed to copy template', 'error');
      });
    });
    
    modal.querySelector('#load-example-btn').addEventListener('click', () => {
      const example = `Name,Prefix,Type,Manufacturer,Firmware,Channel1,Unit1,Min1,Max1,Channel2,Unit2,Min2,Max2
Pressure Loop,PT-,Pressure Transmitter,Emerson,v2.0,Process_Pressure,kPa,0,1000,Ambient_Temp,°C,-10,50
Temperature Monitor,TT-,Temperature Transmitter,Yokogawa,v1.8,Process_Temp,°C,0,200,RTD_Temp,°C,-40,150
Level Sensor,LT-,Level Transmitter,Endress+Hauser,v3.1,Tank_Level,m,0,10,Level_Percent,%,0,100`;
      dataInput.value = example;
      dataInput.dispatchEvent(new Event('input'));
      this.showNotification('Example data loaded! Review and click Import.', 'info');
    });
    
    modal.querySelector('#close-import-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#cancel-import').addEventListener('click', () => modal.remove());
    modal.querySelector('#process-import').addEventListener('click', () => {
      this.processImport(dataInput.value.trim(), modal);
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') modal.remove();
    }, { once: true });
  }
  
  previewImportData(text, previewEl, modal) {
    try {
      const formatRadios = modal.querySelectorAll('input[name="import-format"]');
      let delimiter = ',';
      
      formatRadios.forEach(radio => {
        if (radio.checked) {
          if (radio.value === 'tsv') delimiter = '\t';
          else if (radio.value === 'auto') {
            const commas = (text.match(/,/g) || []).length;
            const tabs = (text.match(/\t/g) || []).length;
            delimiter = tabs > commas ? '\t' : ',';
          }
        }
      });
      
      const parsed = this.parseCSV(text, delimiter);
      
      if (parsed.length > 0) {
        const previewContent = modal.querySelector('#import-preview-content');
        const stats = modal.querySelector('#import-stats');
        
        const preview = parsed.slice(0, 3).map(schema => 
          `${schema.name} (${schema.serialPrefix}) - ${schema.channels.length} channels`
        ).join('\n');
        
        previewContent.textContent = preview;
        stats.textContent = `Found ${parsed.length} schema(s) to import`;
        previewEl.style.display = 'block';
      }
    } catch (e) {
      console.error('Preview error:', e);
    }
  }
  
  parseCSV(text, delimiter = ',') {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const schemas = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      const row = {};
      headers.forEach((header, idx) => {
        row[header.toLowerCase()] = values[idx] || '';
      });
      
      const schema = {
        id: Date.now() + i,
        name: row['name'] || row['schema'] || row['device'] || `Imported Schema ${i}`,
        serialPrefix: row['prefix'] || row['serial'] || row['id'] || 'IMP-',
        manufacturer: row['manufacturer'] || row['mfr'] || 'Unknown',
        deviceType: row['type'] || row['devicetype'] || 'Generic',
        firmwareVersion: row['firmware'] || row['version'] || 'v1.0.0',
        selected: false,
        channels: []
      };
      
      const channelPattern = /^(channel|ch|c)[_\-\s]?(\d+)?$/i;
      let channelIndex = 0;
      
      headers.forEach((header, idx) => {
        const lower = header.toLowerCase();
        const match = lower.match(channelPattern);
        
        if (match || lower.includes('channel')) {
          const channelName = values[idx] || `Channel_${channelIndex + 1}`;
          const unitHeader = headers.find(h => h.toLowerCase().includes('unit') && h.includes(match ? match[2] || (idx + 1) : ''));
          const minHeader = headers.find(h => h.toLowerCase().includes('min') && h.includes(match ? match[2] || (idx + 1) : ''));
          const maxHeader = headers.find(h => h.toLowerCase().includes('max') && h.includes(match ? match[2] || (idx + 1) : ''));
          
          const unitIdx = unitHeader ? headers.indexOf(unitHeader) : -1;
          const minIdx = minHeader ? headers.indexOf(minHeader) : -1;
          const maxIdx = maxHeader ? headers.indexOf(maxHeader) : -1;
          
          schema.channels.push({
            id: Date.now() + i + channelIndex + Math.random(),
            name: channelName,
            unit: unitIdx >= 0 ? values[unitIdx] : '',
            min: minIdx >= 0 ? parseFloat(values[minIdx]) || 0 : 0,
            max: maxIdx >= 0 ? parseFloat(values[maxIdx]) || 100 : 100,
            decimals: 2,
            distribution: 'normal'
          });
          channelIndex++;
        }
      });
      
      if (schema.channels.length === 0) {
        schema.channels.push({
          id: Date.now() + i + Math.random(),
          name: 'Channel_1',
          unit: '',
          min: 0,
          max: 100,
          decimals: 2,
          distribution: 'normal'
        });
      }
      
      schemas.push(schema);
    }
    
    return schemas;
  }
  
  processImport(text, modal) {
    try {
      const formatRadios = modal.querySelectorAll('input[name="import-format"]');
      let delimiter = ',';
      
      formatRadios.forEach(radio => {
        if (radio.checked) {
          if (radio.value === 'tsv') delimiter = '\t';
          else if (radio.value === 'auto') {
            const commas = (text.match(/,/g) || []).length;
            const tabs = (text.match(/\t/g) || []).length;
            delimiter = tabs > commas ? '\t' : ',';
          }
        }
      });
      
      const parsed = this.parseCSV(text, delimiter);
      
      if (parsed.length > 0) {
        this.deviceSchemas.push(...parsed);
        this.saveSchemas();
        this.renderSchemas();
        this.renderDeviceSelection();
        
        this.showNotification(`Successfully imported ${parsed.length} schema(s)`, 'success');
        modal.remove();
      } else {
        this.showNotification('No valid schemas found in the data', 'error');
      }
    } catch (e) {
      this.showNotification('Failed to parse import data: ' + e.message, 'error');
    }
  }
  
  clearStorage() {
    if (confirm('Clear all localStorage data and reset to default settings?\n\nThis will remove all custom device schemas and reload the page with initial defaults.')) {
      try {
        localStorage.removeItem('iotDeviceSchemas');
        this.showNotification('Storage cleared! Reloading page...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (e) {
        this.showNotification('Failed to clear storage: ' + e.message, 'error');
      }
    }
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.zIndex = '9001';
    this.shadowRoot.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

customElements.define('tool-iot-data-generator', ToolIoTDataGenerator);
