// loader.js
// Loads the OPJS modules specified by the user, and all required dependencies

(function () {
  window.OPJS = window.OPJS || {}; // Ensure root namespace exists

  const loaderBaseUrl = document.currentScript.src.replace(/\/[^/]*$/, '/');
  const loadingModules = new Set(); // Modules currently being loaded async
  const loadedModules = new Set();  // Modules finished loading

  // Define modules and their dependencies
  const MODULES = {
    'util': {
      url: loaderBaseUrl + 'util.js',
      css: [],
      dependencies: []
    },
    'tooltip': {
      url: loaderBaseUrl + 'tooltip.js',
      css: [],
      dependencies: ['jquery-ui', 'util']
    },
    'jquery': {
      url: 'https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js',
      css: [],
      dependencies: []
    },
    'jquery-ui': {
      url: 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.14.1/jquery-ui.min.js',
      css: ['https://ajax.googleapis.com/ajax/libs/jqueryui/1.14.1/themes/smoothness/jquery-ui.css'],
      dependencies: ['jquery']  // jQuery UI depends on jQuery
    }
  };

  // Load script from URL/relative dir and run callback
  function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.onload = callback;
    script.onerror = () => console.error(`Failed to load module script: ${url}`);
    document.head.appendChild(script);
  }

  // Load CSS stylesheet from URL/relative dir
  function loadStylesheet(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  // Load module dependencies and then the module itself
  function loadModule(module, callback) {

    // If module already loaded, run callback only
    if (loadedModules.has(module)) {
      console.debug(`[${module}] Module already loaded, running callback only.`);
      callback();
      return;
    }

    // If module is being loaded, attach callback to its loading process
    if (loadingModules.has(module)) {
      setTimeout(() => loadModule(module, callback), 10);
      return;
    }

    loadingModules.add(module);
    const { url, css, dependencies } = MODULES[module];

    // Load required CSS stylesheets first
    if (css.length > 0) {
      css.forEach((url) => {
        console.debug(`[${module}] Loading stylesheet from ${url}`);
        loadStylesheet(url);
      });
    }

    // Recurse through dependencies list
    function loadNextDependency(index) {
      if (index === dependencies.length) {
        loadMainScript(); // All dependencies are loaded, return to load the main script
        return;
      }

      const dep = dependencies[index];
      if (MODULES[dep]) {

        if (loadedModules.has(dep)) {
          console.debug(`[${module}] Dependency ${dep} already loaded.`);
          loadNextDependency(index + 1);

        } else if (loadingModules.has(dep)) {
          setTimeout(() => loadNextDependency(index), 10);

        } else {
          console.debug(`[${module}] Loading dependency ${dep}...`);
          loadModule(dep, () => loadNextDependency(index + 1));
        }
      } else {
        console.error(`[${module}] Dependency module "${dep}" is not defined in the loader.`);
      }
    }

    // Load the main script for the module
    function loadMainScript() {
      console.debug(`[${module}] Loading script...`);
      loadScript(url, () => {
        loadedModules.add(module);
        loadingModules.delete(module);
        console.debug(`[${module}] Module loaded successfully.`);
        callback();
      });
    }

    // If there are dependencies, start loading them one by one
    if (dependencies.length > 0) {
      loadNextDependency(0);
    } else {
      loadMainScript();
    }
  }

  // Function to load specified modules (including their dependencies)
  function loadModules(modules, callback) {
    let loaded = 0;

    function onLoad() {
      loaded++;
      if (loaded === modules.length) {
        callback?.();
      }
    }

    // Loop through the user-specified modules
    modules.forEach((module) => {
      if (MODULES[module]) {
        loadModule(module, onLoad);
      } else {
        console.error(`Module "${module}" is not defined in the loader.`);
      }
    });
  }

  // Expose the loader to the global scope
  window.OPJS.Loader = {
    loadModules: loadModules,
  };
})();