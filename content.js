// Function to determine if a link should open in a new tab
function shouldOpenInNewTab(link) {
  const href = link.href.toLowerCase();
  const text = link.textContent.toLowerCase();
  const className = link.className.toLowerCase();
  const id = link.id.toLowerCase();
  
  // Skip if link already has target="_blank" or target="_self"
  if (link.getAttribute('target') === '_blank' || link.getAttribute('target') === '_self') {
    return false;
  }
  
  // Skip if link has onclick that might handle navigation
  if (link.hasAttribute('onclick')) {
    return false;
  }
  
  // Skip internal navigation links (same domain)
  const currentDomain = window.location.hostname;
  const linkDomain = link.hostname;
  if (linkDomain === currentDomain) {
    // But allow certain internal links that should open in new tabs
    const internalNewTabPatterns = [
      '/download', '/file', '/pdf', '/doc', '/docx', '/xls', '/xlsx',
      '/print', '/print/', '/printer', '/export', '/export/',
      'mailto:', 'tel:', 'sms:', 'whatsapp:', 'telegram:'
    ];
    
    const shouldOpenInternal = internalNewTabPatterns.some(pattern => 
      href.includes(pattern)
    );
    
    if (shouldOpenInternal) {
      return true;
    }
    
    // Skip most internal links
    return false;
  }
  
  // Skip certain types of links that should stay in same tab
  const sameTabPatterns = [
    'mailto:', 'tel:', 'sms:', 'whatsapp:', 'telegram:',
    'javascript:', 'data:', 'file:', 'chrome://', 'moz-extension://',
    'chrome-extension://', 'edge://', 'about:', 'view-source:'
  ];
  
  if (sameTabPatterns.some(pattern => href.startsWith(pattern))) {
    return false;
  }
  
  // Skip certain website-specific patterns
  const sameTabSites = [
    'gmail.com', 'mail.google.com', 'outlook.com', 'mail.live.com',
    'yahoo.com/mail', 'protonmail.com', 'tutanota.com',
    'google.com/maps', 'maps.google.com', 'bing.com/maps',
    'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
    'linkedin.com', 'youtube.com', 'netflix.com', 'spotify.com',
    'discord.com', 'slack.com', 'teams.microsoft.com',
    'github.com', 'gitlab.com', 'bitbucket.org',
    'stackoverflow.com', 'reddit.com', 'quora.com',
    'amazon.com', 'ebay.com', 'etsy.com',
    'bankofamerica.com', 'chase.com', 'wellsfargo.com',
    'paypal.com', 'stripe.com', 'square.com'
  ];
  
  if (sameTabSites.some(site => href.includes(site))) {
    return false;
  }
  
  // Skip navigation elements
  const navigationSelectors = [
    'nav a', 'header a', 'footer a', '.nav a', '.navigation a',
    '.menu a', '.breadcrumb a', '.pagination a', '.tabs a',
    '.tab a', '.sidebar a', '.sidebar-nav a'
  ];
  
  if (navigationSelectors.some(selector => link.matches(selector))) {
    return false;
  }
  
  // Skip buttons that look like links
  if (link.role === 'button' || className.includes('btn') || className.includes('button')) {
    return false;
  }
  
  // Skip small/utility links
  if (text.length < 3 || className.includes('small') || className.includes('utility')) {
    return false;
  }
  
  // Open external links in new tabs
  if (linkDomain !== currentDomain) {
    return true;
  }
  
  // Open download/file links in new tabs
  if (href.includes('/download') || href.includes('/file') || 
      href.includes('.pdf') || href.includes('.doc') || 
      href.includes('.xls') || href.includes('.zip') ||
      href.includes('.exe') || href.includes('.dmg') ||
      href.includes('.apk') || href.includes('.deb') ||
      href.includes('.rpm') || href.includes('.msi')) {
    return true;
  }
  
  return false;
}

// Function to process links
function processLinks() {
  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    // Skip if already processed
    if (link.dataset.processed === 'true') {
      return;
    }
    
    // Check if this link should open in a new tab
    if (shouldOpenInNewTab(link)) {
      // Mark as processed
      link.dataset.processed = 'true';
      
      // Add target="_blank" attribute
      link.setAttribute('target', '_blank');
      
      // Add rel="noopener noreferrer" for security
      const currentRel = link.getAttribute('rel') || '';
      if (!currentRel.includes('noopener')) {
        link.setAttribute('rel', (currentRel + ' noopener noreferrer').trim());
      }
    }
  });
}

// Process links immediately
processLinks();

// Set up MutationObserver to watch for dynamically loaded content
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      shouldProcess = true;
    }
  });
  
  if (shouldProcess) {
    // Small delay to ensure DOM is fully updated
    setTimeout(processLinks, 100);
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Also process on DOMContentLoaded for initial content
document.addEventListener('DOMContentLoaded', processLinks);

// Process on window load as well
window.addEventListener('load', processLinks);
  