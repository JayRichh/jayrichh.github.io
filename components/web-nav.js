class WebNav extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    
    const style = document.createElement('style')
    style.textContent = `
      :host {
        display: block;
        width: 100%;
      }
      
      .nav-drawer {
        position: fixed;
        inset: 0;
        background: var(--sage, #a3a380);
        z-index: var(--layer-nav, 9999);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        transform: translateY(100%);
        transition: transform 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .nav-drawer-inner {
        width: 100%;
        max-width: 84rem;
        margin: 0 auto;
        position: relative;
        padding: 0 var(--content-spacing, 1rem);
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
      }
      
      .nav-close {
        position: absolute;
        top: 0;
        right: var(--content-spacing, 1rem);
        width: var(--header-height, 4rem);
        height: var(--header-height, 4rem);
        background: none;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s ease;
        z-index: calc(var(--layer-nav, 9999) + 9000);
      }
      
      .nav-content {
        width: 100%;
        max-width: 80ch;
        padding: var(--content-spacing, 1rem);
        margin: auto;
        display: flex;
        flex-direction: column;
        gap: clamp(2rem, 4vh, 3rem);
        text-align: center;
      }
      
      @media (max-width: 768px) {
        .nav-close {
          position: fixed;
          right: var(--content-spacing, 1rem);
        }
        
        .nav-content {
          padding-top: calc(var(--header-height, 4rem) + var(--content-spacing, 1rem));
        }
      }
      
      .nav-close:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      
      .nav-close span {
        position: absolute;
        width: 28px;
        height: 3px;
        background: var(--light-beige, #f7f5e8);
        border-radius: 2px;
        box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
      }
      
      .nav-close span:first-child {
        transform: rotate(45deg);
      }
      
      .nav-close span:last-child {
        transform: rotate(-45deg);
      }
      
      .nav-drawer[aria-hidden="false"] {
        transform: translateY(0);
      }
      
      .nav-link {
        color: var(--light-beige, #f7f5e8);
        text-decoration: none;
        font-size: clamp(1.5rem, 4vw, 2rem);
        font-weight: 500;
        padding: clamp(0.75rem, 2vh, 1rem);
        transition: color var(--transition-speed, 0.3s) var(--transition-timing, cubic-bezier(0.4, 0.0, 0.2, 1)),
                    transform var(--transition-speed, 0.3s) var(--transition-timing, cubic-bezier(0.4, 0.0, 0.2, 1));
        position: relative;
        isolation: isolate;
      }
      
      .nav-link::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--light-beige, #f7f5e8);
        opacity: 0;
        z-index: -1;
        border-radius: 0.5rem;
        transition: opacity var(--transition-speed, 0.3s) var(--transition-timing, cubic-bezier(0.4, 0.0, 0.2, 1));
      }
      
      .nav-link:hover {
        color: var(--sage, #a3a380);
        transform: scale(1.05);
      }
      
      .nav-link:hover::after {
        opacity: 0.1;
      }
      
      .nav-section {
        margin-top: clamp(1.5rem, 3vh, 2rem);
        padding-top: clamp(1.5rem, 3vh, 2rem);
        border-top: 1px solid rgba(247, 245, 232, 0.1);
      }
      
      .nav-section-title {
        color: var(--vanilla, #d6ce93);
        font-size: clamp(1rem, 2vw, 1.2rem);
        margin-bottom: clamp(0.75rem, 2vh, 1rem);
        opacity: 0.7;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }
    `
    
    const template = document.createElement('template')
    template.innerHTML = `
      <nav class="nav-drawer" aria-hidden="true">
        <div class="nav-drawer-inner">
          <button class="nav-close" aria-label="Close menu">
            <span></span>
            <span></span>
          </button>
          <div class="nav-content">
            <div class="nav-section">
              <a href="" class="nav-link home-link">Home</a>
            </div>
            
            <div class="nav-section">
              <div class="nav-section-title">Development & Testing</div>
              <a href="" class="nav-link tool-link" data-tool="code-tools">Code Tools</a>
              <a href="" class="nav-link tool-link" data-tool="regex-tester">Regex Tester</a>
              <a href="" class="nav-link tool-link" data-tool="number-converter">Number Converter</a>
              <a href="" class="nav-link tool-link" data-tool="guid-base64">GUID Base64</a>
              <a href="" class="nav-link tool-link" data-tool="timestamp-converter">Timestamp Converter</a>
              <a href="" class="nav-link tool-link" data-tool="iot-data-generator">IoT Data Generator</a>
              <a href="" class="nav-link tool-link" data-tool="markdown">Markdown Editor</a>
            </div>

            <div class="nav-section">
              <div class="nav-section-title">Design & Layout</div>
              <a href="" class="nav-link tool-link" data-tool="color-picker">Color Picker</a>
              <a href="" class="nav-link tool-link" data-tool="contrast-checker">Contrast Checker</a>
              <a href="" class="nav-link tool-link" data-tool="css-grid">CSS Grid Builder</a>
              <a href="" class="nav-link tool-link" data-tool="flexbox">Flexbox Builder</a>
              <a href="" class="nav-link tool-link" data-tool="breakpoint-tester">Breakpoint Tester</a>
              <a href="" class="nav-link tool-link" data-tool="shader-playground">Shader Playground</a>
            </div>

            <div class="nav-section">
              <div class="nav-section-title">Productivity & Utilities</div>
              <a href="" class="nav-link tool-link" data-tool="totp">TOTP Generator</a>
              <a href="" class="nav-link tool-link" data-tool="password">Password Generator</a>
              <a href="" class="nav-link tool-link" data-tool="clipboard">Clipboard</a>
              <a href="" class="nav-link tool-link" data-tool="timezone">TimeSync</a>
              <a href="" class="nav-link tool-link" data-tool="text-transform">Text Transform</a>
              <a href="" class="nav-link tool-link" data-tool="emoji">Emoji Picker</a>
            </div>

            <div class="nav-section">
              <div class="nav-section-title">More</div>
              <a href="" class="nav-link about-link">About</a>
              <a href="https://jayrich.dev" class="nav-link" target="_blank" rel="noopener noreferrer">jayrich.dev</a>
            </div>
          </div>
        </div>
      </nav>
    `
    
    this.shadowRoot.appendChild(style)
    this.shadowRoot.appendChild(template.content.cloneNode(true))
    
    this.navDrawer = this.shadowRoot.querySelector('.nav-drawer')
    this.navClose = this.shadowRoot.querySelector('.nav-close')
    this.homeLink = this.shadowRoot.querySelector('.home-link')
    this.aboutLink = this.shadowRoot.querySelector('.about-link')
    this.toolLinks = this.shadowRoot.querySelectorAll('.tool-link')
  }
  
  connectedCallback() {
    this.setupPaths()
    this.setupEventListeners()
    
    // Listen for toggle-menu events from the header
    document.addEventListener('toggle-menu', (e) => {
      this.navDrawer.setAttribute('aria-hidden', !e.detail.isExpanded)
    })
  }
  
  setupPaths() {
    const basePath = this.getBasePath()
    
    // Set home link
    this.homeLink.href = `${basePath}index.html`
    
    // Set about link
    this.aboutLink.href = `${basePath}about.html`
    
    // Set tool links
    this.toolLinks.forEach(link => {
      const tool = link.dataset.tool
      link.href = `${basePath}${tool}/index.html`
    })
  }
  
  getBasePath() {
    const currentPath = window.location.pathname
    
    // If we're at the root or index.html
    if (currentPath === '/' || 
        currentPath.endsWith('/index.html') || 
        currentPath === '/' || 
        currentPath === '/index.html') {
      return ''
    }
    
    // // If we're in a tool directory
    // if (currentPath.includes('/')) {
    //   return '../../'
    // }
    
    return ''
  }
  
  setupEventListeners() {
    this.navClose.addEventListener('click', () => {
      this.navDrawer.setAttribute('aria-hidden', 'true')
      
      // Also update the menu toggle button in the header
      const event = new CustomEvent('nav-closed', {
        bubbles: true,
        composed: true
      })
      this.dispatchEvent(event)
    })
    
    // Handle keyboard escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && this.navDrawer.getAttribute('aria-hidden') === 'false') {
        this.navDrawer.setAttribute('aria-hidden', 'true')
        
        // Also update the menu toggle button in the header
        const event = new CustomEvent('nav-closed', {
          bubbles: true,
          composed: true
        })
        this.dispatchEvent(event)
      }
    })
    
    // Handle navigation with animation
    this.shadowRoot.addEventListener('click', e => {
      const link = e.target.closest('a')
      if (link && link.classList.contains('nav-link') && !link.hasAttribute('target')) {
        e.preventDefault()
        this.handleNavigation(link.href)
      }
    })
  }
  
  async handleNavigation(url) {
    this.navDrawer.style.transform = 'translateY(100%)'
    await new Promise(resolve => setTimeout(resolve, 300))
    window.location.href = url
  }
}

customElements.define('web-nav', WebNav)
