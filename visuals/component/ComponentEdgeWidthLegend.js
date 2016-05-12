visualizationFunctions.ComponentEdgeWidthLegend = function(element, data, opts) {
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
	network.VisFunc = function() {
		var legendData = network.parentVis.Scales.edgeStrokeScale;
		var w = network.config.dims.width * .75;
		network.SVG.area = network.SVG.append("g")
            .attr("transform", "translate(" + 10 + "," + 25 + ")")
            .attr("width", network.config.dims.fixedWidth)
            .attr("height", network.config.dims.fixedHeight)

		$("#cewl").html(network.parentVis.config.meta.edges.prettyMap[network.parentVis.config.meta.edges.styleEncoding.opacity.attr] || network.parentVis.config.meta.edges.styleEncoding.opacity.attr)
        network.SVG.pathG = network.SVG.area.selectAll(".path")
        	.data(network.parentVis.Scales.edgeOpacityScale.domain().reverse())
        	.enter()
        	.append("g")
        	.attr("transform", function(d, i) {
        		return "translate(10," + (15 * i + 5) + ")";
        	})
        network.SVG.path = network.SVG.pathG
        	.append("path")
        	.attr("d", function(d, i) {
        		return Utilities.lineFunction([{
        			"x": 0,
        			"y": 0
        		}, {
        			"x": (network.config.dims.fixedWidth - 50),
        			"y": 0
        		}])
        	})
        	.attr("stroke", "black")
        	.attr("stroke-width", 3)
        	.attr("opacity", function(d, i) {
        		return network.parentVis.Scales.edgeOpacityScale(d)
        	})
        network.SVG.text = network.SVG.pathG
        	.append("text")
        	.attr("x", (network.config.dims.fixedWidth - 45))
        	.attr("y", 4)
        	.text(function(d, i) {
        		return Math.round(d);
        	})

		// network.SVG.append("line")
		// 	.attr("class", "e")
		// 	.attr("x1", "10%")
		// 	.attr("y1", "10%")
		// 	.attr("x2", "70%")
		// 	.attr("y2", "10%")
		// 	.style("stroke-width", legendData.range()[0])
		// 	.style("stroke", "black")
		// network.SVG.append("line")
		// 	.attr("class", "e")
		// 	.attr("x1", "10%")
		// 	.attr("y1", "30%")
		// 	.attr("x2", "70%")
		// 	.attr("y2", "30%")
		// 	.style("stroke-width", legendData.range()[1])
		// 	.style("stroke", "black")
		// network.SVG.append("line")
		// 	.attr("class", "e")
		// 	.attr("x1", "10%")
		// 	.attr("y1", "50%")
		// 	.attr("x2", "70%")
		// 	.attr("y2", "50%")
		// 	.style("stroke-width", legendData.range()[2])
		// 	.style("stroke", "black")
		// network.SVG.append("text")
		// 	.attr("class", "l2")
		// 	.attr("x", "80%")
		// 	.attr("y", "15%")
		// 	.attr("text-anchor", "middle")
		// 	.text(legendData.domain()[0])
		// network.SVG.append("text")
		// 	.attr("class", "l2")
		// 	.attr("x", "80%")
		// 	.attr("y", "35%")
		// 	.attr("text-anchor", "middle")
		// 	.text(legendData.domain()[1])
		// network.SVG.append("text")
		// 	.attr("class", "l2")
		// 	.attr("x", "80%")
		// 	.attr("y", "55%")
		// 	.attr("text-anchor", "middle")
		// 	.text(legendData.domain()[2])
		// network.SVG.append("text")
		// 	.attr("class", "l2")
		// 	.attr("x", "50%")
		// 	.attr("y", "90%")
		// 	.attr("text-anchor", "middle")
		// 	.text(network.parentVis.config.meta.edges.prettyMap[network.parentVis.config.meta.edges.styleEncoding.strokeWidth.attr] || network.parentVis.config.meta.edges.styleEncoding.strokeWidth.attr)
	}
	return network;
}