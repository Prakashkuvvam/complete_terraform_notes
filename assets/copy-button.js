(function () {
  'use strict';

  // Add visible copy button to each code block
  document.querySelectorAll('pre > code').forEach(function (codeBlock) {
    var pre = codeBlock.parentElement;
    if (!pre || pre.tagName !== 'PRE') return;

    // Skip if already has a copy button
    if (pre.querySelector('.copy-button')) return;

    // Ensure pre is positioned for absolute button placement
    pre.style.position = 'relative';

    // Create the button
    var button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.setAttribute('type', 'button');

    pre.appendChild(button);

    button.addEventListener('click', function () {
      var code = codeBlock.textContent || '';

      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(function () {
          button.textContent = 'Copied!';
          button.classList.add('copied');
          setTimeout(function () {
            button.textContent = 'Copy';
            button.classList.remove('copied');
          }, 2000);
        }).catch(function () {
          fallbackCopy(code, button);
        });
      } else {
        fallbackCopy(code, button);
      }
    });
  });

  function fallbackCopy(text, button) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      button.textContent = 'Copied!';
      button.classList.add('copied');
      setTimeout(function () {
        button.textContent = 'Copy';
        button.classList.remove('copied');
      }, 2000);
    } catch (e) {
      button.textContent = 'Error';
      setTimeout(function () {
        button.textContent = 'Copy';
      }, 2000);
    }
    document.body.removeChild(textarea);
  }
})();
