class ToolRegexTester extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Load external stylesheet
    const linkElem = document.createElement('link');
    linkElem.setAttribute('rel', 'stylesheet');
    linkElem.setAttribute('href', '../styles/tool-regex-tester.css');
    
    // STATE
    this.pattern = '';
    this.flags = { g: true, i: false, m: false, s: false, u: false, y: false };
    this.testString = '';
    this.replaceString = '';
    this.matches = [];
    
    const template = document.createElement('template');
    template.innerHTML = `
      <div class="container">
        <div class="main-content">
          <h1>🔍 Regex Tester</h1>
          <p>Test and debug regular expressions with live pattern matching</p>
          
          <div class="tester-section">
            <div class="pattern-section">
              <div class="section-header">
                <h2>Regular Expression</h2>
              </div>
              <div class="regex-preview-container" id="regex-preview-container">
                <div class="preview-label">Pattern Preview</div>
                <button class="regex-preview" id="regex-preview" title="Click to copy">
                  <span id="regex-preview-text">/(?:)/</span>
                </button>
              </div>
              <div class="pattern-input-container">
                <span class="regex-delimiter">/</span>
                <input 
                  type="text" 
                  id="pattern-input" 
                  class="pattern-input" 
                  placeholder="Enter regex pattern..."
                  spellcheck="false"
                />
                <span class="regex-delimiter">/</span>
                <div class="flags-container">
                  <label class="flag-label" title="Global - Find all matches">
                    <input type="checkbox" name="flag-g" checked>
                    <span>g</span>
                  </label>
                  <label class="flag-label" title="Case insensitive">
                    <input type="checkbox" name="flag-i">
                    <span>i</span>
                  </label>
                  <label class="flag-label" title="Multiline - ^ and $ match line breaks">
                    <input type="checkbox" name="flag-m">
                    <span>m</span>
                  </label>
                  <label class="flag-label" title="Dotall - . matches newlines">
                    <input type="checkbox" name="flag-s">
                    <span>s</span>
                  </label>
                  <label class="flag-label" title="Unicode">
                    <input type="checkbox" name="flag-u">
                    <span>u</span>
                  </label>
                  <label class="flag-label" title="Sticky - Match from lastIndex">
                    <input type="checkbox" name="flag-y">
                    <span>y</span>
                  </label>
                </div>
              </div>
              <div class="pattern-info">
                <span id="pattern-validation" class="validation-msg"></span>
              </div>
              <div class="quick-patterns">
                <button class="quick-pattern-btn" data-pattern="\\d+" data-desc="Numbers">Numbers</button>
                <button class="quick-pattern-btn" data-pattern="[A-Za-z]+" data-desc="Letters">Letters</button>
                <button class="quick-pattern-btn" data-pattern="\\w+" data-desc="Words">Words</button>
                <button class="quick-pattern-btn" data-pattern="\\S+" data-desc="Non-whitespace">Non-space</button>
                <button class="quick-pattern-btn" data-pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}" data-desc="Email">Email</button>
                <button class="quick-pattern-btn" data-pattern="https?://[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+" data-desc="URL">URL</button>
                <button class="quick-pattern-btn" data-pattern="\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}\\b" data-desc="IPv4">IPv4</button>
                <button class="quick-pattern-btn" data-pattern="#[0-9A-Fa-f]{6}\\b|#[0-9A-Fa-f]{3}\\b" data-desc="Hex Color">Hex Color</button>
              </div>
            </div>
            
            <div class="test-string-section">
              <div class="section-header">
                <h2>Test String</h2>
                <div class="match-count" id="match-count">0 matches</div>
              </div>
              <textarea 
                id="test-string" 
                class="test-string-input" 
                placeholder="Enter test string..."
                spellcheck="false"
              ></textarea>
              <div class="test-actions">
                <button id="clear-test-btn" class="secondary-button">🗑️ Clear</button>
                <button id="sample-text-btn" class="secondary-button">📝 Sample Text</button>
              </div>
            </div>
            
            <div class="results-section">
              <div class="section-header">
                <h2>Matches</h2>
                <button id="copy-matches-btn" class="action-button" disabled>📋 Copy All Matches</button>
              </div>
              <div id="matches-container" class="matches-container">
                <p class="no-matches">No matches found. Try adjusting your pattern or test string.</p>
              </div>
            </div>
            
            <div class="replace-section">
              <div class="section-header">
                <h2>Replace</h2>
              </div>
              <div class="replace-controls">
                <input 
                  type="text" 
                  id="replace-input" 
                  class="replace-input" 
                  placeholder="Replacement string (use $1, $2 for groups)..."
                  spellcheck="false"
                />
                <button id="replace-btn" class="primary-button" disabled>🔄 Replace</button>
              </div>
              <div class="replace-result-container" id="replace-result-container" style="display: none;">
                <div class="replace-result-header">
                  <span class="result-label">Result</span>
                  <button id="copy-result-btn" class="action-button">📋 Copy</button>
                </div>
                <pre id="replace-result" class="replace-result"></pre>
              </div>
            </div>
            
            <div class="reference-section">
              <div class="section-header">
                <h2>Quick Reference</h2>
              </div>
              <div class="reference-grid">
                <div class="reference-card">
                  <div class="reference-title">Character Classes</div>
                  <div class="reference-items">
                    <div class="reference-item"><code>\\d</code> Digit (0-9)</div>
                    <div class="reference-item"><code>\\w</code> Word (a-z, A-Z, 0-9, _)</div>
                    <div class="reference-item"><code>\\s</code> Whitespace</div>
                    <div class="reference-item"><code>.</code> Any character (except newline)</div>
                    <div class="reference-item"><code>[abc]</code> Character set</div>
                    <div class="reference-item"><code>[^abc]</code> Negated set</div>
                  </div>
                </div>
                
                <div class="reference-card">
                  <div class="reference-title">Quantifiers</div>
                  <div class="reference-items">
                    <div class="reference-item"><code>*</code> 0 or more</div>
                    <div class="reference-item"><code>+</code> 1 or more</div>
                    <div class="reference-item"><code>?</code> 0 or 1</div>
                    <div class="reference-item"><code>{n}</code> Exactly n</div>
                    <div class="reference-item"><code>{n,}</code> n or more</div>
                    <div class="reference-item"><code>{n,m}</code> Between n and m</div>
                  </div>
                </div>
                
                <div class="reference-card">
                  <div class="reference-title">Anchors</div>
                  <div class="reference-items">
                    <div class="reference-item"><code>^</code> Start of string/line</div>
                    <div class="reference-item"><code>$</code> End of string/line</div>
                    <div class="reference-item"><code>\\b</code> Word boundary</div>
                    <div class="reference-item"><code>\\B</code> Not word boundary</div>
                  </div>
                </div>
                
                <div class="reference-card">
                  <div class="reference-title">Groups</div>
                  <div class="reference-items">
                    <div class="reference-item"><code>(abc)</code> Capturing group</div>
                    <div class="reference-item"><code>(?:abc)</code> Non-capturing</div>
                    <div class="reference-item"><code>(?&lt;name&gt;abc)</code> Named group</div>
                    <div class="reference-item"><code>a|b</code> Alternation (OR)</div>
                  </div>
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
    this.testRegex();
  }
  
  attachEventListeners() {
    // Regex preview copy button
    const regexPreview = this.shadowRoot.getElementById('regex-preview');
    regexPreview.addEventListener('click', () => {
      const regexText = this.shadowRoot.getElementById('regex-preview-text').textContent;
      this.copyToClipboard(regexText);
    });
    
    // Pattern input
    const patternInput = this.shadowRoot.getElementById('pattern-input');
    patternInput.addEventListener('input', () => this.testRegex());
    
    // Flag checkboxes
    this.shadowRoot.querySelectorAll('[name^="flag-"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const flag = e.target.name.replace('flag-', '');
        this.flags[flag] = e.target.checked;
        this.testRegex();
      });
    });
    
    // Test string input
    const testString = this.shadowRoot.getElementById('test-string');
    testString.addEventListener('input', () => this.testRegex());
    
    // Quick pattern buttons
    this.shadowRoot.querySelectorAll('.quick-pattern-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        patternInput.value = btn.dataset.pattern;
        this.testRegex();
        this.showNotification(`Pattern set: ${btn.dataset.desc}`, 'info');
      });
    });
    
    // Clear and sample text buttons
    this.shadowRoot.getElementById('clear-test-btn').addEventListener('click', () => {
      this.shadowRoot.getElementById('test-string').value = '';
      this.testRegex();
    });
    
    this.shadowRoot.getElementById('sample-text-btn').addEventListener('click', () => {
      const sampleText = `Hello World! This is a sample text with various elements:
