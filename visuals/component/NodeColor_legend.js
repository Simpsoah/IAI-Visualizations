visualizationFunctions.componentNodeColorLegend = function(element, data, opts) {
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
		var legendData = network.parentVis.Scales.nodeColorScale.range();
		var w = network.config.dims.width * .75;
		var gradient = network.SVG.append("svg:defs")
			.append("svg:linearGradient")
			.attr("id", "colorGradient")
			.attr("x1", "05%")
			.attr("y1", "0%")
			.attr("x2", "100%")
			.attr("y2", "0%")
			.attr("spreadMethod", "pad");
		for (var i = 0; i < legendData.length; i++) {
			gradient.append("svg:stop")
				.attr("offset", w / legendData.length * i + "%")
				.attr("stop-color", legendData[i])
				.attr("stop-opacity", 1);
		}
		network.SVG.append("text")
			.attr("x", "10%")
			.attr("y", "70%")
			.attr("text-anchor", "start")
			.text(Math.round(network.parentVis.Scales.nodeColorScale.domain()[0] * 100) / 100)
		network.SVG.append("text")
			.attr("x", "50%")
			.attr("y", "70%")
			.attr("text-anchor", "middle")
			.text(Math.round(network.parentVis.Scales.nodeColorScale.domain()[Math.floor((visualizations.mainVis.Scales.nodeColorScale.domain().length - 1) / 2)] * 100) / 100)
		network.SVG.append("text")
			.attr("x", "90%")
			.attr("y", "70%")
			.attr("text-anchor", "end")
			.text(Math.round(network.parentVis.Scales.nodeColorScale.domain()[visualizations.mainVis.Scales.nodeColorScale.domain().length - 1] * 100) / 100)
		network.SVG.append("svg:rect")
			.attr("class", "gradientRect")
			.attr("width", w)
			.attr("height", "25%")
			.attr("x", "12.5%")
			.attr("y", "20%")
			.style("fill", "url(#colorGradient)");
		network.SVG.append("text")
			.attr("x", "50%")
			.attr("y", "90%")
			.attr("text-anchor", "middle")
			.text(network.parentVis.config.meta.nodes.styleEncoding.color.attr)
	}
	return network;
}
