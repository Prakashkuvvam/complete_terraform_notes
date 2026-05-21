(function () {
  'use strict';

  // ── Only run on practice test pages ──
  var article = document.querySelector('.book-article');
  var details = article && article.querySelector('details');
  if (!details) return;

  // Check if this page has an answer key table (practice test indicator)
  var answerTables = details.querySelectorAll('table');
  if (!answerTables.length) return;

  /* =============================================================
     1. COLLECT QUESTIONS FROM THE DOM
     ============================================================= */

  function collectQuestions(root) {
    var children = [];
    for (var i = 0; i < root.children.length; i++) {
      children.push(root.children[i]);
    }

    var questions = [];
    var currentDomain = 'General';

    for (var ci = 0; ci < children.length; ci++) {
      var el = children[ci];

      // Track domain headings
      if (el.tagName === 'H2' || el.tagName === 'H3') {
        var headingText = el.textContent.trim();
        if (/domain/i.test(headingText) || /^\d+\./.test(headingText)) {
          currentDomain = headingText;
        }
        continue;
      }

      // Skip the details/answer section
      if (el.tagName === 'DETAILS') {
        break; // Everything after is answer key, stop collecting
      }

      // Look for <p><strong>Q#.</strong> pattern
      if (el.tagName === 'P' && el.querySelector('strong')) {
        var strong = el.querySelector('strong');
        var strongText = strong.textContent.trim();
        var qMatch = strongText.match(/^Q(\d+)\./i);
        if (!qMatch) continue;

        var qNum = parseInt(qMatch[1], 10);

        // Get full question text (remove the Q#. prefix)
        var qText = el.innerHTML;
        qText = qText.replace(/<strong>Q\d+\.<\/strong>\s*/i, '').trim();

        // Determine if multi-select (select two / choose two)
        var isMulti = /select\s+two|choose\s+two|select\s+all|all\s+that\s+apply/i.test(el.textContent);

        // Find options by scanning forward, skipping intermediate elements
        // like <pre> (code blocks) and non-option <p> elements
        var options = [];
        var optionsElement = null;
        var elementsToRemove = [el];

        var scanEl = el.nextElementSibling;
        while (scanEl && scanEl.tagName !== 'DETAILS' && options.length === 0) {
          elementsToRemove.push(scanEl);

          if (scanEl.tagName === 'UL') {
            // Check if list items look like options (A), B), etc.)
            var items = scanEl.querySelectorAll('li');
            var parsedAny = false;
            for (var liIdx = 0; liIdx < items.length; liIdx++) {
              var li = items[liIdx];
              var liText = li.innerHTML.trim();
              var liMatch = liText.match(/^([A-Z])[)\.]\s*/);
              if (liMatch) {
                options.push({
                  key: liMatch[1].toUpperCase(),
                  label: liText.substring(liMatch[0].length).trim()
                });
                parsedAny = true;
              }
            }
            // If all items have option-like prefixes, this is our options element
            if (parsedAny && options.length === items.length) {
              optionsElement = scanEl;
            } else if (parsedAny && options.length > 0) {
              // Partial match — still use it
              optionsElement = scanEl;
            } else {
              // Not options, clear and keep scanning
              options = [];
            }
          } else if (scanEl.tagName === 'P') {
            // Check if this paragraph contains A) B) C) D) patterns
            var pContent = scanEl.innerHTML;
            var parts = pContent.split(/<br\s*\/?>/i);
            if (parts.length >= 2) {
              // Try splitting by <br>
              var parsedParts = [];
              for (var pi = 0; pi < parts.length; pi++) {
                var part = parts[pi].trim();
                var optMatch = part.match(/^([A-Z])[)\.]\s*/);
                if (optMatch) {
                  parsedParts.push({
                    key: optMatch[1].toUpperCase(),
                    label: part.substring(optMatch[0].length).trim()
                  });
                }
              }
              if (parsedParts.length >= 2) {
                options = parsedParts;
                optionsElement = scanEl;
              }
            } else if (/^[A-Z]\)\s/.test(pContent.trim())) {
              // Single-line option like "A) Option"
              var singleMatch = pContent.trim().match(/^([A-Ze])\)\s*(.*)/);
              if (singleMatch) {
                options.push({
                  key: singleMatch[1].toUpperCase(),
                  label: singleMatch[2].trim()
                });
                optionsElement = scanEl;
              }
            }
          }

          scanEl = scanEl.nextElementSibling;
        }

        // Fallback: check if question p contains options inline
        if (options.length === 0) {
          var inlineMatch = el.innerHTML.match(/([A-E])\)\s+([^<]+)/g);
          if (inlineMatch && inlineMatch.length >= 2) {
            for (var ii = 0; ii < inlineMatch.length; ii++) {
              var im = inlineMatch[ii].match(/([A-E])\)\s+(.*)/);
              if (im) {
                options.push({
                  key: im[1],
                  label: im[2].trim()
                });
              }
            }
            optionsElement = el; // Mark question p as the options source
          }
        }

        questions.push({
          number: qNum,
          text: qText,
          options: options,
          domain: currentDomain,
          isMulti: isMulti,
          element: el,
          optionsElement: optionsElement,
          elementsToRemove: elementsToRemove
        });
      }
    }

    return questions;
  }

  /* =============================================================
     2. PARSE ANSWER KEY FROM TABLE(S)
     ============================================================= */

  function parseAnswerKey(tables) {
    var key = {};

    for (var t = 0; t < tables.length; t++) {
      var table = tables[t];
      var rows = table.querySelectorAll('tbody tr');
      if (!rows.length) {
        // Maybe this table has no thead/tbody separation
        rows = table.querySelectorAll('tr');
      }

      for (var r = 0; r < rows.length; r++) {
        var cells = rows[r].querySelectorAll('td');
        if (cells.length < 2) continue;

        var qNumStr = cells[0].textContent.trim();
        var qNum = parseInt(qNumStr, 10);
        if (isNaN(qNum)) continue;

        // The answer might be in a <strong> or just plain text
        var answerCell = cells[1];
        var strong = answerCell.querySelector('strong');
        var answer = (strong ? strong.textContent : answerCell.textContent).trim().toUpperCase();

        // Handle multi-answer like "A, B" or "A and B"
        var answers = answer.split(/[,&]|and/i).map(function (a) { return a.trim(); });
        key[qNum] = {
          raw: answer,
          values: answers
        };
      }
    }

    return key;
  }

  /* =============================================================
     3. TRANSFORM DOM FOR INTERACTIVITY
     ============================================================= */

  function initInteractive(article, questions, answerKey) {
    // ── Top bar: header + Clear All ──
    var topBar = document.createElement('div');
    topBar.className = 'exam-interactive-controls';
    topBar.innerHTML =
      '<div class="exam-interactive-header">' +
        '<h3>📝 Interactive Mode</h3>' +
        '<p class="exam-interactive-subtitle">Select your answers below, then click "Submit Answers" at the bottom to check your score.</p>' +
      '</div>' +
      '<div class="exam-interactive-actions">' +
        '<span class="exam-answered-badge" id="exam-answered-badge">0 / ' + questions.length + ' answered</span>' +
        '<button class="exam-btn exam-btn-reset" id="exam-reset-btn">🔄 Clear All</button>' +
      '</div>';

    // Insert top bar after exam controls (timer)
    var examControls = article.querySelector('.exam-controls');
    if (examControls) {
      examControls.parentNode.insertBefore(topBar, examControls.nextSibling);
    } else {
      article.insertBefore(topBar, article.firstChild);
    }

    // Transform each question
    for (var qi = 0; qi < questions.length; qi++) {
      var q = questions[qi];
      transformQuestion(q, questions);
    }

    // ── Bottom bar: Submit + score summary (inserted before details/answer key) ──
    var detailsEl = article.querySelector('details');
    var bottomBar = document.createElement('div');
    bottomBar.className = 'exam-interactive-controls exam-bottom-bar';
    bottomBar.id = 'exam-bottom-bar';
    bottomBar.innerHTML =
      '<div class="exam-interactive-actions">' +
        '<button class="exam-btn exam-btn-submit" id="exam-submit-btn">✅ Submit Answers</button>' +
        '<button class="exam-btn exam-btn-reset" id="exam-reset-btn-bottom">🔄 Clear All</button>' +
      '</div>' +
      '<div class="exam-score-summary" id="exam-score-summary" style="display:none;"></div>';

    article.insertBefore(bottomBar, detailsEl);

    // Bind events
    document.getElementById('exam-submit-btn').addEventListener('click', function () {
      gradeTest(questions, answerKey);
    });

    function resetHandler() { resetTest(questions); }
    document.getElementById('exam-reset-btn').addEventListener('click', resetHandler);
    document.getElementById('exam-reset-btn-bottom').addEventListener('click', resetHandler);

    // Track answered count
    article.addEventListener('change', function () {
      updateAnsweredCount(questions);
    });
    updateAnsweredCount(questions);
  }

  function transformQuestion(q, questions) {
    var wrapper = document.createElement('div');
    wrapper.className = 'exam-question-card';
    wrapper.dataset.qnum = q.number;
    wrapper.dataset.domain = q.domain;

    // Question header
    var header = document.createElement('div');
    header.className = 'exam-q-header';
    header.innerHTML = '<span class="exam-q-number">Q' + q.number + '</span>' +
      '<span class="exam-q-text">' + q.text + '</span>';

    wrapper.appendChild(header);

    // Options
    var optionsDiv = document.createElement('div');
    optionsDiv.className = 'exam-q-options';

    var inputType = q.isMulti ? 'checkbox' : 'radio';
    var groupName = 'exam-q-' + q.number;

    for (var oi = 0; oi < q.options.length; oi++) {
      var opt = q.options[oi];
      var optDiv = document.createElement('div');
      optDiv.className = 'exam-option';
      optDiv.dataset.key = opt.key;

      var input = document.createElement('input');
      input.type = inputType;
      input.name = groupName;
      input.value = opt.key;
      input.id = groupName + '-' + opt.key;
      input.className = 'exam-option-input';

      var label = document.createElement('label');
      label.className = 'exam-option-label';
      label.htmlFor = input.id;

      var keySpan = document.createElement('span');
      keySpan.className = 'exam-option-key';
      keySpan.textContent = opt.key + ')';

      var textSpan = document.createElement('span');
      textSpan.className = 'exam-option-text';
      textSpan.innerHTML = opt.label;

      label.appendChild(keySpan);
      label.appendChild(textSpan);
      optDiv.appendChild(input);
      optDiv.appendChild(label);

      // Make entire option row clickable
      optDiv.addEventListener('click', function (e) {
        var inp = this.querySelector('.exam-option-input');
        if (!inp || inp.disabled) return;
        // Don't double-fire — the <label> with htmlFor already handles clicks
        // on itself and its children (spans, text nodes) natively.
        if (e.target.closest('.exam-option-label, .exam-option-input')) return;
        if (inp.type === 'radio') {
          inp.checked = true;
        } else {
          inp.checked = !inp.checked;
        }
        // Trigger change event for answered count tracking
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent('change', true, false);
        inp.dispatchEvent(evt);
      });

      optionsDiv.appendChild(optDiv);
    }

    wrapper.appendChild(optionsDiv);

    // Per-question clear button
    var clearRow = document.createElement('div');
    clearRow.className = 'exam-q-clear-row';
    var clearBtn = document.createElement('button');
    clearBtn.className = 'exam-btn exam-btn-clear-q';
    clearBtn.textContent = '✕ Clear';
    clearBtn.type = 'button';
    clearBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      clearSingleQuestion(wrapper);
      updateAnsweredCount(questions);
    });
    clearRow.appendChild(clearBtn);
    wrapper.appendChild(clearRow);

    // Feedback area
    var feedback = document.createElement('div');
    feedback.className = 'exam-q-feedback';
    feedback.id = 'exam-feedback-' + q.number;
    wrapper.appendChild(feedback);

    // Replace all elements from question p through options
    // (including intermediate elements like <pre> code blocks)
    var parent = q.element.parentNode;
    var insertBeforeEl = q.elementsToRemove[q.elementsToRemove.length - 1].nextElementSibling;
    parent.insertBefore(wrapper, insertBeforeEl);
    for (var ri = 0; ri < q.elementsToRemove.length; ri++) {
      var elToRemove = q.elementsToRemove[ri];
      if (elToRemove && elToRemove.parentNode === parent) {
        parent.removeChild(elToRemove);
      }
    }
  }

  /* ── Clear single question ── */
  function clearSingleQuestion(wrapper) {
    var inputs = wrapper.querySelectorAll('.exam-option-input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].checked = false;
    }
    // If already graded, also clear feedback
    var feedback = wrapper.querySelector('.exam-q-feedback');
    if (feedback && feedback.style.display !== 'none') {
      feedback.style.display = 'none';
      feedback.className = 'exam-q-feedback';
      wrapper.classList.remove('exam-correct', 'exam-incorrect', 'exam-unanswered');
      var options = wrapper.querySelectorAll('.exam-option');
      for (var j = 0; j < options.length; j++) {
        options[j].classList.remove('exam-option-highlight-correct', 'exam-option-highlight-wrong');
      }
      // Re-enable inputs
      for (var k = 0; k < inputs.length; k++) {
        inputs[k].disabled = false;
      }
    }
  }

  /* =============================================================
     4. GRADING
     ============================================================= */

  function gradeTest(questions, answerKey) {
    var totalQuestions = questions.length;
    var correctCount = 0;
    var incorrectCount = 0;
    var unanswered = 0;
    var domainResults = {};

    for (var qi = 0; qi < questions.length; qi++) {
      var q = questions[qi];
      var wrapper = document.querySelector('.exam-question-card[data-qnum="' + q.number + '"]');
      if (!wrapper) continue;

      var inputs = wrapper.querySelectorAll('.exam-option-input:checked');
      var selected = [];
      for (var si = 0; si < inputs.length; si++) {
        selected.push(inputs[si].value);
      }

      var isCorrect = false;
      var expected = answerKey[q.number];

      if (!expected || expected.values.length === 0) {
        // No answer in key — skip
        continue;
      }

      if (selected.length === 0) {
        unanswered++;
        showFeedback(wrapper, 'unanswered', 'No answer selected');
        continue;
      }

      if (q.isMulti) {
        // Multi-select: check if selected matches expected (order-independent)
        var sortedSelected = selected.slice().sort().join(',');
        var sortedExpected = expected.values.slice().sort().join(',');
        isCorrect = sortedSelected === sortedExpected && selected.length === expected.values.length;
      } else {
        isCorrect = selected.length === 1 && selected[0] === expected.values[0];
      }

      if (isCorrect) {
        correctCount++;
        showFeedback(wrapper, 'correct', '✅ Correct! The answer is ' + expected.raw);
      } else {
        incorrectCount++;
        var userAnswer = selected.length > 0 ? selected.join(', ') : '(none)';
        showFeedback(wrapper, 'incorrect', '❌ Incorrect. Correct answer: ' + expected.raw + '. You chose: ' + userAnswer);
        // Highlight the correct answer
        highlightCorrectAnswer(wrapper, expected.values);
      }

      // Track domain
      var domain = q.domain;
      if (!domainResults[domain]) {
        domainResults[domain] = { correct: 0, total: 0 };
      }
      domainResults[domain].total++;
      if (isCorrect) domainResults[domain].correct++;
    }

    showScoreSummary(correctCount, totalQuestions, unanswered, domainResults, answerKey);

    // Auto-scroll to the score summary at the bottom
    var bottomBar = document.getElementById('exam-bottom-bar');
    if (bottomBar) {
      bottomBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function showFeedback(wrapper, type, message) {
    wrapper.classList.add('exam-' + type);
    var feedback = wrapper.querySelector('.exam-q-feedback');
    if (feedback) {
      feedback.className = 'exam-q-feedback exam-feedback-' + type;
      feedback.textContent = message;
      feedback.style.display = 'block';
    }

    // Disable inputs after grading
    var inputs = wrapper.querySelectorAll('.exam-option-input');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
  }

  function highlightCorrectAnswer(wrapper, correctValues) {
    var options = wrapper.querySelectorAll('.exam-option');
    for (var i = 0; i < options.length; i++) {
      var opt = options[i];
      if (correctValues.indexOf(opt.dataset.key) !== -1) {
        opt.classList.add('exam-option-highlight-correct');
      } else {
        var input = opt.querySelector('.exam-option-input');
        if (input && input.checked) {
          opt.classList.add('exam-option-highlight-wrong');
        }
      }
    }
  }

  /* =============================================================
     5. SCORE SUMMARY
     ============================================================= */

  function showScoreSummary(correct, total, unanswered, domainResults, answerKey) {
    var pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    var passed = pct >= 70;

    var summary = document.getElementById('exam-score-summary');
    if (!summary) return;

    var html = '<div class="exam-score-card ' + (passed ? 'exam-passed' : 'exam-failed') + '">';
    html += '  <div class="exam-score-main">';
    html += '    <span class="exam-score-pct">' + pct + '%</span>';
    html += '    <span class="exam-score-label">' + correct + ' / ' + total + ' correct</span>';
    html += '    <span class="exam-score-status">' + (passed ? '✅ PASSED' : '❌ NOT PASSED') + '</span>';
    html += '  </div>';

    if (unanswered > 0) {
      html += '  <p class="exam-score-unanswered">⚠️ ' + unanswered + ' question' + (unanswered > 1 ? 's' : '') + ' unanswered</p>';
    }

    html += '  <p class="exam-score-bar-wrapper"><span class="exam-score-bar" style="width:' + pct + '%;"></span></p>';

    // Domain breakdown
    html += '  <div class="exam-domain-breakdown">';
    html += '    <h4>📊 Domain Breakdown</h4>';
    html += '    <table class="exam-domain-table">';
    html += '      <thead><tr><th>Domain</th><th>Score</th><th>Status</th></tr></thead>';
    html += '      <tbody>';

    var domainNames = Object.keys(domainResults);

    for (var di = 0; di < domainNames.length; di++) {
      var d = domainNames[di];
      var dr = domainResults[d];
      var dPct = dr.total > 0 ? Math.round((dr.correct / dr.total) * 100) : 0;
      var dPassed = dPct >= 70;
      html += '      <tr class="' + (dPassed ? 'domain-pass' : 'domain-fail') + '">';
      html += '        <td>' + escapeHtml(d) + '</td>';
      html += '        <td>' + dr.correct + '/' + dr.total + ' (' + dPct + '%)</td>';
      html += '        <td>' + (dPassed ? '✅' : '🔴') + '</td>';
      html += '      </tr>';
    }

    html += '      </tbody>';
    html += '    </table>';
    html += '  </div>';

    // Score legend
    html += '  <div class="exam-score-legend">';
    html += '    <p><strong>Passing score:</strong> 70% (' + Math.ceil(total * 0.7) + '/' + total + ')</p>';
    html += '    <p>' + (passed ? '🎉 Great job! Ready for the exam.' : '📚 Review the domains marked in red and try again.') + '</p>';
    html += '  </div>';

    html += '</div>';

    summary.innerHTML = html;
    summary.style.display = 'block';

    // Replace submit button with retry
    var submitBtn = document.getElementById('exam-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = '🔄 Retry Test';
      submitBtn.onclick = function () {
        resetTest(questions);
      };
    }
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /* =============================================================
     6. RESET
     ============================================================= */

  function resetTest(questions) {
    // Hide score summary
    var summary = document.getElementById('exam-score-summary');
    if (summary) {
      summary.style.display = 'none';
      summary.innerHTML = '';
    }

    // Reset submit button text
    var submitBtn = document.getElementById('exam-submit-btn');
    if (submitBtn) {
      submitBtn.textContent = '✅ Submit Answers';
      submitBtn.onclick = null;
    }

    // Reset each question
    for (var qi = 0; qi < questions.length; qi++) {
      var q = questions[qi];
      var wrapper = document.querySelector('.exam-question-card[data-qnum="' + q.number + '"]');
      if (!wrapper) continue;

      // Remove feedback
      var feedback = wrapper.querySelector('.exam-q-feedback');
      if (feedback) {
        feedback.style.display = 'none';
        feedback.className = 'exam-q-feedback';
      }

      // Uncheck and enable inputs
      var inputs = wrapper.querySelectorAll('.exam-option-input');
      for (var i = 0; i < inputs.length; i++) {
        inputs[i].checked = false;
        inputs[i].disabled = false;
      }

      // Remove classes
      wrapper.classList.remove('exam-correct', 'exam-incorrect', 'exam-unanswered');

      // Remove highlight classes
      var options = wrapper.querySelectorAll('.exam-option');
      for (var j = 0; j < options.length; j++) {
        options[j].classList.remove('exam-option-highlight-correct', 'exam-option-highlight-wrong');
      }
    }

    // Reset submit button event
    var newSubmitBtn = document.getElementById('exam-submit-btn');
    if (newSubmitBtn) {
      // Remove old listeners by replacing
      var clone = newSubmitBtn.cloneNode(true);
      newSubmitBtn.parentNode.replaceChild(clone, newSubmitBtn);
      clone.addEventListener('click', function () {
        gradeTest(questions, parseAnswerKey(document.querySelectorAll('.book-page details table')));
      });
    }

    updateAnsweredCount(questions);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* =============================================================
     7. ANSWERED COUNT
     ============================================================= */

  function updateAnsweredCount(questions) {
    var answered = 0;
    var total = questions.length;
    for (var qi = 0; qi < total; qi++) {
      var q = questions[qi];
      var wrapper = document.querySelector('.exam-question-card[data-qnum="' + q.number + '"]');
      if (!wrapper) continue;
      var checked = wrapper.querySelectorAll('.exam-option-input:checked');
      if (checked.length > 0) answered++;
    }
    var badge = document.getElementById('exam-answered-badge');
    if (badge) {
      badge.textContent = answered + ' / ' + total + ' answered';
      if (answered === total) {
        badge.className = 'exam-answered-badge exam-answered-all';
      } else {
        badge.className = 'exam-answered-badge';
      }
    }
  }

  /* =============================================================
     8. INIT
     ============================================================= */

  function autoInit() {
    var questions = collectQuestions(article);
    if (questions.length === 0) return;

    var key = parseAnswerKey(answerTables);
    if (Object.keys(key).length === 0) return;

    initInteractive(article, questions, key);
  }

  // Run after page is fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})();
