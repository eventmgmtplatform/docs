/* OEM Kyndryl Documentation Theme v1 — navigation and presentation hooks. */
(function () {
  var domains = [
    { label: 'Documentation', href: '/', match: /^\/$/ },
    { label: 'Architecture', href: '/architecture/oem-architecture-definition/', match: /^\/architecture\// },
    { label: 'Platform', href: '/platform/', match: /^\/platform\// },
    { label: 'Operations', href: '/operations/local-runbook/', match: /^\/operations\// },
    { label: 'Development', href: '/development/contributing/', match: /^\/development\// },
    { label: 'Reference', href: '/reference/api/', match: /^\/reference\// }
  ];

  function sitePath(path) {
    var base = '/event-mgmt-docs';
    return base + (path === '/' ? '/' : path);
  }

  function relativePath() {
    return window.location.pathname.replace(/^\/event-mgmt-docs/, '') || '/';
  }

  function initHeader() {
    var header = document.querySelector('.md-header');
    if (!header) return;

    var titleLink = header.querySelector('.md-header__button.md-logo');
    if (titleLink && !titleLink.querySelector('.oem-mark')) {
      titleLink.innerHTML = '<span class="oem-mark" aria-hidden="true">O</span>';
      titleLink.setAttribute('aria-label', 'Open Event Management home');
    }

    if (document.querySelector('.oem-domain-tabs')) return;
    var current = relativePath();
    var nav = document.createElement('nav');
    nav.className = 'oem-domain-tabs';
    nav.setAttribute('aria-label', 'Documentation domains');
    var inner = document.createElement('div');
    inner.className = 'oem-domain-tabs__inner';

    domains.forEach(function (domain) {
      var link = document.createElement('a');
      link.className = 'oem-domain-tabs__link';
      link.href = sitePath(domain.href);
      link.textContent = domain.label;
      if (domain.match.test(current)) {
        link.classList.add('oem-domain-tabs__link--active');
        link.setAttribute('aria-current', 'page');
      }
      inner.appendChild(link);
    });
    nav.appendChild(inner);
    header.insertAdjacentElement('afterend', nav);
  }

  function initAccordion() {
    var sidebar = document.querySelector('.md-sidebar--primary');
    if (!sidebar || sidebar.dataset.accordionReady) return;
    sidebar.dataset.accordionReady = 'true';

    var rootNav = sidebar.querySelector(':scope .md-nav--primary');
    if (rootNav && !rootNav.querySelector('.oem-product-selector')) {
      var selector = document.createElement('div');
      selector.className = 'oem-product-selector';
      selector.innerHTML = '<span class="oem-product-selector__mark" aria-hidden="true">O</span><span>Open Event Management</span><span class="oem-product-selector__chevron" aria-hidden="true">⌄</span>';
      rootNav.insertBefore(selector, rootNav.firstChild);
    }

    function setExpanded(section, expanded) {
      var toggle = section.querySelector(':scope > input.md-nav__toggle');
      var label = section.querySelector(':scope > label.md-nav__link');
      if (toggle) toggle.checked = expanded;
      section.classList.toggle('oem-nav-collapsed', !expanded);
      if (label) label.setAttribute('aria-expanded', String(expanded));
    }

    sidebar.querySelectorAll('.md-nav__item--nested').forEach(function (section) {
      var toggle = section.querySelector(':scope > input.md-nav__toggle');
      var label = section.querySelector(':scope > label.md-nav__link');
      var childNav = section.querySelector(':scope > nav.md-nav');
      if (!toggle || !label || !childNav) return;
      if (!childNav.id) childNav.id = toggle.id + '_content';
      label.setAttribute('tabindex', '0');
      label.setAttribute('aria-controls', childNav.id);
      setExpanded(section, section.classList.contains('md-nav__item--active'));
    });

    function activateGroup(event) {
      var label = event.target.closest('label.md-nav__link');
      var section = label && label.parentElement;
      if (!section || !section.classList.contains('md-nav__item--nested')) return;
      if (label !== section.querySelector(':scope > label.md-nav__link')) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      setExpanded(section, section.classList.contains('oem-nav-collapsed'));
    }

    sidebar.addEventListener('click', activateGroup, true);
    sidebar.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') activateGroup(event);
    }, true);
  }

  function initPresentation() {
    var path = relativePath();
    var article = document.querySelector('.md-content__inner');
    if (!article) return;
    article.classList.toggle('oem-home-page', path === '/');
    article.classList.toggle('oem-architecture-page', path.indexOf('/architecture/') === 0);
    article.querySelectorAll('.mermaid').forEach(function (diagram) {
      diagram.classList.add('oem-diagram');
    });
  }

  function init() {
    initHeader();
    initAccordion();
    initPresentation();
  }

  init();
  window.addEventListener('load', init);
  var drawer = document.getElementById('__drawer');
  if (drawer) drawer.addEventListener('change', function () {
    document.documentElement.classList.toggle('oem-drawer-closed', drawer.checked);
  });
  if (window.document$) document$.subscribe(init);
})();
