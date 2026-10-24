class WebSeo extends HTMLElement {
  constructor() {
    super()
    
    // This component doesn't use shadow DOM since it needs to modify the document head
    this.baseTitle = 'Web Tools'
    this.baseDescription = 'Free online developer tools for web developers and designers. Simple, fast, and easy to use web utilities.'
    this.baseUrl = 'https://jayrichh.github.io/'
    this.baseImageUrl = 'https://jayrichh.github.io/logo-bg-128.png'
    this.siteName = 'Web Tools - Developer Utilities'
    this.authorName = 'Jay Rich'
    this.organizationName = 'Web Tools'
  }
  
  connectedCallback() {
    // Get attributes or use defaults
    const pageTitle = this.getAttribute('page-title') || ''
    const pageDescription = this.getAttribute('description') || this.baseDescription
    const pageType = this.getAttribute('type') || 'website'
    const pagePath = this.getAttribute('path') || ''
    const pageImage = this.getAttribute('image') || this.baseImageUrl
    const pageKeywords = this.getAttribute('keywords') || 'web tools, developer tools, online utilities'
    const category = this.getAttribute('category') || 'UtilityApplication'
    const author = this.getAttribute('author') || this.authorName
    
    // Construct full title
    const fullTitle = pageTitle ? `${pageTitle} - ${this.baseTitle}` : this.baseTitle
    
    // Construct full URL
    const fullUrl = pagePath ? `${this.baseUrl}${pagePath}/` : this.baseUrl
    
    // Construct full image URL
    const fullImageUrl = pageImage.startsWith('http') ? pageImage : `${this.baseUrl}${pageImage.replace('../../', '')}`
    
    // Update document title
    document.title = fullTitle
    
    // Update or create basic meta tags
    this.updateMetaTag('description', pageDescription)
    this.updateMetaTag('keywords', pageKeywords)
    this.updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1')
    this.updateMetaTag('author', author)
    this.updateMetaTag('theme-color', '#d8a48f')
    this.updateMetaTag('msapplication-TileColor', '#d8a48f')
    
    // Language and locale
    this.updateMetaTag('language', 'en')
    this.updateMetaTag('geo.region', 'US')
    this.updateMetaTag('geo.placename', 'United States')
    
    // Update or create Open Graph tags
    this.updateMetaTag('og:title', fullTitle, 'property')
    this.updateMetaTag('og:description', pageDescription, 'property')
    this.updateMetaTag('og:type', pageType === 'WebApplication' ? 'website' : pageType, 'property')
    this.updateMetaTag('og:url', fullUrl, 'property')
    this.updateMetaTag('og:image', fullImageUrl, 'property')
    this.updateMetaTag('og:image:alt', `${pageTitle} - ${this.siteName}`, 'property')
    this.updateMetaTag('og:site_name', this.siteName, 'property')
    this.updateMetaTag('og:locale', 'en_US', 'property')
    
    // Update or create Twitter Card tags
    this.updateMetaTag('twitter:card', 'summary_large_image', 'name')
    this.updateMetaTag('twitter:title', fullTitle, 'name')
    this.updateMetaTag('twitter:description', pageDescription, 'name')
    this.updateMetaTag('twitter:image', fullImageUrl, 'name')
    this.updateMetaTag('twitter:image:alt', `${pageTitle} - ${this.siteName}`, 'name')
    this.updateMetaTag('twitter:creator', '@jayrichh', 'name')
    this.updateMetaTag('twitter:site', '@jayrichh', 'name')
    
    // Add Facebook specific tags
    this.updateMetaTag('fb:app_id', '', 'property')
    
    // Add canonical link
    this.updateCanonicalLink(fullUrl)
    
    // Add language link
    this.updateLanguageLink('en', fullUrl)
    
    // Add schema.org JSON-LD
    this.addSchemaOrgData(pageType, fullTitle, pageDescription, fullUrl, fullImageUrl, category, author)
    
    // Add breadcrumb schema if it's a tool page
    if (pagePath && pagePath.includes('')) {
      this.addBreadcrumbSchema(fullTitle, fullUrl, pagePath)
    }
  }
  
  updateMetaTag(name, content, attributeName = 'name') {
    let meta = document.querySelector(`meta[${attributeName}="${name}"]`)
    
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attributeName, name)
      document.head.appendChild(meta)
    }
    
    meta.setAttribute('content', content)
  }
  
  updateCanonicalLink(url) {
    let link = document.querySelector('link[rel="canonical"]')
    
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'canonical')
      document.head.appendChild(link)
    }
    
    link.setAttribute('href', url)
  }
  
  updateLanguageLink(lang, url) {
    let link = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
    
    if (!link) {
      link = document.createElement('link')
      link.setAttribute('rel', 'alternate')
      link.setAttribute('hreflang', lang)
      document.head.appendChild(link)
    }
    
    link.setAttribute('href', url)
  }
  
  addSchemaOrgData(type, title, description, url, imageUrl, category, author) {
    // Remove any existing schema.org script
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    existingScripts.forEach(script => script.remove())
    
    // Base organization data
    const organization = {
      '@type': 'Organization',
      'name': this.organizationName,
      'url': this.baseUrl,
      'logo': {
        '@type': 'ImageObject',
        'url': this.baseImageUrl,
        'width': 128,
        'height': 128
      },
      'sameAs': [
        'https://github.com/jayrichh',
        'https://linkedin.com/in/jayrichh'
      ]
    }
    
    // Create main schema.org data based on type
    let mainSchema = {}
    
    switch (type) {
      case 'WebApplication':
        mainSchema = {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          'name': title,
          'description': description,
          'url': url,
          'image': imageUrl,
          'applicationCategory': category || 'UtilityApplication',
          'operatingSystem': 'Any',
          'browserRequirements': 'Requires JavaScript enabled',
          'softwareVersion': '1.0',
          'datePublished': '2024-01-01',
          'dateModified': new Date().toISOString().split('T')[0],
          'isAccessibleForFree': true,
          'license': 'MIT',
          'author': {
            '@type': 'Person',
            'name': author,
            'url': 'https://github.com/jayrichh'
          },
          'publisher': organization,
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD',
            'availability': 'https://schema.org/InStock'
          },
          'featureList': [
            'Free to use',
            'No registration required',
            'Works offline',
            'Mobile responsive'
          ]
        }
        break
        
      case 'Article':
        mainSchema = {
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': title,
          'description': description,
          'url': url,
          'image': imageUrl,
          'datePublished': '2024-01-01',
          'dateModified': new Date().toISOString().split('T')[0],
          'author': {
            '@type': 'Person',
            'name': author,
            'url': 'https://github.com/jayrichh'
          },
          'publisher': organization,
          'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': url
          }
        }
        break
        
      case 'website':
      default:
        mainSchema = {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          'name': title,
          'description': description,
          'url': url,
          'image': imageUrl,
          'publisher': organization,
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${this.baseUrl}?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        }
    }
    
    // Create and append the main schema script
    const mainScript = document.createElement('script')
    mainScript.setAttribute('type', 'application/ld+json')
    mainScript.textContent = JSON.stringify(mainSchema, null, 2)
    document.head.appendChild(mainScript)
    
    // Add organization schema
    const orgScript = document.createElement('script')
    orgScript.setAttribute('type', 'application/ld+json')
    orgScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      ...organization
    }, null, 2)
    document.head.appendChild(orgScript)
  }
  
  addBreadcrumbSchema(title, url, path) {
    const pathParts = path.split('/').filter(part => part)
    const breadcrumbList = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': []
    }
    
    // Add home breadcrumb
    breadcrumbList.itemListElement.push({
      '@type': 'ListItem',
      'position': 1,
      'name': 'Home',
      'item': this.baseUrl
    })
    
    // Add tools breadcrumb if applicable
    if (pathParts[0] === 'tools') {
      breadcrumbList.itemListElement.push({
        '@type': 'ListItem',
        'position': 2,
        'name': 'Tools',
        'item': `${this.baseUrl}#tools`
      })
      
      // Add current tool breadcrumb
      if (pathParts[1]) {
        breadcrumbList.itemListElement.push({
          '@type': 'ListItem',
          'position': 3,
          'name': title.replace(` - ${this.baseTitle}`, ''),
          'item': url
        })
      }
    }
    
    const script = document.createElement('script')
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(breadcrumbList, null, 2)
    document.head.appendChild(script)
  }
}

customElements.define('web-seo', WebSeo)
