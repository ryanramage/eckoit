/*
 * Swipe 1.0
 *
 * Brad Birdsall, Prime
 * Copyright 2011, Licensed GPL & MIT
 *
*/

window.Swipe = function(element, options) {

  // return immediately if element doesn't exist
  if (!element) return null;

  // retreive options
  this.options = options || {};
  this.index = this.options.startSlide || 0;
  this.speed = this.options.speed || 300;
  this.callback = this.options.callback || function() {};

  // reference dom elements
  this.container = element;
  this.element = this.container.getElementsByTagName('ul')[0]; // the slide pane

  // static css
  this.container.style.overflow = 'hidden';
  this.element.style.listStyle = 'none';

  // trigger slider initialization
  this.setup();

  // add event listeners
  this.element.addEventListener('touchstart', this, false);
  this.element.addEventListener('touchmove', this, false);
  this.element.addEventListener('touchend', this, false);
  this.element.addEventListener('webkitTransitionEnd', this, false);
  window.addEventListener('resize', this, false);

}

Swipe.prototype = {

  setup: function() {

    this.started = false;

    // return immediately if their are less than two slides
    if (this.length < 2) return null;


    // get and measure amt of slides
    this.slides = this.element.getElementsByTagName('li');
    this.length = this.slides.length;

    // return immediately if their are less than two slides
    if (this.length < 2) return null;

    // hide slider element but keep positioning during setup
    this.container.style.visibility = 'hidden';

    // determine width of each slide
    this.width = this.container.getBoundingClientRect().width;

    // dynamic css
    this.element.style.width = (this.slides.length * this.width) + 'px';
    var index = this.slides.length;
    while (index--) {
      var el = this.slides[index];
      el.style.width = this.width + 'px';
      el.style.display = 'table-cell';
      el.style.verticalAlign = 'top';
    }

    // set start position and force translate to remove initial flickering
    this.slide(this.index, 0); 

    // show slider element
    this.container.style.visibility = 'visible';

  },

  slide: function(index, duration) {

    // set duration speed (0 represents 1-to-1 scrolling)
    this.element.style.webkitTransitionDuration = duration + 'ms';

    // translate to given index position
    this.element.style.webkitTransform = 'translate3d(' + -(index * this.width) + 'px,0,0)';

    // set new index to allow for expression arguments
    this.index = index;

  },

  getPos: function() {
    
    // return current index position
    return this.index;

  },

  prev: function() {

    // if not at first slide
    if (this.index) this.slide(this.index-1, this.speed);

  },

  next: function() {

    // if not at last slide
    if (this.index < this.length - 1) this.slide(this.index+1, this.speed);

  },

  handleEvent: function(e) {
    switch (e.type) {
      case 'touchstart': this.onTouchStart(e); break;
      case 'touchmove': this.onTouchMove(e); break;
      case 'touchend': this.onTouchEnd(e); break;
      case 'webkitTransitionEnd': this.callback(e, this.index, this.slides[this.index]); break;
      case 'resize': this.setup(); break;
    }
  },

  onTouchStart: function(e) {
    var x,y;
    try {
        x = e.touches[0].pageX;
        y = e.touches[0].pageY
    } catch(ex) {
        x = e.screenX;
        y = e.screenY;
    }
    this.started = true;
    this.start = {

      // get touch coordinates for delta calculations in onTouchMove
      pageX: x,
      pageY: y,

      // set initial timestamp of touch sequence
      time: Number( new Date() )

    }

    // used for testing first onTouchMove event
    this.isScrolling = undefined;
    
    // reset deltaX
    this.deltaX = 0;

    // set transition time to 0 for 1-to-1 touch movement
    this.element.style.webkitTransitionDuration = 0; 

  },

  onTouchMove: function(e) {

    if (!this.start || !this.started) return;
    var newX;
    var newY;
    try {
        newX = e.touches[0].pageX;
        newY = e.touches[0].pageY;
    } catch(ex) {
        newX = e.screenX;
        newY = e.screenY;
    }

    this.deltaX = newX - this.start.pageX;

    // determine if scrolling test has run - one time test
    if ( typeof this.isScrolling == 'undefined') {
      this.isScrolling = !!( this.isScrolling || Math.abs(this.deltaX) < Math.abs(newY - this.start.pageY) );
    }

    // if user is not trying to scroll vertically
    if (!this.isScrolling) {

      // prevent native scrolling 
      e.preventDefault();

      // increase resistance if first or last slide
      this.deltaX = 
        this.deltaX / 
          ( (!this.index && this.deltaX > 0               // if first slide and sliding left
            || this.index == this.length - 1              // or if last slide and sliding right
            && this.deltaX < 0                            // and if sliding at all
          ) ?                      
          ( Math.abs(this.deltaX) / this.width + 1 )      // determine resistance level
          : 1 );                                          // no resistance if false
      
      // translate immediately 1-to-1 
      this.element.style.webkitTransform = 'translate3d(' + (this.deltaX - this.index * this.width) + 'px,0,0)';
    }

  },

  onTouchEnd: function(e) {

    if(!this.started) return;
    this.started = false;

    // determine if slide attempt triggers next/prev slide
    var isValidSlide = 
          Number(new Date()) - this.start.time < 250      // if slide duration is less than 250ms
          && Math.abs(this.deltaX) > 20                   // and if slide amt is greater than 20px
          || Math.abs(this.deltaX) > this.width/2,        // or if slide amt is greater than half the width

    // determine if slide attempt is past start and end
        isPastBounds = 
          !this.index && this.deltaX > 0                          // if first slide and slide amt is greater than 0
          || this.index == this.length - 1 && this.deltaX < 0;    // or if last slide and slide amt is less than 0

    // if not scrolling vertically
    if (!this.isScrolling) {

      // call slide function with slide end value based on isValidSlide and isPastBounds tests
      this.slide( this.index + ( isValidSlide && !isPastBounds ? (this.deltaX < 0 ? 1 : -1) : 0 ), this.speed );

    }

  }

}