(function () {
  'use strict';

  /* =============================================
     EXAM COUNTDOWN TIMER
     ============================================= */

  var STORAGE_KEY = 'terraform_exam_progress';

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
    this.statusEl.textContent = '⏰ Time\'s Up!';
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
     EXAM PROGRESS TRACKING
     ============================================= */

  function saveTestProgress(testId, completed) {
    try {
      var progress = getProgress();
      progress[testId] = completed;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      updateProgressUI();
    } catch (e) {
      // localStorage may be full or disabled
    }
  }

  function getProgress() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function getTestCompletionCount() {
    var progress = getProgress();
    return Object.keys(progress).filter(function (key) {
      return progress[key] === true;
    }).length;
  }

  function getTotalTests() {
    var meta = document.getElementById('exam-progress-meta');
    return meta ? parseInt(meta.dataset.totalTests || '7', 10) : 7;
  }

  function updateProgressUI() {
    var count = getTestCompletionCount();
    var total = getTotalTests();
    var pct = total > 0 ? Math.round((count / total) * 100) : 0;

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
  function initProgress() {
    var progress = getProgress();
    document.querySelectorAll('.test-complete-check').forEach(function (cb) {
      var testId = cb.dataset.testId;
      if (testId && progress[testId] === true) {
        cb.checked = true;
      }
    });
    updateProgressUI();
  }

  // Run init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProgress);
  } else {
    initProgress();
  }

  /* =============================================
     PROGRESS DASHBOARD (for the tracking page)
     ============================================= */

  // For the progress dashboard page, exported as window function
  window.initExamDashboard = function () {
    var progress = getProgress();
    var totalTests = getTotalTests();
    var completed = getTestCompletionCount();

    document.querySelectorAll('.exam-dashboard-check').forEach(function (cb) {
      var testId = cb.dataset.testId;
      if (progress[testId] === true) {
        cb.checked = true;
      }
      cb.addEventListener('change', function () {
        saveTestProgress(testId, cb.checked);
      });
    });

    // Reset all progress
    var resetBtn = document.getElementById('exam-reset-all');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        if (confirm('Reset all exam progress? This cannot be undone.')) {
          localStorage.removeItem(STORAGE_KEY);
          document.querySelectorAll('.exam-dashboard-check').forEach(function (cb) {
            cb.checked = false;
          });
          updateProgressUI();
          if (typeof updateDashboardStats === 'function') {
            updateDashboardStats();
          }
        }
      });
    }
    updateProgressUI();
  };

})();
