class ToolGuidBase64 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Load external stylesheet
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '../styles/tool-guid-base64.css');

    // STATE
    this.debounceTimeout = null;
    this.history = this.loadHistory();
    this.maxHistoryItems = 10;

    // Template
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          color: var(--dark-sage, #6b6b54);
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: var(--sage, #a3a380);
          font-size: 1rem;
        }

        .input-section {
          margin-bottom: 2rem;
        }

        .input-label {
          display: block;
          font-size: 0.875rem;
          color: var(--sage, #a3a380);
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        #input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--sage, #a3a380);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 100px;
          background: white;
          color: var(--dark-sage, #6b6b54);
          transition: border-color 0.2s;
        }

        #input:focus {
          outline: none;
          border-color: var(--buff, #d8a48f);
        }

        #input.valid {
          border-color: #4caf50;
        }

        #input.invalid {
          border-color: #f44336;
        }

        .input-controls {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: var(--sage, #a3a380);
          color: white;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          font-weight: 500;
        }

        button:hover {
          background: var(--buff, #d8a48f);
        }

        button:active {
          transform: translateY(1px);
        }

        button.primary {
          background: var(--dark-sage, #6b6b54);
        }

        button.primary:hover {
          background: var(--buff, #d8a48f);
        }

        .validation-message {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          min-height: 1rem;
        }

        .validation-message.error {
          color: #f44336;
        }

        .validation-message.success {
          color: #4caf50;
        }

        .output-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .output-section {
            grid-template-columns: 1fr;
          }
        }

        .output-card {
          background: var(--beige, #f5f5dc);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .output-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--dark-sage, #6b6b54);
          font-weight: 500;
        }

        .card-icon {
          font-size: 1.5rem;
        }

        .card-title {
          font-size: 1rem;
        }

        .card-body {
          margin-bottom: 1rem;
        }

        .output-value {
          min-height: 60px;
          padding: 0.75rem;
          background: var(--vanilla, #d6ce93);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          word-break: break-all;
          color: var(--dark-sage, #6b6b54);
        }

        .output-value.empty {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--sage, #a3a380);
          font-style: italic;
        }

        .copy-btn {
          width: 100%;
        }

        .history-section {
          background: var(--light-beige, #f7f5e8);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .history-header h3 {
          color: var(--dark-sage, #6b6b54);
          font-size: 1rem;
          font-weight: 500;
        }

        .text-btn {
          background: transparent;
          color: var(--sage, #a3a380);
          padding: 0.25rem 0.5rem;
          font-size: 0.75rem;
        }

        .text-btn:hover {
          background: transparent;
          color: var(--buff, #d8a48f);
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .empty-state {
          text-align: center;
          color: var(--sage, #a3a380);
          font-style: italic;
          padding: 2rem;
          font-size: 0.875rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border-radius: 4px;
          font-size: 0.875rem;
          gap: 1rem;
        }

        .history-content {
          flex: 1;
          min-width: 0;
        }

        .history-guid {
          font-family: 'Courier New', monospace;
          color: var(--dark-sage, #6b6b54);
          font-weight: 500;
          margin-bottom: 0.25rem;
          word-break: break-all;
        }

        .history-base64 {
          font-family: 'Courier New', monospace;
          color: var(--sage, #a3a380);
          font-size: 0.8rem;
          margin-bottom: 0.25rem;
          word-break: break-all;
        }

        .history-time {
          color: var(--sage, #a3a380);
          font-size: 0.75rem;
        }

        .history-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .use-btn {
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          background: var(--sage, #a3a380);
        }

        .remove-btn {
          padding: 0.25rem 0.5rem;
          background: transparent;
          color: var(--sage, #a3a380);
          border: 1px solid var(--sage, #a3a380);
          font-size: 0.875rem;
        }

        .remove-btn:hover {
          background: #f44336;
          border-color: #f44336;
          color: white;
        }

        .help-section {
          background: var(--light-beige, #f7f5e8);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .help-section h3 {
          color: var(--dark-sage, #6b6b54);
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        .help-section ul {
          list-style: none;
          padding-left: 0;
        }

        .help-section li {
          color: var(--sage, #a3a380);
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
          padding-left: 1.5rem;
          position: relative;
        }

        .help-section li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: var(--buff, #d8a48f);
        }

        .help-section code {
          background: white;
          padding: 0.125rem 0.25rem;
          border-radius: 2px;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          color: var(--dark-sage, #6b6b54);
        }

        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 4px;
          background: var(--dark-sage, #6b6b54);
          color: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          opacity: 0;
          transform: translateY(-20px);
          transition: opacity 0.3s, transform 0.3s;
          z-index: 1000;
          font-size: 0.875rem;
        }

        .notification.show {
          opacity: 1;
          transform: translateY(0);
        }

        .notification.success {
          background: #4caf50;
        }

        .notification.error {
          background: #f44336;
        }
      </style>

      <div class="container">
        <header class="header">
          <h1>GUID/UUID ⇄ Base64 Converter</h1>
          <p>Smart converter for MongoDB device IDs - paste any format</p>
        </header>

        <section class="input-section">
          <label class="input-label">Input (GUID or Base64)</label>
          <textarea id="input" placeholder="Paste GUID or Base64 here - auto-detects format"></textarea>
          <div class="input-controls">
            <button id="clear">Clear</button>
            <button id="generate" class="primary">Generate GUID</button>
          </div>
          <div id="validation" class="validation-message"></div>
        </section>

        <section class="output-section">
          <div class="output-card" data-format="guid">
            <div class="card-header">
              <span class="card-icon">🔑</span>
              <span class="card-title">GUID Format</span>
            </div>
            <div class="card-body">
              <div id="guid-output" class="output-value empty">Enter or paste a value above</div>
            </div>
            <button id="copy-guid" class="copy-btn">Copy GUID</button>
          </div>

          <div class="output-card" data-format="base64">
            <div class="card-header">
              <span class="card-icon">🔓</span>
              <span class="card-title">Base64 Format</span>
            </div>
            <div class="card-body">
              <div id="base64-output" class="output-value empty">Enter or paste a value above</div>
            </div>
            <button id="copy-base64" class="copy-btn">Copy Base64</button>
          </div>
        </section>

        <section class="history-section">
          <div class="history-header">
            <h3>Recent Conversions</h3>
            <button id="clear-history" class="text-btn">Clear All</button>
          </div>
          <div id="history-list" class="history-list"></div>
        </section>

        <section class="help-section">
          <h3>Supported Formats</h3>
          <ul>
            <li>GUID with hyphens: <code>0654B150-3D76-4178-B005-22B4995F70B7</code></li>
            <li>GUID without hyphens: <code>0654B1503D764178B00522B4995F70B7</code></li>
            <li>Base64: <code>ULFUBnY9eEGwBSK0mV9wtw==</code> (24 characters)</li>
            <li>Auto-detects format and converts to both representations</li>
          </ul>
        </section>
      </div>
    `;

    this.shadowRoot.appendChild(linkElem);
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.attachEventListeners();
    this.renderHistory();
  }

  attachEventListeners() {
    const input = this.shadowRoot.getElementById('input');
    const clearBtn = this.shadowRoot.getElementById('clear');
    const generateBtn = this.shadowRoot.getElementById('generate');
    const copyGuidBtn = this.shadowRoot.getElementById('copy-guid');
    const copyBase64Btn = this.shadowRoot.getElementById('copy-base64');
    const clearHistoryBtn = this.shadowRoot.getElementById('clear-history');

    input.addEventListener('input', () => {
      this.debouncedHandleInput();
    });

    clearBtn.addEventListener('click', () => {
      this.clearAll();
    });

    generateBtn.addEventListener('click', () => {
      this.generateRandomGuid();
    });

    copyGuidBtn.addEventListener('click', () => {
      const value = this.shadowRoot.getElementById('guid-output').textContent;
      if (value && !this.shadowRoot.getElementById('guid-output').classList.contains('empty')) {
        this.copyToClipboard(value);
      }
    });

    copyBase64Btn.addEventListener('click', () => {
      const value = this.shadowRoot.getElementById('base64-output').textContent;
      if (value && !this.shadowRoot.getElementById('base64-output').classList.contains('empty')) {
        this.copyToClipboard(value);
      }
    });

    clearHistoryBtn.addEventListener('click', () => {
      this.clearHistory();
    });
  }

  debouncedHandleInput() {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.handleInput();
    }, 300);
  }

  handleInput() {
    const input = this.shadowRoot.getElementById('input');
    const value = input.value.trim();

    if (!value) {
      this.clearOutputs();
      input.classList.remove('valid', 'invalid');
      this.showValidation('', '');
      return;
    }

    const type = this.detectInputType(value);

    try {
      if (type === 'guid') {
        const base64 = this.guidToBase64(value);
        const formattedGuid = this.formatGuid(value.replace(/-/g, ''));
        this.updateOutputs(formattedGuid, base64);
        input.classList.add('valid');
        input.classList.remove('invalid');
        this.showValidation('✓ Valid GUID format', 'success');
        this.saveToHistory(formattedGuid, base64);
      } else if (type === 'base64') {
        const guid = this.base64ToGuid(value);
        this.updateOutputs(guid, value);
        input.classList.add('valid');
        input.classList.remove('invalid');
        this.showValidation('✓ Valid Base64 format', 'success');
        this.saveToHistory(guid, value);
      } else {
        this.clearOutputs();
        input.classList.add('invalid');
        input.classList.remove('valid');
        this.showValidation('Invalid format. Expected GUID or Base64.', 'error');
      }
    } catch (error) {
      this.clearOutputs();
      input.classList.add('invalid');
      input.classList.remove('valid');
      this.showValidation(error.message, 'error');
    }
  }

  detectInputType(input) {
    const clean = input.trim();

    // Check for GUID pattern (with or without hyphens, case-insensitive)
    if (/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(clean)) {
      return 'guid';
    }

    // Check for Base64 pattern (length 22-24, standard Base64 chars)
    if (/^[A-Za-z0-9+/]+=*$/.test(clean) && clean.length >= 22 && clean.length <= 24) {
      return 'base64';
    }

    return 'unknown';
  }

  guidToBase64(guid) {
    const clean = guid.replace(/-/g, '').toUpperCase();

    if (clean.length !== 32 || !/^[0-9A-F]{32}$/.test(clean)) {
      throw new Error('Invalid GUID format. Expected 32 hexadecimal characters.');
    }

    const bytes = this.guidToBytes(clean);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64;
  }

  base64ToGuid(base64) {
    if (!/^[A-Za-z0-9+/]+=*$/.test(base64)) {
      throw new Error('Invalid Base64 format.');
    }

    const decoded = atob(base64);
    const bytes = Array.from(decoded, char => char.charCodeAt(0));

    if (bytes.length !== 16) {
      throw new Error('Invalid Base64 length. Expected 16 bytes (GUID).');
    }

    const guid = this.bytesToGuid(bytes);
    return guid;
  }

  guidToBytes(hexString) {
    const bytes = [];

    // Data1 (4 bytes) - little-endian
    for (let i = 6; i >= 0; i -= 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    // Data2 (2 bytes) - little-endian
    for (let i = 10; i >= 8; i -= 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    // Data3 (2 bytes) - little-endian
    for (let i = 14; i >= 12; i -= 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    // Data4 (8 bytes) - big-endian
    for (let i = 16; i < 32; i += 2) {
      bytes.push(parseInt(hexString.substr(i, 2), 16));
    }

    return bytes;
  }

  bytesToGuid(bytes) {
    const hex = [];

    // Data1 (4 bytes) - little-endian (reverse)
    for (let i = 3; i >= 0; i--) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }

    // Data2 (2 bytes) - little-endian (reverse)
    for (let i = 5; i >= 4; i--) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }

    // Data3 (2 bytes) - little-endian (reverse)
    for (let i = 7; i >= 6; i--) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }

    // Data4 (8 bytes) - big-endian (no reverse)
    for (let i = 8; i < 16; i++) {
      hex.push(bytes[i].toString(16).padStart(2, '0'));
    }

    const guidString = hex.join('').toUpperCase();
    return this.formatGuid(guidString);
  }

  formatGuid(hexString) {
    const clean = hexString.replace(/-/g, '').toUpperCase();
    return `${clean.substr(0, 8)}-${clean.substr(8, 4)}-${clean.substr(12, 4)}-${clean.substr(16, 4)}-${clean.substr(20, 12)}`;
  }

  updateOutputs(guid, base64) {
    const guidOutput = this.shadowRoot.getElementById('guid-output');
    const base64Output = this.shadowRoot.getElementById('base64-output');

    guidOutput.textContent = guid;
    guidOutput.classList.remove('empty');

    base64Output.textContent = base64;
    base64Output.classList.remove('empty');
  }

  clearOutputs() {
    const guidOutput = this.shadowRoot.getElementById('guid-output');
    const base64Output = this.shadowRoot.getElementById('base64-output');

    guidOutput.textContent = 'Enter or paste a value above';
    guidOutput.classList.add('empty');

    base64Output.textContent = 'Enter or paste a value above';
    base64Output.classList.add('empty');
  }

  clearAll() {
    const input = this.shadowRoot.getElementById('input');
    input.value = '';
    input.classList.remove('valid', 'invalid');
    this.clearOutputs();
    this.showValidation('', '');
  }

  showValidation(message, type) {
    const validation = this.shadowRoot.getElementById('validation');
    validation.textContent = message;
    validation.className = `validation-message ${type}`;
  }

  generateRandomGuid() {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    // Set version (4) and variant bits
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

    const guid = this.bytesToGuid(Array.from(bytes));

    const input = this.shadowRoot.getElementById('input');
    input.value = guid;
    this.handleInput();
  }

  // History Management
  loadHistory() {
    try {
      const stored = localStorage.getItem('guid-base64-history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveToHistory(guid, base64) {
    // Generate a unique ID for the entry
    const id = `${guid}-${Date.now()}`;

    const entry = {
      guid,
      base64,
      timestamp: Date.now(),
      id
    };

    // Remove duplicates (same GUID or Base64), add to front, limit to max
    this.history = [
      entry,
      ...this.history.filter(h => h.guid !== guid && h.base64 !== base64)
    ].slice(0, this.maxHistoryItems);

    try {
      localStorage.setItem('guid-base64-history', JSON.stringify(this.history));
    } catch (e) {
      console.warn('Failed to save history to localStorage:', e);
    }

    this.renderHistory();
  }

  clearHistory() {
    this.history = [];
    try {
      localStorage.removeItem('guid-base64-history');
    } catch (e) {
      console.warn('Failed to clear history from localStorage:', e);
    }
    this.renderHistory();
  }

  renderHistory() {
    const container = this.shadowRoot.getElementById('history-list');

    if (this.history.length === 0) {
      container.innerHTML = '<p class="empty-state">No recent conversions</p>';
      return;
    }

    container.innerHTML = this.history.map(entry => `
      <div class="history-item" data-id="${entry.id}">
        <div class="history-content">
          <div class="history-guid">${entry.guid}</div>
          <div class="history-base64">${entry.base64}</div>
          <div class="history-time">${this.formatTimeAgo(entry.timestamp)}</div>
        </div>
        <div class="history-actions">
          <button class="use-btn" data-guid="${entry.guid}">Use</button>
          <button class="remove-btn" data-id="${entry.id}">×</button>
        </div>
      </div>
    `).join('');

    // Attach event listeners
    container.querySelectorAll('.use-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const guid = e.target.dataset.guid;
        const input = this.shadowRoot.getElementById('input');
        input.value = guid;
        this.handleInput();
        this.showNotification('Loaded from history', 'success');
      });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.history = this.history.filter(h => h.id !== id);
        try {
          localStorage.setItem('guid-base64-history', JSON.stringify(this.history));
        } catch (err) {
          console.warn('Failed to update history in localStorage:', err);
        }
        this.renderHistory();
      });
    });
  }

  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard', 'success');
    }).catch(() => {
      this.showNotification('Failed to copy', 'error');
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    this.shadowRoot.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

customElements.define('tool-guid-base64', ToolGuidBase64);
