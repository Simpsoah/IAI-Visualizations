visualizationFunctions.componentOpacityLegend = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.config = network.CreateBaseConfig();
	network.parentVis = visualizations[opts.ngComponentFor];
	network.SVG = d3.select(element[0])
		.append("svg")
		.attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
		.attr("height", network.config.dims.height + network.config.margins.top - network.config.margins.bottom)
		.style("background", "none")
		.append("g")
		.attr("class", "canvas " + opts.ngIdentifier);
	network.parentVis = visualizations[opts.ngComponentFor];
	network.VisFunc = function() {
		// network.SVG.remove();
		var legendData = network.parentVis.Scales.edgeOpacityScale;
		var w = network.config.dims.width * .75;
		var gradient = network.SVG.append("svg:defs")
			.append("svg:linearGradient")
			.attr("id", "gradient")
			.attr("x1", "05%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		gradient.append("svg:stop")
			.attr("offset", "0%")
			.attr("stop-color", "grey")
			.attr("stop-opacity", 0);
		gradient.append("svg:stop")
			.attr("offset", "100%")
			.attr("stop-color", "grey")
			.attr("stop-opacity", 1);				
		network.SVG.append("text")
			.attr("class", "l2")
			.attr("x", "10%")
			.attr("y", "70%")
			.attr("text-anchor", "start")
			.text(legendData.domain()[0])
		network.SVG.append("text")
			.attr("class", "l2")
			.attr("x", "90%")
			.attr("y", "70%")
			.attr("text-anchor", "end")
			.text(legendData.domain()[legendData.domain().length - 1])

		network.SVG.append("svg:rect")
			.attr("class", "gradientRect b")
			.attr("width", w)
			.attr("height", "25%")
			.attr("x", "12.5%")
			.attr("y", "20%")
			.style("fill", "url(#gradient)");
		network.SVG.append("text")
			.attr("class", "l2")
			.attr("x", "50%")
			.attr("y", "90%")
			.attr("text-anchor", "middle")
			.text(network.parentVis.config.meta.edges.prettyMap[network.parentVis.config.meta.edges.styleEncoding.opacity.attr] || network.parentVis.config.meta.edges.styleEncoding.opacity.attr)
	}
	return network;
}