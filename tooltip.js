// tooltips.js
// OPJS Tooltip functionality

(function () {
  if (!window.OPJS?.Loader) {
    throw new Error("[OPJS.Tooltip] Must be loaded via OPJS.Loader.");
  }

  if (!window.OPJS.Util) {
    throw new Error("[OPJS.Tooltip] OPJS.Util must be loaded before OPJS.Tooltip.");
  }

  const $ = window.OPJS.Util.getJQueryInstance();

  window.OPJS.Tooltip = {
    defaultSettings: {
      delayMs: 100,     // Hover delay
      debounceMs: 200,  // Default debounce delay (in ms)
      position: {
        smallScreen: { my: "top+15", at: "bottom", collision: "flipfit" },
        largeScreen: { my: "left+30 center", at: "right center", collision: "flipfit" }
      },
      positionBreakpoint: 1100,  // Default width breakpoint for adjusting position
    },

    initializeTooltips: function (tooltipDict, userSettings = {}) {
      const settings = { ...window.OPJS.Tooltip.defaultSettings, ...userSettings };

      if (!tooltipDict || typeof tooltipDict !== "object") {
        console.error("[OPJS.Tooltip.initializeTooltips] Invalid tooltip dictionary provided.");
        return;
      }

      const adjustTooltipPosition = function () {
        const position = $(window).width() < settings.positionBreakpoint
            ? settings.position.smallScreen : settings.position.largeScreen;

          console.debug("[OPJS.Tooltip] Window width is ", $(window).width());
        $.each(tooltipDict, function (elName, tooltipText) {

          if (tooltipText) {
            // Find elements matching the field name in the tooltip dictionary
            $(`[name^='${elName}']`).each(function () {
              const el = $(this);
              const parentDiv = elName.startsWith("f") ? el.closest("div.opt-element") : el;

              if (parentDiv.length) {
                // Check if tooltip is already applied
                if (parentDiv.data("ui-tooltip")) {
                  parentDiv.tooltip("option", "position", position);
                } else {
                  parentDiv.tooltip({
                      content: tooltipText,
                      position: position,
                      show: {
                        delay: settings.delayMs,
                        duration: settings.debounceMs
                      },
                      hide: {
                        duration: settings.debounceMs
                      },
                    }).attr("title", tooltipText);

                  parentDiv.on("mouseleave", function () {
                    parentDiv.tooltip("close");
                  });
                }
              }
            });
          }
        });
      };

      adjustTooltipPosition();
      $(window).on("resize", OPJS.Util.debounce(adjustTooltipPosition, settings.debounceMs).bind(window));
    },
  };
  console.log("[OPJS.Tooltip] Loaded successfully.");
})();