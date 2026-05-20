(function () {
  'use strict';

  /* =============================================
     EXAM COUNTDOWN TIMER
     ============================================= */

  var STORAGE_KEY = 'terraform_exam_progress';
  var CHAPTER_STORAGE_KEY = 'terraform_chapter_progress';

  function ExamTimer(element) {
    this.element = element;
    this.minutesDisplay = element.querySelector('.timer-minutes');
    this.secondsDisplay = element.querySelector('.timer-seconds');
    this.statusEl = element.querySelector('.timer-status');
    this.totalSeconds = parseInt(element.dataset.minutes || '60', 10) * 60;
    this.remaining = this.totalSeconds;
    this.interval = null;
    this.running = false;
    this.finished = false;

    // Restore saved time from localStorage
    var saved = this.loadState();
    if (saved && saved.remaining > 0 && !saved.finished) {
      this.remaining = saved.remaining;
    }

    this.updateDisplay();

    var self = this;
    var startBtn = element.querySelector('.timer-start');
    var pauseBtn = element.querySelector('.timer-pause');
    var resetBtn = element.querySelector('.timer-reset');

    if (startBtn) {
      startBtn.addEventListener('click', function () { self.start(); });
    }
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () { self.pause(); });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () { self.reset(); });
    }

    // Auto-start if previously running
    if (saved && saved.running) {
      this.start();
    }
  }

  ExamTimer.prototype.start = function () {
    if (this.finished) return;
    if (this.running) return;
    this.running = true;
    this.element.classList.add('timer-running');
    this.element.classList.remove('timer-paused');

    var self = this;
    this.interval = setInterval(function () {
      self.remaining--;
      self.updateDisplay();
      self.saveState();

      if (self.remaining <= 0) {
        self.remaining = 0;
        self.updateDisplay();
        self.finish();
      }
    }, 1000);
  };

  ExamTimer.prototype.pause = function () {
    if (!this.running) return;
    this.running = false;
    this.element.classList.remove('timer-running');
    this.element.classList.add('timer-paused');
    clearInterval(this.interval);
    this.interval = null;
    this.saveState();
  };

  ExamTimer.prototype.reset = function () {
    this.pause();
    this.remaining = this.totalSeconds;
    this.finished = false;
    this.element.classList.remove('timer-finished');
    this.element.classList.remove('timer-paused');
    this.statusEl.textContent = 'Time Remaining';
    this.updateDisplay();
    this.saveState();
    localStorage.removeItem(this.getTimerStorageKey());
  };

  ExamTimer.prototype.finish = function () {
    this.running = false;
    this.finished = true;
    this.element.classList.remove('timer-running');
    this.element.classList.add('timer-finished');
    this.statusEl.textContent = "⏰ Time's Up!";
    clearInterval(this.interval);
    this.interval = null;
    this.saveState();
  };

  ExamTimer.prototype.updateDisplay = function () {
    var mins = Math.floor(this.remaining / 60);
    var secs = this.remaining % 60;
    this.minutesDisplay.textContent = String(mins).padStart(2, '0');
    this.secondsDisplay.textContent = String(secs).padStart(2, '0');

    // Warning state (last 5 minutes)
    if (this.remaining <= 300 && this.remaining > 0) {
      this.element.classList.add('timer-warning');
    } else {
      this.element.classList.remove('timer-warning');
    }
  };

  ExamTimer.prototype.getTimerStorageKey = function () {
    return STORAGE_KEY + '_timer_' + this.element.dataset.testId;
  };

  ExamTimer.prototype.loadState = function () {
    try {
      var saved = localStorage.getItem(this.getTimerStorageKey());
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  ExamTimer.prototype.saveState = function () {
    try {
      var state = {
        remaining: this.remaining,
        running: this.running,
        finished: this.finished,
        savedAt: Date.now()
      };
      localStorage.setItem(this.getTimerStorageKey(), JSON.stringify(state));
    } catch (e) {
      // localStorage may be full or disabled
    }
  };

  // Initialize all timers on the page
  document.querySelectorAll('.exam-timer').forEach(function (el) {
    new ExamTimer(el);
  });

  /* =============================================
     EXAM PROGRESS TRACKING (tests)
     ============================================= */

  function saveTestProgress(testId, completed) {
    try {
      var progress = getTestProgress();
      progress[testId] = completed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      updateProgressUI();
    } catch (e) {
      // localStorage may be full or disabled
    }
  }

  function getTestProgress() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function getTestCompletionCount() {
    var progress = getTestProgress();
    return Object.keys(progress).filter(function (key) {
      return progress[key] === true;
    }).length;
  }

  function getTotalTests() {
    return 7;
  }

  function updateProgressUI() {
    var count = getTestCompletionCount();
    var total = getTotalTests();
    var pct = total > 0 ? Math.round((count / total) * 100) : 0;
    var chStats = getChapterStats();

    // Update the navbar/progress bar if present
    var bar = document.getElementById('exam-progress-bar');
    var text = document.getElementById('exam-progress-text');
    if (bar) {
      bar.style.width = pct + '%';
      bar.textContent = pct > 15 ? pct + '%' : '';
    }
    if (text) {
      text.textContent = count + ' of ' + total + ' tests completed';
    }

    // Update sidebar progress bar
    updateSidebarProgress(chStats, count, total);
  }

  function updateSidebarProgress(chStats, testCount, testTotal) {
    var fill = document.getElementById('sidebar-progress-fill');
    var pctEl = document.getElementById('sidebar-progress-pct');
    var chEl = document.getElementById('sidebar-progress-chapters');
    var testEl = document.getElementById('sidebar-progress-tests');

    if (!fill) return; // sidebar not present on this page

    var totalItems = chStats.total + testTotal;
    var doneItems = chStats.completed + testCount;
    var pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';
    if (chEl) chEl.textContent = chStats.completed + '/' + chStats.total + ' chapters';
    if (testEl) testEl.textContent = testCount + '/' + testTotal + ' tests';
  }

  // Handle checkbox clicks for test completion
  document.addEventListener('change', function (e) {
    if (e.target && e.target.matches('.test-complete-check')) {
      var testId = e.target.dataset.testId;
      if (testId) {
        saveTestProgress(testId, e.target.checked);
      }
    }
  });

  // Initialize: restore checkbox states and update UI
  function initTestProgress() {
    var progress = getTestProgress();
    document.querySelectorAll('.test-complete-check').forEach(function (cb) {
      var testId = cb.dataset.testId;
      if (testId && progress[testId] === true) {
        cb.checked = true;
      }
    });
    updateProgressUI();
  }

  /* =============================================
     CHAPTER TRACKING
     ============================================= */

  var CHAPTERS = [
    { id: '01-introduction-to-iac-and-terraform',     title: 'Ch 1: Introduction to IaC & Terraform',         number: 1,  section: 'Foundation' },
    { id: '02-terraform-core-concepts',                title: 'Ch 2: Terraform Core Concepts',                number: 2,  section: 'Foundation' },
    { id: '03-hcl-configuration-language',             title: 'Ch 3: HCL Configuration Language',             number: 3,  section: 'Foundation' },
    { id: '04-resources-and-data-sources',             title: 'Ch 4: Resources, Data Sources & Meta-Arguments', number: 4, section: 'Foundation' },
    { id: '05-variables-and-outputs',                  title: 'Ch 5: Variables, Outputs & Locals',            number: 5,  section: 'Core Skills' },
    { id: '06-state-management',                       title: 'Ch 6: State Management',                       number: 6,  section: 'Core Skills' },
    { id: '07-terraform-modules',                      title: 'Ch 7: Terraform Modules',                      number: 7,  section: 'Core Skills' },
    { id: '08-workspaces-and-environments',            title: 'Ch 8: Workspaces & Environments',              number: 8,  section: 'Core Skills' },
    { id: '09-functions-expressions-dynamic',          title: 'Ch 9: Functions, Expressions & Dynamic Blocks', number: 9, section: 'Advanced' },
    { id: '10-provisioners',                           title: 'Ch 10: Provisioners & Side Effects',           number: 10, section: 'Advanced' },
    { id: '11-terraform-cloud',                        title: 'Ch 11: Terraform Cloud & Enterprise',          number: 11, section: 'Advanced' },
    { id: '12-importing-refactoring',                  title: 'Ch 12: Importing & Refactoring',               number: 12, section: 'Advanced' },
    { id: '13-security-best-practices',                title: 'Ch 13: Security & Compliance',                 number: 13, section: 'Production & Exam Prep' },
    { id: '14-production-grade-terraform',             title: 'Ch 14: Production-Grade Terraform',            number: 14, section: 'Production & Exam Prep' },
    { id: '15-exam-preparation',                       title: 'Ch 15: Exam Preparation Guide',                number: 15, section: 'Production & Exam Prep' },
    { id: '16-interview-questions',                    title: 'Ch 16: Interview Questions & Answers',         number: 16, section: 'Bonus' },
    { id: '17-real-world-scenarios',                   title: 'Ch 17: Real-World Scenario Questions',         number: 17, section: 'Bonus' }
  ];

  var TESTS = [
    { id: 'exam-test-1', title: 'Practice Test 1', number: 1 },
    { id: 'exam-test-2', title: 'Practice Test 2', number: 2 },
    { id: 'exam-test-3', title: 'Practice Test 3', number: 3 },
    { id: 'exam-test-4', title: 'Practice Test 4', number: 4 },
    { id: 'exam-test-5', title: 'Practice Test 5', number: 5 },
    { id: 'exam-test-6', title: 'Practice Test 6', number: 6 },
    { id: 'exam-test-7', title: 'Practice Test 7', number: 7 }
  ];

  function getChapterProgress() {
    try {
      var data = localStorage.getItem(CHAPTER_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveChapterProgress(chapterId, updates) {
    try {
      var progress = getChapterProgress();
      progress[chapterId] = progress[chapterId] || {};
      Object.keys(updates).forEach(function (k) {
        progress[chapterId][k] = updates[k];
      });
      localStorage.setItem(CHAPTER_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {}
  }

  function getChapterStats() {
    var progress = getChapterProgress();
    var read = 0;
    var completed = 0;
    CHAPTERS.forEach(function (ch) {
      var p = progress[ch.id];
      if (p) {
        if (p.read) read++;
        if (p.completed) completed++;
      }
    });
    return { read: read, completed: completed, total: CHAPTERS.length };
  }

  function getTestStats() {
    var progress = getTestProgress();
    var completed = 0;
    TESTS.forEach(function (t) {
      if (progress[t.id] === true) completed++;
    });
    return { completed: completed, total: TESTS.length };
  }

  function getPageChapterId() {
    var match = window.location.pathname.match(/\/docs\/(\d+-[^/]+)\//);
    return match ? match[1] : null;
  }

  function initChapterTracking() {
    var chapterId = getPageChapterId();
    var isChapter = chapterId && CHAPTERS.some(function (c) { return c.id === chapterId; });
    if (isChapter) {
      markChapterRead(chapterId);
      injectChapterCheckbox(chapterId);
    }
  }

  function markChapterRead(chapterId) {
    var progress = getChapterProgress();
    if (!progress[chapterId] || !progress[chapterId].read) {
      saveChapterProgress(chapterId, { read: true, readAt: Date.now() });
    }
  }

  function injectChapterCheckbox(chapterId) {
    var article = document.querySelector('.book-article');
    if (!article) return;

    // Don't inject if already present
    if (article.querySelector('.chapter-complete-check')) return;

    var progress = getChapterProgress();
    var p = progress[chapterId] || {};
    var isCompleted = p.completed === true;

    var div = document.createElement('div');
    div.className = 'chapter-complete-check';
    div.innerHTML =
      '<hr>' +
      '<div class="chapter-progress-bar">' +
        '<input type="checkbox" id="ch-cpl-' + chapterId + '" class="chapter-complete-checkbox" data-chapter-id="' + chapterId + '"' + (isCompleted ? ' checked' : '') + '>' +
        '<label for="ch-cpl-' + chapterId + '" class="chapter-complete-label">✓ Mark this chapter as completed</label>' +
        '<span class="chapter-status-badge">' + (isCompleted ? '✅ Completed' : '📖 Reading') + '</span>' +
      '</div>';

    article.appendChild(div);

    var checkbox = div.querySelector('.chapter-complete-checkbox');
    checkbox.addEventListener('change', function () {
      saveChapterProgress(chapterId, {
        completed: checkbox.checked,
        completedAt: checkbox.checked ? Date.now() : null
      });
      var badge = div.querySelector('.chapter-status-badge');
      badge.textContent = checkbox.checked ? '✅ Completed' : '📖 Reading';
    });
  }

  /* =============================================
     DASHBOARD RENDERING
     ============================================= */

  window.initExamDashboard = function () {
    var app = document.getElementById('exam-dashboard-app');
    if (!app) return;

    app.innerHTML = buildDashboardHTML();

    // Bind chapter checkboxes
    document.querySelectorAll('.dashboard-chapter-check').forEach(function (cb) {
      cb.addEventListener('change', function () {
        saveChapterProgress(cb.dataset.chapterId, {
          completed: cb.checked,
          completedAt: cb.checked ? Date.now() : null
        });
        refreshDashboard();
      });
    });

    // Bind test checkboxes
    document.querySelectorAll('.dashboard-test-check').forEach(function (cb) {
      cb.addEventListener('change', function () {
        saveTestProgress(cb.dataset.testId, cb.checked);
        refreshDashboard();
      });
    });

    // Reset all progress
    var resetBtn = document.getElementById('exam-reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Reset ALL progress (chapters and tests)? This cannot be undone.')) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(CHAPTER_STORAGE_KEY);
          refreshDashboard();
        }
      });
    }
  };

  function buildDashboardHTML() {
    var chStats = getChapterStats();
    var testStats = getTestStats();
    var chProgress = getChapterProgress();
    var testProgress = getTestProgress();

    var totalItems = chStats.total + testStats.total;
    var doneItems = chStats.completed + testStats.completed;
    var combinedPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

    var html = '';

    // ── Header ──
    html += '<div class="exam-dashboard-header">';
    html += '  <h1>📊 Your Learning Dashboard</h1>';
    html += '  <p class="exam-progress-summary">Track your Terraform learning journey — from chapters to practice exams</p>';
    html += '</div>';

    // ── Combined Progress Bar ──
    html += '<div class="exam-combined-progress">';
    html += '  <div class="exam-progress-bar-wrapper" style="max-width:100%;">';
    html += '    <div class="exam-progress-bar-fill" id="dash-combined-bar" style="width:' + combinedPct + '%;">' + (combinedPct > 15 ? combinedPct + '%' : '') + '</div>';
    html += '  </div>';
    html += '  <p class="exam-progress-summary" style="text-align:center;margin-top:0.75rem;">' + doneItems + ' of ' + totalItems + ' total items completed</p>';
    html += '</div>';

    // ── Stats Row ──
    html += '<div class="exam-stats">';
    html += '  <div class="exam-stat-card"><span class="stat-number">' + chStats.completed + '</span><span class="stat-label">of ' + chStats.total + ' Chapters</span></div>';
    html += '  <div class="exam-stat-card"><span class="stat-number">' + chStats.read + '</span><span class="stat-label">Chapters Read</span></div>';
    html += '  <div class="exam-stat-card"><span class="stat-number">' + testStats.completed + '</span><span class="stat-label">of ' + testStats.total + ' Tests Passed</span></div>';
    html += '  <div class="exam-stat-card"><span class="stat-number">' + combinedPct + '%</span><span class="stat-label">Overall Progress</span></div>';
    html += '</div>';

    // ── Learning Progress Section ──
    html += '<h2 style="margin-top:2.5rem;">📚 Learning Progress</h2>';
    html += '<div class="exam-dashboard-grid">';

    var sections = ['Foundation', 'Core Skills', 'Advanced', 'Production & Exam Prep', 'Bonus'];
    sections.forEach(function (section) {
      var sectionChapters = CHAPTERS.filter(function (c) { return c.section === section; });
      if (sectionChapters.length === 0) return;

      // Section header card
      var secRead = 0, secCompleted = 0;
      sectionChapters.forEach(function (ch) {
        var p = chProgress[ch.id];
        if (p) {
          if (p.read) secRead++;
          if (p.completed) secCompleted++;
        }
      });
      var secPct = Math.round((secCompleted / sectionChapters.length) * 100);

      html += '<div class="dashboard-section-card">';
      html += '  <div class="dashboard-section-header">';
      html += '    <span class="dashboard-section-badge">' + section + '</span>';
      html += '    <span class="dashboard-section-count">' + secCompleted + '/' + sectionChapters.length + '</span>';
      html += '  </div>';
      html += '  <div class="dashboard-section-bar-wrapper"><div class="dashboard-section-bar-fill" style="width:' + secPct + '%;"></div></div>';
      html += '  <div class="dashboard-section-chapters">';

      sectionChapters.forEach(function (ch) {
        var p = chProgress[ch.id] || {};
        var isCompleted = p.completed === true;
        var isRead = p.read === true;
        var statusIcon = isCompleted ? '✅' : (isRead ? '📖' : '⬜');
        html += '    <div class="dashboard-chapter-row' + (isCompleted ? ' completed' : '') + '" title="' + ch.title + '">';
        html += '      <input type="checkbox" class="dashboard-chapter-check" data-chapter-id="' + ch.id + '"' + (isCompleted ? ' checked' : '') + '>';
        html += '      <span class="dashboard-chapter-status">' + statusIcon + '</span>';
        html += '      <span class="dashboard-chapter-title">' + ch.title + '</span>';
        html += '    </div>';
      });

      html += '  </div>';
      html += '</div>';
    });

    html += '</div>'; // end exam-dashboard-grid

    // ── Test Progress Section ──
    html += '<h2 style="margin-top:2.5rem;">📝 Practice Test Progress</h2>';
    html += '<div class="exam-dashboard-grid">';

    TESTS.forEach(function (t) {
      var isCompleted = testProgress[t.id] === true;
      html += '  <div class="exam-dashboard-card' + (isCompleted ? ' completed' : '') + '">';
      html += '    <h3>Practice Test ' + t.number + '</h3>';
      html += '    <p>57 questions across all 7 domains | 60 min</p>';
      html += '    <div style="display:flex;align-items:center;gap:0.5rem;">';
      html += '      <input type="checkbox" class="exam-dashboard-check dashboard-test-check" data-test-id="' + t.id + '"' + (isCompleted ? ' checked' : '') + '>';
      html += '      <span class="card-status">' + (isCompleted ? '✅ Passed' : '⬜ Not yet') + '</span>';
      html += '    </div>';
      html += '    <a href="/docs/' + (17 + t.number) + '-exam-practice-test-' + t.number + '/" style="display:inline-block;margin-top:0.75rem;font-size:0.85rem;">→ Open test</a>';
      html += '  </div>';
    });

    html += '</div>';

    // ── Reset Button ──
    html += '<div style="text-align:center;margin:2.5rem 0;">';
    html += '  <button class="btn-reset" id="exam-reset-all">🔄 Reset All Progress</button>';
    html += '</div>';

    return html;
  }

  function refreshDashboard() {
    if (window.initExamDashboard) {
      window.initExamDashboard();
    }
  }

  // ── Auto-init on page load ──
  // ── Export helpers for sidebar progress ──
  window.refreshSidebarProgress = function () {
    var chStats = getChapterStats();
    var testStats = getTestStats();
    updateSidebarProgress(chStats, testStats.completed, testStats.total);
  };

  // ── Auto-init on page load ──
  function autoInit() {
    // Restore test checkbox states
    initTestProgress();

    // Track chapter pages
    initChapterTracking();

    // Init dashboard if present
    if (document.getElementById('exam-dashboard-app')) {
      initExamDashboard();
    }

    // Update sidebar progress bar
    var chStats = getChapterStats();
    var testStats = getTestStats();
    updateSidebarProgress(chStats, testStats.completed, testStats.total);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

})();
