//Head loads scripts in parellel, but executes them in order.
(function() {
	'use strict';
	head.js(
		// CSS
		{'main-css'				: 'css/style.css'},
		{'noUISlider'			: 'css/nouislider.css'},
		// JAVASCRIPT
		{'jquery'				: 'lib/jquery-1.11.2.min.js'},
		{'nouislider'			: 'lib/nouislider.js'},
		{'d3'					: 'lib/d3.v3.min.js'},
		{'d3Legend'				: 'lib/d3.legend.js'},
		// {'d3fisheye'			: 'lib/d3-fisheye.js'},
		// {'jquery-mobile'		: 'lib/jquery.mobile-1.4.5.min.js'},
		{'bootstrap'			: 'lib/bootstrap.min.js'},
		{'Utilities'			: 'src/Utilities.js'},
		{'VisualizationFuncs'	: 'src/VisualizationFunctions.js'},
		{'VisualizationMeta'	: 'src/VisualizationMeta.js'},
		{'Visualization'		: 'src/Visualization.js'},
		{'data'					: 'data/data.js'},
		{'events'				: 'src/Events.js'},
		{'angular-route'		: 'lib/angular-route.js'}
 	);
 }).call(this);

// Load the app once the last head script is called. angular-route is the name given to the appropriate script (above).
head.ready('angular-route', function() {
	angular.element(document).ready(function() {
		head.js('src/App.js');
	});
});