visualizationFunctions.nodeFocus = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.config = network.CreateBaseConfig();
	network.parentVis = visualizations[opts.ngComponentFor];
	var data = network.GetData();

	network.SVG = d3.select(element[0])
		.append("svg")
		.attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
		.attr("height", network.config.dims.height + network.config.margins.top - network.config.margins.bottom)
		.style("background", "none")
		.append("g")
		.attr("class", "canvas " + opts.ngIdentifier);
	network.parentVis = visualizations[opts.ngComponentFor];
	network.VisFunc = function() {
		//Edges are actually outer nodes in this case.
		network.SVG.outerNodesG = network.SVG.selectAll(".outer")
			.append("g")
			.data(data.edges.data)
			.enter()
			.append("g")
			.attr("transform", function(d, i) {
				var theta = (Math.PI * 2) / data.edges.data.length;
				var angle = theta * i;
				var x = ((network.config.dims.fixedWidth / 2) - 10) * Math.cos(angle) + network.config.dims.fixedWidth / 2;
				var y = ((network.config.dims.fixedHeight / 2) - 10) * Math.sin(angle) + network.config.dims.fixedHeight / 2;
				return "translate(" + x + "," + y + ")";
			});
		network.SVG.outerNodes = network.SVG.outerNodesG
			.append("path")
			.attr("class", "e")
			.attr("d", function(d, i) {
				var theta = (Math.PI * 2) / data.edges.data.length;
				var angle = theta * i;
				var x = ((network.config.dims.fixedWidth / 2) - 10) * Math.cos(angle) + network.config.dims.fixedWidth / 2;
				var y = ((network.config.dims.fixedHeight / 2) - 10) * Math.sin(angle) + network.config.dims.fixedHeight / 2;
				return Utilities.lineFunction([{
					"x": 0,
					"y": 0
				}, {
					"x": (network.config.dims.fixedWidth / 2) - x,
					"y": (network.config.dims.fixedHeight / 2) - y
				}])

			})
			.style("fill", "none")
			.style("stroke-width", .2)
		network.SVG.outerNodes = network.SVG.outerNodesG
			.append("circle")
			.attr("class", "n")
			.attr("r", 2)
		network.SVG.centerNodeG = network.SVG
			.append("g")
			.attr("transform", "translate(" + (network.config.dims.fixedWidth / 2) + "," + (network.config.dims.fixedHeight / 2) + ")");			
		network.SVG.centerNode = network.SVG.centerNodeG
			.append("circle")
			.attr("class", "innerNode n")
			.attr("r", network.config.dims.width * .1)
			.moveToFront();
		network.SVG.centerNodeG.append("text")
			.attr("class", "l")
			.attr("x", -(network.config.dims.width * .1  / 2))
			.attr("y",  (network.config.dims.width * .1  / 4))
			.text(Utilities.format(data.edges.data.length))
	}
	return network;
}