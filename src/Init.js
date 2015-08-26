//Head loads scripts in parellel, but executes them in order.
(function() {
	"use strict";
	head.js(
		// CSS
		{'main-css'				: 'css/style.css'},
		{'noUISlider'			: 'css/nouislider.css'},
		// JAVASCRIPT
		{'jquery'				: 'lib/jquery-1.11.2.min.js'},
		{'nouislider'			: 'lib/nouislider.js'},
		{'debugScripts'			: 'src/debugScripts.js'},
		{'d3'					: 'lib/d3.v3.min.js'},
		// {'d3fisheye'			: 'lib/d3-fisheye.js'},
		// {'jquery-mobile'		: 'lib/jquery.mobile-1.4.5.min.js'},
		{'bootstrap'			: 'lib/bootstrap.min.js'},
		{'Utilities'			: 'src/Utilities.js'},
		{'VisualizationFuncs'	: 'src/VisualizationFunctions.js'},
		{'VisualizationMeta'	: 'src/VisualizationMeta.js'},
		{'data'					: "data/data.js"},
		{'angular-route'		: "lib/angular-route.js"}
 	);
 }).call(this);

// Load the app once the last head script is called. angular-route is the name given to the appropriate script (above).
head.ready("angular-route", function() {
	angular.element(document).ready(function() {
		head.js('src/App.js');
	});
});

//Browser fixes
//Fix page layout for IE
if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement('style');
	msViewportStyle.appendChild(
		document.createTextNode(
			'@-ms-viewport{width:auto!important}'
		)
	);
	document.getElementsByTagName('head')[0].appendChild(msViewportStyle);
}

if (!Array.prototype.forEach) {
	Array.prototype.forEach = function(fn, scope) {
		for (var i = 0, len = this.length; i < len; ++i) {
			fn.call(scope, this[i], i, this);
		}
	};
}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
	Array.prototype.map = function(callback, thisArg) {

		var T, A, k;

		if (this === null) {
			throw new TypeError(" this is null or not defined");
		}

		// 1. Let O be the result of calling ToObject passing the |this| value as the argument.
		var O = Object(this);

		// 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
		// 3. Let len be ToUint32(lenValue).
		var len = O.length >>> 0;

		// 4. If IsCallable(callback) is false, throw a TypeError exception.
		// See: http://es5.github.com/#x9.11
		if (typeof callback !== "function") {
			throw new TypeError(callback + " is not a function");
		}

		// 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
		if (thisArg) {
			T = thisArg;
		}

		// 6. Let A be a new array created as if by the expression new Array(len) where Array is
		// the standard built-in constructor with that name and len is the value of len.
		A = new Array(len);

		// 7. Let k be 0
		k = 0;

		// 8. Repeat, while k < len
		while (k < len) {

			var kValue, mappedValue;

			// a. Let Pk be ToString(k).
			//   This is implicit for LHS operands of the in operator
			// b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
			//   This step can be combined with c
			// c. If kPresent is true, then
			if (k in O) {

				// i. Let kValue be the result of calling the Get internal method of O with argument Pk.
				kValue = O[k];

				// ii. Let mappedValue be the result of calling the Call internal method of callback
				// with T as the this value and argument list containing kValue, k, and O.
				mappedValue = callback.call(T, kValue, k, O);

				// iii. Call the DefineOwnProperty internal method of A with arguments
				// Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
				// and false.

				// In browsers that support Object.defineProperty, use the following:
				// Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });

				// For best browser support, use the following:
				A[k] = mappedValue;
			}
			// d. Increase k by 1.
			k++;
		}

		// 9. return A
		return A;
	};
}

if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}


if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
	var msViewportStyle = document.createElement("style");
	msViewportStyle.appendChild(
		document.createTextNode(
			"@-ms-viewport{width:auto!important}"
		)
	);
	document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
}

// Some older browsers error out because console is not a variable...Seriosuly. I wrote this in February...far from the first of April.
if (!window.console) {
	console = {};
	console.log = function() {};
}

String.prototype.replaceAll = function(find, replace) {
	return this.replace(new RegExp(find, 'g'), replace);
};
