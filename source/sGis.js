(function() {
    'use strict';

    /**
     * @namespace sGis
     */
    let sGis = {};

    sGis.version = "0.2.4";
    sGis.releaseDate = "06.03.2017";

    let loadedModules = { 'sGis': sGis };
    let loadingDefs = [];

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
        let loaded = 0;
        let list = loadingDefs.slice();
        let remains = [];
        list.forEach(function(def, index) {
            let deps = [];
            for (let i = 0; i < def[1].length; i++) {
                if (!loadedModules[def[1][i]]) {
                    remains.push(def);
                    // console.log('Tried to load: ' + def[0] + '. Not found: ' + def[1][i]);
                    return;
                }
                deps.push(loadedModules[def[1][i]]);
            }

            if (loadedModules[def[0]]) debugger;
            let module = def[2].apply(this, deps);
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
        let ns = name.split('.');
        let curr = sGis;
        for (let i = 0; i < ns.length - 1; i++) {
            if (!curr[ns[i]]) curr[ns[i]] = {};
            curr = curr[ns[i]];
        }
        curr[ns.pop()] = module;
    }

})();