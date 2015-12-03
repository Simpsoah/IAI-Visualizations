//Head loads scripts in parellel, but executes them in order.
var visualizations = {};
var visualizationFunctions = {};
var Events = {};
(function() {
	'use strict';
	head.js(
		// FONTS
		// CSS
		{'main-css'				: 'css/style.css'},
		{'font-awesome' 		: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css'},
		{'noUISlider'			: 'css/nouislider.css'},
		// JAVASCRIPT
		{'jquery'				: 'lib/jquery-1.11.2.min.js'},
		{'nouislider'			: 'lib/nouislider.js'},
		{'d3'					: 'lib/d3.v3.min.js'},
		{'bootstrap'			: 'lib/bootstrap.min.js'},
		{'immutable'			: 'lib/immutable.js'},
		{'Utilities'			: 'src/Utilities.js'},
		{'VisualizationMeta'	: 'src/VisualizationMeta.js'},
		{'Visualization'		: 'src/Visualization.js'},
		{'DatasourceMap'		: 'src/DatasourceMap.js'},
		{'a' 					: 'visuals/primary/ForceNetwork.js'},
		{'b' 					: 'visuals/primary/BarGraphDistort.js'},
		{'c' 					: 'visuals/component/edgeOpacity_legend.js'},
		{'d' 					: 'visuals/component/edgeWidth_legend.js'},
		{'e' 					: 'visuals/component/nodeColor_legend.js'},
		{'f' 					: 'visuals/component/nodeSize_legend.js'},
		{'g' 					: 'visuals/component/NodeFocus.js'},
		{'h' 					: 'visuals/events/mainVis.js'},
		{'i' 					: 'visuals/events/nodeFocus.js'},
		{'j' 					: 'visuals/events/barVis.js'},
		{'angular-route'		: 'lib/angular-route.js'}
 	);
 }).call(this);

// Load the app once the last head script is called. angular-route is the name given to the appropriate script (above).
head.ready('angular-route', function() {
	angular.element(document).ready(function() {
		head.js('src/App.js');
	});
});
