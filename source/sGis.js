(function() {
    'use strict';

    /**
     * @namespace sGis
     */
    var sGis = {};

    sGis.version = "0.1.3";
    sGis.releaseDate = "07.11.2016";

    sGis.browser = (function() {
        var ua= navigator.userAgent,
        tem,
        M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if (M[1] === 'Chrome') {
            tem= ua.match(/\bOPR\/(\d+)/);
            if (tem != null) return 'Opera ' + tem[1];
        }
        M = M[2] ? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
        return M.join(' ');
    })();

    sGis.isIE = sGis.browser.search('IE') !== -1;

    sGis.isTouch = 'ontouchstart' in document.documentElement;
    sGis.useCanvas = true;


    var loadedModules = { 'sGis': sGis };
    var loadingDefs = [];

    /**
     * This function is used to define sGis library modules and their dependencies. It should not be used if a module loading system (like CommonJS or AMD) is used.
     * @param {String} moduleName - name of the module. Can contain any number of namespaces, like: "namespace.subNamespace.moduleName"
     * @param {String[]} dependencies - list of dependency module names with namespaces
     * @param {Function} intiHandler - module initialization handler. The function will be called with array of loaded models as specified in 'dependencies' argument
     */
    sGis.module = function(moduleName, dependencies, intiHandler) {
        if (loadedModules[moduleName]) throw new Error('Module definition conflict: ' + moduleName);
        loadingDefs.push(Array.prototype.slice.call(arguments));

        while (loadModules()) {}
    };

    /**
     * This function is called each time a new module is loaded. The only argument of the callback is the name of the module.
     * @type {Function|null}
     */
    sGis.module.onLoad = null;

    function loadModules() {
        var loaded = 0;
        var list = loadingDefs.slice();
        var remains = [];
        list.forEach(function(def, index) {
            var deps = [];
            for (var i = 0; i < def[1].length; i++) {
                if (!loadedModules[def[1][i]]) {
                    remains.push(def);
                    // console.log('Tried to load: ' + def[0] + '. Not found: ' + def[1][i]);
                    return;
                }
                deps.push(loadedModules[def[1][i]]);
            }

            if (loadedModules[def[0]]) debugger;
            var module = def[2].apply(this, deps);
            loadedModules[def[0]] = module;
            setModuleReference(module, def[0]);
            loaded ++;

            // console.log('Initialized: ' + def[0]);
            if (sGis.module.onLoad) sGis.module.onLoad(def[0]);
        });
        loadingDefs = remains;

        sGis.loadingDefs = loadingDefs;

        return loaded;
    }

    sGis.loadedModules = loadedModules;

    window.sGis = sGis;

    function setModuleReference(module, name) {
        var ns = name.split('.');
        var curr = sGis;
        for (var i = 0; i < ns.length - 1; i++) {
            if (!curr[ns[i]]) curr[ns[i]] = {};
            curr = curr[ns[i]];
        }
        curr[ns.pop()] = module;
    }

})();