(function(){ // start encapsulation

	// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
	window.log = function(){
		log.history = log.history || []; // store logs to an array for reference
		log.history.push(arguments);
		if(this.console) {
			arguments.callee = arguments.callee.caller;
			console.log( Array.prototype.slice.call(arguments) );
		}
	};
	
	// make it safe to use console.log always
	(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();)b[a]=b[a]||c})(window.console=window.console||{});

	Modernizr.load([
		// load jQuery
		{
			load: 'https://ajax.googleapis.com/ajax/libs/jquery/1.5.2/jquery.js',
			callback: function (url, result, key) {
				if (!window.jQuery) {
					Modernizr.load('/common/js/libs/jquery-1.5.2.min.js');
				}
			}
		},
		// load other scripts
		{
			load: [
				'/common/js/libs/mbp.js',
				'/common/js/mylibs/jquery.tinyscroller.js'
			],
			complete: commonDOMContentLoaded
		}
	]);

	function commonDOMContentLoaded(){

		// iOS scale bug fix
		MBP.scaleFix();

		/* === write all common $(document).ready here === */
		jQuery(function($, undefined){

			// my smooth scroller
			$('a[href^=#]').tinyscrollable();

		});

	} // end of commonDOMContentLoaded

})(); // end encapsulation
