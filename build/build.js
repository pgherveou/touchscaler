
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Bind `el` event `type` to `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, type, fn, capture){\n\
  if (el.addEventListener) {\n\
    el.addEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.attachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
\n\
/**\n\
 * Unbind `el` event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  if (el.removeEventListener) {\n\
    el.removeEventListener(type, fn, capture || false);\n\
  } else {\n\
    el.detachEvent('on' + type, fn);\n\
  }\n\
  return fn;\n\
};\n\
//@ sourceURL=component-event/index.js"
));
require.register("component-matches-selector/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var query = require('query');\n\
\n\
/**\n\
 * Element prototype.\n\
 */\n\
\n\
var proto = Element.prototype;\n\
\n\
/**\n\
 * Vendor function.\n\
 */\n\
\n\
var vendor = proto.matches\n\
  || proto.webkitMatchesSelector\n\
  || proto.mozMatchesSelector\n\
  || proto.msMatchesSelector\n\
  || proto.oMatchesSelector;\n\
\n\
/**\n\
 * Expose `match()`.\n\
 */\n\
\n\
module.exports = match;\n\
\n\
/**\n\
 * Match `el` to `selector`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
function match(el, selector) {\n\
  if (vendor) return vendor.call(el, selector);\n\
  var nodes = query.all(selector, el.parentNode);\n\
  for (var i = 0; i < nodes.length; ++i) {\n\
    if (nodes[i] == el) return true;\n\
  }\n\
  return false;\n\
}\n\
//@ sourceURL=component-matches-selector/index.js"
));
require.register("discore-closest/index.js", Function("exports, require, module",
"var matches = require('matches-selector')\n\
\n\
module.exports = function (element, selector, checkYoSelf, root) {\n\
  element = checkYoSelf ? element : element.parentNode\n\
  root = root || document\n\
\n\
  do {\n\
    if (matches(element, selector))\n\
      return element\n\
    // After `matches` on the edge case that\n\
    // the selector matches the root\n\
    // (when the root is not the document)\n\
    if (element === root)\n\
      return\n\
    // Make sure `element !== document`\n\
    // otherwise we get an illegal invocation\n\
  } while ((element = element.parentNode) && element !== document)\n\
}//@ sourceURL=discore-closest/index.js"
));
require.register("component-delegate/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var closest = require('closest')\n\
  , event = require('event');\n\
\n\
/**\n\
 * Delegate event `type` to `selector`\n\
 * and invoke `fn(e)`. A callback function\n\
 * is returned which may be passed to `.unbind()`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} selector\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @return {Function}\n\
 * @api public\n\
 */\n\
\n\
exports.bind = function(el, selector, type, fn, capture){\n\
  return event.bind(el, type, function(e){\n\
    var target = e.target || e.srcElement;\n\
    e.delegateTarget = closest(target, selector, true, el);\n\
    if (e.delegateTarget) fn.call(el, e);\n\
  }, capture);\n\
};\n\
\n\
/**\n\
 * Unbind event `type`'s callback `fn`.\n\
 *\n\
 * @param {Element} el\n\
 * @param {String} type\n\
 * @param {Function} fn\n\
 * @param {Boolean} capture\n\
 * @api public\n\
 */\n\
\n\
exports.unbind = function(el, type, fn, capture){\n\
  event.unbind(el, type, fn, capture);\n\
};\n\
//@ sourceURL=component-delegate/index.js"
));
require.register("component-events/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var events = require('event');\n\
var delegate = require('delegate');\n\
\n\
/**\n\
 * Expose `Events`.\n\
 */\n\
\n\
module.exports = Events;\n\
\n\
/**\n\
 * Initialize an `Events` with the given\n\
 * `el` object which events will be bound to,\n\
 * and the `obj` which will receive method calls.\n\
 *\n\
 * @param {Object} el\n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
function Events(el, obj) {\n\
  if (!(this instanceof Events)) return new Events(el, obj);\n\
  if (!el) throw new Error('element required');\n\
  if (!obj) throw new Error('object required');\n\
  this.el = el;\n\
  this.obj = obj;\n\
  this._events = {};\n\
}\n\
\n\
/**\n\
 * Subscription helper.\n\
 */\n\
\n\
Events.prototype.sub = function(event, method, cb){\n\
  this._events[event] = this._events[event] || {};\n\
  this._events[event][method] = cb;\n\
};\n\
\n\
/**\n\
 * Bind to `event` with optional `method` name.\n\
 * When `method` is undefined it becomes `event`\n\
 * with the \"on\" prefix.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Direct event handling:\n\
 *\n\
 *    events.bind('click') // implies \"onclick\"\n\
 *    events.bind('click', 'remove')\n\
 *    events.bind('click', 'sort', 'asc')\n\
 *\n\
 *  Delegated event handling:\n\
 *\n\
 *    events.bind('click li > a')\n\
 *    events.bind('click li > a', 'remove')\n\
 *    events.bind('click a.sort-ascending', 'sort', 'asc')\n\
 *    events.bind('click a.sort-descending', 'sort', 'desc')\n\
 *\n\
 * @param {String} event\n\
 * @param {String|function} [method]\n\
 * @return {Function} callback\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.bind = function(event, method){\n\
  var e = parse(event);\n\
  var el = this.el;\n\
  var obj = this.obj;\n\
  var name = e.name;\n\
  var method = method || 'on' + name;\n\
  var args = [].slice.call(arguments, 2);\n\
\n\
  // callback\n\
  function cb(){\n\
    var a = [].slice.call(arguments).concat(args);\n\
    obj[method].apply(obj, a);\n\
  }\n\
\n\
  // bind\n\
  if (e.selector) {\n\
    cb = delegate.bind(el, e.selector, name, cb);\n\
  } else {\n\
    events.bind(el, name, cb);\n\
  }\n\
\n\
  // subscription for unbinding\n\
  this.sub(name, method, cb);\n\
\n\
  return cb;\n\
};\n\
\n\
/**\n\
 * Unbind a single binding, all bindings for `event`,\n\
 * or all bindings within the manager.\n\
 *\n\
 * Examples:\n\
 *\n\
 *  Unbind direct handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * Unbind delegate handlers:\n\
 *\n\
 *     events.unbind('click', 'remove')\n\
 *     events.unbind('click')\n\
 *     events.unbind()\n\
 *\n\
 * @param {String|Function} [event]\n\
 * @param {String|Function} [method]\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.unbind = function(event, method){\n\
  if (0 == arguments.length) return this.unbindAll();\n\
  if (1 == arguments.length) return this.unbindAllOf(event);\n\
\n\
  // no bindings for this event\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  // no bindings for this method\n\
  var cb = bindings[method];\n\
  if (!cb) return;\n\
\n\
  events.unbind(this.el, event, cb);\n\
};\n\
\n\
/**\n\
 * Unbind all events.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAll = function(){\n\
  for (var event in this._events) {\n\
    this.unbindAllOf(event);\n\
  }\n\
};\n\
\n\
/**\n\
 * Unbind all events for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.unbindAllOf = function(event){\n\
  var bindings = this._events[event];\n\
  if (!bindings) return;\n\
\n\
  for (var method in bindings) {\n\
    this.unbind(event, method);\n\
  }\n\
};\n\
\n\
/**\n\
 * Parse `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function parse(event) {\n\
  var parts = event.split(/ +/);\n\
  return {\n\
    name: parts.shift(),\n\
    selector: parts.join(' ')\n\
  }\n\
}\n\
//@ sourceURL=component-events/index.js"
));
require.register("pgherveou-prefix/index.js", Function("exports, require, module",
"// module globals\n\
\n\
var prefixes = ['webkit','Moz','ms','O']\n\
  , len = prefixes.length\n\
  , p = document.createElement('p')\n\
  , style = p.style\n\
  , capitalize = function (str) {return str.charAt(0).toUpperCase() + str.slice(1);}\n\
  , dasherize = function(str) {\n\
      return str.replace(/([A-Z])/g, function(str,m1) {\n\
        return '-' + m1.toLowerCase();\n\
      });\n\
    };\n\
\n\
// nullify p to release dom node\n\
p = null;\n\
\n\
/**\n\
 * get prefix for dom style\n\
 *\n\
 * example\n\
 *   prefix('transform') // webkitTransform\n\
 *   prefix('transform', true) // -webkit-transform\n\
 *\n\
 * @param  {String}   ppty dom style\n\
 * @param  {Boolean}  dasherize\n\
 * @return {String}   prefixed ppty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(ppty, dasherized) {\n\
  var Ppty, name, Name;\n\
\n\
  // test without prefix\n\
  if (style[ppty] !== undefined) {\n\
    if (!dasherized) return ppty;\n\
    return dasherize(ppty);\n\
  }\n\
\n\
  // test with prefix\n\
  Ppty = capitalize(ppty);\n\
  for (i = 0; i < len; i++) {\n\
    name = prefixes[i] + Ppty;\n\
    if (style[name] !== undefined) {\n\
      if (!dasherized) return name;\n\
      return '-' + prefixes[i].toLowerCase() + '-' + dasherize(ppty);\n\
    }\n\
  }\n\
\n\
  // not found return empty string\n\
  return '';\n\
};\n\
//@ sourceURL=pgherveou-prefix/index.js"
));
require.register("component-query/index.js", Function("exports, require, module",
"function one(selector, el) {\n\
  return el.querySelector(selector);\n\
}\n\
\n\
exports = module.exports = function(selector, el){\n\
  el = el || document;\n\
  return one(selector, el);\n\
};\n\
\n\
exports.all = function(selector, el){\n\
  el = el || document;\n\
  return el.querySelectorAll(selector);\n\
};\n\
\n\
exports.engine = function(obj){\n\
  if (!obj.one) throw new Error('.one callback required');\n\
  if (!obj.all) throw new Error('.all callback required');\n\
  one = obj.one;\n\
  exports.all = obj.all;\n\
  return exports;\n\
};\n\
//@ sourceURL=component-query/index.js"
));
require.register("component-transform-property/index.js", Function("exports, require, module",
"\n\
var styles = [\n\
  'webkitTransform',\n\
  'MozTransform',\n\
  'msTransform',\n\
  'OTransform',\n\
  'transform'\n\
];\n\
\n\
var el = document.createElement('p');\n\
var style;\n\
\n\
for (var i = 0; i < styles.length; i++) {\n\
  style = styles[i];\n\
  if (null != el.style[style]) {\n\
    module.exports = style;\n\
    break;\n\
  }\n\
}\n\
//@ sourceURL=component-transform-property/index.js"
));
require.register("component-has-translate3d/index.js", Function("exports, require, module",
"\n\
var prop = require('transform-property');\n\
// IE8<= doesn't have `getComputedStyle`\n\
if (!prop || !window.getComputedStyle) return module.exports = false;\n\
\n\
var map = {\n\
  webkitTransform: '-webkit-transform',\n\
  OTransform: '-o-transform',\n\
  msTransform: '-ms-transform',\n\
  MozTransform: '-moz-transform',\n\
  transform: 'transform'\n\
};\n\
\n\
// from: https://gist.github.com/lorenzopolidori/3794226\n\
var el = document.createElement('div');\n\
el.style[prop] = 'translate3d(1px,1px,1px)';\n\
document.body.insertBefore(el, null);\n\
var val = getComputedStyle(el).getPropertyValue(map[prop]);\n\
document.body.removeChild(el);\n\
module.exports = null != val && val.length && 'none' != val;\n\
//@ sourceURL=component-has-translate3d/index.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/index.js", Function("exports, require, module",
"module.exports = require(\"./load-image.js\");\n\
\n\
require('./load-image-ios.js');\n\
require('./load-image-orientation.js');\n\
require('./load-image-meta.js');\n\
require('./load-image-exif.js');\n\
require('./load-image-exif-map.js');//@ sourceURL=pgherveou-JavaScript-Load-Image/js/index.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/load-image.js", Function("exports, require, module",
"/*\n\
 * JavaScript Load Image 1.9.0\n\
 * https://github.com/blueimp/JavaScript-Load-Image\n\
 *\n\
 * Copyright 2011, Sebastian Tschan\n\
 * https://blueimp.net\n\
 *\n\
 * Licensed under the MIT license:\n\
 * http://www.opensource.org/licenses/MIT\n\
 */\n\
\n\
/*jslint nomen: true */\n\
/*global define, window, document, URL, webkitURL, Blob, File, FileReader */\n\
\n\
(function ($) {\n\
    'use strict';\n\
\n\
    // Loads an image for a given File object.\n\
    // Invokes the callback with an img or optional canvas\n\
    // element (if supported by the browser) as parameter:\n\
    var loadImage = function (file, callback, options) {\n\
            var img = document.createElement('img'),\n\
                url,\n\
                oUrl;\n\
            img.onerror = callback;\n\
            img.onload = function () {\n\
                if (oUrl && !(options && options.noRevoke)) {\n\
                    loadImage.revokeObjectURL(oUrl);\n\
                }\n\
                if (callback) {\n\
                    callback(loadImage.scale(img, options));\n\
                }\n\
            };\n\
            if (loadImage.isInstanceOf('Blob', file) ||\n\
                    // Files are also Blob instances, but some browsers\n\
                    // (Firefox 3.6) support the File API but not Blobs:\n\
                    loadImage.isInstanceOf('File', file)) {\n\
                url = oUrl = loadImage.createObjectURL(file);\n\
                // Store the file type for resize processing:\n\
                img._type = file.type;\n\
            } else if (typeof file === 'string') {\n\
                url = file;\n\
                if (options && options.crossOrigin) {\n\
                    img.crossOrigin = options.crossOrigin;\n\
                }\n\
            } else {\n\
                return false;\n\
            }\n\
            if (url) {\n\
                img.src = url;\n\
                return img;\n\
            }\n\
            return loadImage.readFile(file, function (e) {\n\
                var target = e.target;\n\
                if (target && target.result) {\n\
                    img.src = target.result;\n\
                } else {\n\
                    if (callback) {\n\
                        callback(e);\n\
                    }\n\
                }\n\
            });\n\
        },\n\
        // The check for URL.revokeObjectURL fixes an issue with Opera 12,\n\
        // which provides URL.createObjectURL but doesn't properly implement it:\n\
        urlAPI = (window.createObjectURL && window) ||\n\
            (window.URL && URL.revokeObjectURL && URL) ||\n\
            (window.webkitURL && webkitURL);\n\
\n\
    loadImage.isInstanceOf = function (type, obj) {\n\
        // Cross-frame instanceof check\n\
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';\n\
    };\n\
\n\
    // Transform image coordinates, allows to override e.g.\n\
    // the canvas orientation based on the orientation option,\n\
    // gets canvas, options passed as arguments:\n\
    loadImage.transformCoordinates = function () {\n\
        return;\n\
    };\n\
\n\
    // Returns transformed options, allows to override e.g.\n\
    // coordinate and dimension options based on the orientation:\n\
    loadImage.getTransformedOptions = function (options) {\n\
        return options;\n\
    };\n\
\n\
    // Canvas render method, allows to override the\n\
    // rendering e.g. to work around issues on iOS:\n\
    loadImage.renderImageToCanvas = function (\n\
        canvas,\n\
        img,\n\
        sourceX,\n\
        sourceY,\n\
        sourceWidth,\n\
        sourceHeight,\n\
        destX,\n\
        destY,\n\
        destWidth,\n\
        destHeight\n\
    ) {\n\
        canvas.getContext('2d').drawImage(\n\
            img,\n\
            sourceX,\n\
            sourceY,\n\
            sourceWidth,\n\
            sourceHeight,\n\
            destX,\n\
            destY,\n\
            destWidth,\n\
            destHeight\n\
        );\n\
        return canvas;\n\
    };\n\
\n\
    // This method is used to determine if the target image\n\
    // should be a canvas element:\n\
    loadImage.hasCanvasOption = function (options) {\n\
        return options.canvas || options.crop;\n\
    };\n\
\n\
    // Scales and/or crops the given image (img or canvas HTML element)\n\
    // using the given options.\n\
    // Returns a canvas object if the browser supports canvas\n\
    // and the hasCanvasOption method returns true or a canvas\n\
    // object is passed as image, else the scaled image:\n\
    loadImage.scale = function (img, options) {\n\
        options = options || {};\n\
        var canvas = document.createElement('canvas'),\n\
            useCanvas = img.getContext ||\n\
                (loadImage.hasCanvasOption(options) && canvas.getContext),\n\
            width = img.naturalWidth || img.width,\n\
            height = img.naturalHeight || img.height,\n\
            destWidth = width,\n\
            destHeight = height,\n\
            maxWidth,\n\
            maxHeight,\n\
            minWidth,\n\
            minHeight,\n\
            sourceWidth,\n\
            sourceHeight,\n\
            sourceX,\n\
            sourceY,\n\
            tmp,\n\
            scaleUp = function () {\n\
                var scale = Math.max(\n\
                    (minWidth || destWidth) / destWidth,\n\
                    (minHeight || destHeight) / destHeight\n\
                );\n\
                if (scale > 1) {\n\
                    destWidth = Math.ceil(destWidth * scale);\n\
                    destHeight = Math.ceil(destHeight * scale);\n\
                }\n\
            },\n\
            scaleDown = function () {\n\
                var scale = Math.min(\n\
                    (maxWidth || destWidth) / destWidth,\n\
                    (maxHeight || destHeight) / destHeight\n\
                );\n\
                if (scale < 1) {\n\
                    destWidth = Math.ceil(destWidth * scale);\n\
                    destHeight = Math.ceil(destHeight * scale);\n\
                }\n\
            };\n\
        if (useCanvas) {\n\
            options = loadImage.getTransformedOptions(options);\n\
            sourceX = options.left || 0;\n\
            sourceY = options.top || 0;\n\
            if (options.sourceWidth) {\n\
                sourceWidth = options.sourceWidth;\n\
                if (options.right !== undefined && options.left === undefined) {\n\
                    sourceX = width - sourceWidth - options.right;\n\
                }\n\
            } else {\n\
                sourceWidth = width - sourceX - (options.right || 0);\n\
            }\n\
            if (options.sourceHeight) {\n\
                sourceHeight = options.sourceHeight;\n\
                if (options.bottom !== undefined && options.top === undefined) {\n\
                    sourceY = height - sourceHeight - options.bottom;\n\
                }\n\
            } else {\n\
                sourceHeight = height - sourceY - (options.bottom || 0);\n\
            }\n\
            destWidth = sourceWidth;\n\
            destHeight = sourceHeight;\n\
        }\n\
        maxWidth = options.maxWidth;\n\
        maxHeight = options.maxHeight;\n\
        minWidth = options.minWidth;\n\
        minHeight = options.minHeight;\n\
        if (useCanvas && maxWidth && maxHeight && options.crop) {\n\
            destWidth = maxWidth;\n\
            destHeight = maxHeight;\n\
            tmp = sourceWidth / sourceHeight - maxWidth / maxHeight;\n\
            if (tmp < 0) {\n\
                sourceHeight = maxHeight * sourceWidth / maxWidth;\n\
                if (options.top === undefined && options.bottom === undefined) {\n\
                    sourceY = (height - sourceHeight) / 2;\n\
                }\n\
            } else if (tmp > 0) {\n\
                sourceWidth = maxWidth * sourceHeight / maxHeight;\n\
                if (options.left === undefined && options.right === undefined) {\n\
                    sourceX = (width - sourceWidth) / 2;\n\
                }\n\
            }\n\
        } else {\n\
            if (options.contain || options.cover) {\n\
                minWidth = maxWidth = maxWidth || minWidth;\n\
                minHeight = maxHeight = maxHeight || minHeight;\n\
            }\n\
            if (options.cover) {\n\
                scaleDown();\n\
                scaleUp();\n\
            } else {\n\
                scaleUp();\n\
                scaleDown();\n\
            }\n\
        }\n\
        if (useCanvas) {\n\
            canvas.width = destWidth;\n\
            canvas.height = destHeight;\n\
            loadImage.transformCoordinates(\n\
                canvas,\n\
                options\n\
            );\n\
            return loadImage.renderImageToCanvas(\n\
                canvas,\n\
                img,\n\
                sourceX,\n\
                sourceY,\n\
                sourceWidth,\n\
                sourceHeight,\n\
                0,\n\
                0,\n\
                destWidth,\n\
                destHeight\n\
            );\n\
        }\n\
        img.width = destWidth;\n\
        img.height = destHeight;\n\
        return img;\n\
    };\n\
\n\
    loadImage.createObjectURL = function (file) {\n\
        return urlAPI ? urlAPI.createObjectURL(file) : false;\n\
    };\n\
\n\
    loadImage.revokeObjectURL = function (url) {\n\
        return urlAPI ? urlAPI.revokeObjectURL(url) : false;\n\
    };\n\
\n\
    // Loads a given File object via FileReader interface,\n\
    // invokes the callback with the event object (load or error).\n\
    // The result can be read via event.target.result:\n\
    loadImage.readFile = function (file, callback, method) {\n\
        if (window.FileReader) {\n\
            var fileReader = new FileReader();\n\
            fileReader.onload = fileReader.onerror = callback;\n\
            method = method || 'readAsDataURL';\n\
            if (fileReader[method]) {\n\
                fileReader[method](file);\n\
                return fileReader;\n\
            }\n\
        }\n\
        return false;\n\
    };\n\
    \n\
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {\n\
        module.exports = loadImage;\n\
    } else if (typeof define === 'function' && define.amd) {\n\
        define(function () {\n\
            return loadImage;\n\
        });\n\
    } else {\n\
        $.loadImage = loadImage;\n\
    }\n\
}(this));\n\
//@ sourceURL=pgherveou-JavaScript-Load-Image/js/load-image.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/load-image-ios.js", Function("exports, require, module",
"/*\n\
 * JavaScript Load Image iOS scaling fixes 1.0.3\n\
 * https://github.com/blueimp/JavaScript-Load-Image\n\
 *\n\
 * Copyright 2013, Sebastian Tschan\n\
 * https://blueimp.net\n\
 *\n\
 * iOS image scaling fixes based on\n\
 * https://github.com/stomita/ios-imagefile-megapixel\n\
 *\n\
 * Licensed under the MIT license:\n\
 * http://www.opensource.org/licenses/MIT\n\
 */\n\
\n\
/*jslint nomen: true, bitwise: true */\n\
/*global define, window, document */\n\
\n\
(function (factory) {\n\
    'use strict';\n\
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {\n\
        var loadImage = require('./load-image');\n\
        module.exports = factory(loadImage);\n\
    }\n\
    else if (typeof define === 'function' && define.amd) {\n\
        // Register as an anonymous AMD module:\n\
        define(['load-image'], factory);\n\
    } else {\n\
        // Browser globals:\n\
        factory(window.loadImage);\n\
    }\n\
}(function (loadImage) {\n\
    'use strict';\n\
\n\
    // Only apply fixes on the iOS platform:\n\
    if (!window.navigator || !window.navigator.platform ||\n\
             !(/iP(hone|od|ad)/).test(window.navigator.platform)) {\n\
        return;\n\
    }\n\
\n\
    var originalRenderMethod = loadImage.renderImageToCanvas;\n\
\n\
    // Detects subsampling in JPEG images:\n\
    loadImage.detectSubsampling = function (img) {\n\
        var canvas,\n\
            context;\n\
        if (img.width * img.height > 1024 * 1024) { // only consider mexapixel images\n\
            canvas = document.createElement('canvas');\n\
            canvas.width = canvas.height = 1;\n\
            context = canvas.getContext('2d');\n\
            context.drawImage(img, -img.width + 1, 0);\n\
            // subsampled image becomes half smaller in rendering size.\n\
            // check alpha channel value to confirm image is covering edge pixel or not.\n\
            // if alpha value is 0 image is not covering, hence subsampled.\n\
            return context.getImageData(0, 0, 1, 1).data[3] === 0;\n\
        }\n\
        return false;\n\
    };\n\
\n\
    // Detects vertical squash in JPEG images:\n\
    loadImage.detectVerticalSquash = function (img, subsampled) {\n\
        var naturalHeight = img.naturalHeight || img.height,\n\
            canvas = document.createElement('canvas'),\n\
            context = canvas.getContext('2d'),\n\
            data,\n\
            sy,\n\
            ey,\n\
            py,\n\
            alpha;\n\
        if (subsampled) {\n\
            naturalHeight /= 2;\n\
        }\n\
        canvas.width = 1;\n\
        canvas.height = naturalHeight;\n\
        context.drawImage(img, 0, 0);\n\
        data = context.getImageData(0, 0, 1, naturalHeight).data;\n\
        // search image edge pixel position in case it is squashed vertically:\n\
        sy = 0;\n\
        ey = naturalHeight;\n\
        py = naturalHeight;\n\
        while (py > sy) {\n\
            alpha = data[(py - 1) * 4 + 3];\n\
            if (alpha === 0) {\n\
                ey = py;\n\
            } else {\n\
                sy = py;\n\
            }\n\
            py = (ey + sy) >> 1;\n\
        }\n\
        return (py / naturalHeight) || 1;\n\
    };\n\
\n\
    // Renders image to canvas while working around iOS image scaling bugs:\n\
    // https://github.com/blueimp/JavaScript-Load-Image/issues/13\n\
    loadImage.renderImageToCanvas = function (\n\
        canvas,\n\
        img,\n\
        sourceX,\n\
        sourceY,\n\
        sourceWidth,\n\
        sourceHeight,\n\
        destX,\n\
        destY,\n\
        destWidth,\n\
        destHeight\n\
    ) {\n\
        if (img._type === 'image/jpeg') {\n\
            var context = canvas.getContext('2d'),\n\
                tmpCanvas = document.createElement('canvas'),\n\
                tileSize = 1024,\n\
                tmpContext = tmpCanvas.getContext('2d'),\n\
                subsampled,\n\
                vertSquashRatio,\n\
                tileX,\n\
                tileY;\n\
            tmpCanvas.width = tileSize;\n\
            tmpCanvas.height = tileSize;\n\
            context.save();\n\
            subsampled = loadImage.detectSubsampling(img);\n\
            if (subsampled) {\n\
                sourceX /= 2;\n\
                sourceY /= 2;\n\
                sourceWidth /= 2;\n\
                sourceHeight /= 2;\n\
            }\n\
            vertSquashRatio = loadImage.detectVerticalSquash(img, subsampled);\n\
            if (subsampled || vertSquashRatio !== 1) {\n\
                sourceY *= vertSquashRatio;\n\
                destWidth = Math.ceil(tileSize * destWidth / sourceWidth);\n\
                destHeight = Math.ceil(\n\
                    tileSize * destHeight / sourceHeight / vertSquashRatio\n\
                );\n\
                destY = 0;\n\
                tileY = 0;\n\
                while (tileY < sourceHeight) {\n\
                    destX = 0;\n\
                    tileX = 0;\n\
                    while (tileX < sourceWidth) {\n\
                        tmpContext.clearRect(0, 0, tileSize, tileSize);\n\
                        tmpContext.drawImage(\n\
                            img,\n\
                            sourceX,\n\
                            sourceY,\n\
                            sourceWidth,\n\
                            sourceHeight,\n\
                            -tileX,\n\
                            -tileY,\n\
                            sourceWidth,\n\
                            sourceHeight\n\
                        );\n\
                        context.drawImage(\n\
                            tmpCanvas,\n\
                            0,\n\
                            0,\n\
                            tileSize,\n\
                            tileSize,\n\
                            destX,\n\
                            destY,\n\
                            destWidth,\n\
                            destHeight\n\
                        );\n\
                        tileX += tileSize;\n\
                        destX += destWidth;\n\
                    }\n\
                    tileY += tileSize;\n\
                    destY += destHeight;\n\
                }\n\
                context.restore();\n\
                return canvas;\n\
            }\n\
        }\n\
        return originalRenderMethod(\n\
            canvas,\n\
            img,\n\
            sourceX,\n\
            sourceY,\n\
            sourceWidth,\n\
            sourceHeight,\n\
            destX,\n\
            destY,\n\
            destWidth,\n\
            destHeight\n\
        );\n\
    };\n\
\n\
}));\n\
//@ sourceURL=pgherveou-JavaScript-Load-Image/js/load-image-ios.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/load-image-orientation.js", Function("exports, require, module",
"/*\n\
 * JavaScript Load Image Orientation 1.0.0\n\
 * https://github.com/blueimp/JavaScript-Load-Image\n\
 *\n\
 * Copyright 2013, Sebastian Tschan\n\
 * https://blueimp.net\n\
 *\n\
 * Licensed under the MIT license:\n\
 * http://www.opensource.org/licenses/MIT\n\
 */\n\
\n\
/*global define, window */\n\
\n\
(function (factory) {\n\
    'use strict';\n\
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {\n\
        // common js\n\
        var loadImage = require('./load-image');\n\
        module.exports = factory(loadImage);\n\
    }\n\
    else if (typeof define === 'function' && define.amd) {\n\
        // Register as an anonymous AMD module:\n\
        define(['load-image'], factory);\n\
    } else {\n\
        // Browser globals:\n\
        factory(window.loadImage);\n\
    }\n\
}(function (loadImage) {\n\
    'use strict';\n\
\n\
    var originalHasCanvasOptionMethod = loadImage.hasCanvasOption;\n\
\n\
    // This method is used to determine if the target image\n\
    // should be a canvas element:\n\
    loadImage.hasCanvasOption = function (options) {\n\
        return originalHasCanvasOptionMethod(options) || options.orientation;\n\
    };\n\
\n\
    // Transform image orientation based on\n\
    // the given EXIF orientation option:\n\
    loadImage.transformCoordinates = function (canvas, options) {\n\
        var ctx = canvas.getContext('2d'),\n\
            width = canvas.width,\n\
            height = canvas.height,\n\
            orientation = options.orientation;\n\
        if (!orientation) {\n\
            return;\n\
        }\n\
        if (orientation > 4) {\n\
            canvas.width = height;\n\
            canvas.height = width;\n\
        }\n\
        switch (orientation) {\n\
        case 2:\n\
            // horizontal flip\n\
            ctx.translate(width, 0);\n\
            ctx.scale(-1, 1);\n\
            break;\n\
        case 3:\n\
            // 180° rotate left\n\
            ctx.translate(width, height);\n\
            ctx.rotate(Math.PI);\n\
            break;\n\
        case 4:\n\
            // vertical flip\n\
            ctx.translate(0, height);\n\
            ctx.scale(1, -1);\n\
            break;\n\
        case 5:\n\
            // vertical flip + 90 rotate right\n\
            ctx.rotate(0.5 * Math.PI);\n\
            ctx.scale(1, -1);\n\
            break;\n\
        case 6:\n\
            // 90° rotate right\n\
            ctx.rotate(0.5 * Math.PI);\n\
            ctx.translate(0, -height);\n\
            break;\n\
        case 7:\n\
            // horizontal flip + 90 rotate right\n\
            ctx.rotate(0.5 * Math.PI);\n\
            ctx.translate(width, -height);\n\
            ctx.scale(-1, 1);\n\
            break;\n\
        case 8:\n\
            // 90° rotate left\n\
            ctx.rotate(-0.5 * Math.PI);\n\
            ctx.translate(-width, 0);\n\
            break;\n\
        }\n\
    };\n\
\n\
    // Transforms coordinate and dimension options\n\
    // based on the given orientation option:\n\
    loadImage.getTransformedOptions = function (options) {\n\
        if (!options.orientation || options.orientation === 1) {\n\
            return options;\n\
        }\n\
        var newOptions = {},\n\
            i;\n\
        for (i in options) {\n\
            if (options.hasOwnProperty(i)) {\n\
                newOptions[i] = options[i];\n\
            }\n\
        }\n\
        switch (options.orientation) {\n\
        case 2:\n\
            // horizontal flip\n\
            newOptions.left = options.right;\n\
            newOptions.right = options.left;\n\
            break;\n\
        case 3:\n\
            // 180° rotate left\n\
            newOptions.left = options.right;\n\
            newOptions.top = options.bottom;\n\
            newOptions.right = options.left;\n\
            newOptions.bottom = options.top;\n\
            break;\n\
        case 4:\n\
            // vertical flip\n\
            newOptions.top = options.bottom;\n\
            newOptions.bottom = options.top;\n\
            break;\n\
        case 5:\n\
            // vertical flip + 90 rotate right\n\
            newOptions.left = options.top;\n\
            newOptions.top = options.left;\n\
            newOptions.right = options.bottom;\n\
            newOptions.bottom = options.right;\n\
            break;\n\
        case 6:\n\
            // 90° rotate right\n\
            newOptions.left = options.top;\n\
            newOptions.top = options.right;\n\
            newOptions.right = options.bottom;\n\
            newOptions.bottom = options.left;\n\
            break;\n\
        case 7:\n\
            // horizontal flip + 90 rotate right\n\
            newOptions.left = options.bottom;\n\
            newOptions.top = options.right;\n\
            newOptions.right = options.top;\n\
            newOptions.bottom = options.left;\n\
            break;\n\
        case 8:\n\
            // 90° rotate left\n\
            newOptions.left = options.bottom;\n\
            newOptions.top = options.left;\n\
            newOptions.right = options.top;\n\
            newOptions.bottom = options.right;\n\
            break;\n\
        }\n\
        if (options.orientation > 4) {\n\
            newOptions.maxWidth = options.maxHeight;\n\
            newOptions.maxHeight = options.maxWidth;\n\
            newOptions.minWidth = options.minHeight;\n\
            newOptions.minHeight = options.minWidth;\n\
            newOptions.sourceWidth = options.sourceHeight;\n\
            newOptions.sourceHeight = options.sourceWidth;\n\
        }\n\
        return newOptions;\n\
    };\n\
\n\
}));\n\
//@ sourceURL=pgherveou-JavaScript-Load-Image/js/load-image-orientation.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/load-image-meta.js", Function("exports, require, module",
"/*\n\
 * JavaScript Load Image Meta 1.0.1\n\
 * https://github.com/blueimp/JavaScript-Load-Image\n\
 *\n\
 * Copyright 2013, Sebastian Tschan\n\
 * https://blueimp.net\n\
 *\n\
 * Image meta data handling implementation\n\
 * based on the help and contribution of\n\
 * Achim Stöhr.\n\
 *\n\
 * Licensed under the MIT license:\n\
 * http://www.opensource.org/licenses/MIT\n\
 */\n\
\n\
/*jslint continue:true */\n\
/*global define, window, DataView, Blob, Uint8Array, console */\n\
\n\
(function (factory) {\n\
    'use strict';\n\
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {\n\
        var loadImage = require('./load-image');\n\
        module.exports = factory(loadImage);\n\
    }\n\
    else if (typeof define === 'function' && define.amd) {\n\
        // Register as an anonymous AMD module:\n\
        define(['load-image'], factory);\n\
    } else {\n\
        // Browser globals:\n\
        factory(window.loadImage);\n\
    }\n\
}(function (loadImage) {\n\
    'use strict';\n\
\n\
    var hasblobSlice = window.Blob && (Blob.prototype.slice ||\n\
            Blob.prototype.webkitSlice || Blob.prototype.mozSlice);\n\
\n\
    loadImage.blobSlice = hasblobSlice && function () {\n\
        var slice = this.slice || this.webkitSlice || this.mozSlice;\n\
        return slice.apply(this, arguments);\n\
    };\n\
\n\
    loadImage.metaDataParsers = {\n\
        jpeg: {\n\
            0xffe1: [] // APP1 marker\n\
        }\n\
    };\n\
\n\
    // Parses image meta data and calls the callback with an object argument\n\
    // with the following properties:\n\
    // * imageHead: The complete image head as ArrayBuffer (Uint8Array for IE10)\n\
    // The options arguments accepts an object and supports the following properties:\n\
    // * maxMetaDataSize: Defines the maximum number of bytes to parse.\n\
    // * disableImageHead: Disables creating the imageHead property.\n\
    loadImage.parseMetaData = function (file, callback, options) {\n\
        options = options || {};\n\
        var that = this,\n\
            // 256 KiB should contain all EXIF/ICC/IPTC segments:\n\
            maxMetaDataSize = options.maxMetaDataSize || 262144,\n\
            data = {},\n\
            noMetaData = !(window.DataView  && file && file.size >= 12 &&\n\
                file.type === 'image/jpeg' && loadImage.blobSlice);\n\
        if (noMetaData || !loadImage.readFile(\n\
                loadImage.blobSlice.call(file, 0, maxMetaDataSize),\n\
                function (e) {\n\
                    // Note on endianness:\n\
                    // Since the marker and length bytes in JPEG files are always\n\
                    // stored in big endian order, we can leave the endian parameter\n\
                    // of the DataView methods undefined, defaulting to big endian.\n\
                    var buffer = e.target.result,\n\
                        dataView = new DataView(buffer),\n\
                        offset = 2,\n\
                        maxOffset = dataView.byteLength - 4,\n\
                        headLength = offset,\n\
                        markerBytes,\n\
                        markerLength,\n\
                        parsers,\n\
                        i;\n\
                    // Check for the JPEG marker (0xffd8):\n\
                    if (dataView.getUint16(0) === 0xffd8) {\n\
                        while (offset < maxOffset) {\n\
                            markerBytes = dataView.getUint16(offset);\n\
                            // Search for APPn (0xffeN) and COM (0xfffe) markers,\n\
                            // which contain application-specific meta-data like\n\
                            // Exif, ICC and IPTC data and text comments:\n\
                            if ((markerBytes >= 0xffe0 && markerBytes <= 0xffef) ||\n\
                                    markerBytes === 0xfffe) {\n\
                                // The marker bytes (2) are always followed by\n\
                                // the length bytes (2), indicating the length of the\n\
                                // marker segment, which includes the length bytes,\n\
                                // but not the marker bytes, so we add 2:\n\
                                markerLength = dataView.getUint16(offset + 2) + 2;\n\
                                if (offset + markerLength > dataView.byteLength) {\n\
                                    console.log('Invalid meta data: Invalid segment size.');\n\
                                    break;\n\
                                }\n\
                                parsers = loadImage.metaDataParsers.jpeg[markerBytes];\n\
                                if (parsers) {\n\
                                    for (i = 0; i < parsers.length; i += 1) {\n\
                                        parsers[i].call(\n\
                                            that,\n\
                                            dataView,\n\
                                            offset,\n\
                                            markerLength,\n\
                                            data,\n\
                                            options\n\
                                        );\n\
                                    }\n\
                                }\n\
                                offset += markerLength;\n\
                                headLength = offset;\n\
                            } else {\n\
                                // Not an APPn or COM marker, probably safe to\n\
                                // assume that this is the end of the meta data\n\
                                break;\n\
                            }\n\
                        }\n\
                        // Meta length must be longer than JPEG marker (2)\n\
                        // plus APPn marker (2), followed by length bytes (2):\n\
                        if (!options.disableImageHead && headLength > 6) {\n\
                            if (buffer.slice) {\n\
                                data.imageHead = buffer.slice(0, headLength);\n\
                            } else {\n\
                                // Workaround for IE10, which does not yet\n\
                                // support ArrayBuffer.slice:\n\
                                data.imageHead = new Uint8Array(buffer)\n\
                                    .subarray(0, headLength);\n\
                            }\n\
                        }\n\
                    } else {\n\
                        console.log('Invalid JPEG file: Missing JPEG marker.');\n\
                    }\n\
                    callback(data);\n\
                },\n\
                'readAsArrayBuffer'\n\
            )) {\n\
            callback(data);\n\
        }\n\
    };\n\
\n\
}));\n\
//@ sourceURL=pgherveou-JavaScript-Load-Image/js/load-image-meta.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/load-image-exif.js", Function("exports, require, module",
"/*\n\
 * JavaScript Load Image Exif Parser 1.0.0\n\
 * https://github.com/blueimp/JavaScript-Load-Image\n\
 *\n\
 * Copyright 2013, Sebastian Tschan\n\
 * https://blueimp.net\n\
 *\n\
 * Licensed under the MIT license:\n\
 * http://www.opensource.org/licenses/MIT\n\
 */\n\
\n\
/*jslint unparam: true */\n\
/*global define, window, console */\n\
\n\
(function (factory) {\n\
    'use strict';\n\
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {\n\
        var loadImage = require('./load-image');\n\
        require('./load-image-meta');\n\
        module.exports = factory(loadImage);\n\
    }\n\
    else if (typeof define === 'function' && define.amd) {\n\
        // Register as an anonymous AMD module:\n\
        define(['load-image', 'load-image-meta'], factory);\n\
    } else {\n\
        // Browser globals:\n\
        factory(window.loadImage);\n\
    }\n\
}(function (loadImage) {\n\
    'use strict';\n\
\n\
    loadImage.ExifMap = function () {\n\
        return this;\n\
    };\n\
\n\
    loadImage.ExifMap.prototype.map = {\n\
        'Orientation': 0x0112\n\
    };\n\
\n\
    loadImage.ExifMap.prototype.get = function (id) {\n\
        return this[id] || this[this.map[id]];\n\
    };\n\
\n\
    loadImage.getExifThumbnail = function (dataView, offset, length) {\n\
        var hexData,\n\
            i,\n\
            b;\n\
        if (!length || offset + length > dataView.byteLength) {\n\
            console.log('Invalid Exif data: Invalid thumbnail data.');\n\
            return;\n\
        }\n\
        hexData = [];\n\
        for (i = 0; i < length; i += 1) {\n\
            b = dataView.getUint8(offset + i);\n\
            hexData.push((b < 16 ? '0' : '') + b.toString(16));\n\
        }\n\
        return 'data:image/jpeg,%' + hexData.join('%');\n\
    };\n\
\n\
    loadImage.exifTagTypes = {\n\
        // byte, 8-bit unsigned int:\n\
        1: {\n\
            getValue: function (dataView, dataOffset) {\n\
                return dataView.getUint8(dataOffset);\n\
            },\n\
            size: 1\n\
        },\n\
        // ascii, 8-bit byte:\n\
        2: {\n\
            getValue: function (dataView, dataOffset) {\n\
                return String.fromCharCode(dataView.getUint8(dataOffset));\n\
            },\n\
            size: 1,\n\
            ascii: true\n\
        },\n\
        // short, 16 bit int:\n\
        3: {\n\
            getValue: function (dataView, dataOffset, littleEndian) {\n\
                return dataView.getUint16(dataOffset, littleEndian);\n\
            },\n\
            size: 2\n\
        },\n\
        // long, 32 bit int:\n\
        4: {\n\
            getValue: function (dataView, dataOffset, littleEndian) {\n\
                return dataView.getUint32(dataOffset, littleEndian);\n\
            },\n\
            size: 4\n\
        },\n\
        // rational = two long values, first is numerator, second is denominator:\n\
        5: {\n\
            getValue: function (dataView, dataOffset, littleEndian) {\n\
                return dataView.getUint32(dataOffset, littleEndian) /\n\
                    dataView.getUint32(dataOffset + 4, littleEndian);\n\
            },\n\
            size: 8\n\
        },\n\
        // slong, 32 bit signed int:\n\
        9: {\n\
            getValue: function (dataView, dataOffset, littleEndian) {\n\
                return dataView.getInt32(dataOffset, littleEndian);\n\
            },\n\
            size: 4\n\
        },\n\
        // srational, two slongs, first is numerator, second is denominator:\n\
        10: {\n\
            getValue: function (dataView, dataOffset, littleEndian) {\n\
                return dataView.getInt32(dataOffset, littleEndian) /\n\
                    dataView.getInt32(dataOffset + 4, littleEndian);\n\
            },\n\
            size: 8\n\
        }\n\
    };\n\
    // undefined, 8-bit byte, value depending on field:\n\
    loadImage.exifTagTypes[7] = loadImage.exifTagTypes[1];\n\
\n\
    loadImage.getExifValue = function (dataView, tiffOffset, offset, type, length, littleEndian) {\n\
        var tagType = loadImage.exifTagTypes[type],\n\
            tagSize,\n\
            dataOffset,\n\
            values,\n\
            i,\n\
            str,\n\
            c;\n\
        if (!tagType) {\n\
            console.log('Invalid Exif data: Invalid tag type.');\n\
            return;\n\
        }\n\
        tagSize = tagType.size * length;\n\
        // Determine if the value is contained in the dataOffset bytes,\n\
        // or if the value at the dataOffset is a pointer to the actual data:\n\
        dataOffset = tagSize > 4 ?\n\
                tiffOffset + dataView.getUint32(offset + 8, littleEndian) : (offset + 8);\n\
        if (dataOffset + tagSize > dataView.byteLength) {\n\
            console.log('Invalid Exif data: Invalid data offset.');\n\
            return;\n\
        }\n\
        if (length === 1) {\n\
            return tagType.getValue(dataView, dataOffset, littleEndian);\n\
        }\n\
        values = [];\n\
        for (i = 0; i < length; i += 1) {\n\
            values[i] = tagType.getValue(dataView, dataOffset + i * tagType.size, littleEndian);\n\
        }\n\
        if (tagType.ascii) {\n\
            str = '';\n\
            // Concatenate the chars:\n\
            for (i = 0; i < values.length; i += 1) {\n\
                c = values[i];\n\
                // Ignore the terminating NULL byte(s):\n\
                if (c === '\\u0000') {\n\
                    break;\n\
                }\n\
                str += c;\n\
            }\n\
            return str;\n\
        }\n\
        return values;\n\
    };\n\
\n\
    loadImage.parseExifTag = function (dataView, tiffOffset, offset, littleEndian, data) {\n\
        var tag = dataView.getUint16(offset, littleEndian);\n\
        data.exif[tag] = loadImage.getExifValue(\n\
            dataView,\n\
            tiffOffset,\n\
            offset,\n\
            dataView.getUint16(offset + 2, littleEndian), // tag type\n\
            dataView.getUint32(offset + 4, littleEndian), // tag length\n\
            littleEndian\n\
        );\n\
    };\n\
\n\
    loadImage.parseExifTags = function (dataView, tiffOffset, dirOffset, littleEndian, data) {\n\
        var tagsNumber,\n\
            dirEndOffset,\n\
            i;\n\
        if (dirOffset + 6 > dataView.byteLength) {\n\
            console.log('Invalid Exif data: Invalid directory offset.');\n\
            return;\n\
        }\n\
        tagsNumber = dataView.getUint16(dirOffset, littleEndian);\n\
        dirEndOffset = dirOffset + 2 + 12 * tagsNumber;\n\
        if (dirEndOffset + 4 > dataView.byteLength) {\n\
            console.log('Invalid Exif data: Invalid directory size.');\n\
            return;\n\
        }\n\
        for (i = 0; i < tagsNumber; i += 1) {\n\
            this.parseExifTag(\n\
                dataView,\n\
                tiffOffset,\n\
                dirOffset + 2 + 12 * i, // tag offset\n\
                littleEndian,\n\
                data\n\
            );\n\
        }\n\
        // Return the offset to the next directory:\n\
        return dataView.getUint32(dirEndOffset, littleEndian);\n\
    };\n\
\n\
    loadImage.parseExifData = function (dataView, offset, length, data, options) {\n\
        if (options.disableExif) {\n\
            return;\n\
        }\n\
        var tiffOffset = offset + 10,\n\
            littleEndian,\n\
            dirOffset,\n\
            thumbnailData;\n\
        // Check for the ASCII code for \"Exif\" (0x45786966):\n\
        if (dataView.getUint32(offset + 4) !== 0x45786966) {\n\
            // No Exif data, might be XMP data instead\n\
            return;\n\
        }\n\
        if (tiffOffset + 8 > dataView.byteLength) {\n\
            console.log('Invalid Exif data: Invalid segment size.');\n\
            return;\n\
        }\n\
        // Check for the two null bytes:\n\
        if (dataView.getUint16(offset + 8) !== 0x0000) {\n\
            console.log('Invalid Exif data: Missing byte alignment offset.');\n\
            return;\n\
        }\n\
        // Check the byte alignment:\n\
        switch (dataView.getUint16(tiffOffset)) {\n\
        case 0x4949:\n\
            littleEndian = true;\n\
            break;\n\
        case 0x4D4D:\n\
            littleEndian = false;\n\
            break;\n\
        default:\n\
            console.log('Invalid Exif data: Invalid byte alignment marker.');\n\
            return;\n\
        }\n\
        // Check for the TIFF tag marker (0x002A):\n\
        if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) {\n\
            console.log('Invalid Exif data: Missing TIFF marker.');\n\
            return;\n\
        }\n\
        // Retrieve the directory offset bytes, usually 0x00000008 or 8 decimal:\n\
        dirOffset = dataView.getUint32(tiffOffset + 4, littleEndian);\n\
        // Create the exif object to store the tags:\n\
        data.exif = new loadImage.ExifMap();\n\
        // Parse the tags of the main image directory and retrieve the\n\
        // offset to the next directory, usually the thumbnail directory:\n\
        dirOffset = loadImage.parseExifTags(\n\
            dataView,\n\
            tiffOffset,\n\
            tiffOffset + dirOffset,\n\
            littleEndian,\n\
            data\n\
        );\n\
        if (dirOffset && !options.disableExifThumbnail) {\n\
            thumbnailData = {exif: {}};\n\
            dirOffset = loadImage.parseExifTags(\n\
                dataView,\n\
                tiffOffset,\n\
                tiffOffset + dirOffset,\n\
                littleEndian,\n\
                thumbnailData\n\
            );\n\
            // Check for JPEG Thumbnail offset:\n\
            if (thumbnailData.exif[0x0201]) {\n\
                data.exif.Thumbnail = loadImage.getExifThumbnail(\n\
                    dataView,\n\
                    tiffOffset + thumbnailData.exif[0x0201],\n\
                    thumbnailData.exif[0x0202] // Thumbnail data length\n\
                );\n\
            }\n\
        }\n\
        // Check for Exif Sub IFD Pointer:\n\
        if (data.exif[0x8769] && !options.disableExifSub) {\n\
            loadImage.parseExifTags(\n\
                dataView,\n\
                tiffOffset,\n\
                tiffOffset + data.exif[0x8769], // directory offset\n\
                littleEndian,\n\
                data\n\
            );\n\
        }\n\
        // Check for GPS Info IFD Pointer:\n\
        if (data.exif[0x8825] && !options.disableExifGps) {\n\
            loadImage.parseExifTags(\n\
                dataView,\n\
                tiffOffset,\n\
                tiffOffset + data.exif[0x8825], // directory offset\n\
                littleEndian,\n\
                data\n\
            );\n\
        }\n\
    };\n\
\n\
    // Registers the Exif parser for the APP1 JPEG meta data segment:\n\
    loadImage.metaDataParsers.jpeg[0xffe1].push(loadImage.parseExifData);\n\
\n\
    // Adds the following properties to the parseMetaData callback data:\n\
    // * exif: The exif tags, parsed by the parseExifData method\n\
\n\
    // Adds the following options to the parseMetaData method:\n\
    // * disableExif: Disables Exif parsing.\n\
    // * disableExifThumbnail: Disables parsing of the Exif Thumbnail.\n\
    // * disableExifSub: Disables parsing of the Exif Sub IFD.\n\
    // * disableExifGps: Disables parsing of the Exif GPS Info IFD.\n\
\n\
}));\n\
//@ sourceURL=pgherveou-JavaScript-Load-Image/js/load-image-exif.js"
));
require.register("pgherveou-JavaScript-Load-Image/js/load-image-exif-map.js", Function("exports, require, module",
"/*\n\
 * JavaScript Load Image Exif Map 1.0.1\n\
 * https://github.com/blueimp/JavaScript-Load-Image\n\
 *\n\
 * Copyright 2013, Sebastian Tschan\n\
 * https://blueimp.net\n\
 *\n\
 * Exif tags mapping based on\n\
 * https://github.com/jseidelin/exif-js\n\
 *\n\
 * Licensed under the MIT license:\n\
 * http://www.opensource.org/licenses/MIT\n\
 */\n\
\n\
/*global define, window */\n\
\n\
(function (factory) {\n\
    'use strict';\n\
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {\n\
        var loadImage = require('./load-image');\n\
        require('./load-image-exif');\n\
        module.exports = factory(loadImage);\n\
    }\n\
    else if (typeof define === 'function' && define.amd) {\n\
        // Register as an anonymous AMD module:\n\
        define(['load-image', 'load-image-exif'], factory);\n\
    } else {\n\
        // Browser globals:\n\
        factory(window.loadImage);\n\
    }\n\
}(function (loadImage) {\n\
    'use strict';\n\
\n\
    var tags,\n\
        map,\n\
        prop;\n\
\n\
    loadImage.ExifMap.prototype.tags = {\n\
        // =================\n\
        // TIFF tags (IFD0):\n\
        // =================\n\
        0x0100: 'ImageWidth',\n\
        0x0101: 'ImageHeight',\n\
        0x8769: 'ExifIFDPointer',\n\
        0x8825: 'GPSInfoIFDPointer',\n\
        0xA005: 'InteroperabilityIFDPointer',\n\
        0x0102: 'BitsPerSample',\n\
        0x0103: 'Compression',\n\
        0x0106: 'PhotometricInterpretation',\n\
        0x0112: 'Orientation',\n\
        0x0115: 'SamplesPerPixel',\n\
        0x011C: 'PlanarConfiguration',\n\
        0x0212: 'YCbCrSubSampling',\n\
        0x0213: 'YCbCrPositioning',\n\
        0x011A: 'XResolution',\n\
        0x011B: 'YResolution',\n\
        0x0128: 'ResolutionUnit',\n\
        0x0111: 'StripOffsets',\n\
        0x0116: 'RowsPerStrip',\n\
        0x0117: 'StripByteCounts',\n\
        0x0201: 'JPEGInterchangeFormat',\n\
        0x0202: 'JPEGInterchangeFormatLength',\n\
        0x012D: 'TransferFunction',\n\
        0x013E: 'WhitePoint',\n\
        0x013F: 'PrimaryChromaticities',\n\
        0x0211: 'YCbCrCoefficients',\n\
        0x0214: 'ReferenceBlackWhite',\n\
        0x0132: 'DateTime',\n\
        0x010E: 'ImageDescription',\n\
        0x010F: 'Make',\n\
        0x0110: 'Model',\n\
        0x0131: 'Software',\n\
        0x013B: 'Artist',\n\
        0x8298: 'Copyright',\n\
        // ==================\n\
        // Exif Sub IFD tags:\n\
        // ==================\n\
        0x9000: 'ExifVersion',                  // EXIF version\n\
        0xA000: 'FlashpixVersion',              // Flashpix format version\n\
        0xA001: 'ColorSpace',                   // Color space information tag\n\
        0xA002: 'PixelXDimension',              // Valid width of meaningful image\n\
        0xA003: 'PixelYDimension',              // Valid height of meaningful image\n\
        0xA500: 'Gamma',\n\
        0x9101: 'ComponentsConfiguration',      // Information about channels\n\
        0x9102: 'CompressedBitsPerPixel',       // Compressed bits per pixel\n\
        0x927C: 'MakerNote',                    // Any desired information written by the manufacturer\n\
        0x9286: 'UserComment',                  // Comments by user\n\
        0xA004: 'RelatedSoundFile',             // Name of related sound file\n\
        0x9003: 'DateTimeOriginal',             // Date and time when the original image was generated\n\
        0x9004: 'DateTimeDigitized',            // Date and time when the image was stored digitally\n\
        0x9290: 'SubSecTime',                   // Fractions of seconds for DateTime\n\
        0x9291: 'SubSecTimeOriginal',           // Fractions of seconds for DateTimeOriginal\n\
        0x9292: 'SubSecTimeDigitized',          // Fractions of seconds for DateTimeDigitized\n\
        0x829A: 'ExposureTime',                 // Exposure time (in seconds)\n\
        0x829D: 'FNumber',\n\
        0x8822: 'ExposureProgram',              // Exposure program\n\
        0x8824: 'SpectralSensitivity',          // Spectral sensitivity\n\
        0x8827: 'PhotographicSensitivity',      // EXIF 2.3, ISOSpeedRatings in EXIF 2.2\n\
        0x8828: 'OECF',                         // Optoelectric conversion factor\n\
        0x8830: 'SensitivityType',\n\
        0x8831: 'StandardOutputSensitivity',\n\
        0x8832: 'RecommendedExposureIndex',\n\
        0x8833: 'ISOSpeed',\n\
        0x8834: 'ISOSpeedLatitudeyyy',\n\
        0x8835: 'ISOSpeedLatitudezzz',\n\
        0x9201: 'ShutterSpeedValue',            // Shutter speed\n\
        0x9202: 'ApertureValue',                // Lens aperture\n\
        0x9203: 'BrightnessValue',              // Value of brightness\n\
        0x9204: 'ExposureBias',                 // Exposure bias\n\
        0x9205: 'MaxApertureValue',             // Smallest F number of lens\n\
        0x9206: 'SubjectDistance',              // Distance to subject in meters\n\
        0x9207: 'MeteringMode',                 // Metering mode\n\
        0x9208: 'LightSource',                  // Kind of light source\n\
        0x9209: 'Flash',                        // Flash status\n\
        0x9214: 'SubjectArea',                  // Location and area of main subject\n\
        0x920A: 'FocalLength',                  // Focal length of the lens in mm\n\
        0xA20B: 'FlashEnergy',                  // Strobe energy in BCPS\n\
        0xA20C: 'SpatialFrequencyResponse',\n\
        0xA20E: 'FocalPlaneXResolution',        // Number of pixels in width direction per FPRUnit\n\
        0xA20F: 'FocalPlaneYResolution',        // Number of pixels in height direction per FPRUnit\n\
        0xA210: 'FocalPlaneResolutionUnit',     // Unit for measuring the focal plane resolution\n\
        0xA214: 'SubjectLocation',              // Location of subject in image\n\
        0xA215: 'ExposureIndex',                // Exposure index selected on camera\n\
        0xA217: 'SensingMethod',                // Image sensor type\n\
        0xA300: 'FileSource',                   // Image source (3 == DSC)\n\
        0xA301: 'SceneType',                    // Scene type (1 == directly photographed)\n\
        0xA302: 'CFAPattern',                   // Color filter array geometric pattern\n\
        0xA401: 'CustomRendered',               // Special processing\n\
        0xA402: 'ExposureMode',                 // Exposure mode\n\
        0xA403: 'WhiteBalance',                 // 1 = auto white balance, 2 = manual\n\
        0xA404: 'DigitalZoomRatio',             // Digital zoom ratio\n\
        0xA405: 'FocalLengthIn35mmFilm',\n\
        0xA406: 'SceneCaptureType',             // Type of scene\n\
        0xA407: 'GainControl',                  // Degree of overall image gain adjustment\n\
        0xA408: 'Contrast',                     // Direction of contrast processing applied by camera\n\
        0xA409: 'Saturation',                   // Direction of saturation processing applied by camera\n\
        0xA40A: 'Sharpness',                    // Direction of sharpness processing applied by camera\n\
        0xA40B: 'DeviceSettingDescription',\n\
        0xA40C: 'SubjectDistanceRange',         // Distance to subject\n\
        0xA420: 'ImageUniqueID',                // Identifier assigned uniquely to each image\n\
        0xA430: 'CameraOwnerName',\n\
        0xA431: 'BodySerialNumber',\n\
        0xA432: 'LensSpecification',\n\
        0xA433: 'LensMake',\n\
        0xA434: 'LensModel',\n\
        0xA435: 'LensSerialNumber',\n\
        // ==============\n\
        // GPS Info tags:\n\
        // ==============\n\
        0x0000: 'GPSVersionID',\n\
        0x0001: 'GPSLatitudeRef',\n\
        0x0002: 'GPSLatitude',\n\
        0x0003: 'GPSLongitudeRef',\n\
        0x0004: 'GPSLongitude',\n\
        0x0005: 'GPSAltitudeRef',\n\
        0x0006: 'GPSAltitude',\n\
        0x0007: 'GPSTimeStamp',\n\
        0x0008: 'GPSSatellites',\n\
        0x0009: 'GPSStatus',\n\
        0x000A: 'GPSMeasureMode',\n\
        0x000B: 'GPSDOP',\n\
        0x000C: 'GPSSpeedRef',\n\
        0x000D: 'GPSSpeed',\n\
        0x000E: 'GPSTrackRef',\n\
        0x000F: 'GPSTrack',\n\
        0x0010: 'GPSImgDirectionRef',\n\
        0x0011: 'GPSImgDirection',\n\
        0x0012: 'GPSMapDatum',\n\
        0x0013: 'GPSDestLatitudeRef',\n\
        0x0014: 'GPSDestLatitude',\n\
        0x0015: 'GPSDestLongitudeRef',\n\
        0x0016: 'GPSDestLongitude',\n\
        0x0017: 'GPSDestBearingRef',\n\
        0x0018: 'GPSDestBearing',\n\
        0x0019: 'GPSDestDistanceRef',\n\
        0x001A: 'GPSDestDistance',\n\
        0x001B: 'GPSProcessingMethod',\n\
        0x001C: 'GPSAreaInformation',\n\
        0x001D: 'GPSDateStamp',\n\
        0x001E: 'GPSDifferential',\n\
        0x001F: 'GPSHPositioningError'\n\
    };\n\
\n\
    loadImage.ExifMap.prototype.stringValues = {\n\
        ExposureProgram: {\n\
            0: 'Undefined',\n\
            1: 'Manual',\n\
            2: 'Normal program',\n\
            3: 'Aperture priority',\n\
            4: 'Shutter priority',\n\
            5: 'Creative program',\n\
            6: 'Action program',\n\
            7: 'Portrait mode',\n\
            8: 'Landscape mode'\n\
        },\n\
        MeteringMode: {\n\
            0: 'Unknown',\n\
            1: 'Average',\n\
            2: 'CenterWeightedAverage',\n\
            3: 'Spot',\n\
            4: 'MultiSpot',\n\
            5: 'Pattern',\n\
            6: 'Partial',\n\
            255: 'Other'\n\
        },\n\
        LightSource: {\n\
            0: 'Unknown',\n\
            1: 'Daylight',\n\
            2: 'Fluorescent',\n\
            3: 'Tungsten (incandescent light)',\n\
            4: 'Flash',\n\
            9: 'Fine weather',\n\
            10: 'Cloudy weather',\n\
            11: 'Shade',\n\
            12: 'Daylight fluorescent (D 5700 - 7100K)',\n\
            13: 'Day white fluorescent (N 4600 - 5400K)',\n\
            14: 'Cool white fluorescent (W 3900 - 4500K)',\n\
            15: 'White fluorescent (WW 3200 - 3700K)',\n\
            17: 'Standard light A',\n\
            18: 'Standard light B',\n\
            19: 'Standard light C',\n\
            20: 'D55',\n\
            21: 'D65',\n\
            22: 'D75',\n\
            23: 'D50',\n\
            24: 'ISO studio tungsten',\n\
            255: 'Other'\n\
        },\n\
        Flash: {\n\
            0x0000: 'Flash did not fire',\n\
            0x0001: 'Flash fired',\n\
            0x0005: 'Strobe return light not detected',\n\
            0x0007: 'Strobe return light detected',\n\
            0x0009: 'Flash fired, compulsory flash mode',\n\
            0x000D: 'Flash fired, compulsory flash mode, return light not detected',\n\
            0x000F: 'Flash fired, compulsory flash mode, return light detected',\n\
            0x0010: 'Flash did not fire, compulsory flash mode',\n\
            0x0018: 'Flash did not fire, auto mode',\n\
            0x0019: 'Flash fired, auto mode',\n\
            0x001D: 'Flash fired, auto mode, return light not detected',\n\
            0x001F: 'Flash fired, auto mode, return light detected',\n\
            0x0020: 'No flash function',\n\
            0x0041: 'Flash fired, red-eye reduction mode',\n\
            0x0045: 'Flash fired, red-eye reduction mode, return light not detected',\n\
            0x0047: 'Flash fired, red-eye reduction mode, return light detected',\n\
            0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',\n\
            0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',\n\
            0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',\n\
            0x0059: 'Flash fired, auto mode, red-eye reduction mode',\n\
            0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',\n\
            0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'\n\
        },\n\
        SensingMethod: {\n\
            1: 'Undefined',\n\
            2: 'One-chip color area sensor',\n\
            3: 'Two-chip color area sensor',\n\
            4: 'Three-chip color area sensor',\n\
            5: 'Color sequential area sensor',\n\
            7: 'Trilinear sensor',\n\
            8: 'Color sequential linear sensor'\n\
        },\n\
        SceneCaptureType: {\n\
            0: 'Standard',\n\
            1: 'Landscape',\n\
            2: 'Portrait',\n\
            3: 'Night scene'\n\
        },\n\
        SceneType: {\n\
            1: 'Directly photographed'\n\
        },\n\
        CustomRendered: {\n\
            0: 'Normal process',\n\
            1: 'Custom process'\n\
        },\n\
        WhiteBalance: {\n\
            0: 'Auto white balance',\n\
            1: 'Manual white balance'\n\
        },\n\
        GainControl: {\n\
            0: 'None',\n\
            1: 'Low gain up',\n\
            2: 'High gain up',\n\
            3: 'Low gain down',\n\
            4: 'High gain down'\n\
        },\n\
        Contrast: {\n\
            0: 'Normal',\n\
            1: 'Soft',\n\
            2: 'Hard'\n\
        },\n\
        Saturation: {\n\
            0: 'Normal',\n\
            1: 'Low saturation',\n\
            2: 'High saturation'\n\
        },\n\
        Sharpness: {\n\
            0: 'Normal',\n\
            1: 'Soft',\n\
            2: 'Hard'\n\
        },\n\
        SubjectDistanceRange: {\n\
            0: 'Unknown',\n\
            1: 'Macro',\n\
            2: 'Close view',\n\
            3: 'Distant view'\n\
        },\n\
        FileSource: {\n\
            3: 'DSC'\n\
        },\n\
        ComponentsConfiguration: {\n\
            0: '',\n\
            1: 'Y',\n\
            2: 'Cb',\n\
            3: 'Cr',\n\
            4: 'R',\n\
            5: 'G',\n\
            6: 'B'\n\
        },\n\
        Orientation: {\n\
            1: 'top-left',\n\
            2: 'top-right',\n\
            3: 'bottom-right',\n\
            4: 'bottom-left',\n\
            5: 'left-top',\n\
            6: 'right-top',\n\
            7: 'right-bottom',\n\
            8: 'left-bottom'\n\
        }\n\
    };\n\
\n\
    loadImage.ExifMap.prototype.getText = function (id) {\n\
        var value = this.get(id);\n\
        switch (id) {\n\
        case 'LightSource':\n\
        case 'Flash':\n\
        case 'MeteringMode':\n\
        case 'ExposureProgram':\n\
        case 'SensingMethod':\n\
        case 'SceneCaptureType':\n\
        case 'SceneType':\n\
        case 'CustomRendered':\n\
        case 'WhiteBalance':\n\
        case 'GainControl':\n\
        case 'Contrast':\n\
        case 'Saturation':\n\
        case 'Sharpness':\n\
        case 'SubjectDistanceRange':\n\
        case 'FileSource':\n\
        case 'Orientation':\n\
            return this.stringValues[id][value];\n\
        case 'ExifVersion':\n\
        case 'FlashpixVersion':\n\
            return String.fromCharCode(value[0], value[1], value[2], value[3]);\n\
        case 'ComponentsConfiguration':\n\
            return this.stringValues[id][value[0]]\n\
                + this.stringValues[id][value[1]]\n\
                + this.stringValues[id][value[2]]\n\
                + this.stringValues[id][value[3]];\n\
        case 'GPSVersionID':\n\
            return value[0] + '.' + value[1]  + '.' + value[2]  + '.' + value[3];\n\
        }\n\
        return String(value);\n\
    };\n\
\n\
    tags = loadImage.ExifMap.prototype.tags;\n\
    map = loadImage.ExifMap.prototype.map;\n\
\n\
    // Map the tag names to tags:\n\
    for (prop in tags) {\n\
        if (tags.hasOwnProperty(prop)) {\n\
            map[tags[prop]] = prop;\n\
        }\n\
    }\n\
\n\
    loadImage.ExifMap.prototype.getAll = function () {\n\
        var map = {},\n\
            prop,\n\
            id;\n\
        for (prop in this) {\n\
            if (this.hasOwnProperty(prop)) {\n\
                id = tags[prop];\n\
                if (id) {\n\
                    map[id] = this.getText(id);\n\
                }\n\
            }\n\
        }\n\
        return map;\n\
    };\n\
\n\
}));\n\
//@ sourceURL=pgherveou-JavaScript-Load-Image/js/load-image-exif-map.js"
));
require.register("component-transitionend-property/index.js", Function("exports, require, module",
"/**\n\
 * Transition-end mapping\n\
 */\n\
\n\
var map = {\n\
  'WebkitTransition' : 'webkitTransitionEnd',\n\
  'MozTransition' : 'transitionend',\n\
  'OTransition' : 'oTransitionEnd',\n\
  'msTransition' : 'MSTransitionEnd',\n\
  'transition' : 'transitionend'\n\
};\n\
\n\
/**\n\
 * Expose `transitionend`\n\
 */\n\
\n\
var el = document.createElement('p');\n\
\n\
for (var transition in map) {\n\
  if (null != el.style[transition]) {\n\
    module.exports = map[transition];\n\
    break;\n\
  }\n\
}\n\
//@ sourceURL=component-transitionend-property/index.js"
));
require.register("touchscaler/index.js", Function("exports, require, module",
"/*!\n\
 * module deps\n\
 */\n\
\n\
var ev = require('event'),\n\
    events = require('events'),\n\
    query = require('query'),\n\
    has3d = require('has-translate3d'),\n\
    transitionend = require('transitionend-property'),\n\
    prefix = require('prefix'),\n\
    loadImage = require('load-image');\n\
\n\
/*!\n\
 * module globals\n\
 */\n\
\n\
var transform = prefix('transform'),\n\
    transition = prefix('transition'),\n\
    defaults;\n\
\n\
defaults = {\n\
  easing: 'ease',\n\
  transitionSpeed: 0.3,\n\
  rotation: false,\n\
  maxScale: 3,\n\
  quality: 2\n\
};\n\
\n\
\n\
/**\n\
 * get translate or translate3d str\n\
 *\n\
 * @param  {Number} x\n\
 * @param  {Number} y\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function translate(x, y) {\n\
  if (has3d) return 'translate3d(' + x + 'px, ' + y + 'px, 0)';\n\
  return 'translate(' + x + 'px, ' + y + 'px)';\n\
}\n\
\n\
/**\n\
 * get rotate str\n\
 *\n\
 * @param  {Number} x\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function rotate(x) {\n\
  return 'rotate(' + x + 'deg)';\n\
}\n\
\n\
/**\n\
 * get scale or scale3d str\n\
 *\n\
 * @param  {Number} x\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function scale(x) {\n\
  if (has3d) return 'scale3d(' + x + ', ' + x + ', 1)';\n\
  return 'scale(' + x + ')';\n\
}\n\
\n\
/**\n\
 * get event page X\n\
 *\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
function pageX(e) {\n\
  if (e.pageX) return e.pageX;\n\
  return e.touches[0].pageX;\n\
}\n\
\n\
/**\n\
 * get event page Y\n\
 *\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
function pageY(e) {\n\
  if (e.pageY) return e.pageY;\n\
  return e.touches[0].pageY;\n\
}\n\
\n\
/**\n\
 * cancel\n\
 * @param {Event} e\n\
 * @api private\n\
 */\n\
\n\
function cancel(e) {\n\
  e.preventDefault();\n\
}\n\
\n\
/**\n\
 * Scaler constructor\n\
 *\n\
 * @param {Element} el\n\
 * @param {[Object]} opts\n\
 * @api public\n\
 */\n\
\n\
function Scaler(el, opts) {\n\
  this.el = el;\n\
\n\
  // init options\n\
  if (!opts) {\n\
    this.opts = defaults;\n\
  } else {\n\
    for (var opt in defaults) {\n\
      if (!this.opts.hasOwnProperty(opt)) this.opts[opt] = defaults[opt];\n\
    }\n\
  }\n\
\n\
  // box bounds refs\n\
  this.bounds = query('.scaler-box', el).getBoundingClientRect();\n\
\n\
  // bind events\n\
  ev.bind(this.el, 'touchmove', cancel);\n\
\n\
  this.events = events(el, this);\n\
  this.events.bind('touchstart', 'touchstart');\n\
  this.events.bind('touchmove', 'touchmove');\n\
  this.events.bind('touchend', 'touchend');\n\
  this.events.bind('touchcancel', 'touchend');\n\
\n\
  this.events.bind('gesturestart', 'gesturestart');\n\
  this.events.bind('gesturechange', 'gesturechange');\n\
  this.events.bind('gestureend', 'gestureend');\n\
  this.events.bind('gesturecancel', 'gestureend');\n\
\n\
  this.events.bind('change input[type=\"file\"]', 'loadFile');\n\
}\n\
\n\
/**\n\
 * remove all events\n\
 */\n\
\n\
Scaler.prototype.destroy = function () {\n\
  ev.unbind(this.el, 'touchmove', cancel);\n\
  this.events.unbind();\n\
};\n\
\n\
/**\n\
 * create output data\n\
 *\n\
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage\n\
 * @api public\n\
 */\n\
\n\
Scaler.prototype.data = function() {\n\
  if (!this.canvas) return;\n\
  var canvas, box, ctx, dh, dw, dx, dy, sh, sw, sx, sy;\n\
\n\
  box = this.canvas.getBoundingClientRect();\n\
\n\
  // create canvas\n\
  canvas = document.createElement('canvas');\n\
  canvas.width = this.bounds.width;\n\
  canvas.height = this.bounds.height;\n\
\n\
  // draw image on canvas\n\
  ctx = canvas.getContext('2d');\n\
  dx = dy = 0;\n\
  dw = canvas.width;\n\
  dh = canvas.height;\n\
  sw = this.opts.quality * canvas.width / this.state.scale;\n\
  sh = this.opts.quality * canvas.height / this.state.scale;\n\
\n\
  sx = this.opts.quality * (this.bounds.left - box.left) / this.state.scale;\n\
  sy = this.opts.quality * (this.bounds.top - box.top) / this.state.scale;\n\
  ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);\n\
\n\
  return {\n\
    transform: this.state,\n\
    filename: this.filename,\n\
    dataURL: canvas.toDataURL()\n\
  };\n\
};\n\
\n\
/**\n\
 * load file\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.loadFile = function(e) {\n\
  var file = e.target.files[0];\n\
  if (!file) return;\n\
  this.loadImage(file);\n\
};\n\
\n\
/**\n\
 * load File, Blob object or a simple image URL\n\
 *\n\
 * @param {File|Blob|String} url\n\
 * @api public\n\
 */\n\
\n\
Scaler.prototype.loadImage = function (url) {\n\
  var _this = this,\n\
      width = this.el.offsetWidth,\n\
      height = this.el.offsetHeight,\n\
      opts;\n\
\n\
  if (url.name) {\n\
    this.filename = url.name;\n\
  } else if ('string' === typeof url) {\n\
    this.filename = url;\n\
  }\n\
\n\
  // reset styles\n\
  this.touch = {};\n\
  this.touch.scale = 1;\n\
  this.touch.translateX = 0;\n\
  this.touch.translateY = 0;\n\
  this.touch.rotate = 0;\n\
\n\
  // init previous and current data\n\
  ['prev', 'state'].forEach(function (str) {\n\
    this[str] = {};\n\
    this[str].scale = this.touch.scale;\n\
    this[str].rotate = this.touch.rotate;\n\
    this[str].translateX = this.touch.translateX;\n\
    this[str].translateY = this.touch.translateY;\n\
  }, this);\n\
\n\
  // load image opts\n\
  opts = {\n\
    maxWidth: this.opts.quality * width,\n\
    maxHeight: this.opts.quality * height,\n\
    orientation: true,\n\
    cover: true,\n\
    canvas: true,\n\
    crossOrigin: true\n\
  };\n\
\n\
  loadImage(url, function (canvas) {\n\
    if (canvas.type === 'error') return;\n\
    if (_this.canvas) _this.el.removeChild(_this.canvas);\n\
\n\
    // set canvas initial styles\n\
    var canvasWidth = canvas.width / _this.opts.quality,\n\
        canvasHeight = canvas.height / _this.opts.quality;\n\
\n\
    canvas.style.width = canvasWidth + 'px';\n\
    canvas.style.height = canvasHeight + 'px';\n\
    canvas.style.marginLeft = ((width - canvasWidth) / 2) + 'px';\n\
    canvas.style.marginTop = ((height - canvasHeight) / 2) + 'px';\n\
\n\
    // replace existing canvas\n\
    _this.el.insertBefore(canvas, _this.el.firstChild);\n\
    _this.canvas = canvas;\n\
    _this.updateStyle();\n\
\n\
  }, opts);\n\
};\n\
\n\
/**\n\
 * check if current transform is in bound\n\
 *\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.acceptTransform = function() {\n\
  if (this.state.scale > this.opts.maxScale) return false;\n\
\n\
  var box = this.canvas.getBoundingClientRect(),\n\
      bounds = this.bounds;\n\
\n\
  return box.top <= bounds.top\n\
      && box.left <= bounds.left\n\
      && box.right >= bounds.right\n\
      && box.bottom >= bounds.bottom;\n\
};\n\
\n\
/**\n\
 * store values on touchstart\n\
 *\n\
 * @param  {Event} e\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.touchstart = function(e) {\n\
  this.touch.touchmove = this.touch.touchstart = e;\n\
};\n\
\n\
/**\n\
 * transform canvas on touchmove\n\
 *\n\
 * @param  {Event} e\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.touchmove = function(e) {\n\
  if ( Math.abs(pageX(e) - pageX(this.touch.touchmove)) > 30\n\
    || Math.abs(pageY(e) - pageY(this.touch.touchmove)) > 30) return;\n\
\n\
  this.touch.touchmove = e;\n\
  this.state.translateX = this.touch.translateX + pageX(e)\n\
                      - pageX(this.touch.touchstart);\n\
\n\
  this.state.translateY = this.touch.translateY + pageY(e)\n\
                      - pageY(this.touch.touchstart);\n\
\n\
  // update styles with current values\n\
  this.updateStyle();\n\
\n\
  if (this.acceptTransform()) {\n\
\n\
    // update previous values with current\n\
    this.prev.translateX = this.state.translateX;\n\
    this.prev.translateY = this.state.translateY;\n\
  }\n\
};\n\
\n\
/**\n\
 * restore invalid translate values on touchend\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.touchend = function() {\n\
  var _this = this;\n\
\n\
  function removeStyle() {\n\
    _this.canvas.style[transition] = '';\n\
    ev.unbind(_this.canvas, transitionend, removeStyle);\n\
  }\n\
\n\
  // restore previous values\n\
  if (this.acceptTransform()) {\n\
    this.touch.translateX = this.state.translateX;\n\
    this.touch.translateY = this.state.translateY;\n\
  } else {\n\
    this.state.translateX = this.touch.translateX = this.prev.translateX;\n\
    this.state.translateY = this.touch.translateY = this.prev.translateY;\n\
    ev.bind(this.canvas, transitionend, removeStyle);\n\
    this.canvas.style[transition] = 'all '\n\
                              + this.opts.transitionSpeed + 's '\n\
                              + this.opts.easing;\n\
\n\
    this.updateStyle();\n\
  }\n\
};\n\
\n\
/**\n\
 * save gesture values on gesturestart\n\
 *\n\
 * @param  {Event} e\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.gesturestart = function(e) {\n\
  this.touch.gesturestart = e;\n\
};\n\
\n\
/**\n\
 * transform on gesturechange\n\
 *\n\
 * @param  {Event} e\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.gesturechange = function(e) {\n\
  this.state.scale = this.touch.scale\n\
                 + this.touch.scale * (e.scale - this.touch.gesturestart.scale);\n\
\n\
  if (this.opts.rotate) {\n\
    this.state.rotate = this.touch.rotate + e.rotation\n\
                    - this.touch.gesturestart.rotation;\n\
  }\n\
\n\
  this.updateStyle();\n\
\n\
  if (this.acceptTransform()) {\n\
    this.prev.scale = this.state.scale;\n\
    this.prev.rotate = this.state.rotate;\n\
  }\n\
};\n\
\n\
/**\n\
 * restore invalid values on gesturend\n\
 *\n\
 * @param  {Event} e\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.gestureend = function() {\n\
  var _this = this;\n\
\n\
  function removeStyle() {\n\
    _this.canvas.style[transition] = '';\n\
    ev.unbind(_this.canvas, transitionend, removeStyle);\n\
  }\n\
\n\
  // restore previous values\n\
  if (this.acceptTransform()) {\n\
    this.touch.scale  = this.state.scale;\n\
    this.touch.rotate = this.state.rotate;\n\
  } else {\n\
    this.state.scale = this.touch.scale = this.prev.scale;\n\
    this.state.rotate = this.touch.rotate = this.prev.rotate;\n\
\n\
    ev.bind(this.canvas, transitionend, removeStyle);\n\
    this.canvas.style[transition] = 'all '\n\
                                  + this.opts.transitionSpeed + 's '\n\
                                  + this.opts.easing;\n\
    this.updateStyle();\n\
  }\n\
};\n\
\n\
/**\n\
 * apply css transforms\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.updateStyle = function() {\n\
  this.canvas.style[transform] = [\n\
    translate(this.state.translateX,  this.state.translateY),\n\
    scale(this.state.scale),\n\
    rotate(this.state.rotate)\n\
  ].join(' ');\n\
};\n\
\n\
/**\n\
 * set state and update style\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Scaler.prototype.setState = function(state) {\n\
  this.state = state;\n\
  this.updateStyle();\n\
};\n\
\n\
/*!\n\
 * module exports\n\
 */\n\
\n\
module.exports = Scaler;//@ sourceURL=touchscaler/index.js"
));














require.alias("component-event/index.js", "touchscaler/deps/event/index.js");
require.alias("component-event/index.js", "event/index.js");

require.alias("component-events/index.js", "touchscaler/deps/events/index.js");
require.alias("component-events/index.js", "events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("discore-closest/index.js", "component-delegate/deps/closest/index.js");
require.alias("component-matches-selector/index.js", "discore-closest/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("discore-closest/index.js", "discore-closest/index.js");
require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("pgherveou-prefix/index.js", "touchscaler/deps/prefix/index.js");
require.alias("pgherveou-prefix/index.js", "touchscaler/deps/prefix/index.js");
require.alias("pgherveou-prefix/index.js", "prefix/index.js");
require.alias("pgherveou-prefix/index.js", "pgherveou-prefix/index.js");
require.alias("component-query/index.js", "touchscaler/deps/query/index.js");
require.alias("component-query/index.js", "query/index.js");

require.alias("component-has-translate3d/index.js", "touchscaler/deps/has-translate3d/index.js");
require.alias("component-has-translate3d/index.js", "has-translate3d/index.js");
require.alias("component-transform-property/index.js", "component-has-translate3d/deps/transform-property/index.js");

require.alias("pgherveou-JavaScript-Load-Image/js/index.js", "touchscaler/deps/load-image/js/index.js");
require.alias("pgherveou-JavaScript-Load-Image/js/load-image.js", "touchscaler/deps/load-image/js/load-image.js");
require.alias("pgherveou-JavaScript-Load-Image/js/load-image-ios.js", "touchscaler/deps/load-image/js/load-image-ios.js");
require.alias("pgherveou-JavaScript-Load-Image/js/load-image-orientation.js", "touchscaler/deps/load-image/js/load-image-orientation.js");
require.alias("pgherveou-JavaScript-Load-Image/js/load-image-meta.js", "touchscaler/deps/load-image/js/load-image-meta.js");
require.alias("pgherveou-JavaScript-Load-Image/js/load-image-exif.js", "touchscaler/deps/load-image/js/load-image-exif.js");
require.alias("pgherveou-JavaScript-Load-Image/js/load-image-exif-map.js", "touchscaler/deps/load-image/js/load-image-exif-map.js");
require.alias("pgherveou-JavaScript-Load-Image/js/index.js", "touchscaler/deps/load-image/index.js");
require.alias("pgherveou-JavaScript-Load-Image/js/index.js", "load-image/index.js");
require.alias("pgherveou-JavaScript-Load-Image/js/index.js", "pgherveou-JavaScript-Load-Image/index.js");
require.alias("component-transitionend-property/index.js", "touchscaler/deps/transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "touchscaler/deps/transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "component-transitionend-property/index.js");
require.alias("touchscaler/index.js", "touchscaler/index.js");