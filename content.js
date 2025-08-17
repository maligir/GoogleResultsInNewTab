// Function to determine if a link should open in a new tab
function shouldOpenInNewTab(link) {
  const href = link.href.toLowerCase();
  const text = link.textContent.toLowerCase();
  const className = link.className.toLowerCase();

  // Skip if already has target="_blank" or "_self"
  if (link.getAttribute('target') === '_blank' || link.getAttribute('target') === '_self') {
      return false;
  }

  // Skip links with onclick handlers
  if (link.hasAttribute('onclick')) {
      return false;
  }

  // Skip small/utility links or buttons
  if (link.role === 'button' || className.includes('btn') || className.includes('button')) {
      return false;
  }
  if (text.length < 3 || className.includes('small') || className.includes('utility')) {
      return false;
  }

  // Skip navigation elements (header/footer/nav/sidebar)
  const navigationSelectors = [
      'nav a', 'header a', 'footer a', '.nav a', '.navigation a',
      '.menu a', '.breadcrumb a', '.pagination a', '.tabs a',
      '.tab a', '.sidebar a', '.sidebar-nav a'
  ];
  if (navigationSelectors.some(selector => link.matches(selector))) {
      return false;
  }

  // Open downloads or document links in new tabs
  const downloadExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.exe', '.dmg', '.apk', '.deb', '.rpm', '.msi'];
  if (downloadExtensions.some(ext => href.endsWith(ext)) || href.includes('/download') || href.includes('/file')) {
      return true;
  }

  // Open external links in new tabs
  const currentDomain = window.location.hostname;
  const linkDomain = link.hostname;
  if (linkDomain !== currentDomain) {
      return true;
  }

  // Default: do not open internal same-domain links in new tab
  return false;
}

// Function to process all links
function processLinks() {
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
      if (link.dataset.processed === 'true') return;
      if (shouldOpenInNewTab(link)) {
          link.dataset.processed = 'true';
          link.setAttribute('target', '_blank');
          const currentRel = link.getAttribute('rel') || '';
          if (!currentRel.includes('noopener')) {
              link.setAttribute('rel', (currentRel + ' noopener noreferrer').trim());
          }
      }
  });
}

// Process links immediately and dynamically
processLinks();
const observer = new MutationObserver(() => setTimeout(processLinks, 100));
observer.observe(document.body, { childList: true, subtree: true });
document.addEventListener('DOMContentLoaded', processLinks);
window.addEventListener('load', processLinks);
