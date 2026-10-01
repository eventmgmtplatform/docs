/* Keep the primary navigation compact and independently scrollable. */
(function () {
  function initAccordion() {
    var sidebar = document.querySelector('.md-sidebar--primary');
    if (!sidebar) return;

    sidebar.querySelectorAll('.md-nav__item--section').forEach(function (section) {
      var toggle = section.querySelector(':scope > input.md-nav__toggle');
      var label = section.querySelector(':scope > label.md-nav__link');
      var childNav = section.querySelector(':scope > nav.md-nav');
      if (!toggle || !label || !childNav || section.dataset.accordionReady) return;

      section.dataset.accordionReady = 'true';
      if (!childNav.id) childNav.id = toggle.id + '_content';
      label.setAttribute('aria-controls', childNav.id);
      label.setAttribute('aria-expanded', String(toggle.checked));

      toggle.addEventListener('change', function () {
        if (toggle.checked) {
          var siblings = section.parentElement.querySelectorAll(':scope > .md-nav__item--section');
          siblings.forEach(function (sibling) {
            if (sibling === section) return;
            var siblingToggle = sibling.querySelector(':scope > input.md-nav__toggle');
            if (siblingToggle) siblingToggle.checked = false;
          });
        }
        label.setAttribute('aria-expanded', String(toggle.checked));
      });
    });
  }

  function initPresentation() {
    var path = window.location.pathname;
    var article = document.querySelector('.md-content__inner');
    if (!article) return;

    article.classList.toggle('oem-architecture-page', path.indexOf('/architecture/') !== -1);
    article.classList.toggle('oem-flagship-page', /\/architecture\/oem-architecture-definition\/?$/.test(path));
    article.classList.toggle('oem-environment-page', /\/architecture\/d6-environment-evolution\/?$/.test(path));
    article.classList.toggle('oem-cross-cutting-page', /\/(data-authority-replay|multi-surface-interaction|ai-01-aiops-ai-architecture)\/?$/.test(path));

    article.querySelectorAll('.mermaid').forEach(function (diagram) {
      diagram.classList.add('oem-diagram');
      var heading = diagram.previousElementSibling;
      while (heading && !/^H[1-4]$/.test(heading.tagName)) heading = heading.previousElementSibling;
      var label = heading ? heading.textContent.toLowerCase() : '';
      diagram.classList.toggle('oem-diagram--solution', label.indexOf('solution architecture') !== -1 || label.indexOf('architecture map') !== -1);
      diagram.classList.toggle('oem-diagram--engineering', label.indexOf('engineering architecture') !== -1);
    });
  }

  initAccordion();
  initPresentation();
  window.addEventListener('load', function () {
    window.setTimeout(initPresentation, 0);
  });
  var drawer = document.getElementById('__drawer');
  if (drawer) {
    drawer.addEventListener('change', function () {
      document.documentElement.classList.toggle('em-drawer-closed', drawer.checked);
    });
  }
  if (window.document$) document$.subscribe(function () {
    initAccordion();
    initPresentation();
    window.setTimeout(initPresentation, 0);
  });
})();
