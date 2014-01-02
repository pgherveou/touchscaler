;(function(){

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
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matches
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("discore-closest/index.js", function(exports, require, module){
var matches = require('matches-selector')

module.exports = function (element, selector, checkYoSelf, root) {
  element = checkYoSelf ? element : element.parentNode
  root = root || document

  do {
    if (matches(element, selector))
      return element
    // After `matches` on the edge case that
    // the selector matches the root
    // (when the root is not the document)
    if (element === root)
      return
    // Make sure `element !== document`
    // otherwise we get an illegal invocation
  } while ((element = element.parentNode) && element !== document)
}
});
require.register("component-delegate/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var closest = require('closest')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    var target = e.target || e.srcElement;
    e.delegateTarget = closest(target, selector, true, el);
    if (e.delegateTarget) fn.call(el, e);
  }, capture);
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("pgherveou-prefix/index.js", function(exports, require, module){
// module globals

var prefixes = ['webkit','Moz','ms','O']
  , len = prefixes.length
  , p = document.createElement('p')
  , style = p.style
  , capitalize = function (str) {return str.charAt(0).toUpperCase() + str.slice(1);}
  , dasherize = function(str) {
      return str.replace(/([A-Z])/g, function(str,m1) {
        return '-' + m1.toLowerCase();
      });
    };

// nullify p to release dom node
p = null;

/**
 * get prefix for dom style
 *
 * example
 *   prefix('transform') // webkitTransform
 *   prefix('transform', true) // -webkit-transform
 *
 * @param  {String}   ppty dom style
 * @param  {Boolean}  dasherize
 * @return {String}   prefixed ppty
 * @api public
 */

module.exports = function(ppty, dasherized) {
  var Ppty, name, Name;

  // test without prefix
  if (style[ppty] !== undefined) {
    if (!dasherized) return ppty;
    return dasherize(ppty);
  }

  // test with prefix
  Ppty = capitalize(ppty);
  for (i = 0; i < len; i++) {
    name = prefixes[i] + Ppty;
    if (style[name] !== undefined) {
      if (!dasherized) return name;
      return '-' + prefixes[i].toLowerCase() + '-' + dasherize(ppty);
    }
  }

  // not found return empty string
  return '';
};

});
require.register("component-query/index.js", function(exports, require, module){
function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
  return exports;
};

});
require.register("component-transform-property/index.js", function(exports, require, module){

var styles = [
  'webkitTransform',
  'MozTransform',
  'msTransform',
  'OTransform',
  'transform'
];

var el = document.createElement('p');
var style;

for (var i = 0; i < styles.length; i++) {
  style = styles[i];
  if (null != el.style[style]) {
    module.exports = style;
    break;
  }
}

});
require.register("component-has-translate3d/index.js", function(exports, require, module){

var prop = require('transform-property');
// IE8<= doesn't have `getComputedStyle`
if (!prop || !window.getComputedStyle) return module.exports = false;

var map = {
  webkitTransform: '-webkit-transform',
  OTransform: '-o-transform',
  msTransform: '-ms-transform',
  MozTransform: '-moz-transform',
  transform: 'transform'
};

// from: https://gist.github.com/lorenzopolidori/3794226
var el = document.createElement('div');
el.style[prop] = 'translate3d(1px,1px,1px)';
document.body.insertBefore(el, null);
var val = getComputedStyle(el).getPropertyValue(map[prop]);
document.body.removeChild(el);
module.exports = null != val && val.length && 'none' != val;

});
require.register("pgherveou-load-image/js/index.js", function(exports, require, module){
module.exports = require("./load-image.js");

require('./load-image-ios.js');
require('./load-image-orientation.js');
require('./load-image-meta.js');
require('./load-image-exif.js');
require('./load-image-exif-map.js');
});
require.register("pgherveou-load-image/js/load-image.js", function(exports, require, module){
/*
 * JavaScript Load Image 1.9.0
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2011, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true */
/*global define, window, document, URL, webkitURL, Blob, File, FileReader */

(function ($) {
    'use strict';

    // Loads an image for a given File object.
    // Invokes the callback with an img or optional canvas
    // element (if supported by the browser) as parameter:
    var loadImage = function (file, callback, options) {
            var img = document.createElement('img'),
                url,
                oUrl;
            img.onerror = callback;
            img.onload = function () {
                if (oUrl && !(options && options.noRevoke)) {
                    loadImage.revokeObjectURL(oUrl);
                }
                if (callback) {
                    callback(loadImage.scale(img, options));
                }
            };
            if (loadImage.isInstanceOf('Blob', file) ||
                    // Files are also Blob instances, but some browsers
                    // (Firefox 3.6) support the File API but not Blobs:
                    loadImage.isInstanceOf('File', file)) {
                url = oUrl = loadImage.createObjectURL(file);
                // Store the file type for resize processing:
                img._type = file.type;
            } else if (typeof file === 'string') {
                url = file;
                if (options && options.crossOrigin) {
                    img.crossOrigin = options.crossOrigin;
                }
            } else {
                return false;
            }
            if (url) {
                img.src = url;
                return img;
            }
            return loadImage.readFile(file, function (e) {
                var target = e.target;
                if (target && target.result) {
                    img.src = target.result;
                } else {
                    if (callback) {
                        callback(e);
                    }
                }
            });
        },
        // The check for URL.revokeObjectURL fixes an issue with Opera 12,
        // which provides URL.createObjectURL but doesn't properly implement it:
        urlAPI = (window.createObjectURL && window) ||
            (window.URL && URL.revokeObjectURL && URL) ||
            (window.webkitURL && webkitURL);

    loadImage.isInstanceOf = function (type, obj) {
        // Cross-frame instanceof check
        return Object.prototype.toString.call(obj) === '[object ' + type + ']';
    };

    // Transform image coordinates, allows to override e.g.
    // the canvas orientation based on the orientation option,
    // gets canvas, options passed as arguments:
    loadImage.transformCoordinates = function () {
        return;
    };

    // Returns transformed options, allows to override e.g.
    // coordinate and dimension options based on the orientation:
    loadImage.getTransformedOptions = function (options) {
        return options;
    };

    // Canvas render method, allows to override the
    // rendering e.g. to work around issues on iOS:
    loadImage.renderImageToCanvas = function (
        canvas,
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
    ) {
        canvas.getContext('2d').drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            destX,
            destY,
            destWidth,
            destHeight
        );
        return canvas;
    };

    // This method is used to determine if the target image
    // should be a canvas element:
    loadImage.hasCanvasOption = function (options) {
        return options.canvas || options.crop;
    };

    // Scales and/or crops the given image (img or canvas HTML element)
    // using the given options.
    // Returns a canvas object if the browser supports canvas
    // and the hasCanvasOption method returns true or a canvas
    // object is passed as image, else the scaled image:
    loadImage.scale = function (img, options) {
        options = options || {};
        var canvas = document.createElement('canvas'),
            useCanvas = img.getContext ||
                (loadImage.hasCanvasOption(options) && canvas.getContext),
            width = img.naturalWidth || img.width,
            height = img.naturalHeight || img.height,
            destWidth = width,
            destHeight = height,
            maxWidth,
            maxHeight,
            minWidth,
            minHeight,
            sourceWidth,
            sourceHeight,
            sourceX,
            sourceY,
            tmp,
            scaleUp = function () {
                var scale = Math.max(
                    (minWidth || destWidth) / destWidth,
                    (minHeight || destHeight) / destHeight
                );
                if (scale > 1) {
                    destWidth = Math.ceil(destWidth * scale);
                    destHeight = Math.ceil(destHeight * scale);
                }
            },
            scaleDown = function () {
                var scale = Math.min(
                    (maxWidth || destWidth) / destWidth,
                    (maxHeight || destHeight) / destHeight
                );
                if (scale < 1) {
                    destWidth = Math.ceil(destWidth * scale);
                    destHeight = Math.ceil(destHeight * scale);
                }
            };
        if (useCanvas) {
            options = loadImage.getTransformedOptions(options);
            sourceX = options.left || 0;
            sourceY = options.top || 0;
            if (options.sourceWidth) {
                sourceWidth = options.sourceWidth;
                if (options.right !== undefined && options.left === undefined) {
                    sourceX = width - sourceWidth - options.right;
                }
            } else {
                sourceWidth = width - sourceX - (options.right || 0);
            }
            if (options.sourceHeight) {
                sourceHeight = options.sourceHeight;
                if (options.bottom !== undefined && options.top === undefined) {
                    sourceY = height - sourceHeight - options.bottom;
                }
            } else {
                sourceHeight = height - sourceY - (options.bottom || 0);
            }
            destWidth = sourceWidth;
            destHeight = sourceHeight;
        }
        maxWidth = options.maxWidth;
        maxHeight = options.maxHeight;
        minWidth = options.minWidth;
        minHeight = options.minHeight;
        if (useCanvas && maxWidth && maxHeight && options.crop) {
            destWidth = maxWidth;
            destHeight = maxHeight;
            tmp = sourceWidth / sourceHeight - maxWidth / maxHeight;
            if (tmp < 0) {
                sourceHeight = maxHeight * sourceWidth / maxWidth;
                if (options.top === undefined && options.bottom === undefined) {
                    sourceY = (height - sourceHeight) / 2;
                }
            } else if (tmp > 0) {
                sourceWidth = maxWidth * sourceHeight / maxHeight;
                if (options.left === undefined && options.right === undefined) {
                    sourceX = (width - sourceWidth) / 2;
                }
            }
        } else {
            if (options.contain || options.cover) {
                minWidth = maxWidth = maxWidth || minWidth;
                minHeight = maxHeight = maxHeight || minHeight;
            }
            if (options.cover) {
                scaleDown();
                scaleUp();
            } else {
                scaleUp();
                scaleDown();
            }
        }
        if (useCanvas) {
            canvas.width = destWidth;
            canvas.height = destHeight;
            loadImage.transformCoordinates(
                canvas,
                options
            );
            return loadImage.renderImageToCanvas(
                canvas,
                img,
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                0,
                0,
                destWidth,
                destHeight
            );
        }
        img.width = destWidth;
        img.height = destHeight;
        return img;
    };

    loadImage.createObjectURL = function (file) {
        return urlAPI ? urlAPI.createObjectURL(file) : false;
    };

    loadImage.revokeObjectURL = function (url) {
        return urlAPI ? urlAPI.revokeObjectURL(url) : false;
    };

    // Loads a given File object via FileReader interface,
    // invokes the callback with the event object (load or error).
    // The result can be read via event.target.result:
    loadImage.readFile = function (file, callback, method) {
        if (window.FileReader) {
            var fileReader = new FileReader();
            fileReader.onload = fileReader.onerror = callback;
            method = method || 'readAsDataURL';
            if (fileReader[method]) {
                fileReader[method](file);
                return fileReader;
            }
        }
        return false;
    };
    
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        module.exports = loadImage;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return loadImage;
        });
    } else {
        $.loadImage = loadImage;
    }
}(this));

});
require.register("pgherveou-load-image/js/load-image-ios.js", function(exports, require, module){
/*
 * JavaScript Load Image iOS scaling fixes 1.0.3
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * iOS image scaling fixes based on
 * https://github.com/stomita/ios-imagefile-megapixel
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, bitwise: true */
/*global define, window, document */

(function (factory) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        var loadImage = require('./load-image');
        module.exports = factory(loadImage);
    }
    else if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    // Only apply fixes on the iOS platform:
    if (!window.navigator || !window.navigator.platform ||
             !(/iP(hone|od|ad)/).test(window.navigator.platform)) {
        return;
    }

    var originalRenderMethod = loadImage.renderImageToCanvas;

    // Detects subsampling in JPEG images:
    loadImage.detectSubsampling = function (img) {
        var canvas,
            context;
        if (img.width * img.height > 1024 * 1024) { // only consider mexapixel images
            canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            context = canvas.getContext('2d');
            context.drawImage(img, -img.width + 1, 0);
            // subsampled image becomes half smaller in rendering size.
            // check alpha channel value to confirm image is covering edge pixel or not.
            // if alpha value is 0 image is not covering, hence subsampled.
            return context.getImageData(0, 0, 1, 1).data[3] === 0;
        }
        return false;
    };

    // Detects vertical squash in JPEG images:
    loadImage.detectVerticalSquash = function (img, subsampled) {
        var naturalHeight = img.naturalHeight || img.height,
            canvas = document.createElement('canvas'),
            context = canvas.getContext('2d'),
            data,
            sy,
            ey,
            py,
            alpha;
        if (subsampled) {
            naturalHeight /= 2;
        }
        canvas.width = 1;
        canvas.height = naturalHeight;
        context.drawImage(img, 0, 0);
        data = context.getImageData(0, 0, 1, naturalHeight).data;
        // search image edge pixel position in case it is squashed vertically:
        sy = 0;
        ey = naturalHeight;
        py = naturalHeight;
        while (py > sy) {
            alpha = data[(py - 1) * 4 + 3];
            if (alpha === 0) {
                ey = py;
            } else {
                sy = py;
            }
            py = (ey + sy) >> 1;
        }
        return (py / naturalHeight) || 1;
    };

    // Renders image to canvas while working around iOS image scaling bugs:
    // https://github.com/blueimp/JavaScript-Load-Image/issues/13
    loadImage.renderImageToCanvas = function (
        canvas,
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
    ) {
        if (img._type === 'image/jpeg') {
            var context = canvas.getContext('2d'),
                tmpCanvas = document.createElement('canvas'),
                tileSize = 1024,
                tmpContext = tmpCanvas.getContext('2d'),
                subsampled,
                vertSquashRatio,
                tileX,
                tileY;
            tmpCanvas.width = tileSize;
            tmpCanvas.height = tileSize;
            context.save();
            subsampled = loadImage.detectSubsampling(img);
            if (subsampled) {
                sourceX /= 2;
                sourceY /= 2;
                sourceWidth /= 2;
                sourceHeight /= 2;
            }
            vertSquashRatio = loadImage.detectVerticalSquash(img, subsampled);
            if (subsampled || vertSquashRatio !== 1) {
                sourceY *= vertSquashRatio;
                destWidth = Math.ceil(tileSize * destWidth / sourceWidth);
                destHeight = Math.ceil(
                    tileSize * destHeight / sourceHeight / vertSquashRatio
                );
                destY = 0;
                tileY = 0;
                while (tileY < sourceHeight) {
                    destX = 0;
                    tileX = 0;
                    while (tileX < sourceWidth) {
                        tmpContext.clearRect(0, 0, tileSize, tileSize);
                        tmpContext.drawImage(
                            img,
                            sourceX,
                            sourceY,
                            sourceWidth,
                            sourceHeight,
                            -tileX,
                            -tileY,
                            sourceWidth,
                            sourceHeight
                        );
                        context.drawImage(
                            tmpCanvas,
                            0,
                            0,
                            tileSize,
                            tileSize,
                            destX,
                            destY,
                            destWidth,
                            destHeight
                        );
                        tileX += tileSize;
                        destX += destWidth;
                    }
                    tileY += tileSize;
                    destY += destHeight;
                }
                context.restore();
                return canvas;
            }
        }
        return originalRenderMethod(
            canvas,
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            destX,
            destY,
            destWidth,
            destHeight
        );
    };

}));

});
require.register("pgherveou-load-image/js/load-image-orientation.js", function(exports, require, module){
/*
 * JavaScript Load Image Orientation 1.0.0
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global define, window */

(function (factory) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        // common js
        var loadImage = require('./load-image');
        module.exports = factory(loadImage);
    }
    else if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    var originalHasCanvasOptionMethod = loadImage.hasCanvasOption;

    // This method is used to determine if the target image
    // should be a canvas element:
    loadImage.hasCanvasOption = function (options) {
        return originalHasCanvasOptionMethod(options) || options.orientation;
    };

    // Transform image orientation based on
    // the given EXIF orientation option:
    loadImage.transformCoordinates = function (canvas, options) {
        var ctx = canvas.getContext('2d'),
            width = canvas.width,
            height = canvas.height,
            orientation = options.orientation;
        if (!orientation) {
            return;
        }
        if (orientation > 4) {
            canvas.width = height;
            canvas.height = width;
        }
        switch (orientation) {
        case 2:
            // horizontal flip
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
            break;
        case 3:
            // 180° rotate left
            ctx.translate(width, height);
            ctx.rotate(Math.PI);
            break;
        case 4:
            // vertical flip
            ctx.translate(0, height);
            ctx.scale(1, -1);
            break;
        case 5:
            // vertical flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.scale(1, -1);
            break;
        case 6:
            // 90° rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(0, -height);
            break;
        case 7:
            // horizontal flip + 90 rotate right
            ctx.rotate(0.5 * Math.PI);
            ctx.translate(width, -height);
            ctx.scale(-1, 1);
            break;
        case 8:
            // 90° rotate left
            ctx.rotate(-0.5 * Math.PI);
            ctx.translate(-width, 0);
            break;
        }
    };

    // Transforms coordinate and dimension options
    // based on the given orientation option:
    loadImage.getTransformedOptions = function (options) {
        if (!options.orientation || options.orientation === 1) {
            return options;
        }
        var newOptions = {},
            i;
        for (i in options) {
            if (options.hasOwnProperty(i)) {
                newOptions[i] = options[i];
            }
        }
        switch (options.orientation) {
        case 2:
            // horizontal flip
            newOptions.left = options.right;
            newOptions.right = options.left;
            break;
        case 3:
            // 180° rotate left
            newOptions.left = options.right;
            newOptions.top = options.bottom;
            newOptions.right = options.left;
            newOptions.bottom = options.top;
            break;
        case 4:
            // vertical flip
            newOptions.top = options.bottom;
            newOptions.bottom = options.top;
            break;
        case 5:
            // vertical flip + 90 rotate right
            newOptions.left = options.top;
            newOptions.top = options.left;
            newOptions.right = options.bottom;
            newOptions.bottom = options.right;
            break;
        case 6:
            // 90° rotate right
            newOptions.left = options.top;
            newOptions.top = options.right;
            newOptions.right = options.bottom;
            newOptions.bottom = options.left;
            break;
        case 7:
            // horizontal flip + 90 rotate right
            newOptions.left = options.bottom;
            newOptions.top = options.right;
            newOptions.right = options.top;
            newOptions.bottom = options.left;
            break;
        case 8:
            // 90° rotate left
            newOptions.left = options.bottom;
            newOptions.top = options.left;
            newOptions.right = options.top;
            newOptions.bottom = options.right;
            break;
        }
        if (options.orientation > 4) {
            newOptions.maxWidth = options.maxHeight;
            newOptions.maxHeight = options.maxWidth;
            newOptions.minWidth = options.minHeight;
            newOptions.minHeight = options.minWidth;
            newOptions.sourceWidth = options.sourceHeight;
            newOptions.sourceHeight = options.sourceWidth;
        }
        return newOptions;
    };

}));

});
require.register("pgherveou-load-image/js/load-image-meta.js", function(exports, require, module){
/*
 * JavaScript Load Image Meta 1.0.1
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Image meta data handling implementation
 * based on the help and contribution of
 * Achim Stöhr.
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint continue:true */
/*global define, window, DataView, Blob, Uint8Array, console */

(function (factory) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        var loadImage = require('./load-image');
        module.exports = factory(loadImage);
    }
    else if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    var hasblobSlice = window.Blob && (Blob.prototype.slice ||
            Blob.prototype.webkitSlice || Blob.prototype.mozSlice);

    loadImage.blobSlice = hasblobSlice && function () {
        var slice = this.slice || this.webkitSlice || this.mozSlice;
        return slice.apply(this, arguments);
    };

    loadImage.metaDataParsers = {
        jpeg: {
            0xffe1: [] // APP1 marker
        }
    };

    // Parses image meta data and calls the callback with an object argument
    // with the following properties:
    // * imageHead: The complete image head as ArrayBuffer (Uint8Array for IE10)
    // The options arguments accepts an object and supports the following properties:
    // * maxMetaDataSize: Defines the maximum number of bytes to parse.
    // * disableImageHead: Disables creating the imageHead property.
    loadImage.parseMetaData = function (file, callback, options) {
        options = options || {};
        var that = this,
            // 256 KiB should contain all EXIF/ICC/IPTC segments:
            maxMetaDataSize = options.maxMetaDataSize || 262144,
            data = {},
            noMetaData = !(window.DataView  && file && file.size >= 12 &&
                file.type === 'image/jpeg' && loadImage.blobSlice);
        if (noMetaData || !loadImage.readFile(
                loadImage.blobSlice.call(file, 0, maxMetaDataSize),
                function (e) {
                    // Note on endianness:
                    // Since the marker and length bytes in JPEG files are always
                    // stored in big endian order, we can leave the endian parameter
                    // of the DataView methods undefined, defaulting to big endian.
                    var buffer = e.target.result,
                        dataView = new DataView(buffer),
                        offset = 2,
                        maxOffset = dataView.byteLength - 4,
                        headLength = offset,
                        markerBytes,
                        markerLength,
                        parsers,
                        i;
                    // Check for the JPEG marker (0xffd8):
                    if (dataView.getUint16(0) === 0xffd8) {
                        while (offset < maxOffset) {
                            markerBytes = dataView.getUint16(offset);
                            // Search for APPn (0xffeN) and COM (0xfffe) markers,
                            // which contain application-specific meta-data like
                            // Exif, ICC and IPTC data and text comments:
                            if ((markerBytes >= 0xffe0 && markerBytes <= 0xffef) ||
                                    markerBytes === 0xfffe) {
                                // The marker bytes (2) are always followed by
                                // the length bytes (2), indicating the length of the
                                // marker segment, which includes the length bytes,
                                // but not the marker bytes, so we add 2:
                                markerLength = dataView.getUint16(offset + 2) + 2;
                                if (offset + markerLength > dataView.byteLength) {
                                    console.log('Invalid meta data: Invalid segment size.');
                                    break;
                                }
                                parsers = loadImage.metaDataParsers.jpeg[markerBytes];
                                if (parsers) {
                                    for (i = 0; i < parsers.length; i += 1) {
                                        parsers[i].call(
                                            that,
                                            dataView,
                                            offset,
                                            markerLength,
                                            data,
                                            options
                                        );
                                    }
                                }
                                offset += markerLength;
                                headLength = offset;
                            } else {
                                // Not an APPn or COM marker, probably safe to
                                // assume that this is the end of the meta data
                                break;
                            }
                        }
                        // Meta length must be longer than JPEG marker (2)
                        // plus APPn marker (2), followed by length bytes (2):
                        if (!options.disableImageHead && headLength > 6) {
                            if (buffer.slice) {
                                data.imageHead = buffer.slice(0, headLength);
                            } else {
                                // Workaround for IE10, which does not yet
                                // support ArrayBuffer.slice:
                                data.imageHead = new Uint8Array(buffer)
                                    .subarray(0, headLength);
                            }
                        }
                    } else {
                        console.log('Invalid JPEG file: Missing JPEG marker.');
                    }
                    callback(data);
                },
                'readAsArrayBuffer'
            )) {
            callback(data);
        }
    };

}));

});
require.register("pgherveou-load-image/js/load-image-exif.js", function(exports, require, module){
/*
 * JavaScript Load Image Exif Parser 1.0.0
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint unparam: true */
/*global define, window, console */

(function (factory) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        var loadImage = require('./load-image');
        require('./load-image-meta');
        module.exports = factory(loadImage);
    }
    else if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image', 'load-image-meta'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    loadImage.ExifMap = function () {
        return this;
    };

    loadImage.ExifMap.prototype.map = {
        'Orientation': 0x0112
    };

    loadImage.ExifMap.prototype.get = function (id) {
        return this[id] || this[this.map[id]];
    };

    loadImage.getExifThumbnail = function (dataView, offset, length) {
        var hexData,
            i,
            b;
        if (!length || offset + length > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid thumbnail data.');
            return;
        }
        hexData = [];
        for (i = 0; i < length; i += 1) {
            b = dataView.getUint8(offset + i);
            hexData.push((b < 16 ? '0' : '') + b.toString(16));
        }
        return 'data:image/jpeg,%' + hexData.join('%');
    };

    loadImage.exifTagTypes = {
        // byte, 8-bit unsigned int:
        1: {
            getValue: function (dataView, dataOffset) {
                return dataView.getUint8(dataOffset);
            },
            size: 1
        },
        // ascii, 8-bit byte:
        2: {
            getValue: function (dataView, dataOffset) {
                return String.fromCharCode(dataView.getUint8(dataOffset));
            },
            size: 1,
            ascii: true
        },
        // short, 16 bit int:
        3: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getUint16(dataOffset, littleEndian);
            },
            size: 2
        },
        // long, 32 bit int:
        4: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getUint32(dataOffset, littleEndian);
            },
            size: 4
        },
        // rational = two long values, first is numerator, second is denominator:
        5: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getUint32(dataOffset, littleEndian) /
                    dataView.getUint32(dataOffset + 4, littleEndian);
            },
            size: 8
        },
        // slong, 32 bit signed int:
        9: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getInt32(dataOffset, littleEndian);
            },
            size: 4
        },
        // srational, two slongs, first is numerator, second is denominator:
        10: {
            getValue: function (dataView, dataOffset, littleEndian) {
                return dataView.getInt32(dataOffset, littleEndian) /
                    dataView.getInt32(dataOffset + 4, littleEndian);
            },
            size: 8
        }
    };
    // undefined, 8-bit byte, value depending on field:
    loadImage.exifTagTypes[7] = loadImage.exifTagTypes[1];

    loadImage.getExifValue = function (dataView, tiffOffset, offset, type, length, littleEndian) {
        var tagType = loadImage.exifTagTypes[type],
            tagSize,
            dataOffset,
            values,
            i,
            str,
            c;
        if (!tagType) {
            console.log('Invalid Exif data: Invalid tag type.');
            return;
        }
        tagSize = tagType.size * length;
        // Determine if the value is contained in the dataOffset bytes,
        // or if the value at the dataOffset is a pointer to the actual data:
        dataOffset = tagSize > 4 ?
                tiffOffset + dataView.getUint32(offset + 8, littleEndian) : (offset + 8);
        if (dataOffset + tagSize > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid data offset.');
            return;
        }
        if (length === 1) {
            return tagType.getValue(dataView, dataOffset, littleEndian);
        }
        values = [];
        for (i = 0; i < length; i += 1) {
            values[i] = tagType.getValue(dataView, dataOffset + i * tagType.size, littleEndian);
        }
        if (tagType.ascii) {
            str = '';
            // Concatenate the chars:
            for (i = 0; i < values.length; i += 1) {
                c = values[i];
                // Ignore the terminating NULL byte(s):
                if (c === '\u0000') {
                    break;
                }
                str += c;
            }
            return str;
        }
        return values;
    };

    loadImage.parseExifTag = function (dataView, tiffOffset, offset, littleEndian, data) {
        var tag = dataView.getUint16(offset, littleEndian);
        data.exif[tag] = loadImage.getExifValue(
            dataView,
            tiffOffset,
            offset,
            dataView.getUint16(offset + 2, littleEndian), // tag type
            dataView.getUint32(offset + 4, littleEndian), // tag length
            littleEndian
        );
    };

    loadImage.parseExifTags = function (dataView, tiffOffset, dirOffset, littleEndian, data) {
        var tagsNumber,
            dirEndOffset,
            i;
        if (dirOffset + 6 > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid directory offset.');
            return;
        }
        tagsNumber = dataView.getUint16(dirOffset, littleEndian);
        dirEndOffset = dirOffset + 2 + 12 * tagsNumber;
        if (dirEndOffset + 4 > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid directory size.');
            return;
        }
        for (i = 0; i < tagsNumber; i += 1) {
            this.parseExifTag(
                dataView,
                tiffOffset,
                dirOffset + 2 + 12 * i, // tag offset
                littleEndian,
                data
            );
        }
        // Return the offset to the next directory:
        return dataView.getUint32(dirEndOffset, littleEndian);
    };

    loadImage.parseExifData = function (dataView, offset, length, data, options) {
        if (options.disableExif) {
            return;
        }
        var tiffOffset = offset + 10,
            littleEndian,
            dirOffset,
            thumbnailData;
        // Check for the ASCII code for "Exif" (0x45786966):
        if (dataView.getUint32(offset + 4) !== 0x45786966) {
            // No Exif data, might be XMP data instead
            return;
        }
        if (tiffOffset + 8 > dataView.byteLength) {
            console.log('Invalid Exif data: Invalid segment size.');
            return;
        }
        // Check for the two null bytes:
        if (dataView.getUint16(offset + 8) !== 0x0000) {
            console.log('Invalid Exif data: Missing byte alignment offset.');
            return;
        }
        // Check the byte alignment:
        switch (dataView.getUint16(tiffOffset)) {
        case 0x4949:
            littleEndian = true;
            break;
        case 0x4D4D:
            littleEndian = false;
            break;
        default:
            console.log('Invalid Exif data: Invalid byte alignment marker.');
            return;
        }
        // Check for the TIFF tag marker (0x002A):
        if (dataView.getUint16(tiffOffset + 2, littleEndian) !== 0x002A) {
            console.log('Invalid Exif data: Missing TIFF marker.');
            return;
        }
        // Retrieve the directory offset bytes, usually 0x00000008 or 8 decimal:
        dirOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
        // Create the exif object to store the tags:
        data.exif = new loadImage.ExifMap();
        // Parse the tags of the main image directory and retrieve the
        // offset to the next directory, usually the thumbnail directory:
        dirOffset = loadImage.parseExifTags(
            dataView,
            tiffOffset,
            tiffOffset + dirOffset,
            littleEndian,
            data
        );
        if (dirOffset && !options.disableExifThumbnail) {
            thumbnailData = {exif: {}};
            dirOffset = loadImage.parseExifTags(
                dataView,
                tiffOffset,
                tiffOffset + dirOffset,
                littleEndian,
                thumbnailData
            );
            // Check for JPEG Thumbnail offset:
            if (thumbnailData.exif[0x0201]) {
                data.exif.Thumbnail = loadImage.getExifThumbnail(
                    dataView,
                    tiffOffset + thumbnailData.exif[0x0201],
                    thumbnailData.exif[0x0202] // Thumbnail data length
                );
            }
        }
        // Check for Exif Sub IFD Pointer:
        if (data.exif[0x8769] && !options.disableExifSub) {
            loadImage.parseExifTags(
                dataView,
                tiffOffset,
                tiffOffset + data.exif[0x8769], // directory offset
                littleEndian,
                data
            );
        }
        // Check for GPS Info IFD Pointer:
        if (data.exif[0x8825] && !options.disableExifGps) {
            loadImage.parseExifTags(
                dataView,
                tiffOffset,
                tiffOffset + data.exif[0x8825], // directory offset
                littleEndian,
                data
            );
        }
    };

    // Registers the Exif parser for the APP1 JPEG meta data segment:
    loadImage.metaDataParsers.jpeg[0xffe1].push(loadImage.parseExifData);

    // Adds the following properties to the parseMetaData callback data:
    // * exif: The exif tags, parsed by the parseExifData method

    // Adds the following options to the parseMetaData method:
    // * disableExif: Disables Exif parsing.
    // * disableExifThumbnail: Disables parsing of the Exif Thumbnail.
    // * disableExifSub: Disables parsing of the Exif Sub IFD.
    // * disableExifGps: Disables parsing of the Exif GPS Info IFD.

}));

});
require.register("pgherveou-load-image/js/load-image-exif-map.js", function(exports, require, module){
/*
 * JavaScript Load Image Exif Map 1.0.1
 * https://github.com/blueimp/JavaScript-Load-Image
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Exif tags mapping based on
 * https://github.com/jseidelin/exif-js
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*global define, window */

(function (factory) {
    'use strict';
    if (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined') {
        var loadImage = require('./load-image');
        require('./load-image-exif');
        module.exports = factory(loadImage);
    }
    else if (typeof define === 'function' && define.amd) {
        // Register as an anonymous AMD module:
        define(['load-image', 'load-image-exif'], factory);
    } else {
        // Browser globals:
        factory(window.loadImage);
    }
}(function (loadImage) {
    'use strict';

    var tags,
        map,
        prop;

    loadImage.ExifMap.prototype.tags = {
        // =================
        // TIFF tags (IFD0):
        // =================
        0x0100: 'ImageWidth',
        0x0101: 'ImageHeight',
        0x8769: 'ExifIFDPointer',
        0x8825: 'GPSInfoIFDPointer',
        0xA005: 'InteroperabilityIFDPointer',
        0x0102: 'BitsPerSample',
        0x0103: 'Compression',
        0x0106: 'PhotometricInterpretation',
        0x0112: 'Orientation',
        0x0115: 'SamplesPerPixel',
        0x011C: 'PlanarConfiguration',
        0x0212: 'YCbCrSubSampling',
        0x0213: 'YCbCrPositioning',
        0x011A: 'XResolution',
        0x011B: 'YResolution',
        0x0128: 'ResolutionUnit',
        0x0111: 'StripOffsets',
        0x0116: 'RowsPerStrip',
        0x0117: 'StripByteCounts',
        0x0201: 'JPEGInterchangeFormat',
        0x0202: 'JPEGInterchangeFormatLength',
        0x012D: 'TransferFunction',
        0x013E: 'WhitePoint',
        0x013F: 'PrimaryChromaticities',
        0x0211: 'YCbCrCoefficients',
        0x0214: 'ReferenceBlackWhite',
        0x0132: 'DateTime',
        0x010E: 'ImageDescription',
        0x010F: 'Make',
        0x0110: 'Model',
        0x0131: 'Software',
        0x013B: 'Artist',
        0x8298: 'Copyright',
        // ==================
        // Exif Sub IFD tags:
        // ==================
        0x9000: 'ExifVersion',                  // EXIF version
        0xA000: 'FlashpixVersion',              // Flashpix format version
        0xA001: 'ColorSpace',                   // Color space information tag
        0xA002: 'PixelXDimension',              // Valid width of meaningful image
        0xA003: 'PixelYDimension',              // Valid height of meaningful image
        0xA500: 'Gamma',
        0x9101: 'ComponentsConfiguration',      // Information about channels
        0x9102: 'CompressedBitsPerPixel',       // Compressed bits per pixel
        0x927C: 'MakerNote',                    // Any desired information written by the manufacturer
        0x9286: 'UserComment',                  // Comments by user
        0xA004: 'RelatedSoundFile',             // Name of related sound file
        0x9003: 'DateTimeOriginal',             // Date and time when the original image was generated
        0x9004: 'DateTimeDigitized',            // Date and time when the image was stored digitally
        0x9290: 'SubSecTime',                   // Fractions of seconds for DateTime
        0x9291: 'SubSecTimeOriginal',           // Fractions of seconds for DateTimeOriginal
        0x9292: 'SubSecTimeDigitized',          // Fractions of seconds for DateTimeDigitized
        0x829A: 'ExposureTime',                 // Exposure time (in seconds)
        0x829D: 'FNumber',
        0x8822: 'ExposureProgram',              // Exposure program
        0x8824: 'SpectralSensitivity',          // Spectral sensitivity
        0x8827: 'PhotographicSensitivity',      // EXIF 2.3, ISOSpeedRatings in EXIF 2.2
        0x8828: 'OECF',                         // Optoelectric conversion factor
        0x8830: 'SensitivityType',
        0x8831: 'StandardOutputSensitivity',
        0x8832: 'RecommendedExposureIndex',
        0x8833: 'ISOSpeed',
        0x8834: 'ISOSpeedLatitudeyyy',
        0x8835: 'ISOSpeedLatitudezzz',
        0x9201: 'ShutterSpeedValue',            // Shutter speed
        0x9202: 'ApertureValue',                // Lens aperture
        0x9203: 'BrightnessValue',              // Value of brightness
        0x9204: 'ExposureBias',                 // Exposure bias
        0x9205: 'MaxApertureValue',             // Smallest F number of lens
        0x9206: 'SubjectDistance',              // Distance to subject in meters
        0x9207: 'MeteringMode',                 // Metering mode
        0x9208: 'LightSource',                  // Kind of light source
        0x9209: 'Flash',                        // Flash status
        0x9214: 'SubjectArea',                  // Location and area of main subject
        0x920A: 'FocalLength',                  // Focal length of the lens in mm
        0xA20B: 'FlashEnergy',                  // Strobe energy in BCPS
        0xA20C: 'SpatialFrequencyResponse',
        0xA20E: 'FocalPlaneXResolution',        // Number of pixels in width direction per FPRUnit
        0xA20F: 'FocalPlaneYResolution',        // Number of pixels in height direction per FPRUnit
        0xA210: 'FocalPlaneResolutionUnit',     // Unit for measuring the focal plane resolution
        0xA214: 'SubjectLocation',              // Location of subject in image
        0xA215: 'ExposureIndex',                // Exposure index selected on camera
        0xA217: 'SensingMethod',                // Image sensor type
        0xA300: 'FileSource',                   // Image source (3 == DSC)
        0xA301: 'SceneType',                    // Scene type (1 == directly photographed)
        0xA302: 'CFAPattern',                   // Color filter array geometric pattern
        0xA401: 'CustomRendered',               // Special processing
        0xA402: 'ExposureMode',                 // Exposure mode
        0xA403: 'WhiteBalance',                 // 1 = auto white balance, 2 = manual
        0xA404: 'DigitalZoomRatio',             // Digital zoom ratio
        0xA405: 'FocalLengthIn35mmFilm',
        0xA406: 'SceneCaptureType',             // Type of scene
        0xA407: 'GainControl',                  // Degree of overall image gain adjustment
        0xA408: 'Contrast',                     // Direction of contrast processing applied by camera
        0xA409: 'Saturation',                   // Direction of saturation processing applied by camera
        0xA40A: 'Sharpness',                    // Direction of sharpness processing applied by camera
        0xA40B: 'DeviceSettingDescription',
        0xA40C: 'SubjectDistanceRange',         // Distance to subject
        0xA420: 'ImageUniqueID',                // Identifier assigned uniquely to each image
        0xA430: 'CameraOwnerName',
        0xA431: 'BodySerialNumber',
        0xA432: 'LensSpecification',
        0xA433: 'LensMake',
        0xA434: 'LensModel',
        0xA435: 'LensSerialNumber',
        // ==============
        // GPS Info tags:
        // ==============
        0x0000: 'GPSVersionID',
        0x0001: 'GPSLatitudeRef',
        0x0002: 'GPSLatitude',
        0x0003: 'GPSLongitudeRef',
        0x0004: 'GPSLongitude',
        0x0005: 'GPSAltitudeRef',
        0x0006: 'GPSAltitude',
        0x0007: 'GPSTimeStamp',
        0x0008: 'GPSSatellites',
        0x0009: 'GPSStatus',
        0x000A: 'GPSMeasureMode',
        0x000B: 'GPSDOP',
        0x000C: 'GPSSpeedRef',
        0x000D: 'GPSSpeed',
        0x000E: 'GPSTrackRef',
        0x000F: 'GPSTrack',
        0x0010: 'GPSImgDirectionRef',
        0x0011: 'GPSImgDirection',
        0x0012: 'GPSMapDatum',
        0x0013: 'GPSDestLatitudeRef',
        0x0014: 'GPSDestLatitude',
        0x0015: 'GPSDestLongitudeRef',
        0x0016: 'GPSDestLongitude',
        0x0017: 'GPSDestBearingRef',
        0x0018: 'GPSDestBearing',
        0x0019: 'GPSDestDistanceRef',
        0x001A: 'GPSDestDistance',
        0x001B: 'GPSProcessingMethod',
        0x001C: 'GPSAreaInformation',
        0x001D: 'GPSDateStamp',
        0x001E: 'GPSDifferential',
        0x001F: 'GPSHPositioningError'
    };

    loadImage.ExifMap.prototype.stringValues = {
        ExposureProgram: {
            0: 'Undefined',
            1: 'Manual',
            2: 'Normal program',
            3: 'Aperture priority',
            4: 'Shutter priority',
            5: 'Creative program',
            6: 'Action program',
            7: 'Portrait mode',
            8: 'Landscape mode'
        },
        MeteringMode: {
            0: 'Unknown',
            1: 'Average',
            2: 'CenterWeightedAverage',
            3: 'Spot',
            4: 'MultiSpot',
            5: 'Pattern',
            6: 'Partial',
            255: 'Other'
        },
        LightSource: {
            0: 'Unknown',
            1: 'Daylight',
            2: 'Fluorescent',
            3: 'Tungsten (incandescent light)',
            4: 'Flash',
            9: 'Fine weather',
            10: 'Cloudy weather',
            11: 'Shade',
            12: 'Daylight fluorescent (D 5700 - 7100K)',
            13: 'Day white fluorescent (N 4600 - 5400K)',
            14: 'Cool white fluorescent (W 3900 - 4500K)',
            15: 'White fluorescent (WW 3200 - 3700K)',
            17: 'Standard light A',
            18: 'Standard light B',
            19: 'Standard light C',
            20: 'D55',
            21: 'D65',
            22: 'D75',
            23: 'D50',
            24: 'ISO studio tungsten',
            255: 'Other'
        },
        Flash: {
            0x0000: 'Flash did not fire',
            0x0001: 'Flash fired',
            0x0005: 'Strobe return light not detected',
            0x0007: 'Strobe return light detected',
            0x0009: 'Flash fired, compulsory flash mode',
            0x000D: 'Flash fired, compulsory flash mode, return light not detected',
            0x000F: 'Flash fired, compulsory flash mode, return light detected',
            0x0010: 'Flash did not fire, compulsory flash mode',
            0x0018: 'Flash did not fire, auto mode',
            0x0019: 'Flash fired, auto mode',
            0x001D: 'Flash fired, auto mode, return light not detected',
            0x001F: 'Flash fired, auto mode, return light detected',
            0x0020: 'No flash function',
            0x0041: 'Flash fired, red-eye reduction mode',
            0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
            0x0047: 'Flash fired, red-eye reduction mode, return light detected',
            0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
            0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
            0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
            0x0059: 'Flash fired, auto mode, red-eye reduction mode',
            0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
            0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
        },
        SensingMethod: {
            1: 'Undefined',
            2: 'One-chip color area sensor',
            3: 'Two-chip color area sensor',
            4: 'Three-chip color area sensor',
            5: 'Color sequential area sensor',
            7: 'Trilinear sensor',
            8: 'Color sequential linear sensor'
        },
        SceneCaptureType: {
            0: 'Standard',
            1: 'Landscape',
            2: 'Portrait',
            3: 'Night scene'
        },
        SceneType: {
            1: 'Directly photographed'
        },
        CustomRendered: {
            0: 'Normal process',
            1: 'Custom process'
        },
        WhiteBalance: {
            0: 'Auto white balance',
            1: 'Manual white balance'
        },
        GainControl: {
            0: 'None',
            1: 'Low gain up',
            2: 'High gain up',
            3: 'Low gain down',
            4: 'High gain down'
        },
        Contrast: {
            0: 'Normal',
            1: 'Soft',
            2: 'Hard'
        },
        Saturation: {
            0: 'Normal',
            1: 'Low saturation',
            2: 'High saturation'
        },
        Sharpness: {
            0: 'Normal',
            1: 'Soft',
            2: 'Hard'
        },
        SubjectDistanceRange: {
            0: 'Unknown',
            1: 'Macro',
            2: 'Close view',
            3: 'Distant view'
        },
        FileSource: {
            3: 'DSC'
        },
        ComponentsConfiguration: {
            0: '',
            1: 'Y',
            2: 'Cb',
            3: 'Cr',
            4: 'R',
            5: 'G',
            6: 'B'
        },
        Orientation: {
            1: 'top-left',
            2: 'top-right',
            3: 'bottom-right',
            4: 'bottom-left',
            5: 'left-top',
            6: 'right-top',
            7: 'right-bottom',
            8: 'left-bottom'
        }
    };

    loadImage.ExifMap.prototype.getText = function (id) {
        var value = this.get(id);
        switch (id) {
        case 'LightSource':
        case 'Flash':
        case 'MeteringMode':
        case 'ExposureProgram':
        case 'SensingMethod':
        case 'SceneCaptureType':
        case 'SceneType':
        case 'CustomRendered':
        case 'WhiteBalance':
        case 'GainControl':
        case 'Contrast':
        case 'Saturation':
        case 'Sharpness':
        case 'SubjectDistanceRange':
        case 'FileSource':
        case 'Orientation':
            return this.stringValues[id][value];
        case 'ExifVersion':
        case 'FlashpixVersion':
            return String.fromCharCode(value[0], value[1], value[2], value[3]);
        case 'ComponentsConfiguration':
            return this.stringValues[id][value[0]]
                + this.stringValues[id][value[1]]
                + this.stringValues[id][value[2]]
                + this.stringValues[id][value[3]];
        case 'GPSVersionID':
            return value[0] + '.' + value[1]  + '.' + value[2]  + '.' + value[3];
        }
        return String(value);
    };

    tags = loadImage.ExifMap.prototype.tags;
    map = loadImage.ExifMap.prototype.map;

    // Map the tag names to tags:
    for (prop in tags) {
        if (tags.hasOwnProperty(prop)) {
            map[tags[prop]] = prop;
        }
    }

    loadImage.ExifMap.prototype.getAll = function () {
        var map = {},
            prop,
            id;
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                id = tags[prop];
                if (id) {
                    map[id] = this.getText(id);
                }
            }
        }
        return map;
    };

}));

});
require.register("component-transitionend-property/index.js", function(exports, require, module){
/**
 * Transition-end mapping
 */

var map = {
  'WebkitTransition' : 'webkitTransitionEnd',
  'MozTransition' : 'transitionend',
  'OTransition' : 'oTransitionEnd',
  'msTransition' : 'MSTransitionEnd',
  'transition' : 'transitionend'
};

/**
 * Expose `transitionend`
 */

var el = document.createElement('p');

for (var transition in map) {
  if (null != el.style[transition]) {
    module.exports = map[transition];
    break;
  }
}

});
require.register("touchscaler/index.js", function(exports, require, module){
/*!
 * module deps
 */

var ev = require('event'),
    events = require('events'),
    query = require('query'),
    has3d = require('has-translate3d'),
    transitionend = require('transitionend-property'),
    prefix = require('prefix'),
    loadImage = require('load-image');

/*!
 * module globals
 */

var transform = prefix('transform'),
    transition = prefix('transition'),
    defaults;

defaults = {
  easing: 'ease',
  transitionSpeed: 0.3,
  rotation: false,
  maxScale: 3,
  quality: 3
};


/**
 * get translate or translate3d str
 *
 * @param  {Number} x
 * @param  {Number} y
 * @return {String}
 * @api private
 */

function translate(x, y) {
  if (has3d) return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  return 'translate(' + x + 'px, ' + y + 'px)';
}

/**
 * get rotate str
 *
 * @param  {Number} x
 * @return {String}
 * @api private
 */

function rotate(x) {
  return 'rotate(' + x + 'deg)';
}

/**
 * get scale or scale3d str
 *
 * @param  {Number} x
 * @return {String}
 * @api private
 */

function scale(x) {
  if (has3d) return 'scale3d(' + x + ', ' + x + ', 1)';
  return 'scale(' + x + ')';
}

/**
 * get event page X
 *
 * @param {Event} e
 * @api private
 */

function pageX(e) {
  if (e.pageX) return e.pageX;
  return e.touches[0].pageX;
}

/**
 * get event page Y
 *
 * @param {Event} e
 * @api private
 */

function pageY(e) {
  if (e.pageY) return e.pageY;
  return e.touches[0].pageY;
}

/**
 * Scaler constructor
 *
 * @param {Element} el
 * @param {[Object]} opts
 * @api public
 */

function Scaler(el, opts) {
  this.el = el;

  // init options
  if (!opts) {
    this.opts = defaults;
  } else {
    for (var opt in defaults) {
      if (!this.opts.hasOwnProperty(opt)) this.opts[opt] = defaults[opt];
    }
  }

  // box bounds refs
  this.bounds = query('.scaler-box', el).getBoundingClientRect();

  this.events = events(el, this);
  this.events.bind('touchstart', 'touchstart');
  this.events.bind('touchmove', 'touchmove');
  this.events.bind('touchend', 'touchend');
  this.events.bind('touchcancel', 'touchend');

  this.events.bind('gesturestart', 'gesturestart');
  this.events.bind('gesturechange', 'gesturechange');
  this.events.bind('gestureend', 'gestureend');
  this.events.bind('gesturecancel', 'gestureend');
}

/**
 * remove all events
 */

Scaler.prototype.destroy = function () {
  this.events.unbind();
};

/**
 * create output data
 *
 * @see http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-drawimage
 * @api public
 */

Scaler.prototype.data = function() {
  if (!this.canvas) return;
  var canvas, box, ctx, dh, dw, dx, dy, sh, sw, sx, sy;

  box = this.canvas.getBoundingClientRect();

  // create canvas
  canvas = document.createElement('canvas');
  // canvas.width = this.bounds.width;
  // canvas.height = this.bounds.height;

  canvas.width =  this.opts.quality * this.bounds.width;
  canvas.height = this.opts.quality * this.bounds.height;

  // draw image on canvas
  ctx = canvas.getContext('2d');
  dx = dy = 0;

  dw = canvas.width;
  dh = canvas.height;
  sw = canvas.width / this.state.scale;
  sh = canvas.height / this.state.scale;

  sx = this.opts.quality * (this.bounds.left - box.left) / this.state.scale;
  sy = this.opts.quality * (this.bounds.top - box.top) / this.state.scale;
  ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);

  return {
    transform: this.state,
    filename: this.filename,
    dataURL: canvas.toDataURL()
  };
};

/**
 * load File, Blob object or a simple image URL
 *
 * @param {File|Blob|String} url
 * @api public
 */

Scaler.prototype.loadImage = function (url) {
  var _this = this,
      width = this.el.offsetWidth,
      height = this.el.offsetHeight,
      opts;

  if (url.name) {
    this.filename = url.name;
  } else if ('string' === typeof url) {
    this.filename = url;
  }

  // reset styles
  this.touch = {};
  this.touch.scale = 1;
  this.touch.translateX = 0;
  this.touch.translateY = 0;
  this.touch.rotate = 0;

  // init previous and current data
  ['prev', 'state'].forEach(function (str) {
    this[str] = {};
    this[str].scale = this.touch.scale;
    this[str].rotate = this.touch.rotate;
    this[str].translateX = this.touch.translateX;
    this[str].translateY = this.touch.translateY;
  }, this);

  // load image opts
  opts = {
    maxWidth: this.opts.quality * width,
    maxHeight: this.opts.quality * height,
    orientation: true,
    cover: true,
    canvas: true,
    crossOrigin: true
  };

  loadImage(url, function (canvas) {
    if (canvas.type === 'error') return;
    if (_this.canvas) _this.el.removeChild(_this.canvas);

    // set canvas initial styles
    var canvasWidth = canvas.width / _this.opts.quality,
        canvasHeight = canvas.height / _this.opts.quality;

    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    canvas.style.marginLeft = ((width - canvasWidth) / 2) + 'px';
    canvas.style.marginTop = ((height - canvasHeight) / 2) + 'px';

    // replace existing canvas
    _this.el.insertBefore(canvas, _this.el.firstChild);
    _this.canvas = canvas;
    _this.updateStyle();

  }, opts);
};

/**
 * check if current transform is in bound
 *
 * @return {Boolean}
 * @api private
 */

Scaler.prototype.acceptTransform = function() {
  if (this.state.scale > this.opts.maxScale) return false;

  var box = this.canvas.getBoundingClientRect(),
      bounds = this.bounds;

  return box.top <= bounds.top
      && box.left <= bounds.left
      && box.right >= bounds.right
      && box.bottom >= bounds.bottom;
};

/**
 * store values on touchstart
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.touchstart = function(e) {
  this.touch.touchmove = this.touch.touchstart = e;
};

/**
 * transform canvas on touchmove
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.touchmove = function(e) {
  // prevent scrolling
  e.preventDefault();

  if ( Math.abs(pageX(e) - pageX(this.touch.touchmove)) > 30
    || Math.abs(pageY(e) - pageY(this.touch.touchmove)) > 30) return;

  this.touch.touchmove = e;
  this.state.translateX = this.touch.translateX + pageX(e)
                      - pageX(this.touch.touchstart);

  this.state.translateY = this.touch.translateY + pageY(e)
                      - pageY(this.touch.touchstart);

  // update styles with current values
  this.updateStyle();

  if (this.acceptTransform()) {

    // update previous values with current
    this.prev.translateX = this.state.translateX;
    this.prev.translateY = this.state.translateY;
  }
};

/**
 * restore invalid translate values on touchend
 * @api private
 */

Scaler.prototype.touchend = function() {
  var _this = this;

  function removeStyle() {
    _this.canvas.style[transition] = '';
    ev.unbind(_this.canvas, transitionend, removeStyle);
  }

  // restore previous values
  if (this.acceptTransform()) {
    this.touch.translateX = this.state.translateX;
    this.touch.translateY = this.state.translateY;
  } else {
    this.state.translateX = this.touch.translateX = this.prev.translateX;
    this.state.translateY = this.touch.translateY = this.prev.translateY;
    ev.bind(this.canvas, transitionend, removeStyle);
    this.canvas.style[transition] = 'all '
                              + this.opts.transitionSpeed + 's '
                              + this.opts.easing;

    this.updateStyle();
  }
};

/**
 * save gesture values on gesturestart
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.gesturestart = function(e) {
  this.touch.gesturestart = e;
};

/**
 * transform on gesturechange
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.gesturechange = function(e) {
  this.state.scale = this.touch.scale
                 + this.touch.scale * (e.scale - this.touch.gesturestart.scale);

  if (this.opts.rotate) {
    this.state.rotate = this.touch.rotate + e.rotation
                    - this.touch.gesturestart.rotation;
  }

  this.updateStyle();

  if (this.acceptTransform()) {
    this.prev.scale = this.state.scale;
    this.prev.rotate = this.state.rotate;
  }
};

/**
 * restore invalid values on gesturend
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.gestureend = function() {
  var _this = this;

  function removeStyle() {
    _this.canvas.style[transition] = '';
    ev.unbind(_this.canvas, transitionend, removeStyle);
  }

  // restore previous values
  if (this.acceptTransform()) {
    this.touch.scale  = this.state.scale;
    this.touch.rotate = this.state.rotate;
  } else {
    this.state.scale = this.touch.scale = this.prev.scale;
    this.state.rotate = this.touch.rotate = this.prev.rotate;

    ev.bind(this.canvas, transitionend, removeStyle);
    this.canvas.style[transition] = 'all '
                                  + this.opts.transitionSpeed + 's '
                                  + this.opts.easing;
    this.updateStyle();
  }
};

/**
 * apply css transforms
 *
 * @api private
 */

Scaler.prototype.updateStyle = function() {
  this.canvas.style[transform] = [
    translate(this.state.translateX,  this.state.translateY),
    scale(this.state.scale),
    rotate(this.state.rotate)
  ].join(' ');
};

/**
 * set state and update style
 *
 * @api public
 */

Scaler.prototype.setState = function(state) {
  this.state = state;
  this.updateStyle();
};

/*!
 * module exports
 */

module.exports = Scaler;
});














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

