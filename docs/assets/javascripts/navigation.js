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

  initAccordion();
  if (window.document$) document$.subscribe(initAccordion);
})();