Email: john.doe@example.com
Phone: +1-555-123-4567
Website: https://www.example.com
IP Address: 192.168.1.1
Date: 2024-01-15
Numbers: 42, 3.14159, -17
Hex Color: #FF5733, #abc
Lorem ipsum dolor sit amet, consectetur adipiscing elit.`;
      this.shadowRoot.getElementById('test-string').value = sampleText;
      this.testRegex();
      this.showNotification('Sample text loaded', 'success');
    });
    
    // Copy matches button
    this.shadowRoot.getElementById('copy-matches-btn').addEventListener('click', () => {
      this.copyMatches();
    });
    
    // Replace functionality
    this.shadowRoot.getElementById('replace-input').addEventListener('input', () => {
      this.updateReplace();
    });
    
    this.shadowRoot.getElementById('replace-btn').addEventListener('click', () => {
      this.updateReplace();
    });
    
    this.shadowRoot.getElementById('copy-result-btn')?.addEventListener('click', () => {
      const result = this.shadowRoot.getElementById('replace-result').textContent;
      this.copyToClipboard(result);
    });
  }
  
  testRegex() {
    const patternInput = this.shadowRoot.getElementById('pattern-input');
    const testString = this.shadowRoot.getElementById('test-string');
    const validation = this.shadowRoot.getElementById('pattern-validation');
    
    this.pattern = patternInput.value;
    this.testString = testString.value;
    
    // Update regex preview
    this.updateRegexPreview();
    
    if (!this.pattern) {
      validation.textContent = '';
      validation.className = 'validation-msg';
      this.clearResults();
      return;
    }
    
    try {
      const flagString = Object.keys(this.flags).filter(f => this.flags[f]).join('');
      const regex = new RegExp(this.pattern, flagString);
      
      validation.textContent = '✓ Valid regex';
      validation.className = 'validation-msg success';
      
      // Find matches
      this.matches = [];
      if (this.testString) {
        if (this.flags.g) {
          let match;
          while ((match = regex.exec(this.testString)) !== null) {
            this.matches.push({
              match: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups
            });
          }
        } else {
          const match = regex.exec(this.testString);
          if (match) {
            this.matches.push({
              match: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups
            });
          }
        }
      }
      
      this.displayResults();
      this.updateReplace();
      
    } catch (e) {
      validation.textContent = `⚠️ ${e.message}`;
      validation.className = 'validation-msg error';
      this.clearResults();
    }
  }
  
  displayResults() {
    const container = this.shadowRoot.getElementById('matches-container');
    const matchCount = this.shadowRoot.getElementById('match-count');
    const copyBtn = this.shadowRoot.getElementById('copy-matches-btn');
    const replaceBtn = this.shadowRoot.getElementById('replace-btn');
    
    if (this.matches.length === 0) {
      container.innerHTML = '<p class="no-matches">No matches found. Try adjusting your pattern or test string.</p>';
      matchCount.textContent = '0 matches';
      copyBtn.disabled = true;
      replaceBtn.disabled = true;
      return;
    }
    
    matchCount.textContent = `${this.matches.length} match${this.matches.length !== 1 ? 'es' : ''}`;
    copyBtn.disabled = false;
    replaceBtn.disabled = false;
    
    container.innerHTML = '';
    this.matches.forEach((match, idx) => {
      const matchCard = document.createElement('div');
      matchCard.className = 'match-card';
      
      let groupsHTML = '';
      if (match.groups.length > 0 || match.namedGroups) {
        groupsHTML = '<div class="match-groups">';
        match.groups.forEach((group, gIdx) => {
          if (group !== undefined) {
            groupsHTML += `<div class="group-item"><span class="group-label">Group ${gIdx + 1}:</span> <code>${this.escapeHtml(group)}</code></div>`;
          }
        });
        if (match.namedGroups) {
          Object.entries(match.namedGroups).forEach(([name, value]) => {
            if (value !== undefined) {
              groupsHTML += `<div class="group-item"><span class="group-label">&lt;${name}&gt;:</span> <code>${this.escapeHtml(value)}</code></div>`;
            }
          });
        }
        groupsHTML += '</div>';
      }
      
      matchCard.innerHTML = `
        <div class="match-header">
          <span class="match-index">Match ${idx + 1}</span>
          <span class="match-position">Position: ${match.index}-${match.index + match.match.length}</span>
        </div>
        <div class="match-content">
          <code>${this.escapeHtml(match.match)}</code>
        </div>
        ${groupsHTML}
      `;
      
      container.appendChild(matchCard);
    });
  }
  
  clearResults() {
    const container = this.shadowRoot.getElementById('matches-container');
    const matchCount = this.shadowRoot.getElementById('match-count');
    const copyBtn = this.shadowRoot.getElementById('copy-matches-btn');
    const replaceBtn = this.shadowRoot.getElementById('replace-btn');
    
    container.innerHTML = '<p class="no-matches">No matches found. Try adjusting your pattern or test string.</p>';
    matchCount.textContent = '0 matches';
    copyBtn.disabled = true;
    replaceBtn.disabled = true;
    this.matches = [];
    
    const replaceResultContainer = this.shadowRoot.getElementById('replace-result-container');
    replaceResultContainer.style.display = 'none';
  }
  
  updateReplace() {
    const replaceInput = this.shadowRoot.getElementById('replace-input');
    const replaceResult = this.shadowRoot.getElementById('replace-result');
    const replaceResultContainer = this.shadowRoot.getElementById('replace-result-container');
    
    if (this.matches.length === 0 || !this.pattern) {
      replaceResultContainer.style.display = 'none';
      return;
    }
    
    try {
      const flagString = Object.keys(this.flags).filter(f => this.flags[f]).join('');
      const regex = new RegExp(this.pattern, flagString);
      const result = this.testString.replace(regex, replaceInput.value);
      
      replaceResult.textContent = result;
      replaceResultContainer.style.display = 'block';
    } catch (e) {
      replaceResultContainer.style.display = 'none';
    }
  }
  
  copyMatches() {
    const matchesText = this.matches.map((m, idx) => 
      `Match ${idx + 1}: ${m.match} (Position: ${m.index})`
    ).join('\n');
    
    this.copyToClipboard(matchesText);
  }
  
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('Copied to clipboard', 'success');
    }).catch(() => {
      this.showNotification('Failed to copy', 'error');
    });
  }
  
  updateRegexPreview() {
    const previewText = this.shadowRoot.getElementById('regex-preview-text');
    const flagString = Object.keys(this.flags).filter(f => this.flags[f]).join('');
    const pattern = this.pattern || '';
    previewText.textContent = `/${pattern}/${flagString}`;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

customElements.define('tool-regex-tester', ToolRegexTester);
