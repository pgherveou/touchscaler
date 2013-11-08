/*!
 * module deps
 */

var ev = require('event'),
    events = require('events'),
    domify = require('domify'),
    query = require('query'),
    has3d = require('has-translate3d'),
    transitionend = require('transitionend-property'),
    prefix = require('prefix'),
    template = require('./template'),
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
  quality: 2
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
 * cancel
 * @param {Event} e
 * @api private
 */

function cancel(e) {
  e.preventDefault();
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

  // add template
  el.appendChild(domify(template));

  // box bounds refs
  this.bounds = query('.scaler-box', el).getBoundingClientRect();

  // bind events
  ev.bind(this.el, 'touchmove', cancel);

  this.events = events(el, this);
  this.events.bind('touchstart canvas', 'touchstart');
  this.events.bind('touchmove canvas', 'touchmove');
  this.events.bind('touchend canvas', 'touchend');
  this.events.bind('touchcancel canvas', 'touchend');

  this.events.bind('gesturestart canvas', 'gesturestart');
  this.events.bind('gesturechange canvas', 'gesturechange');
  this.events.bind('gestureend canvas', 'gestureend');
  this.events.bind('gesturecancel canvas', 'gestureend');

  this.events.bind('change input[type="file"]', 'loadFile');
}

/**
 * remove all events
 */

Scaler.prototype.destroy = function () {
  ev.unbind(this.el, 'touchmove', cancel);
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
  canvas.width = this.bounds.width;
  canvas.height = this.bounds.height;

  // draw image on canvas
  ctx = canvas.getContext('2d');
  dx = dy = 0;
  dw = canvas.width;
  dh = canvas.height;
  sw = this.opts.quality * canvas.width / this.state.scale;
  sh = this.opts.quality * canvas.height / this.state.scale;

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
 * load file
 *
 * @api private
 */

Scaler.prototype.loadFile = function(e) {
  var file = e.target.files[0];
  if (!file) return;
  this.loadImage(file);
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
    if (_this.canvas) _this.el.removeChild(_this.canvas);

    //
    canvas.style.width = canvas.width / _this.opts.quality;
    canvas.style.height = canvas.height / _this.opts.quality;

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
  if ( Math.abs(pageX(e) - this.touch.touchmove.pageX) > 30
    || Math.abs(pageY(e) - this.touch.touchmove.pageY) > 30) return;

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
    scale(this.state.scale),
    translate(this.state.translateX,  this.state.translateY),
    rotate(this.state.rotate)
  ].join(' ');
};

/*!
 * module exports
 */

module.exports = Scaler;