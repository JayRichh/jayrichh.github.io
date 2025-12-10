class ToolTimestampConverter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Load external stylesheet
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '../styles/tool-timestamp-converter.css');
    
    // STATE
    this.currentTimestamp = Date.now();
    this.useMilliseconds = true;
    
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="container">
        <div class="main-content">
          <h1>🕐 Timestamp Converter</h1>
          <p>Convert between Unix timestamps and human-readable dates</p>
          
          <div class="converter-section">
            <div class="input-section">
              <div class="section-header">
                <h2>Input</h2>
                <div class="input-controls">
                  <button id="now-btn" class="control-button">⏰ Current Time</button>
                  <div class="timestamp-type">
                    <label class="radio-option">
                      <input type="radio" name="timestamp-type" value="milliseconds" checked>
                      <span>Milliseconds</span>
                    </label>
                    <label class="radio-option">
                      <input type="radio" name="timestamp-type" value="seconds">
                      <span>Seconds</span>
                    </label>
                  </div>
                </div>
              </div>
              <input 
                type="text" 
                id="input-value" 
                class="input-field" 
                placeholder="Enter Unix timestamp or date string..."
                spellcheck="false"
              />
              <div class="input-info">
                <span id="input-validation" class="validation-msg"></span>
              </div>
              <div class="quick-actions">
                <button class="quick-btn" data-offset="0">Now</button>
                <button class="quick-btn" data-offset="-3600000">1 Hour Ago</button>
                <button class="quick-btn" data-offset="-86400000">1 Day Ago</button>
                <button class="quick-btn" data-offset="-604800000">1 Week Ago</button>
                <button class="quick-btn" data-offset="3600000">1 Hour Later</button>
                <button class="quick-btn" data-offset="86400000">1 Day Later</button>
              </div>
            </div>
            
            <div class="output-section">
              <div class="section-header">
                <h2>Conversions</h2>
              </div>
              
              <div class="conversion-grid">
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">Unix Timestamp (Seconds)</span>
                    <button class="copy-btn" data-target="unix-seconds" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="unix-seconds">0</div>
                  <div class="conversion-info">Seconds since Jan 1, 1970 00:00:00 UTC</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">Unix Timestamp (Milliseconds)</span>
                    <button class="copy-btn" data-target="unix-milliseconds" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="unix-milliseconds">0</div>
                  <div class="conversion-info">Milliseconds since Jan 1, 1970 00:00:00 UTC</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">ISO 8601 (UTC)</span>
                    <button class="copy-btn" data-target="iso-utc" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="iso-utc">-</div>
                  <div class="conversion-info">International standard format</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">ISO 8601 (Local)</span>
                    <button class="copy-btn" data-target="iso-local" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="iso-local">-</div>
                  <div class="conversion-info">With local timezone offset</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">RFC 2822</span>
                    <button class="copy-btn" data-target="rfc2822" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="rfc2822">-</div>
                  <div class="conversion-info">Email/HTTP date format</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">Human Readable (UTC)</span>
                    <button class="copy-btn" data-target="human-utc" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="human-utc">-</div>
                  <div class="conversion-info">Full date and time in UTC</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">Human Readable (Local)</span>
                    <button class="copy-btn" data-target="human-local" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="human-local">-</div>
                  <div class="conversion-info">Full date and time in local timezone</div>
                </div>
                
                <div class="conversion-card">
                  <div class="conversion-header">
                    <span class="conversion-label">Relative Time</span>
                    <button class="copy-btn" data-target="relative-time" title="Copy">📋</button>
                  </div>
                  <div class="conversion-output" id="relative-time">-</div>
                  <div class="conversion-info">Time ago or time until</div>
                </div>
              </div>
            </div>
            
            <div class="details-section">
              <div class="section-header">
                <h2>Details</h2>
              </div>
              <div class="details-grid">
                <div class="detail-item">
                  <span class="detail-label">Day of Week</span>
                  <span class="detail-value" id="day-of-week">-</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Day of Year</span>
                  <span class="detail-value" id="day-of-year">-</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Week of Year</span>
                  <span class="detail-value" id="week-of-year">-</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Quarter</span>
                  <span class="detail-value" id="quarter">-</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Is Leap Year</span>
                  <span class="detail-value" id="is-leap-year">-</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Timezone Offset</span>
                  <span class="detail-value" id="timezone-offset">-</span>
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
    this.setCurrentTime();
  }
  
  attachEventListeners() {
    // Input field
    const inputField = this.shadowRoot.getElementById('input-value');
    inputField.addEventListener('input', () => this.handleInput());
    
    // Now button
    this.shadowRoot.getElementById('now-btn').addEventListener('click', () => {
      this.setCurrentTime();
    });
    
    // Timestamp type radios
    this.shadowRoot.querySelectorAll('input[name="timestamp-type"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.useMilliseconds = e.target.value === 'milliseconds';
        this.handleInput();
      });
    });
    
    // Quick action buttons
    this.shadowRoot.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const offset = parseInt(btn.dataset.offset);
        const timestamp = Date.now() + offset;
        this.shadowRoot.getElementById('input-value').value = this.useMilliseconds ? timestamp : Math.floor(timestamp / 1000);
        this.handleInput();
      });
    });
    
    // Copy buttons
    this.shadowRoot.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetEl = this.shadowRoot.getElementById(targetId);
        this.copyToClipboard(targetEl.textContent);
      });
    });
  }
  
  setCurrentTime() {
    const now = Date.now();
    const inputField = this.shadowRoot.getElementById('input-value');
    inputField.value = this.useMilliseconds ? now : Math.floor(now / 1000);
    this.handleInput();
    this.showNotification('Set to current time', 'success');
  }
  
  handleInput() {
    const input = this.shadowRoot.getElementById('input-value').value.trim();
    const validation = this.shadowRoot.getElementById('input-validation');
    
    if (!input) {
      validation.textContent = '';
      validation.className = 'validation-msg';
      return;
    }
    
    try {
      let timestamp;
      
      // Try parsing as number (Unix timestamp)
      if (/^-?\d+$/.test(input)) {
        const num = parseInt(input);
        timestamp = this.useMilliseconds ? num : num * 1000;
      } 
      // Try parsing as date string
      else {
        const date = new Date(input);
        if (isNaN(date.getTime())) {
          validation.textContent = '⚠️ Invalid date format';
          validation.className = 'validation-msg error';
          return;
        }
        timestamp = date.getTime();
      }
      
      // Validate timestamp range
      if (timestamp < -62135596800000 || timestamp > 253402300799999) {
        validation.textContent = '⚠️ Timestamp out of valid range';
        validation.className = 'validation-msg warning';
      } else {
        validation.textContent = '✓ Valid';
        validation.className = 'validation-msg success';
      }
      
      this.currentTimestamp = timestamp;
      this.updateConversions();
      
    } catch (e) {
      validation.textContent = '⚠️ Invalid input';
      validation.className = 'validation-msg error';
    }
  }
  
  updateConversions() {
    const date = new Date(this.currentTimestamp);
    
    // Unix timestamps
    this.shadowRoot.getElementById('unix-seconds').textContent = Math.floor(this.currentTimestamp / 1000);
    this.shadowRoot.getElementById('unix-milliseconds').textContent = this.currentTimestamp;
    
    // ISO formats
    this.shadowRoot.getElementById('iso-utc').textContent = date.toISOString();
    this.shadowRoot.getElementById('iso-local').textContent = this.formatISOLocal(date);
    
    // RFC 2822
    this.shadowRoot.getElementById('rfc2822').textContent = this.formatRFC2822(date);
    
    // Human readable
    this.shadowRoot.getElementById('human-utc').textContent = this.formatHumanReadable(date, true);
    this.shadowRoot.getElementById('human-local').textContent = this.formatHumanReadable(date, false);
    
    // Relative time
    this.shadowRoot.getElementById('relative-time').textContent = this.formatRelativeTime(this.currentTimestamp);
    
    // Update details
    this.updateDetails(date);
  }
  
  formatISOLocal(date) {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const minutes = String(absOffset % 60).padStart(2, '0');
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    const ms = String(date.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${ms}${sign}${hours}:${minutes}`;
  }
  
  formatRFC2822(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const day = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const offsetHours = String(Math.floor(absOffset / 60)).padStart(2, '0');
    const offsetMinutes = String(absOffset % 60).padStart(2, '0');
    
    return `${day}, ${dd} ${month} ${year} ${hh}:${mm}:${ss} ${sign}${offsetHours}${offsetMinutes}`;
  }
  
  formatHumanReadable(date, utc = false) {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: utc ? 'UTC' : undefined,
      timeZoneName: 'short'
    };
    
    return date.toLocaleString('en-US', options);
  }
  
  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = timestamp - now;
    const absDiff = Math.abs(diff);
    const isPast = diff < 0;
    
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    let timeStr;
    if (years > 0) {
      timeStr = `${years} year${years !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      timeStr = `${months} month${months !== 1 ? 's' : ''}`;
    } else if (weeks > 0) {
      timeStr = `${weeks} week${weeks !== 1 ? 's' : ''}`;
    } else if (days > 0) {
      timeStr = `${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      timeStr = `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      timeStr = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      timeStr = `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    return isPast ? `${timeStr} ago` : `in ${timeStr}`;
  }
  
  updateDetails(date) {
    // Day of week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.shadowRoot.getElementById('day-of-week').textContent = days[date.getDay()];
    
    // Day of year
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    this.shadowRoot.getElementById('day-of-year').textContent = dayOfYear;
    
    // Week of year
    const weekOfYear = Math.ceil(dayOfYear / 7);
    this.shadowRoot.getElementById('week-of-year').textContent = weekOfYear;
    
    // Quarter
    const quarter = Math.floor((date.getMonth() + 3) / 3);
    this.shadowRoot.getElementById('quarter').textContent = `Q${quarter}`;
    
    // Is leap year
    const year = date.getFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    this.shadowRoot.getElementById('is-leap-year').textContent = isLeapYear ? 'Yes' : 'No';
    
    // Timezone offset
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    this.shadowRoot.getElementById('timezone-offset').textContent = `UTC${sign}${hours}:${String(minutes).padStart(2, '0')}`;
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

customElements.define('tool-timestamp-converter', ToolTimestampConverter);
