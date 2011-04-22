/*
 * $.tinyscroller
 *
 * version 0.1.1 (2010/11/29)
 * Copyright (c) 2010 Takeshi Takatsudo (takazudo[at]gmail.com)
 * MIT license
 * original: Tiny Scrolling http://lab.centralscrutinizer.it/the-tiny-scrollings/ (thanks Marco Rosella)
 *
=============================================================================
 depends on
-----------------------------------------------------------------------------
 * jQuery 1.4.4
 *
 */
(function($){ // start $=jQuery encapsulation

/* for reuse */
var $win = $(window);
var $doc = $(document);

/* $.fn.offset has bug in iOS ver.3.0-4.0 Safari so use this instead. */
function yOf(el){
	var y = 0;
	while(el.offsetParent){
		y += el.offsetTop;
		el = el.offsetParent;
	}
	return y;
}
/* i don't know why but $.fn.scrollTop was not worked on IE 6,7,8 w/ jQuery1.4.3 */
function scrollTop(){
	return $doc.scrollTop() || document.documentElement.scrollTop || document.body.scrollTop || window.pageYOffset || 0;
}


/**
 * $.Tinyscroller
 */
$.Tinyscroller = function(){

	this.options = {

		speed : 30, // scrollstep interval
		maxStep: 2000, // max distance(px) per scrollstep
		slowdownRate: 3, // something to define slowdown rate
		stepInterval: 5,

		/* callbacks */
		everyscrollstart: $.noop,
		everyscrollend: $.noop,
		scrollstart: $.noop,
		scrollend: $.noop,

		changeHash: false, // change hash after scrolling or not
		hash: null, // '#foo'

		// scroll till scrollTop reaches...
		endpointElement: null, // element
		endY: null // or px from top

	};

};

$.Tinyscroller.prototype = {

	_currentScrollOptions: null,
	_whileScrolling: false,
	_endY: null,
	_cancelNext: false,

	_scrollEndHandler: function(){
		var o = this._currentScrollOptions;
		this._whileScrolling = false;
		if($.isFunction(o.scrollend)){
			o.scrollend();
		}
		if($.isFunction(o.everyscrollend)){
			o.everyscrollend();
		}
		if(o.changeHash && $.type(o.hash)==='string'){
			location.hash = o.hash;
		}
		if($.isFunction(this._cancelCallback)){
			this._cancelCallback();
		}
		return this;
	},
	_stepToNext: function(){
		var self = this;
		setTimeout(function(){
			var top  = scrollTop();
			var o = self._currentScrollOptions;
			var endDistance, offset;
			if(self._endY > top) {  
				endDistance = Math.round( ($doc.height() - (top + $win.height())) /o.slowdownRate);
				endDistance = Math.min(Math.round((self._endY-top)/ o.slowdownRate), endDistance);
				offset = Math.max(2, Math.min(endDistance, o.maxStep));
			} else {
				offset = - Math.min(Math.abs(Math.round((self._endY-top)/ o.slowdownRate)), o.maxStep);
			}
			window.scrollTo(0, top + offset);
			if(self._cancelNext){
				self._cancelNext = false;
				self._scrollEndHandler();
			}else if(Math.abs(top - self._endY) <= 1 || scrollTop() == top){
				window.scrollTo(0, self._endY);
				self._scrollEndHandler();
			}else{
				setTimeout( $.proxy(self._stepToNext, self), o.speed );
			}
		},self.options.stepInterval);
		return this;
	},
	_start: function(){
		var o = this._currentScrollOptions;
		if($.isFunction(o.scrollstart)){
			o.scrollstart();
		}
		if($.isFunction(o.everyscrollstart)){
			o.everyscrollstart();
		}
		this._stepToNext();
		return this;
	},
	stop: function(callback){
		var o = this._currentScrollOptions;
		if(this._whileScrolling){
			this._cancelNext = true;
			this._cancelCallback = callback;
		}else if($.isFunction(callback)){
			callback();
		}
		return this;
	},
	scrollTo: function(endY, callback){ // endY:number
		var o = {
			endY: endY
		};
		if($.isFunction(callback)){
			o.scrollend = callback;
		}
		this.scroll(o);
		return this;
	},
	scroll: function(options){
		var self = this;
		this.stop(function(){
			var o = self._currentScrollOptions = $.extend({}, self.options, options);
			if($.type(o.endY)==='number'){
				self._endY = o.endY;
				self._start();
			}else{
				var $end = $(o.endpointElement);
				if($end.size()){
					self._endY = yOf($end[0]);
					self._start();
				}
			}
		});
		return this;
	},
	setOptions: function(options){
		$.extend(this.options, options);
		return this;
	},
	liveEventify: function(selector){
		selector = selector || 'a[href^=#]:not([href^=#!)';
		var self = this;
		$(selector).live('click', function(e){
			if(!self.isValidAnchor(this)){
				return;
			}
			e.preventDefault();
			$(this).invokeTinyscroll();
		});
	},
	isValidAnchor: function(element){
		var $el = $(element);
		if(!$el.is('[href]')){
			return false;
		}
		var hash = $el.attr('href');
		if(!/^#.+$/.test(hash)){
			return false;
		}
		var $target = $(hash);
		if(!$target.size()){
			return false;
		}
		return true;
	}

};

// create instance
$.tinyscroller = new $.Tinyscroller();


/**
 * $.fn.invokeTinyscroll
 * invoke scroll
 */
$.fn.invokeTinyscroll = function(options){

	return this.each(function(){

		if(!$.tinyscroller.isValidAnchor(this)){
			return;
		}

		var $el = $(this);
		var hash = $el.attr('href');
		var target = $(hash)[0];

		var o = $.extend({}, options, {
			hash: hash,
			endpointElement: target
		});

		// invoke
		$.tinyscroller.scroll(o);

	});

};

/**
 * $.fn.tinyscrollable
 * catch click for anchors
 */
$.fn.tinyscrollable = function(options){

	return this.each(function(){

		var $el = $(this);

		if(!$el.is('a')){
			return;
		}

		// put flag to avoid double bind
		if($el.data('tinyscrollable.attached')){
			return;
		}else{
			$el.data('tinyscrollable.attached', true)
		}

		// bind
		$el.bind('click', function(e){
			if(!$.tinyscroller.isValidAnchor(this)){
				return;
			}
			e.preventDefault();
			$el.invokeTinyscroll(options);
		});
		
	});

};


})(jQuery); // end $=jQuery encapsulation
