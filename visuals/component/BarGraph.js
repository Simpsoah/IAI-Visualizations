visualizationFunctions.componentBarGraph = function(element, data, opts) {
	$(element).css({'overflow-y':'auto', 'overflow-x':'hidden'});
	var newElem = document.createElement("div");
	newElem.id = "inner-" + opts.ngIdentifier;
	$(element).append(newElem);
	var network = visualizations[opts.ngIdentifier];
	network.config = network.CreateBaseConfig();
	network.SVG = d3.select(newElem)
		.append("svg")
		.attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
	network.parentVis = visualizations[opts.ngComponentFor];
	network.SVG.sortFunction = function(a, b) {
		return d3.descending(a[network.parentVis.SVG.nodeSizeAttr], b[network.parentVis.SVG.nodeSizeAttr])
	}
	//TODO: Work on these values with designer
	var textWidth = 150;
	var textPadding = 6;
	var textOffset = textWidth + textPadding;
	//TODO: Change the size coding
	network.Update = function() {
		network.SVG.attr("height", initData.length * 30 + 50);
	}
	network.VisFunc = function() {
		var initData = visualizations.mainVis.SVG.gnodes.selectAllToleranceFiltered(true).data();
		// var initData = network.parentVis.SVG.gnodes.data();
		network.SVG.attr("height", initData.length * 30 + 50)

		Utilities.runJSONFuncs(network.config.meta, [initData, network.config]);
		var orientation = {
			"vertical": {
				"range": network.config.dims.fixedWidth,
				"barWidth": function(d, i) {
					return network.Scales.nodeBarSizeScale(d);
				},
				"barHeight": function(d, i) {
					return 30;
				},
				"x": function(d, i) {
					return 0;
				},
				"y": function(d, i) {
					return d * i + 15;
				}
			},
			"horizontal": {
				"range": network.config.dims.fixedHeight,
				"barWidth": function(d, i) {
					return network.config.dims.fixedWidth / initData.length;
				},
				"barHeight": function(d, i) {
					return network.Scales.nodeBarSizeScale(d);
				},
				"x": function(d, i) {
					return d * i;
				},
				"y": function(d, i) {
					return network.config.dims.height - d - network.config.margins.bottom;
				}
			}
		}[opts.ngOrientation];

		network.Scales.nodeBarSizeScale = Utilities.makeDynamicScale(
			initData,
			network.parentVis.SVG.nodeSizeAttr,
			"linear", 
			[5, orientation.range - textOffset - 5]
		);

		//TODO: Get rid of this
		network.Scales.nodeBarSizeScaleReversed = Utilities.makeDynamicScale(
			initData,
			network.parentVis.SVG.nodeSizeAttr,
			"linear", 
			[orientation.range - textOffset - 5, 5]
		);

		var xAxis = d3.svg.axis()
			.scale(network.Scales.nodeBarSizeScaleReversed)
			.orient("top")
			.ticks(3)
		//TODO: Why isn't this aligned with the bars?
		network.SVG.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(" + 5 + ",20)")
			.style("fill", "none")
			.call(xAxis)

		network.SVG.bars = network.SVG.selectAll(".bar")
			.data(initData.sort(network.SVG.sortFunction))
			.enter()
			.append("rect")
			.attr("class", function(d, i) {
				return "b b" + d.id;
			}).each(function(d, i) {
				var currBar = d3.select(this);
				var barNode = network.parentVis.SVG.select(".n" + d.id);
				var barWidth = orientation.barWidth(d[network.parentVis.SVG.nodeSizeAttr]);
				var barHeight = orientation.barHeight(d[network.parentVis.SVG.nodeSizeAttr]);
				currBar
					.attr("x", network.config.dims.fixedWidth - orientation.x(barWidth, i) - barWidth - textOffset)
					.attr("y", orientation.y(barHeight, i) + 5)
					.attr("width", barWidth)
					.attr("height", barHeight)
					.attr("fill", barNode.attr().style("fill"))
				network.SVG
					.append("text")
					.attr("class", "l l2 l" + d.id)
					.attr("dx", orientation.x(barWidth, i) + textPadding + network.Scales.nodeBarSizeScale.range()[network.Scales.nodeBarSizeScale.range().length - 1])
					.attr("dy", orientation.y(barHeight, i) + barHeight / 3 * 2)
					.text(d.label)
					.style("text-anchor", "start")
			})
	}
	return network;
}