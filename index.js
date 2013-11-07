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
 * get rotate or rotate3d str
 *
 * @param  {Number} x
 * @return {String}
 * @api private
 */

function rotate(x) {
  // if (has3d) return 'rotate3d(' + x + 'deg, 0 , 0)';
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
 * @api public
 */

Scaler.prototype.data = function() {
  if (!this.canvas) return;
  var canvas, ctx, dh, dw, dx, dy, sh, sw, sx, sy;

  // create canvas
  canvas = document.createElement('canvas');
  canvas.width = this.bounds.width;
  canvas.height = this.bounds.height;

  // draw image on canvas
  ctx = canvas.getContext('2d');
  dx = dy = 0;
  dw = canvas.width;
  dh = canvas.height;
  sw = canvas.width / this.cur.scale;
  sh = canvas.height / this.cur.scale;

  sx = (this.canvas.width - sw) / 2 - this.cur.translateX / this.cur.scale;
  sy = (this.canvas.height - sh) / 2 - this.cur.translateY / this.cur.scale;
  ctx.drawImage(this.canvas, sx, sy, sw, sh, dx, dy, dw, dh);

  return {
    transform: this.cur,
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
  ['prv', 'cur'].forEach(function (str) {
    this[str] = {};
    this[str].scale = this.touch.scale;
    this[str].rotate = this.touch.rotate;
    this[str].translateX = this.touch.translateX;
    this[str].translateY = this.touch.translateY;
  }, this);

  // load image opts
  opts = {
    maxWidth: width * 1.2,
    maxHeight: height * 1.2,
    orientation: true,
    cover: true,
    canvas: true,
    crossOrigin: true
  };

  loadImage(url, function (canvas) {
    if (_this.canvas) _this.el.removeChild(_this.canvas);

    // replace existing canvas
    _this.el.insertBefore(canvas, _this.el.firstChild);
    _this.canvas = canvas;
    _this.updateStyle();

    // center canvas
    _this.canvas.style.marginLeft = -0.5 * (opts.maxWidth - width);
    _this.canvas.style.marginTop = -0.5 * (opts.maxHeight - height);

  }, opts);
};

/**
 * check if current transform is in bound
 *
 * @return {Boolean}
 * @api private
 */

Scaler.prototype.acceptTransform = function() {
  if (this.cur.scale > this.opts.maxScale) return false;

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
  this.cur.translateX = this.touch.translateX + pageX(e)
                      - pageX(this.touch.touchstart);

  this.cur.translateY = this.touch.translateY + pageY(e)
                      - pageY(this.touch.touchstart);

  // update styles with current values
  this.updateStyle();

  if (this.acceptTransform()) {

    // update previous values with current
    this.prv.translateX = this.cur.translateX;
    this.prv.translateY = this.cur.translateY;
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
    this.touch.translateX = this.cur.translateX;
    this.touch.translateY = this.cur.translateY;
  } else {
    this.cur.translateX = this.touch.translateX = this.prv.translateX;
    this.cur.translateY = this.touch.translateY = this.prv.translateY;
    ev.bind(this.canvas, transitionend, removeStyle);
    this.canvas.style[transition] = 'all ' + this.opts.transitionSpeed + 's ' + this.opts.easing;
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
  this.cur.translateX = this.touch.translateX + pageX(e)
                        - pageX(this.touch.touchstart) / 2;
  this.cur.translateY = this.touch.translateY + pageY(e)
                        - pageY(this.touch.touchstart) / 2;
};

/**
 * transform on gesturechange
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.gesturechange = function(e) {

  this.cur.scale = this.touch.scale +
              this.touch.scale * (e.scale - this.touch.gesturestart.scale);

  if (this.opts.rotate) {
    this.cur.rotate = this.touch.rotate + e.rotation
                    - this.touch.gesturestart.rotation;
  }

  this.updateStyle();

  if (this.acceptTransform()) {
    this.prv.scale = this.cur.scale;
    this.prv.rotate = this.cur.rotate;
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
    this.touch.scale  = this.cur.scale;
    this.touch.rotate = this.cur.rotate;
  } else {
    this.cur.scale = this.touch.scale = this.prv.scale;
    this.cur.rotate = this.touch.rotate = this.prv.rotate;

    ev.bind(this.canvas, transitionend, removeStyle);
    this.canvas.style[transition] = 'all ' + this.opts.transitionSpeed + 's ' + this.opts.easing;
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
    translate(this.cur.translateX,  this.cur.translateY),
    scale(this.cur.scale),
    rotate(this.cur.rotate)
  ].join(' ');
};

/*!
 * module exports
 */

module.exports = Scaler;