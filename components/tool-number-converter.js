class ToolNumberConverter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Load external stylesheet
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '../styles/tool-number-converter.css');
    
    // STATE
    this.decimalValue = 0;
    this.inputBase = 10;
    this.bitWidth = 32;
    this.signed = false;
    
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="container">
        <div class="main-content">
          <h1>🔢 Number Converter</h1>
          <p>Convert numbers between binary, decimal, hexadecimal, and octal instantly</p>
          
          <div class="converter-layout">
            <!-- Input Section -->
            <div class="input-section">
              <div class="section-header">
                <h2>Input</h2>
                <div class="base-selector">
                  <button class="base-btn active" data-base="10">Decimal</button>
                  <button class="base-btn" data-base="16">Hex</button>
                  <button class="base-btn" data-base="2">Binary</button>
                  <button class="base-btn" data-base="8">Octal</button>
                </div>
              </div>
              
              <div class="input-wrapper">
                <input 
                  type="text" 
                  id="number-input" 
                  class="number-input" 
                  placeholder="Enter a number..."
                  spellcheck="false"
                  autocomplete="off"
                />
                <div class="input-hint" id="input-hint">Base-10 (Decimal)</div>
              </div>
              
              <div class="quick-values">
                <button class="quick-btn" data-value="0">0</button>
                <button class="quick-btn" data-value="1">1</button>
                <button class="quick-btn" data-value="255">255</button>
                <button class="quick-btn" data-value="256">256</button>
                <button class="quick-btn" data-value="1024">1024</button>
                <button class="quick-btn" data-value="65535">65535</button>
                <button class="quick-btn" data-value="-1">-1</button>
                <button class="quick-btn" data-value="-128">-128</button>
              </div>
              
              <div class="options-row">
                <div class="option-group">
                  <label class="checkbox-label">
                    <input type="checkbox" id="signed-checkbox">
                    <span>Signed (Two's Complement)</span>
                  </label>
                </div>
                <div class="option-group">
                  <label for="bit-width">Bit Width:</label>
                  <select id="bit-width" class="bit-select">
                    <option value="8">8-bit</option>
                    <option value="16">16-bit</option>
                    <option value="32" selected>32-bit</option>
                    <option value="64">64-bit</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Conversions Grid -->
            <div class="conversions-section">
              <div class="section-header">
                <h2>Conversions</h2>
                <button id="copy-all-btn" class="copy-all-btn" title="Copy all conversions">📋 Copy All</button>
              </div>
              
              <div class="conversions-grid">
                <div class="conversion-card" data-base="2">
                  <div class="conversion-header">
                    <div class="conversion-title">
                      <span class="conversion-icon">⚡</span>
                      <span class="conversion-label">Binary</span>
                    </div>
                    <button class="copy-icon-btn" data-target="binary" title="Copy">📋</button>
                  </div>
                  <div class="conversion-value" id="binary-value">0</div>
                  <div class="conversion-meta">Base-2 • <span id="binary-bits">1 bit</span></div>
                </div>
                
                <div class="conversion-card" data-base="8">
                  <div class="conversion-header">
                    <div class="conversion-title">
                      <span class="conversion-icon">🔶</span>
                      <span class="conversion-label">Octal</span>
                    </div>
                    <button class="copy-icon-btn" data-target="octal" title="Copy">📋</button>
                  </div>
                  <div class="conversion-value" id="octal-value">0</div>
                  <div class="conversion-meta">Base-8 • <span id="octal-digits">1 digit</span></div>
                </div>
                
                <div class="conversion-card" data-base="10">
                  <div class="conversion-header">
                    <div class="conversion-title">
                      <span class="conversion-icon">🔟</span>
                      <span class="conversion-label">Decimal</span>
                    </div>
                    <button class="copy-icon-btn" data-target="decimal" title="Copy">📋</button>
                  </div>
                  <div class="conversion-value" id="decimal-value">0</div>
                  <div class="conversion-meta">Base-10 • Standard notation</div>
                </div>
                
                <div class="conversion-card" data-base="16">
                  <div class="conversion-header">
                    <div class="conversion-title">
                      <span class="conversion-icon">🔷</span>
                      <span class="conversion-label">Hexadecimal</span>
                    </div>
                    <button class="copy-icon-btn" data-target="hex" title="Copy">📋</button>
                  </div>
                  <div class="conversion-value" id="hex-value">0</div>
                  <div class="conversion-meta">Base-16 • <span id="hex-digits">1 digit</span></div>
                </div>
              </div>
            </div>
            
            <!-- Information Panel -->
            <div class="info-section">
              <div class="section-header">
                <h2>Details</h2>
              </div>
              
              <div class="info-grid">
                <div class="info-card">
                  <div class="info-label">Value Range</div>
                  <div class="info-value" id="range-info">0 to 4,294,967,295</div>
                </div>
                
                <div class="info-card">
                  <div class="info-label">Binary Representation</div>
                  <div class="info-value mono" id="binary-rep">00000000 00000000 00000000 00000000</div>
                </div>
                
                <div class="info-card">
                  <div class="info-label">Bytes</div>
                  <div class="info-value" id="bytes-info">4 bytes</div>
                </div>
                
                <div class="info-card">
                  <div class="info-label">Scientific Notation</div>
                  <div class="info-value mono" id="scientific-info">0 × 10⁰</div>
                </div>
              </div>
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
    this.updateConversions();
  }
  
  attachEventListeners() {
    // Input field
    const input = this.shadowRoot.getElementById('number-input');
    input.addEventListener('input', () => this.handleInput());
    
    // Base selector buttons
    this.shadowRoot.querySelectorAll('.base-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.shadowRoot.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.inputBase = parseInt(e.target.dataset.base);
        this.updateInputHint();
        this.handleInput();
      });
    });
    
    // Quick value buttons
    this.shadowRoot.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const value = e.target.dataset.value;
        input.value = value;
        this.handleInput();
      });
    });
    
    // Signed checkbox
    const signedCheckbox = this.shadowRoot.getElementById('signed-checkbox');
    signedCheckbox.addEventListener('change', (e) => {
      this.signed = e.target.checked;
      this.handleInput();
    });
    
    // Bit width selector
    const bitWidth = this.shadowRoot.getElementById('bit-width');
    bitWidth.addEventListener('change', (e) => {
      this.bitWidth = parseInt(e.target.value);
      this.handleInput();
    });
    
    // Copy buttons
    this.shadowRoot.querySelectorAll('.copy-icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        const valueEl = this.shadowRoot.getElementById(`${target}-value`);
        this.copyToClipboard(valueEl.textContent);
      });
    });
    
    // Copy all button
    this.shadowRoot.getElementById('copy-all-btn').addEventListener('click', () => {
      this.copyAllConversions();
    });
    
    // Conversion card click to use as input
    this.shadowRoot.querySelectorAll('.conversion-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking copy button
        if (e.target.closest('.copy-icon-btn')) return;
        
        const base = parseInt(card.dataset.base);
        const valueEl = card.querySelector('.conversion-value');
        
        // Set the clicked base as input base
        this.shadowRoot.querySelectorAll('.base-btn').forEach(b => b.classList.remove('active'));
        this.shadowRoot.querySelector(`[data-base="${base}"]`).classList.add('active');
        this.inputBase = base;
        
        // Set the value in input
        input.value = valueEl.textContent;
        this.updateInputHint();
        this.handleInput();
        
        this.showNotification(`Using ${card.querySelector('.conversion-label').textContent} as input`, 'info');
      });
    });
  }
  
  updateInputHint() {
    const hint = this.shadowRoot.getElementById('input-hint');
    const baseNames = {
      2: 'Binary (0b prefix optional)',
      8: 'Octal (0o prefix optional)',
      10: 'Decimal',
      16: 'Hexadecimal (0x prefix optional)'
    };
    hint.textContent = `Base-${this.inputBase} • ${baseNames[this.inputBase]}`;
  }
  
  handleInput() {
    const input = this.shadowRoot.getElementById('number-input');
    const value = input.value.trim();
    
    if (!value) {
      this.decimalValue = 0;
      this.updateConversions();
      return;
    }
    
    try {
      // Parse the input based on selected base
      this.decimalValue = this.parseInput(value);
      this.updateConversions();
    } catch (e) {
      this.showNotification('Invalid input for selected base', 'error');
    }
  }
  
  parseInput(value) {
    // Remove common separators
    value = value.replace(/[_\s,]/g, '');
    
    // Remove base prefixes if present
    if (this.inputBase === 2) {
      value = value.replace(/^0b/i, '');
    } else if (this.inputBase === 8) {
      value = value.replace(/^0o/i, '');
    } else if (this.inputBase === 16) {
      value = value.replace(/^0x/i, '');
    }
    
    // Parse the number
    let num = parseInt(value, this.inputBase);
    
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    
    // Handle signed values and bit width constraints
    const maxUnsigned = Math.pow(2, this.bitWidth) - 1;
    const maxSigned = Math.pow(2, this.bitWidth - 1) - 1;
    const minSigned = -Math.pow(2, this.bitWidth - 1);
    
    if (this.signed) {
      // For signed, clamp to range
      if (num > maxSigned) num = maxSigned;
      if (num < minSigned) num = minSigned;
    } else {
      // For unsigned, wrap around
      num = num & maxUnsigned;
    }
    
    return num;
  }
  
  updateConversions() {
    let displayValue = this.decimalValue;
    
    // Convert to unsigned representation for display if needed
    if (this.decimalValue < 0 && !this.signed) {
      displayValue = Math.pow(2, this.bitWidth) + this.decimalValue;
    } else if (this.signed && this.decimalValue < 0) {
      // For signed negative, get the two's complement representation
      displayValue = Math.pow(2, this.bitWidth) + this.decimalValue;
    }
    
    // Ensure value fits in bit width
    const mask = Math.pow(2, this.bitWidth) - 1;
    displayValue = displayValue & mask;
    
    // Update Binary
    const binaryStr = displayValue.toString(2).padStart(this.bitWidth, '0');
    const formattedBinary = binaryStr.match(/.{1,4}/g).join(' ');
    this.shadowRoot.getElementById('binary-value').textContent = '0b' + formattedBinary;
    this.shadowRoot.getElementById('binary-bits').textContent = `${this.bitWidth} bits`;
    
    // Update Octal
    const octalStr = displayValue.toString(8);
    this.shadowRoot.getElementById('octal-value').textContent = '0o' + octalStr;
    this.shadowRoot.getElementById('octal-digits').textContent = `${octalStr.length} digit${octalStr.length !== 1 ? 's' : ''}`;
    
    // Update Decimal (show actual signed value if signed mode)
    const decimalDisplay = this.signed && this.decimalValue < 0 ? this.decimalValue : displayValue;
    this.shadowRoot.getElementById('decimal-value').textContent = decimalDisplay.toLocaleString();
    
    // Update Hexadecimal
    const hexStr = displayValue.toString(16).toUpperCase();
    this.shadowRoot.getElementById('hex-value').textContent = '0x' + hexStr;
    this.shadowRoot.getElementById('hex-digits').textContent = `${hexStr.length} digit${hexStr.length !== 1 ? 's' : ''}`;
    
    // Update Details
    this.updateDetails(displayValue, binaryStr);
  }
  
  updateDetails(value, binaryStr) {
    // Range info
    const rangeEl = this.shadowRoot.getElementById('range-info');
    if (this.signed) {
      const min = -Math.pow(2, this.bitWidth - 1);
      const max = Math.pow(2, this.bitWidth - 1) - 1;
      rangeEl.textContent = `${min.toLocaleString()} to ${max.toLocaleString()}`;
    } else {
      const max = Math.pow(2, this.bitWidth) - 1;
      rangeEl.textContent = `0 to ${max.toLocaleString()}`;
    }
    
    // Binary representation with spacing
    const formattedBinary = binaryStr.match(/.{1,8}/g).join(' ');
    this.shadowRoot.getElementById('binary-rep').textContent = formattedBinary;
    
    // Bytes
    this.shadowRoot.getElementById('bytes-info').textContent = `${this.bitWidth / 8} byte${this.bitWidth / 8 !== 1 ? 's' : ''}`;
    
    // Scientific notation
    const actualValue = this.signed && this.decimalValue < 0 ? this.decimalValue : value;
    if (actualValue === 0) {
      this.shadowRoot.getElementById('scientific-info').textContent = '0 × 10⁰';
    } else {
      const exp = Math.floor(Math.log10(Math.abs(actualValue)));
      const mantissa = (actualValue / Math.pow(10, exp)).toFixed(3);
      const superscript = exp.toString().split('').map(c => {
        const digits = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        const minus = '⁻';
        return c === '-' ? minus : digits[c];
      }).join('');
      this.shadowRoot.getElementById('scientific-info').textContent = `${mantissa} × 10${superscript}`;
    }
  }
  
  copyAllConversions() {
    const binary = this.shadowRoot.getElementById('binary-value').textContent;
    const octal = this.shadowRoot.getElementById('octal-value').textContent;
    const decimal = this.shadowRoot.getElementById('decimal-value').textContent;
    const hex = this.shadowRoot.getElementById('hex-value').textContent;
    
    const text = `Binary: ${binary}\nOctal: ${octal}\nDecimal: ${decimal}\nHexadecimal: ${hex}`;
    this.copyToClipboard(text);
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
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 2000);
  }
}

customElements.define('tool-number-converter', ToolNumberConverter);
