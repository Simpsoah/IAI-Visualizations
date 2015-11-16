//TODO: Does not work as a primary visualization anymore
//TODO: Does not work with 'horizontal' orientation
//TODO: Locked down to nodes only...not[network.PrimaryDataAttr]
visualizationFunctions.componentBarGraph = function(element, data, opts) {
	//options
	var network = visualizations[opts.ngIdentifier];
	// network.InitFunc = function() {		
		network.config = network.CreateBaseConfig();
		network.parentVis = visualizations[opts.ngComponentFor];
		network.textWidth = 150;
		network.textPadding = 10;
		network.textOffset = network.textWidth + network.textPadding;
		$(element).css({'overflow-y':'auto', 'overflow-x':'hidden'});
		var newElem = document.createElement("div");
		newElem.id = "inner-" + opts.ngIdentifier;
		$(element).append(newElem);
		network.SVG = d3.select(newElem)
			.append("svg")
			.attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
			.attr("height", network.config.dims.height)

		//functions
		network.SVG.sortFunction = function(a, b) {
			return d3.descending(a[network.config.meta[network.PrimaryDataAttr].styleEncoding.mainWoH.attr], b[network.config.meta[network.PrimaryDataAttr].styleEncoding.mainWoH.attr])
		}
	// }
	network.vertical = function() {
		var useData;
		if (opts.ngComponentFor) {
			//TODO: Find some way to determine the data
			useData = network.parentVis.GetData()[network.parentVis.PrimaryDataAttr].data;	
		} else {
			useData = network.GetData()[network.PrimaryDataAttr].data;
		}
		// var useData = network.parentVis.SVG.gnodes.data();
		Utilities.runJSONFuncs(network.config.meta, [useData, network.config]);

		network.SVG.attr("height", useData.length * network.config.meta[network.PrimaryDataAttr].styleEncoding.secondaryWoH.attr * 2 + 50)
		network.Scales.nodeBarSizeScale = Utilities.makeDynamicScale(
			useData,
			network.config.meta[network.PrimaryDataAttr].styleEncoding.mainWoH.attr,
			"linear", 
			[5, network.config.dims.fixedWidth - network.textOffset - 5]
		);

		//TODO: Get rid of this
		network.Scales.nodeBarSizeScaleReversed = Utilities.makeDynamicScale(
			useData,
			network.config.meta[network.PrimaryDataAttr].styleEncoding.mainWoH.attr,
			"linear", 
			[network.config.dims.fixedWidth - network.textOffset, 5]
		);

		var axis = d3.svg.axis()
			.scale(network.Scales.nodeBarSizeScaleReversed)
			.orient(top)
			.ticks(2)
		//TODO: Why isn't this aligned with the bars?
		network.SVG.append("g")
			.attr("class", "x axis l l2")
			.attr("transform", "translate(0,0)")
			.call(axis)

		network.Scales.barColorScale = Utilities.makeDynamicScale(
			useData,
			network.config.meta[network.PrimaryDataAttr].styleEncoding.color.attr,
			"linear",
			network.config.meta[network.PrimaryDataAttr].styleEncoding.color.range
		);

		network.SVG.bars = network.SVG.selectAll(".bar")
			.data(useData.sort(network.SVG.sortFunction))
			.enter()
			.append("rect")
			.attr("class", function(d, i) {
				return "b b" + d.id;
			}).each(function(d, i) {
				var currBar = d3.select(this);
				var barWidth = network.Scales.nodeBarSizeScale(d[network.config.meta[network.PrimaryDataAttr].styleEncoding.mainWoH.attr])
				var barHeight = network.config.meta[network.PrimaryDataAttr].styleEncoding.secondaryWoH.attr + 15;
				currBar
					.attr("x", network.config.dims.fixedWidth - barWidth - network.textOffset)
					.attr("y", barHeight * i + 20)
					.attr("width", barWidth)
					.attr("height", barHeight)
					.attr("fill", function(d, i) {
						return network.Scales.barColorScale(d[network.config.meta[network.PrimaryDataAttr].styleEncoding.color.attr])
					})
				network.SVG
					.append("text")
					.attr("class", "l l2 l" + d.id)
					.attr("dx", network.config.dims.fixedWidth - barWidth - network.textOffset + network.textPadding + barWidth)
					.attr("dy", barHeight * i + 20 + barHeight / 3 * 2)
					.text(d.label)
					.style("text-anchor", "start")
			})
		network.SVG.selectAll("text").classed("l2", true);
	}

	//exec
	switch (opts.ngOrientation) {
		case "vertical":
			network.VisFunc = network.vertical;
			break;
		case "horizontal":
			network.VisFunc = network.horizontal;
			break;			
	}

	return network;
}