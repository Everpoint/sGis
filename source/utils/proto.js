'use strict';

(function() {

    sGis.utils.proto = {};

    sGis.utils.proto.setProperties = function(obj, properties) {
        var keys = Object.keys(properties);
        for (var i = 0; i < keys.length; i++)  {
            var key = keys[i];

            if (!(properties[key] instanceof Object)) {
                obj[key] = properties[key];
            } else if (properties.default !== undefined && properties.get === undefined && properties.set === undefined && properties.type === undefined) {
                obj[key] = properties[key].default;
            } else {
                var enumerable = properties.set !== null;

                Object.defineProperty(obj, '_' + key, {
                    enumerable: false,
                    writable: true,
                    value: properties[key].default
                });

                Object.defineProperty(obj, key, {
                    enumerable: enumerable,
                    get: sGis.utils.proto.getGetter(key, properties[key].get),
                    set: sGis.utils.proto.getSetter(key, properties[key].set, properties[key].type)
                });
            }
        }
    };

    sGis.utils.proto.setMethods = function(obj, properties, collisions) {
        var keys = Object.keys(properties);
        for (var i = 0; i < keys.length; i++) {
            if (obj.hasOwnProperty(keys[i])) {
                if (collisions === 'override') {
                    _define(obj, keys[i], properties[keys[i]]);
                } else if (collisions !== 'ignore') {
                    utils.error('Cannot copy property .' + keys[i] + ' - the object already has this property. Use options "ignore" or "override" if this is expected.');
                }
            } else {
                _define(obj, keys[i], properties[keys[i]]);
            }
        }
    };

    function _define(obj, key, value) {
        Object.defineProperty(obj, key, {
            value: value
        });
    }

    sGis.utils.proto.getGetter = function(key, getter) {
        if (getter !== null) {
            return function () {
                if (getter) {
                    return getter.call(this);
                } else {
                    return this['_' + key];
                }
            };
        }
    };

    sGis.utils.proto.getSetter = function(key, setter, type) {
        if (setter !== null) {

            return function (val) {
                if (type) sGis.utils.validate(val, type);
                if (setter) {
                    setter.call(this, val);
                } else {
                    this['_' + key] = val;
                }
            };
        }
    };

    sGis.utils.validate = function(val, type) {
        if (val === null) return;
        if (sGis.utils.is.function(type)) {
            if (!(val instanceof type)) valError(type.name, val);
        } else if (sGis.utils.validateFuncs[type]) {
            sGis.utils.validateFuncs[type](val);
        }
    };

    sGis.utils.validateFuncs = {
        'function': function (obj) {
            if (!sGis.utils.is.function(obj)) valError('Function', obj);
        },
        number: function(obj) {
            if (!sGis.utils.is.number(obj)) valError('Number', obj);
        },
        string: function(obj) {
            if (!sGis.utils.is.string(obj)) valError('String', obj);
        },
        array: function(obj) {
            if (!sGis.utils.is.array(obj)) valError('Array', obj);
        }
    };

    sGis.utils.is = {
        'function': function(obj) {
            return obj instanceof Function;
        },
        number: function(n) {
            return !utils.isArray(n) && !isNaN(parseFloat(n)) && isFinite(n);
        },
        string: function(s) {
            return typeof s === 'string';
        },
        array: function(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    };

    function valError(type, obj) {
        utils.error(type + ' is expected but got ' + obj + ' instead');
    }

})();