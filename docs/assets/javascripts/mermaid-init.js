/* Render Mermaid locally on initial load and Material instant navigation. */
(function () {
  if (typeof mermaid === 'undefined') return;

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict'
  });

  function renderMermaid() {
    document.querySelectorAll('.mermaid:not([data-processed="true"])').forEach(function (diagram) {
      var code = diagram.querySelector(':scope > code');
      if (!code) return;
      var container = document.createElement('div');
      container.className = diagram.className;
      container.textContent = code.textContent;
      diagram.replaceWith(container);
    });

    return mermaid.run({
      querySelector: '.mermaid:not([data-processed="true"])'
    });
  }

  if (window.document$) {
    document$.subscribe(function () {
      renderMermaid().catch(function (error) {
        console.error('Mermaid rendering failed: ' + (error && error.message ? error.message : String(error)));
      });
    });
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMermaid, { once: true });
  } else {
    renderMermaid();
  }
})();
