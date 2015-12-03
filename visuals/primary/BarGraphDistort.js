visualizationFunctions.barGraphDistort = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.SVG = network.config.easySVG(element[0])
		.attr("background", "white")
		.attr("class", "canvas " + opts.ngIdentifier)
		.append("g")
		.attr("transform", "translate(" + (network.config.margins.left) + "," + (network.config.margins.top) + ")")
	network.VisFunc = function() {
			var useData = network.GetData()[network.PrimaryDataAttr].data;
			if (!opts.ngDataField) {
				useData = network.parentVis.GetData()[network.parentVis.PrimaryDataAttr].data;
				network.Scales = network.parentVis.Scales;
				if (!network.config.meta) {
					network.config.meta = network.parentVis.config.meta	
				}
			} else {
				useData = useData.slice(0,64)
			}

			//TODO: Remove
			// useData = useData.slice(0,64)
			
			//TODO: Make sort in VisualizationClass
			useData = useData.sort(function(a, b) {
				var sortAttr = network.config.meta[network.PrimaryDataAttr].styleEncoding.size.attr;
				return b[sortAttr] - a[sortAttr]
			})

			network.Scales.xScale = d3.scale.linear()
				.domain([0,1])
				.range([3, network.config.dims.fixedWidth - (network.config.dims.fixedWidth * .35)])
			network.Scales.yScale = d3.scale.linear()
				.domain([0, 1])
				.range([0, (network.config.dims.fixedHeight - 75) / useData.length])

			network.SVG.xaxis = d3.svg.axis()
				.scale(network.Scales.xScale)
				.orient("top")
				.ticks(6)
				.tickSize(network.config.dims.fixedHeight)
				.tickFormat(function(d) {
					var test = Utilities.round(d, 2);
					return Utilities.format(test);
				})

			network.SVG.gxaxis = network.SVG.append("g")
				.attr("class", "axis l l2")
				.style("stroke-width", 1)
				.attr("transform", "translate(" + (network.config.dims.fixedWidth * .35 - 3) + "," + (network.config.dims.fixedHeight + 25) + ")")
				.call(network.SVG.xaxis)
			network.SVG.select(".domain").remove();

			network.SVG.gBars = network.SVG.selectAll(".gBarg")
				.append("g")
				.data(useData)
				.enter()
				.append("g")
				.attr("class", function(d, i) {
					return "gBar i" + i
				})
				.attr("transform", function(d, i) {
					return "translate(" + (network.config.dims.fixedWidth * .35) + "," + (network.Scales.yScale(i) + 25) + ")";
				})
			network.SVG.barRects = network.SVG.gBars.append("rect")
				.attr("class", function(d, i) {
					return "b b" + d.id
				})
				.attr("width", function(d, i) {
					return d.id
				})
				.attr("height", function(d, i) {
					return network.Scales.yScale(1) - 2
				})
			network.SVG.barLabels = network.SVG.gBars.append("text")
				.attr("class", "l")
				.style("text-anchor", "end")
				.attr("x", -3)
				.attr("y", network.Scales.yScale(1) / 2)
				.style("font-size", network.Scales.yScale(1) - 2 + "px")
				


	}
	return network;
}
