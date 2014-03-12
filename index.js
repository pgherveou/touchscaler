/*!
 * module deps
 */

var ev = require('event'),
    Hammer = require('hammerjs'),
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
  translate: true,
  scale: true,
  rotate: false,
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
 * Scaler constructor
 *
 * @param {Element} el
 * @param {[Object]} opts
 * @api public
 */

function Scaler(el, opts) {
  var _this = this;

  this.el = el;
  this.hammer = new Hammer(el);

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

  // bind gesture events
  this.bind('pinch drag', 'gesturechange');
  this.bind('dragend release', 'gestureend');
}

/**
 * bind touch event
 * @api private
 */

Scaler.prototype.bind = function(ev, method) {
  var _this = this;
  this.hammer.on(ev, function(e) {
    _this[method](e);
  });
};

/**
 * remove all events
 * @api public
 */

Scaler.prototype.destroy = function () {
  this.hammer.dispose();
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
    this.filename = url.split('?')[0];
  }

  // init state objects
  ['prev', 'state', 'cur'].forEach(function (str) {
    this[str] = {};
    this[str].scale = 1;
    this[str].rotation = 0;
    this[str].deltaX = 0;
    this[str].deltaY = 0;
  }, this);

  // load image opts
  opts = {
    maxWidth: this.opts.quality * width,
    maxHeight: this.opts.quality * height,
    cover: true,
    canvas: true,
    crossOrigin: true
  };

  loadImage.parseMetaData(url, function (data) {

    // load orientation from exif data
    if (data.exif) opts.orientation = data.exif.get('Orientation');

    // load image
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
  });
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
 * transform on gesturechange
 *
 * @param  {Event} e
 * @api private
 */

Scaler.prototype.gesturechange = function(e) {
  e.gesture.preventDefault();

  this.state.deltaX = this.cur.deltaX + e.gesture.deltaX;
  this.state.deltaY = this.cur.deltaY + e.gesture.deltaY;
  this.state.scale = this.cur.scale - 1 + e.gesture.scale;
  this.state.rotation = this.cur.rotation + e.gesture.rotation;

  // update styles with current values
  this.updateStyle();

  if (this.acceptTransform()) {
    this.prev.deltaX = this.state.deltaX;
    this.prev.deltaY = this.state.deltaY;
    this.prev.scale = this.state.scale;
    this.prev.rotation = this.state.rotation;
  }
};

/**
 * restore invalid values on gesturend
 *
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
    this.cur.deltaX = this.state.deltaX;
    this.cur.deltaY = this.state.deltaY;
    this.cur.scale  = this.state.scale;
    this.cur.rotation = this.state.rotation;
  } else {
    this.state.deltaX = this.cur.deltaX = this.prev.deltaX;
    this.state.deltaY = this.cur.deltaY = this.prev.deltaY;
    this.state.scale = this.cur.scale = this.prev.scale;
    this.state.rotation = this.cur.rotation = this.prev.rotation;

    ev.bind(this.canvas, transitionend, removeStyle);
    this.canvas.style[transition] = 'all '
                                  + this.opts.transitionSpeed + 's '
                                  + this.opts.easing;
    this.updateStyle();
  }

  Hammer.detection.stopDetect();
};

/**
 * apply css transforms
 *
 * @api private
 */

Scaler.prototype.updateStyle = function() {
  var transforms = [];

  if (this.opts.translate) {
    transforms.push(translate(this.state.deltaX,  this.state.deltaY));
  }

  if (this.opts.scale) {
    transforms.push(scale(this.state.scale));
  }

  if (this.opts.rotate) {
    transforms.push(rotate(this.state.rotation));
  }

  this.canvas.style[transform] = transforms.join(' ');
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