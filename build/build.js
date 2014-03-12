
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
require.register("eightmedia-hammer.js/hammer.js", Function("exports, require, module",
"/*! Hammer.JS - v1.0.7 - 2014-03-11\n\
 * http://eightmedia.github.com/hammer.js\n\
 *\n\
 * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;\n\
 * Licensed under the MIT license */\n\
\n\
(function(window, undefined) {\n\
  'use strict';\n\
\n\
/**\n\
 * Hammer\n\
 * use this to create instances\n\
 * @param   {HTMLElement}   element\n\
 * @param   {Object}        options\n\
 * @returns {Hammer.Instance}\n\
 * @constructor\n\
 */\n\
var Hammer = function(element, options) {\n\
  return new Hammer.Instance(element, options || {});\n\
};\n\
\n\
// default settings\n\
Hammer.defaults = {\n\
  // add styles and attributes to the element to prevent the browser from doing\n\
  // its native behavior. this doesnt prevent the scrolling, but cancels\n\
  // the contextmenu, tap highlighting etc\n\
  // set to false to disable this\n\
  stop_browser_behavior: {\n\
    // this also triggers onselectstart=false for IE\n\
    userSelect       : 'none',\n\
    // this makes the element blocking in IE10 >, you could experiment with the value\n\
    // see for more options this issue; https://github.com/EightMedia/hammer.js/issues/241\n\
    touchAction      : 'none',\n\
    touchCallout     : 'none',\n\
    contentZooming   : 'none',\n\
    userDrag         : 'none',\n\
    tapHighlightColor: 'rgba(0,0,0,0)'\n\
  }\n\
\n\
  //\n\
  // more settings are defined per gesture at gestures.js\n\
  //\n\
};\n\
\n\
// detect touchevents\n\
Hammer.HAS_POINTEREVENTS = window.navigator.pointerEnabled || window.navigator.msPointerEnabled;\n\
Hammer.HAS_TOUCHEVENTS = ('ontouchstart' in window);\n\
\n\
// dont use mouseevents on mobile devices\n\
Hammer.MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android|silk/i;\n\
Hammer.NO_MOUSEEVENTS = Hammer.HAS_TOUCHEVENTS && window.navigator.userAgent.match(Hammer.MOBILE_REGEX);\n\
\n\
// eventtypes per touchevent (start, move, end)\n\
// are filled by Hammer.event.determineEventTypes on setup\n\
Hammer.EVENT_TYPES = {};\n\
\n\
// direction defines\n\
Hammer.DIRECTION_DOWN = 'down';\n\
Hammer.DIRECTION_LEFT = 'left';\n\
Hammer.DIRECTION_UP = 'up';\n\
Hammer.DIRECTION_RIGHT = 'right';\n\
\n\
// pointer type\n\
Hammer.POINTER_MOUSE = 'mouse';\n\
Hammer.POINTER_TOUCH = 'touch';\n\
Hammer.POINTER_PEN = 'pen';\n\
\n\
// interval in which Hammer recalculates current velocity in ms\n\
Hammer.UPDATE_VELOCITY_INTERVAL = 16;\n\
\n\
// touch event defines\n\
Hammer.EVENT_START = 'start';\n\
Hammer.EVENT_MOVE = 'move';\n\
Hammer.EVENT_END = 'end';\n\
\n\
// hammer document where the base events are added at\n\
Hammer.DOCUMENT = window.document;\n\
\n\
// plugins and gestures namespaces\n\
Hammer.plugins = Hammer.plugins || {};\n\
Hammer.gestures = Hammer.gestures || {};\n\
\n\
\n\
// if the window events are set...\n\
Hammer.READY = false;\n\
\n\
/**\n\
 * setup events to detect gestures on the document\n\
 */\n\
function setup() {\n\
  if(Hammer.READY) {\n\
    return;\n\
  }\n\
\n\
  // find what eventtypes we add listeners to\n\
  Hammer.event.determineEventTypes();\n\
\n\
  // Register all gestures inside Hammer.gestures\n\
  Hammer.utils.each(Hammer.gestures, function(gesture){\n\
    Hammer.detection.register(gesture);\n\
  });\n\
\n\
  // Add touch events on the document\n\
  Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_MOVE, Hammer.detection.detect);\n\
  Hammer.event.onTouch(Hammer.DOCUMENT, Hammer.EVENT_END, Hammer.detection.detect);\n\
\n\
  // Hammer is ready...!\n\
  Hammer.READY = true;\n\
}\n\
\n\
Hammer.utils = {\n\
  /**\n\
   * extend method,\n\
   * also used for cloning when dest is an empty object\n\
   * @param   {Object}    dest\n\
   * @param   {Object}    src\n\
   * @parm  {Boolean}  merge    do a merge\n\
   * @returns {Object}    dest\n\
   */\n\
  extend: function extend(dest, src, merge) {\n\
    for(var key in src) {\n\
      if(dest[key] !== undefined && merge) {\n\
        continue;\n\
      }\n\
      dest[key] = src[key];\n\
    }\n\
    return dest;\n\
  },\n\
\n\
\n\
  /**\n\
   * for each\n\
   * @param obj\n\
   * @param iterator\n\
   */\n\
  each: function(obj, iterator, context) {\n\
    var i, o;\n\
    // native forEach on arrays\n\
    if ('forEach' in obj) {\n\
      obj.forEach(iterator, context);\n\
    }\n\
    // arrays\n\
    else if(obj.length !== undefined) {\n\
      for(i=-1; (o=obj[++i]);) {\n\
        if (iterator.call(context, o, i, obj) === false) {\n\
          return;\n\
        }\n\
      }\n\
    }\n\
    // objects\n\
    else {\n\
      for(i in obj) {\n\
        if(obj.hasOwnProperty(i) &&\n\
            iterator.call(context, obj[i], i, obj) === false) {\n\
          return;\n\
        }\n\
      }\n\
    }\n\
  },\n\
\n\
  /**\n\
   * find if a node is in the given parent\n\
   * used for event delegation tricks\n\
   * @param   {HTMLElement}   node\n\
   * @param   {HTMLElement}   parent\n\
   * @returns {boolean}       has_parent\n\
   */\n\
  hasParent: function(node, parent) {\n\
    while(node) {\n\
      if(node == parent) {\n\
        return true;\n\
      }\n\
      node = node.parentNode;\n\
    }\n\
    return false;\n\
  },\n\
\n\
\n\
  /**\n\
   * get the center of all the touches\n\
   * @param   {Array}     touches\n\
   * @returns {Object}    center\n\
   */\n\
  getCenter: function getCenter(touches) {\n\
    var valuesX = [], valuesY = [];\n\
\n\
    Hammer.utils.each(touches, function(touch) {\n\
      // I prefer clientX because it ignore the scrolling position\n\
      valuesX.push(typeof touch.clientX !== 'undefined' ? touch.clientX : touch.pageX);\n\
      valuesY.push(typeof touch.clientY !== 'undefined' ? touch.clientY : touch.pageY);\n\
    });\n\
\n\
    return {\n\
      pageX: (Math.min.apply(Math, valuesX) + Math.max.apply(Math, valuesX)) / 2,\n\
      pageY: (Math.min.apply(Math, valuesY) + Math.max.apply(Math, valuesY)) / 2\n\
    };\n\
  },\n\
\n\
\n\
  /**\n\
   * calculate the velocity between two points\n\
   * @param   {Number}    delta_time\n\
   * @param   {Number}    delta_x\n\
   * @param   {Number}    delta_y\n\
   * @returns {Object}    velocity\n\
   */\n\
  getVelocity: function getVelocity(delta_time, delta_x, delta_y) {\n\
    return {\n\
      x: Math.abs(delta_x / delta_time) || 0,\n\
      y: Math.abs(delta_y / delta_time) || 0\n\
    };\n\
  },\n\
\n\
\n\
  /**\n\
   * calculate the angle between two coordinates\n\
   * @param   {Touch}     touch1\n\
   * @param   {Touch}     touch2\n\
   * @returns {Number}    angle\n\
   */\n\
  getAngle: function getAngle(touch1, touch2) {\n\
    var y = touch2.pageY - touch1.pageY,\n\
      x = touch2.pageX - touch1.pageX;\n\
    return Math.atan2(y, x) * 180 / Math.PI;\n\
  },\n\
\n\
\n\
  /**\n\
   * angle to direction define\n\
   * @param   {Touch}     touch1\n\
   * @param   {Touch}     touch2\n\
   * @returns {String}    direction constant, like Hammer.DIRECTION_LEFT\n\
   */\n\
  getDirection: function getDirection(touch1, touch2) {\n\
    var x = Math.abs(touch1.pageX - touch2.pageX),\n\
      y = Math.abs(touch1.pageY - touch2.pageY);\n\
\n\
    if(x >= y) {\n\
      return touch1.pageX - touch2.pageX > 0 ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;\n\
    }\n\
    return touch1.pageY - touch2.pageY > 0 ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;\n\
  },\n\
\n\
\n\
  /**\n\
   * calculate the distance between two touches\n\
   * @param   {Touch}     touch1\n\
   * @param   {Touch}     touch2\n\
   * @returns {Number}    distance\n\
   */\n\
  getDistance: function getDistance(touch1, touch2) {\n\
    var x = touch2.pageX - touch1.pageX,\n\
      y = touch2.pageY - touch1.pageY;\n\
    return Math.sqrt((x * x) + (y * y));\n\
  },\n\
\n\
\n\
  /**\n\
   * calculate the scale factor between two touchLists (fingers)\n\
   * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out\n\
   * @param   {Array}     start\n\
   * @param   {Array}     end\n\
   * @returns {Number}    scale\n\
   */\n\
  getScale: function getScale(start, end) {\n\
    // need two fingers...\n\
    if(start.length >= 2 && end.length >= 2) {\n\
      return this.getDistance(end[0], end[1]) /\n\
        this.getDistance(start[0], start[1]);\n\
    }\n\
    return 1;\n\
  },\n\
\n\
\n\
  /**\n\
   * calculate the rotation degrees between two touchLists (fingers)\n\
   * @param   {Array}     start\n\
   * @param   {Array}     end\n\
   * @returns {Number}    rotation\n\
   */\n\
  getRotation: function getRotation(start, end) {\n\
    // need two fingers\n\
    if(start.length >= 2 && end.length >= 2) {\n\
      return this.getAngle(end[1], end[0]) -\n\
        this.getAngle(start[1], start[0]);\n\
    }\n\
    return 0;\n\
  },\n\
\n\
\n\
  /**\n\
   * boolean if the direction is vertical\n\
   * @param    {String}    direction\n\
   * @returns  {Boolean}   is_vertical\n\
   */\n\
  isVertical: function isVertical(direction) {\n\
    return direction == Hammer.DIRECTION_UP || direction == Hammer.DIRECTION_DOWN;\n\
  },\n\
\n\
\n\
  /**\n\
   * toggle browser default behavior with css props\n\
   * @param   {HtmlElement}   element\n\
   * @param   {Object}        css_props\n\
   * @param   {Boolean}       toggle\n\
   */\n\
  toggleDefaultBehavior: function toggleDefaultBehavior(element, css_props, toggle) {\n\
    if(!css_props || !element || !element.style) {\n\
      return;\n\
    }\n\
\n\
    // with css properties for modern browsers\n\
    Hammer.utils.each(['webkit', 'moz', 'Moz', 'ms', 'o', ''], function(vendor) {\n\
      Hammer.utils.each(css_props, function(value, prop) {\n\
          // vender prefix at the property\n\
          if(vendor) {\n\
            prop = vendor + prop.substring(0, 1).toUpperCase() + prop.substring(1);\n\
          }\n\
          // set the style\n\
          if(prop in element.style) {\n\
            element.style[prop] = !toggle && value;\n\
          }\n\
      });\n\
    });\n\
\n\
    // also the disable onselectstart\n\
    if(css_props.userSelect == 'none') {\n\
      element.onselectstart = !toggle && function(){ return false; };\n\
    }\n\
    // and disable ondragstart\n\
    if(css_props.userDrag == 'none') {\n\
      element.ondragstart = !toggle && function(){ return false; };\n\
    }\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * create new hammer instance\n\
 * all methods should return the instance itself, so it is chainable.\n\
 * @param   {HTMLElement}       element\n\
 * @param   {Object}            [options={}]\n\
 * @returns {Hammer.Instance}\n\
 * @constructor\n\
 */\n\
Hammer.Instance = function(element, options) {\n\
  var self = this;\n\
\n\
  // setup HammerJS window events and register all gestures\n\
  // this also sets up the default options\n\
  setup();\n\
\n\
  this.element = element;\n\
\n\
  // start/stop detection option\n\
  this.enabled = true;\n\
\n\
  // merge options\n\
  this.options = Hammer.utils.extend(\n\
    Hammer.utils.extend({}, Hammer.defaults),\n\
    options || {});\n\
\n\
  // add some css to the element to prevent the browser from doing its native behavoir\n\
  if(this.options.stop_browser_behavior) {\n\
    Hammer.utils.toggleDefaultBehavior(this.element, this.options.stop_browser_behavior, false);\n\
  }\n\
\n\
  // start detection on touchstart\n\
  this.eventStartHandler = Hammer.event.onTouch(element, Hammer.EVENT_START, function(ev) {\n\
    if(self.enabled) {\n\
      Hammer.detection.startDetect(self, ev);\n\
    }\n\
  });\n\
\n\
  // keep a list of user event handlers which needs to be removed when calling 'dispose'\n\
  this.eventHandlers = [];\n\
\n\
  // return instance\n\
  return this;\n\
};\n\
\n\
\n\
Hammer.Instance.prototype = {\n\
  /**\n\
   * bind events to the instance\n\
   * @param   {String}      gesture\n\
   * @param   {Function}    handler\n\
   * @returns {Hammer.Instance}\n\
   */\n\
  on: function onEvent(gesture, handler) {\n\
    var gestures = gesture.split(' ');\n\
    Hammer.utils.each(gestures, function(gesture) {\n\
      this.element.addEventListener(gesture, handler, false);\n\
      this.eventHandlers.push({ gesture: gesture, handler: handler });\n\
    }, this);\n\
    return this;\n\
  },\n\
\n\
\n\
  /**\n\
   * unbind events to the instance\n\
   * @param   {String}      gesture\n\
   * @param   {Function}    handler\n\
   * @returns {Hammer.Instance}\n\
   */\n\
  off: function offEvent(gesture, handler) {\n\
    var gestures = gesture.split(' '),\n\
      i, eh;\n\
    Hammer.utils.each(gestures, function(gesture) {\n\
      this.element.removeEventListener(gesture, handler, false);\n\
\n\
      // remove the event handler from the internal list\n\
      for(i=-1; (eh=this.eventHandlers[++i]);) {\n\
        if(eh.gesture === gesture && eh.handler === handler) {\n\
          this.eventHandlers.splice(i, 1);\n\
        }\n\
      }\n\
    }, this);\n\
    return this;\n\
  },\n\
\n\
\n\
  /**\n\
   * trigger gesture event\n\
   * @param   {String}      gesture\n\
   * @param   {Object}      [eventData]\n\
   * @returns {Hammer.Instance}\n\
   */\n\
  trigger: function triggerEvent(gesture, eventData) {\n\
    // optional\n\
    if(!eventData) {\n\
      eventData = {};\n\
    }\n\
\n\
    // create DOM event\n\
    var event = Hammer.DOCUMENT.createEvent('Event');\n\
    event.initEvent(gesture, true, true);\n\
    event.gesture = eventData;\n\
\n\
    // trigger on the target if it is in the instance element,\n\
    // this is for event delegation tricks\n\
    var element = this.element;\n\
    if(Hammer.utils.hasParent(eventData.target, element)) {\n\
      element = eventData.target;\n\
    }\n\
\n\
    element.dispatchEvent(event);\n\
    return this;\n\
  },\n\
\n\
\n\
  /**\n\
   * enable of disable hammer.js detection\n\
   * @param   {Boolean}   state\n\
   * @returns {Hammer.Instance}\n\
   */\n\
  enable: function enable(state) {\n\
    this.enabled = state;\n\
    return this;\n\
  },\n\
\n\
\n\
  /**\n\
   * dispose this hammer instance\n\
   * @returns {Hammer.Instance}\n\
   */\n\
  dispose: function dispose() {\n\
    var i, eh;\n\
\n\
    // undo all changes made by stop_browser_behavior\n\
    if(this.options.stop_browser_behavior) {\n\
      Hammer.utils.toggleDefaultBehavior(this.element, this.options.stop_browser_behavior, true);\n\
    }\n\
\n\
    // unbind all custom event handlers\n\
    for(i=-1; (eh=this.eventHandlers[++i]);) {\n\
      this.element.removeEventListener(eh.gesture, eh.handler, false);\n\
    }\n\
    this.eventHandlers = [];\n\
\n\
    // unbind the start event listener\n\
    Hammer.event.unbindDom(this.element, Hammer.EVENT_TYPES[Hammer.EVENT_START], this.eventStartHandler);\n\
\n\
    return null;\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * this holds the last move event,\n\
 * used to fix empty touchend issue\n\
 * see the onTouch event for an explanation\n\
 * @type {Object}\n\
 */\n\
var last_move_event = null;\n\
\n\
/**\n\
 * when the mouse is hold down, this is true\n\
 * @type {Boolean}\n\
 */\n\
var enable_detect = false;\n\
\n\
/**\n\
 * when touch events have been fired, this is true\n\
 * @type {Boolean}\n\
 */\n\
var touch_triggered = false;\n\
\n\
\n\
Hammer.event = {\n\
  /**\n\
   * simple addEventListener\n\
   * @param   {HTMLElement}   element\n\
   * @param   {String}        type\n\
   * @param   {Function}      handler\n\
   */\n\
  bindDom: function(element, type, handler) {\n\
    var types = type.split(' ');\n\
    Hammer.utils.each(types, function(type){\n\
      element.addEventListener(type, handler, false);\n\
    });\n\
  },\n\
\n\
\n\
  /**\n\
   * simple removeEventListener\n\
   * @param   {HTMLElement}   element\n\
   * @param   {String}        type\n\
   * @param   {Function}      handler\n\
   */\n\
  unbindDom: function(element, type, handler) {\n\
    var types = type.split(' ');\n\
    Hammer.utils.each(types, function(type){\n\
      element.removeEventListener(type, handler, false);\n\
    });\n\
  },\n\
\n\
\n\
  /**\n\
   * touch events with mouse fallback\n\
   * @param   {HTMLElement}   element\n\
   * @param   {String}        eventType        like Hammer.EVENT_MOVE\n\
   * @param   {Function}      handler\n\
   */\n\
  onTouch: function onTouch(element, eventType, handler) {\n\
    var self = this;\n\
\n\
    var bindDomOnTouch = function(ev) {\n\
      var srcEventType = ev.type.toLowerCase();\n\
\n\
      // onmouseup, but when touchend has been fired we do nothing.\n\
      // this is for touchdevices which also fire a mouseup on touchend\n\
      if(srcEventType.match(/mouse/) && touch_triggered) {\n\
        return;\n\
      }\n\
\n\
      // mousebutton must be down or a touch event\n\
      else if(srcEventType.match(/touch/) ||   // touch events are always on screen\n\
        srcEventType.match(/pointerdown/) || // pointerevents touch\n\
        (srcEventType.match(/mouse/) && ev.which === 1)   // mouse is pressed\n\
        ) {\n\
        enable_detect = true;\n\
      }\n\
\n\
      // mouse isn't pressed\n\
      else if(srcEventType.match(/mouse/) && !ev.which) {\n\
        enable_detect = false;\n\
      }\n\
\n\
\n\
      // we are in a touch event, set the touch triggered bool to true,\n\
      // this for the conflicts that may occur on ios and android\n\
      if(srcEventType.match(/touch|pointer/)) {\n\
        touch_triggered = true;\n\
      }\n\
\n\
      // count the total touches on the screen\n\
      var count_touches = 0;\n\
\n\
      // when touch has been triggered in this detection session\n\
      // and we are now handling a mouse event, we stop that to prevent conflicts\n\
      if(enable_detect) {\n\
        // update pointerevent\n\
        if(Hammer.HAS_POINTEREVENTS && eventType != Hammer.EVENT_END) {\n\
          count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);\n\
        }\n\
        // touch\n\
        else if(srcEventType.match(/touch/)) {\n\
          count_touches = ev.touches.length;\n\
        }\n\
        // mouse\n\
        else if(!touch_triggered) {\n\
          count_touches = srcEventType.match(/up/) ? 0 : 1;\n\
        }\n\
\n\
        // if we are in a end event, but when we remove one touch and\n\
        // we still have enough, set eventType to move\n\
        if(count_touches > 0 && eventType == Hammer.EVENT_END) {\n\
          eventType = Hammer.EVENT_MOVE;\n\
        }\n\
        // no touches, force the end event\n\
        else if(!count_touches) {\n\
          eventType = Hammer.EVENT_END;\n\
        }\n\
\n\
        // store the last move event\n\
        if(count_touches || last_move_event === null) {\n\
          last_move_event = ev;\n\
        }\n\
\n\
        // trigger the handler\n\
        handler.call(Hammer.detection,\n\
                     self.collectEventData(element, eventType,\n\
                                           self.getTouchList(last_move_event, eventType),\n\
                                           ev));\n\
\n\
        // remove pointerevent from list\n\
        if(Hammer.HAS_POINTEREVENTS && eventType == Hammer.EVENT_END) {\n\
          count_touches = Hammer.PointerEvent.updatePointer(eventType, ev);\n\
        }\n\
      }\n\
\n\
      // on the end we reset everything\n\
      if(!count_touches) {\n\
        last_move_event = null;\n\
        enable_detect = false;\n\
        touch_triggered = false;\n\
        Hammer.PointerEvent.reset();\n\
      }\n\
    };\n\
\n\
    this.bindDom(element, Hammer.EVENT_TYPES[eventType], bindDomOnTouch);\n\
\n\
    // return the bound function to be able to unbind it later\n\
    return bindDomOnTouch;\n\
  },\n\
\n\
\n\
  /**\n\
   * we have different events for each device/browser\n\
   * determine what we need and set them in the Hammer.EVENT_TYPES constant\n\
   */\n\
  determineEventTypes: function determineEventTypes() {\n\
    // determine the eventtype we want to set\n\
    var types;\n\
\n\
    // pointerEvents magic\n\
    if(Hammer.HAS_POINTEREVENTS) {\n\
      types = Hammer.PointerEvent.getEvents();\n\
    }\n\
    // on Android, iOS, blackberry, windows mobile we dont want any mouseevents\n\
    else if(Hammer.NO_MOUSEEVENTS) {\n\
      types = [\n\
        'touchstart',\n\
        'touchmove',\n\
        'touchend touchcancel'];\n\
    }\n\
    // for non pointer events browsers and mixed browsers,\n\
    // like chrome on windows8 touch laptop\n\
    else {\n\
      types = [\n\
        'touchstart mousedown',\n\
        'touchmove mousemove',\n\
        'touchend touchcancel mouseup'];\n\
    }\n\
\n\
    Hammer.EVENT_TYPES[Hammer.EVENT_START] = types[0];\n\
    Hammer.EVENT_TYPES[Hammer.EVENT_MOVE] = types[1];\n\
    Hammer.EVENT_TYPES[Hammer.EVENT_END] = types[2];\n\
  },\n\
\n\
\n\
  /**\n\
   * create touchlist depending on the event\n\
   * @param   {Object}    ev\n\
   * @param   {String}    eventType   used by the fakemultitouch plugin\n\
   */\n\
  getTouchList: function getTouchList(ev/*, eventType*/) {\n\
    // get the fake pointerEvent touchlist\n\
    if(Hammer.HAS_POINTEREVENTS) {\n\
      return Hammer.PointerEvent.getTouchList();\n\
    }\n\
    // get the touchlist\n\
    else if(ev.touches) {\n\
      return ev.touches;\n\
    }\n\
    // make fake touchlist from mouse position\n\
    else {\n\
      ev.identifier = 1;\n\
      return [ev];\n\
    }\n\
  },\n\
\n\
\n\
  /**\n\
   * collect event data for Hammer js\n\
   * @param   {HTMLElement}   element\n\
   * @param   {String}        eventType        like Hammer.EVENT_MOVE\n\
   * @param   {Object}        eventData\n\
   */\n\
  collectEventData: function collectEventData(element, eventType, touches, ev) {\n\
    // find out pointerType\n\
    var pointerType = Hammer.POINTER_TOUCH;\n\
    if(ev.type.match(/mouse/) || Hammer.PointerEvent.matchType(Hammer.POINTER_MOUSE, ev)) {\n\
      pointerType = Hammer.POINTER_MOUSE;\n\
    }\n\
\n\
    return {\n\
      center     : Hammer.utils.getCenter(touches),\n\
      timeStamp  : new Date().getTime(),\n\
      target     : ev.target,\n\
      touches    : touches,\n\
      eventType  : eventType,\n\
      pointerType: pointerType,\n\
      srcEvent   : ev,\n\
\n\
      /**\n\
       * prevent the browser default actions\n\
       * mostly used to disable scrolling of the browser\n\
       */\n\
      preventDefault: function() {\n\
        if(this.srcEvent.preventManipulation) {\n\
          this.srcEvent.preventManipulation();\n\
        }\n\
\n\
        if(this.srcEvent.preventDefault) {\n\
          this.srcEvent.preventDefault();\n\
        }\n\
      },\n\
\n\
      /**\n\
       * stop bubbling the event up to its parents\n\
       */\n\
      stopPropagation: function() {\n\
        this.srcEvent.stopPropagation();\n\
      },\n\
\n\
      /**\n\
       * immediately stop gesture detection\n\
       * might be useful after a swipe was detected\n\
       * @return {*}\n\
       */\n\
      stopDetect: function() {\n\
        return Hammer.detection.stopDetect();\n\
      }\n\
    };\n\
  }\n\
};\n\
\n\
Hammer.PointerEvent = {\n\
  /**\n\
   * holds all pointers\n\
   * @type {Object}\n\
   */\n\
  pointers: {},\n\
\n\
  /**\n\
   * get a list of pointers\n\
   * @returns {Array}     touchlist\n\
   */\n\
  getTouchList: function() {\n\
    var self = this;\n\
    var touchlist = [];\n\
\n\
    // we can use forEach since pointerEvents only is in IE10\n\
    Hammer.utils.each(self.pointers, function(pointer){\n\
      touchlist.push(pointer);\n\
    });\n\
\n\
    return touchlist;\n\
  },\n\
\n\
  /**\n\
   * update the position of a pointer\n\
   * @param   {String}   type             Hammer.EVENT_END\n\
   * @param   {Object}   pointerEvent\n\
   */\n\
  updatePointer: function(type, pointerEvent) {\n\
    if(type == Hammer.EVENT_END) {\n\
      delete this.pointers[pointerEvent.pointerId];\n\
    }\n\
    else {\n\
      pointerEvent.identifier = pointerEvent.pointerId;\n\
      this.pointers[pointerEvent.pointerId] = pointerEvent;\n\
    }\n\
\n\
    return Object.keys(this.pointers).length;\n\
  },\n\
\n\
  /**\n\
   * check if ev matches pointertype\n\
   * @param   {String}        pointerType     Hammer.POINTER_MOUSE\n\
   * @param   {PointerEvent}  ev\n\
   */\n\
  matchType: function(pointerType, ev) {\n\
    if(!ev.pointerType) {\n\
      return false;\n\
    }\n\
\n\
    var pt = ev.pointerType,\n\
      types = {};\n\
    types[Hammer.POINTER_MOUSE] = (pt === ev.MSPOINTER_TYPE_MOUSE || pt === Hammer.POINTER_MOUSE);\n\
    types[Hammer.POINTER_TOUCH] = (pt === ev.MSPOINTER_TYPE_TOUCH || pt === Hammer.POINTER_TOUCH);\n\
    types[Hammer.POINTER_PEN] = (pt === ev.MSPOINTER_TYPE_PEN || pt === Hammer.POINTER_PEN);\n\
    return types[pointerType];\n\
  },\n\
\n\
\n\
  /**\n\
   * get events\n\
   */\n\
  getEvents: function() {\n\
    return [\n\
      'pointerdown MSPointerDown',\n\
      'pointermove MSPointerMove',\n\
      'pointerup pointercancel MSPointerUp MSPointerCancel'\n\
    ];\n\
  },\n\
\n\
  /**\n\
   * reset the list\n\
   */\n\
  reset: function() {\n\
    this.pointers = {};\n\
  }\n\
};\n\
\n\
\n\
Hammer.detection = {\n\
  // contains all registred Hammer.gestures in the correct order\n\
  gestures: [],\n\
\n\
  // data of the current Hammer.gesture detection session\n\
  current : null,\n\
\n\
  // the previous Hammer.gesture session data\n\
  // is a full clone of the previous gesture.current object\n\
  previous: null,\n\
\n\
  // when this becomes true, no gestures are fired\n\
  stopped : false,\n\
\n\
\n\
  /**\n\
   * start Hammer.gesture detection\n\
   * @param   {Hammer.Instance}   inst\n\
   * @param   {Object}            eventData\n\
   */\n\
  startDetect: function startDetect(inst, eventData) {\n\
    // already busy with a Hammer.gesture detection on an element\n\
    if(this.current) {\n\
      return;\n\
    }\n\
\n\
    this.stopped = false;\n\
\n\
    this.current = {\n\
      inst      : inst, // reference to HammerInstance we're working for\n\
      startEvent: Hammer.utils.extend({}, eventData), // start eventData for distances, timing etc\n\
      lastEvent : false, // last eventData\n\
      lastVEvent: false, // last eventData for velocity.\n\
      velocity  : false, // current velocity\n\
      name      : '' // current gesture we're in/detected, can be 'tap', 'hold' etc\n\
    };\n\
\n\
    this.detect(eventData);\n\
  },\n\
\n\
\n\
  /**\n\
   * Hammer.gesture detection\n\
   * @param   {Object}    eventData\n\
   */\n\
  detect: function detect(eventData) {\n\
    if(!this.current || this.stopped) {\n\
      return;\n\
    }\n\
\n\
    // extend event data with calculations about scale, distance etc\n\
    eventData = this.extendEventData(eventData);\n\
\n\
    // instance options\n\
    var inst_options = this.current.inst.options;\n\
\n\
    // call Hammer.gesture handlers\n\
    Hammer.utils.each(this.gestures, function(gesture) {\n\
      // only when the instance options have enabled this gesture\n\
      if(!this.stopped && inst_options[gesture.name] !== false) {\n\
        // if a handler returns false, we stop with the detection\n\
        if(gesture.handler.call(gesture, eventData, this.current.inst) === false) {\n\
          this.stopDetect();\n\
          return false;\n\
        }\n\
      }\n\
    }, this);\n\
\n\
    // store as previous event event\n\
    if(this.current) {\n\
      this.current.lastEvent = eventData;\n\
    }\n\
\n\
    // endevent, but not the last touch, so dont stop\n\
    if(eventData.eventType == Hammer.EVENT_END && !eventData.touches.length - 1) {\n\
      this.stopDetect();\n\
    }\n\
\n\
    return eventData;\n\
  },\n\
\n\
\n\
  /**\n\
   * clear the Hammer.gesture vars\n\
   * this is called on endDetect, but can also be used when a final Hammer.gesture has been detected\n\
   * to stop other Hammer.gestures from being fired\n\
   */\n\
  stopDetect: function stopDetect() {\n\
    // clone current data to the store as the previous gesture\n\
    // used for the double tap gesture, since this is an other gesture detect session\n\
    this.previous = Hammer.utils.extend({}, this.current);\n\
\n\
    // reset the current\n\
    this.current = null;\n\
\n\
    // stopped!\n\
    this.stopped = true;\n\
  },\n\
\n\
\n\
  /**\n\
   * extend eventData for Hammer.gestures\n\
   * @param   {Object}   ev\n\
   * @returns {Object}   ev\n\
   */\n\
  extendEventData: function extendEventData(ev) {\n\
    var startEv = this.current.startEvent,\n\
        lastVEv = this.current.lastVEvent;\n\
\n\
    // if the touches change, set the new touches over the startEvent touches\n\
    // this because touchevents don't have all the touches on touchstart, or the\n\
    // user must place his fingers at the EXACT same time on the screen, which is not realistic\n\
    // but, sometimes it happens that both fingers are touching at the EXACT same time\n\
    if(startEv && (ev.touches.length != startEv.touches.length || ev.touches === startEv.touches)) {\n\
      // extend 1 level deep to get the touchlist with the touch objects\n\
      startEv.touches = [];\n\
      Hammer.utils.each(ev.touches, function(touch) {\n\
        startEv.touches.push(Hammer.utils.extend({}, touch));\n\
      });\n\
    }\n\
\n\
    var delta_time = ev.timeStamp - startEv.timeStamp\n\
      , delta_x = ev.center.pageX - startEv.center.pageX\n\
      , delta_y = ev.center.pageY - startEv.center.pageY\n\
      , interimAngle\n\
      , interimDirection\n\
      , velocity = this.current.velocity;\n\
\n\
    if (lastVEv !== false && ev.timeStamp - lastVEv.timeStamp > Hammer.UPDATE_VELOCITY_INTERVAL) {\n\
        velocity = Hammer.utils.getVelocity(ev.timeStamp - lastVEv.timeStamp,\n\
                                            ev.center.pageX - lastVEv.center.pageX,\n\
                                            ev.center.pageY - lastVEv.center.pageY);\n\
        this.current.lastVEvent = ev;\n\
\n\
        if (velocity.x > 0 && velocity.y > 0) {\n\
            this.current.velocity = velocity;\n\
        }\n\
\n\
    } else if(this.current.velocity === false) {\n\
        velocity = Hammer.utils.getVelocity(delta_time, delta_x, delta_y);\n\
        this.current.velocity = velocity;\n\
        this.current.lastVEvent = ev;\n\
    }\n\
\n\
    // end events (e.g. dragend) don't have useful values for interimDirection & interimAngle\n\
    // because the previous event has exactly the same coordinates\n\
    // so for end events, take the previous values of interimDirection & interimAngle\n\
    // instead of recalculating them and getting a spurious '0'\n\
    if(ev.eventType == Hammer.EVENT_END) {\n\
      interimAngle = this.current.lastEvent && this.current.lastEvent.interimAngle;\n\
      interimDirection = this.current.lastEvent && this.current.lastEvent.interimDirection;\n\
    }\n\
    else {\n\
      interimAngle = this.current.lastEvent &&\n\
        Hammer.utils.getAngle(this.current.lastEvent.center, ev.center);\n\
      interimDirection = this.current.lastEvent &&\n\
        Hammer.utils.getDirection(this.current.lastEvent.center, ev.center);\n\
    }\n\
\n\
    Hammer.utils.extend(ev, {\n\
      deltaTime: delta_time,\n\
\n\
      deltaX: delta_x,\n\
      deltaY: delta_y,\n\
\n\
      velocityX: velocity.x,\n\
      velocityY: velocity.y,\n\
\n\
      distance: Hammer.utils.getDistance(startEv.center, ev.center),\n\
\n\
      angle: Hammer.utils.getAngle(startEv.center, ev.center),\n\
      interimAngle: interimAngle,\n\
\n\
      direction: Hammer.utils.getDirection(startEv.center, ev.center),\n\
      interimDirection: interimDirection,\n\
\n\
      scale: Hammer.utils.getScale(startEv.touches, ev.touches),\n\
      rotation: Hammer.utils.getRotation(startEv.touches, ev.touches),\n\
\n\
      startEvent: startEv\n\
    });\n\
\n\
    return ev;\n\
  },\n\
\n\
\n\
  /**\n\
   * register new gesture\n\
   * @param   {Object}    gesture object, see gestures.js for documentation\n\
   * @returns {Array}     gestures\n\
   */\n\
  register: function register(gesture) {\n\
    // add an enable gesture options if there is no given\n\
    var options = gesture.defaults || {};\n\
    if(options[gesture.name] === undefined) {\n\
      options[gesture.name] = true;\n\
    }\n\
\n\
    // extend Hammer default options with the Hammer.gesture options\n\
    Hammer.utils.extend(Hammer.defaults, options, true);\n\
\n\
    // set its index\n\
    gesture.index = gesture.index || 1000;\n\
\n\
    // add Hammer.gesture to the list\n\
    this.gestures.push(gesture);\n\
\n\
    // sort the list by index\n\
    this.gestures.sort(function(a, b) {\n\
      if(a.index < b.index) { return -1; }\n\
      if(a.index > b.index) { return 1; }\n\
      return 0;\n\
    });\n\
\n\
    return this.gestures;\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Drag\n\
 * Move with x fingers (default 1) around on the page. Blocking the scrolling when\n\
 * moving left and right is a good practice. When all the drag events are blocking\n\
 * you disable scrolling on that area.\n\
 * @events  drag, drapleft, dragright, dragup, dragdown\n\
 */\n\
Hammer.gestures.Drag = {\n\
  name     : 'drag',\n\
  index    : 50,\n\
  defaults : {\n\
    drag_min_distance            : 10,\n\
\n\
    // Set correct_for_drag_min_distance to true to make the starting point of the drag\n\
    // be calculated from where the drag was triggered, not from where the touch started.\n\
    // Useful to avoid a jerk-starting drag, which can make fine-adjustments\n\
    // through dragging difficult, and be visually unappealing.\n\
    correct_for_drag_min_distance: true,\n\
\n\
    // set 0 for unlimited, but this can conflict with transform\n\
    drag_max_touches             : 1,\n\
\n\
    // prevent default browser behavior when dragging occurs\n\
    // be careful with it, it makes the element a blocking element\n\
    // when you are using the drag gesture, it is a good practice to set this true\n\
    drag_block_horizontal        : false,\n\
    drag_block_vertical          : false,\n\
\n\
    // drag_lock_to_axis keeps the drag gesture on the axis that it started on,\n\
    // It disallows vertical directions if the initial direction was horizontal, and vice versa.\n\
    drag_lock_to_axis            : false,\n\
\n\
    // drag lock only kicks in when distance > drag_lock_min_distance\n\
    // This way, locking occurs only when the distance has become large enough to reliably determine the direction\n\
    drag_lock_min_distance       : 25\n\
  },\n\
\n\
  triggered: false,\n\
  handler  : function dragGesture(ev, inst) {\n\
    // current gesture isnt drag, but dragged is true\n\
    // this means an other gesture is busy. now call dragend\n\
    if(Hammer.detection.current.name != this.name && this.triggered) {\n\
      inst.trigger(this.name + 'end', ev);\n\
      this.triggered = false;\n\
      return;\n\
    }\n\
\n\
    // max touches\n\
    if(inst.options.drag_max_touches > 0 &&\n\
      ev.touches.length > inst.options.drag_max_touches) {\n\
      return;\n\
    }\n\
\n\
    switch(ev.eventType) {\n\
      case Hammer.EVENT_START:\n\
        this.triggered = false;\n\
        break;\n\
\n\
      case Hammer.EVENT_MOVE:\n\
        // when the distance we moved is too small we skip this gesture\n\
        // or we can be already in dragging\n\
        if(ev.distance < inst.options.drag_min_distance &&\n\
          Hammer.detection.current.name != this.name) {\n\
          return;\n\
        }\n\
\n\
        // we are dragging!\n\
        if(Hammer.detection.current.name != this.name) {\n\
          Hammer.detection.current.name = this.name;\n\
          if(inst.options.correct_for_drag_min_distance && ev.distance > 0) {\n\
            // When a drag is triggered, set the event center to drag_min_distance pixels from the original event center.\n\
            // Without this correction, the dragged distance would jumpstart at drag_min_distance pixels instead of at 0.\n\
            // It might be useful to save the original start point somewhere\n\
            var factor = Math.abs(inst.options.drag_min_distance / ev.distance);\n\
            Hammer.detection.current.startEvent.center.pageX += ev.deltaX * factor;\n\
            Hammer.detection.current.startEvent.center.pageY += ev.deltaY * factor;\n\
\n\
            // recalculate event data using new start point\n\
            ev = Hammer.detection.extendEventData(ev);\n\
          }\n\
        }\n\
\n\
        // lock drag to axis?\n\
        if(Hammer.detection.current.lastEvent.drag_locked_to_axis ||\n\
            ( inst.options.drag_lock_to_axis &&\n\
              inst.options.drag_lock_min_distance <= ev.distance\n\
            )) {\n\
          ev.drag_locked_to_axis = true;\n\
        }\n\
        var last_direction = Hammer.detection.current.lastEvent.direction;\n\
        if(ev.drag_locked_to_axis && last_direction !== ev.direction) {\n\
          // keep direction on the axis that the drag gesture started on\n\
          if(Hammer.utils.isVertical(last_direction)) {\n\
            ev.direction = (ev.deltaY < 0) ? Hammer.DIRECTION_UP : Hammer.DIRECTION_DOWN;\n\
          }\n\
          else {\n\
            ev.direction = (ev.deltaX < 0) ? Hammer.DIRECTION_LEFT : Hammer.DIRECTION_RIGHT;\n\
          }\n\
        }\n\
\n\
        // first time, trigger dragstart event\n\
        if(!this.triggered) {\n\
          inst.trigger(this.name + 'start', ev);\n\
          this.triggered = true;\n\
        }\n\
\n\
        // trigger events\n\
        inst.trigger(this.name, ev);\n\
        inst.trigger(this.name + ev.direction, ev);\n\
\n\
        var is_vertical = Hammer.utils.isVertical(ev.direction);\n\
\n\
        // block the browser events\n\
        if((inst.options.drag_block_vertical && is_vertical) ||\n\
          (inst.options.drag_block_horizontal && !is_vertical)) {\n\
          ev.preventDefault();\n\
        }\n\
        break;\n\
\n\
      case Hammer.EVENT_END:\n\
        // trigger dragend\n\
        if(this.triggered) {\n\
          inst.trigger(this.name + 'end', ev);\n\
        }\n\
\n\
        this.triggered = false;\n\
        break;\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Hold\n\
 * Touch stays at the same place for x time\n\
 * @events  hold\n\
 */\n\
Hammer.gestures.Hold = {\n\
  name    : 'hold',\n\
  index   : 10,\n\
  defaults: {\n\
    hold_timeout  : 500,\n\
    hold_threshold: 1\n\
  },\n\
  timer   : null,\n\
\n\
  handler : function holdGesture(ev, inst) {\n\
    switch(ev.eventType) {\n\
      case Hammer.EVENT_START:\n\
        // clear any running timers\n\
        clearTimeout(this.timer);\n\
\n\
        // set the gesture so we can check in the timeout if it still is\n\
        Hammer.detection.current.name = this.name;\n\
\n\
        // set timer and if after the timeout it still is hold,\n\
        // we trigger the hold event\n\
        this.timer = setTimeout(function() {\n\
          if(Hammer.detection.current.name == 'hold') {\n\
            inst.trigger('hold', ev);\n\
          }\n\
        }, inst.options.hold_timeout);\n\
        break;\n\
\n\
      // when you move or end we clear the timer\n\
      case Hammer.EVENT_MOVE:\n\
        if(ev.distance > inst.options.hold_threshold) {\n\
          clearTimeout(this.timer);\n\
        }\n\
        break;\n\
\n\
      case Hammer.EVENT_END:\n\
        clearTimeout(this.timer);\n\
        break;\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Release\n\
 * Called as last, tells the user has released the screen\n\
 * @events  release\n\
 */\n\
Hammer.gestures.Release = {\n\
  name   : 'release',\n\
  index  : Infinity,\n\
  handler: function releaseGesture(ev, inst) {\n\
    if(ev.eventType == Hammer.EVENT_END) {\n\
      inst.trigger(this.name, ev);\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Swipe\n\
 * triggers swipe events when the end velocity is above the threshold\n\
 * for best usage, set prevent_default (on the drag gesture) to true\n\
 * @events  swipe, swipeleft, swiperight, swipeup, swipedown\n\
 */\n\
Hammer.gestures.Swipe = {\n\
  name    : 'swipe',\n\
  index   : 40,\n\
  defaults: {\n\
    swipe_min_touches: 1,\n\
    swipe_max_touches: 1,\n\
    swipe_velocity   : 0.7\n\
  },\n\
  handler : function swipeGesture(ev, inst) {\n\
    if(ev.eventType == Hammer.EVENT_END) {\n\
      // max touches\n\
      if(ev.touches.length < inst.options.swipe_min_touches ||\n\
        ev.touches.length > inst.options.swipe_max_touches) {\n\
        return;\n\
      }\n\
\n\
      // when the distance we moved is too small we skip this gesture\n\
      // or we can be already in dragging\n\
      if(ev.velocityX > inst.options.swipe_velocity ||\n\
        ev.velocityY > inst.options.swipe_velocity) {\n\
        // trigger swipe events\n\
        inst.trigger(this.name, ev);\n\
        inst.trigger(this.name + ev.direction, ev);\n\
      }\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Tap/DoubleTap\n\
 * Quick touch at a place or double at the same place\n\
 * @events  tap, doubletap\n\
 */\n\
Hammer.gestures.Tap = {\n\
  name    : 'tap',\n\
  index   : 100,\n\
  defaults: {\n\
    tap_max_touchtime : 250,\n\
    tap_max_distance  : 10,\n\
    tap_always        : true,\n\
    doubletap_distance: 20,\n\
    doubletap_interval: 300\n\
  },\n\
\n\
  has_moved: false,\n\
\n\
  handler : function tapGesture(ev, inst) {\n\
    // reset moved state\n\
    if(ev.eventType == Hammer.EVENT_START) {\n\
      this.has_moved = false;\n\
    }\n\
\n\
    // Track the distance we've moved. If it's above the max ONCE, remember that (fixes #406).\n\
    else if(ev.eventType == Hammer.EVENT_MOVE && !this.moved) {\n\
      this.has_moved = (ev.distance > inst.options.tap_max_distance);\n\
    }\n\
\n\
    else if(ev.eventType == Hammer.EVENT_END &&\n\
        ev.srcEvent.type != 'touchcancel' &&\n\
        ev.deltaTime < inst.options.tap_max_touchtime && !this.has_moved) {\n\
\n\
      // previous gesture, for the double tap since these are two different gesture detections\n\
      var prev = Hammer.detection.previous,\n\
        since_prev = (ev.timeStamp - prev.lastEvent.timeStamp),\n\
        did_doubletap = false;\n\
\n\
      // check if double tap\n\
      if(prev && prev.name == 'tap' &&\n\
          since_prev < inst.options.doubletap_interval &&\n\
          ev.distance < inst.options.doubletap_distance) {\n\
        inst.trigger('doubletap', ev);\n\
        did_doubletap = true;\n\
      }\n\
\n\
      // do a single tap\n\
      if(!did_doubletap || inst.options.tap_always) {\n\
        Hammer.detection.current.name = 'tap';\n\
        inst.trigger(Hammer.detection.current.name, ev);\n\
      }\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Touch\n\
 * Called as first, tells the user has touched the screen\n\
 * @events  touch\n\
 */\n\
Hammer.gestures.Touch = {\n\
  name    : 'touch',\n\
  index   : -Infinity,\n\
  defaults: {\n\
    // call preventDefault at touchstart, and makes the element blocking by\n\
    // disabling the scrolling of the page, but it improves gestures like\n\
    // transforming and dragging.\n\
    // be careful with using this, it can be very annoying for users to be stuck\n\
    // on the page\n\
    prevent_default    : false,\n\
\n\
    // disable mouse events, so only touch (or pen!) input triggers events\n\
    prevent_mouseevents: false\n\
  },\n\
  handler : function touchGesture(ev, inst) {\n\
    if(inst.options.prevent_mouseevents &&\n\
        ev.pointerType == Hammer.POINTER_MOUSE) {\n\
      ev.stopDetect();\n\
      return;\n\
    }\n\
\n\
    if(inst.options.prevent_default) {\n\
      ev.preventDefault();\n\
    }\n\
\n\
    if(ev.eventType == Hammer.EVENT_START) {\n\
      inst.trigger(this.name, ev);\n\
    }\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Transform\n\
 * User want to scale or rotate with 2 fingers\n\
 * @events  transform, pinch, pinchin, pinchout, rotate\n\
 */\n\
Hammer.gestures.Transform = {\n\
  name     : 'transform',\n\
  index    : 45,\n\
  defaults : {\n\
    // factor, no scale is 1, zoomin is to 0 and zoomout until higher then 1\n\
    transform_min_scale      : 0.01,\n\
    // rotation in degrees\n\
    transform_min_rotation   : 1,\n\
    // prevent default browser behavior when two touches are on the screen\n\
    // but it makes the element a blocking element\n\
    // when you are using the transform gesture, it is a good practice to set this true\n\
    transform_always_block   : false,\n\
    // ensures that all touches occurred within the instance element\n\
    transform_within_instance: false\n\
  },\n\
\n\
  triggered: false,\n\
\n\
  handler  : function transformGesture(ev, inst) {\n\
    // current gesture isnt drag, but dragged is true\n\
    // this means an other gesture is busy. now call dragend\n\
    if(Hammer.detection.current.name != this.name && this.triggered) {\n\
      inst.trigger(this.name + 'end', ev);\n\
      this.triggered = false;\n\
      return;\n\
    }\n\
\n\
    // at least multitouch\n\
    if(ev.touches.length < 2) {\n\
      return;\n\
    }\n\
\n\
    // prevent default when two fingers are on the screen\n\
    if(inst.options.transform_always_block) {\n\
      ev.preventDefault();\n\
    }\n\
\n\
    // check if all touches occurred within the instance element\n\
    if(inst.options.transform_within_instance) {\n\
      for(var i=-1; ev.touches[++i];) {\n\
        if(!Hammer.utils.hasParent(ev.touches[i].target, inst.element)) {\n\
          return;\n\
        }\n\
      }\n\
    }\n\
\n\
    switch(ev.eventType) {\n\
      case Hammer.EVENT_START:\n\
        this.triggered = false;\n\
        break;\n\
\n\
      case Hammer.EVENT_MOVE:\n\
        var scale_threshold = Math.abs(1 - ev.scale);\n\
        var rotation_threshold = Math.abs(ev.rotation);\n\
\n\
        // when the distance we moved is too small we skip this gesture\n\
        // or we can be already in dragging\n\
        if(scale_threshold < inst.options.transform_min_scale &&\n\
          rotation_threshold < inst.options.transform_min_rotation) {\n\
          return;\n\
        }\n\
\n\
        // we are transforming!\n\
        Hammer.detection.current.name = this.name;\n\
\n\
        // first time, trigger dragstart event\n\
        if(!this.triggered) {\n\
          inst.trigger(this.name + 'start', ev);\n\
          this.triggered = true;\n\
        }\n\
\n\
        inst.trigger(this.name, ev); // basic transform event\n\
\n\
        // trigger rotate event\n\
        if(rotation_threshold > inst.options.transform_min_rotation) {\n\
          inst.trigger('rotate', ev);\n\
        }\n\
\n\
        // trigger pinch event\n\
        if(scale_threshold > inst.options.transform_min_scale) {\n\
          inst.trigger('pinch', ev);\n\
          inst.trigger('pinch' + (ev.scale<1 ? 'in' : 'out'), ev);\n\
        }\n\
        break;\n\
\n\
      case Hammer.EVENT_END:\n\
        // trigger dragend\n\
        if(this.triggered) {\n\
          inst.trigger(this.name + 'end', ev);\n\
        }\n\
\n\
        this.triggered = false;\n\
        break;\n\
    }\n\
  }\n\
};\n\
\n\
// AMD export\n\
if(typeof define == 'function' && define.amd) {\n\
  define(function(){\n\
    return Hammer;\n\
  });\n\
}\n\
// commonjs export\n\
else if(typeof module == 'object' && module.exports) {\n\
  module.exports = Hammer;\n\
}\n\
// browser export\n\
else {\n\
  window.Hammer = Hammer;\n\
}\n\
\n\
})(window);//@ sourceURL=eightmedia-hammer.js/hammer.js"
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
require.register("pgherveou-load-image/js/index.js", Function("exports, require, module",
"module.exports = require(\"./load-image.js\");\n\
\n\
require('./load-image-ios.js');\n\
require('./load-image-orientation.js');\n\
require('./load-image-meta.js');\n\
require('./load-image-exif.js');\n\
require('./load-image-exif-map.js');//@ sourceURL=pgherveou-load-image/js/index.js"
));
require.register("pgherveou-load-image/js/load-image.js", Function("exports, require, module",
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
//@ sourceURL=pgherveou-load-image/js/load-image.js"
));
require.register("pgherveou-load-image/js/load-image-ios.js", Function("exports, require, module",
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
//@ sourceURL=pgherveou-load-image/js/load-image-ios.js"
));
require.register("pgherveou-load-image/js/load-image-orientation.js", Function("exports, require, module",
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
//@ sourceURL=pgherveou-load-image/js/load-image-orientation.js"
));
require.register("pgherveou-load-image/js/load-image-meta.js", Function("exports, require, module",
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
//@ sourceURL=pgherveou-load-image/js/load-image-meta.js"
));
require.register("pgherveou-load-image/js/load-image-exif.js", Function("exports, require, module",
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
//@ sourceURL=pgherveou-load-image/js/load-image-exif.js"
));
require.register("pgherveou-load-image/js/load-image-exif-map.js", Function("exports, require, module",
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
//@ sourceURL=pgherveou-load-image/js/load-image-exif-map.js"
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
    Hammer = require('hammerjs'),\n\
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
  translate: true,\n\
  scale: true,\n\
  rotate: false,\n\
  maxScale: 3,\n\
  quality: 3\n\
};\n\
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
 * Scaler constructor\n\
 *\n\
 * @param {Element} el\n\
 * @param {[Object]} opts\n\
 * @api public\n\
 */\n\
\n\
function Scaler(el, opts) {\n\
  var _this = this;\n\
\n\
  this.el = el;\n\
  this.hammer = new Hammer(el);\n\
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
  // bind gesture events\n\
  this.bind('pinch drag', 'gesturechange');\n\
  this.bind('dragend release', 'gestureend');\n\
}\n\
\n\
/**\n\
 * bind touch event\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.bind = function(ev, method) {\n\
  var _this = this;\n\
  this.hammer.on(ev, function(e) {\n\
    _this[method](e);\n\
  });\n\
};\n\
\n\
/**\n\
 * remove all events\n\
 * @api public\n\
 */\n\
\n\
Scaler.prototype.destroy = function () {\n\
  this.hammer.dispose();\n\
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
  // canvas.width = this.bounds.width;\n\
  // canvas.height = this.bounds.height;\n\
\n\
  canvas.width =  this.opts.quality * this.bounds.width;\n\
  canvas.height = this.opts.quality * this.bounds.height;\n\
\n\
  // draw image on canvas\n\
  ctx = canvas.getContext('2d');\n\
  dx = dy = 0;\n\
\n\
  dw = canvas.width;\n\
  dh = canvas.height;\n\
  sw = canvas.width / this.state.scale;\n\
  sh = canvas.height / this.state.scale;\n\
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
    this.filename = url.split('?')[0];\n\
  }\n\
\n\
  // init state objects\n\
  ['prev', 'state', 'cur'].forEach(function (str) {\n\
    this[str] = {};\n\
    this[str].scale = 1;\n\
    this[str].rotation = 0;\n\
    this[str].deltaX = 0;\n\
    this[str].deltaY = 0;\n\
  }, this);\n\
\n\
  // load image opts\n\
  opts = {\n\
    maxWidth: this.opts.quality * width,\n\
    maxHeight: this.opts.quality * height,\n\
    cover: true,\n\
    canvas: true,\n\
    crossOrigin: true\n\
  };\n\
\n\
  loadImage.parseMetaData(url, function (data) {\n\
\n\
    // load orientation from exif data\n\
    if (data.exif) opts.orientation = data.exif.get('Orientation');\n\
\n\
    // load image\n\
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
  });\n\
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
\n\
/**\n\
 * transform on gesturechange\n\
 *\n\
 * @param  {Event} e\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.gesturechange = function(e) {\n\
  e.gesture.preventDefault();\n\
\n\
  this.state.deltaX = this.cur.deltaX + e.gesture.deltaX;\n\
  this.state.deltaY = this.cur.deltaY + e.gesture.deltaY;\n\
  this.state.scale = this.cur.scale - 1 + e.gesture.scale;\n\
  this.state.rotation = this.cur.rotation + e.gesture.rotation;\n\
\n\
  // update styles with current values\n\
  this.updateStyle();\n\
\n\
  if (this.acceptTransform()) {\n\
    this.prev.deltaX = this.state.deltaX;\n\
    this.prev.deltaY = this.state.deltaY;\n\
    this.prev.scale = this.state.scale;\n\
    this.prev.rotation = this.state.rotation;\n\
  }\n\
};\n\
\n\
/**\n\
 * restore invalid values on gesturend\n\
 *\n\
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
    this.cur.deltaX = this.state.deltaX;\n\
    this.cur.deltaY = this.state.deltaY;\n\
    this.cur.scale  = this.state.scale;\n\
    this.cur.rotation = this.state.rotation;\n\
  } else {\n\
    this.state.deltaX = this.cur.deltaX = this.prev.deltaX;\n\
    this.state.deltaY = this.cur.deltaY = this.prev.deltaY;\n\
    this.state.scale = this.cur.scale = this.prev.scale;\n\
    this.state.rotation = this.cur.rotation = this.prev.rotation;\n\
\n\
    ev.bind(this.canvas, transitionend, removeStyle);\n\
    this.canvas.style[transition] = 'all '\n\
                                  + this.opts.transitionSpeed + 's '\n\
                                  + this.opts.easing;\n\
    this.updateStyle();\n\
  }\n\
\n\
  Hammer.detection.stopDetect();\n\
};\n\
\n\
/**\n\
 * apply css transforms\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Scaler.prototype.updateStyle = function() {\n\
  var transforms = [];\n\
\n\
  if (this.opts.translate) {\n\
    transforms.push(translate(this.state.deltaX,  this.state.deltaY));\n\
  }\n\
\n\
  if (this.opts.scale) {\n\
    transforms.push(scale(this.state.scale));\n\
  }\n\
\n\
  if (this.opts.rotate) {\n\
    transforms.push(rotate(this.state.rotation));\n\
  }\n\
\n\
  this.canvas.style[transform] = transforms.join(' ');\n\
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

require.alias("eightmedia-hammer.js/hammer.js", "touchscaler/deps/hammerjs/hammer.js");
require.alias("eightmedia-hammer.js/hammer.js", "touchscaler/deps/hammerjs/index.js");
require.alias("eightmedia-hammer.js/hammer.js", "hammerjs/index.js");
require.alias("eightmedia-hammer.js/hammer.js", "eightmedia-hammer.js/index.js");
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
require.alias("touchscaler/index.js", "touchscaler/index.js");