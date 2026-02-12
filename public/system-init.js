// System initialization script - used for integrity checks
(function() {
  'use strict';
  if (typeof window !== 'undefined') {
    window.isSystemInitialized = true;
    window.__systemInitLoaded = true;
    window.__systemInitTimestamp = Date.now();
  }
})();