require.alias("pgherveou-load-image/js/index.js", "touchscaler/deps/load-image/js/index.js");
require.alias("pgherveou-load-image/js/load-image.js", "touchscaler/deps/load-image/js/load-image.js");
require.alias("pgherveou-load-image/js/load-image-ios.js", "touchscaler/deps/load-image/js/load-image-ios.js");
require.alias("pgherveou-load-image/js/load-image-orientation.js", "touchscaler/deps/load-image/js/load-image-orientation.js");
require.alias("pgherveou-load-image/js/load-image-meta.js", "touchscaler/deps/load-image/js/load-image-meta.js");
require.alias("pgherveou-load-image/js/load-image-exif.js", "touchscaler/deps/load-image/js/load-image-exif.js");
require.alias("pgherveou-load-image/js/load-image-exif-map.js", "touchscaler/deps/load-image/js/load-image-exif-map.js");
require.alias("pgherveou-load-image/js/index.js", "touchscaler/deps/load-image/index.js");
require.alias("pgherveou-load-image/js/index.js", "load-image/index.js");
require.alias("pgherveou-load-image/js/index.js", "pgherveou-load-image/index.js");
require.alias("component-transitionend-property/index.js", "touchscaler/deps/transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "touchscaler/deps/transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "transitionend-property/index.js");
require.alias("component-transitionend-property/index.js", "component-transitionend-property/index.js");
require.alias("touchscaler/index.js", "touchscaler/index.js");if (typeof exports == "object") {
  module.exports = require("touchscaler");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("touchscaler"); });
} else {
  this["touchscaler"] = require("touchscaler");
}})();