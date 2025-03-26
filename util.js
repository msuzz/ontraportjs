// util.js
// OPJS Internal Utility library

(function () {
  if (window.OPJS?.Util) {
    console.log("[OPJS.Util] Module is already loaded.");
    return;
  }

  if (!window.OPJS?.Loader) {
    throw new Error("[OPJS.Util] Must be loaded via OPJS.Loader.");
  }

  let jQueryInstance;

  window.OPJS.Util = {
    // Function to get jQueryInstance with noConflict
    getJQueryInstance: function () {
      if (!jQueryInstance && typeof jQuery !== 'undefined') {
        jQueryInstance = jQuery.noConflict(true);
        console.log("[OPJS.Util.getJQueryInstance] jQuery version", jQueryInstance.fn.jquery, "loaded.");
        if (jQueryInstance.ui) {
          console.log("[OPJS.Util.getJQueryInstance] jQuery UI version", jQueryInstance.ui.version, "loaded.");
        }
      }
      return jQueryInstance;
    },

    debounce: function (func, delay_ms) {
      let timer;
      return function (...args) {
        const context = this;
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(context, args), delay_ms);
      };
    },    
  };
})();
