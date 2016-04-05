visualizationFunctions.NodeFocus = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.config = network.CreateBaseConfig();
	network.parentVis = visualizations[opts.ngComponentFor];

	network.VisFunc = function() {	
		network.SVG = d3.select(element[0])
			.append("svg")
			.attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
			.attr("height", network.config.dims.height + network.config.margins.top - network.config.margins.bottom)
			.style("background", "none")
			.append("g")
			.attr("class", "canvas " + opts.ngIdentifier);


        var focusNodeR = 20;
		network.SVG.focusNodeG = network.SVG.append("g")
			.attr("transform", "translate(" + (network.config.dims.fixedWidth  / 2) + "," + (network.config.dims.fixedHeight  / 2) + ")")
		network.SVG.focusNode = network.SVG.focusNodeG.append("circle")
			.attr("r", focusNodeR)
			.attr("fill", "red")

		network.SVG.leftNode = network.SVG.focusNodeG.append("circle")
			.attr("r", focusNodeR * 2)
			.attr("cx", -focusNodeR * 3)
			.attr("cy", focusNodeR / 2)
			.attr("fill", "none")
			.style("stroke", "black")
			.style("stroke-dasharray", ("3, 3"))
		network.SVG.rightNode = network.SVG.focusNodeG.append("circle")
			.attr("r", focusNodeR * 2)
			.attr("cx", focusNodeR * 3)
			.attr("cy", focusNodeR / 2)
			.attr("fill", "none")
			.style("stroke", "black")
			.style("stroke-dasharray", ("3, 3"))

		var inData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		network.SVG.testNodeG = network.SVG.focusNodeG.selectAll(".in")
			.data(inData)
			.enter()
			.append("g")
			.attr("transform", function(d, i) {
				var x = (focusNodeR * 3) + (focusNodeR * 2) * Math.cos(2 * Math.PI * (i / (inData.length * 1.25)) * 2);
				var y = (focusNodeR / 2) + (focusNodeR * 2) * Math.sin(2 * Math.PI * (i / (inData.length * 1.25)) * 2));
				return "translate(" + x + "," + y + ")";
			})
			
		network.SVG.testNode = network.SVG.testNodeG.append("circle")
			.attr("r", 6)
			.attr("fill", function(d, i) {
				if (i== 0) return "red"
				return "blue"
			})
			// .attr("transform", function(d, i) {
			// 	return "rotate(" + ((18 * 2) + 18 * i) + " " + (focusNodeR * 1.5) + " " + (focusNodeR * 1.5) + ")"
			// })
		network.SVG.testEdge = network.SVG.testNodeG.append("path")
			.attr("d", function(d, i) {
				return "M0,0L" + (network.config.dims.fixedWidth / 2) + "," + (network.config.dims.fixedHeight / 2)
			})
			.style("stroke", "black")

		// network.SVG.centerNodeG = network.SVG
		// 	.append("g")
		// 	.attr("transform", "translate(" + (network.config.dims.fixedWidth / 4 * 3) + "," + (network.config.dims.fixedHeight / 4 * 3 - 20) + ")");			
		// network.SVG.edge = network.SVG.centerNodeG
		// 	.append("path")
		// 	.attr("class", "e")
		// 	.attr("d", function(d, i) {
		// 		return Utilities.lineFunction([{
		// 			"x": 0,
		// 			"y": 0
		// 		}, {
		// 			"x": -(network.config.dims.fixedWidth / 4 * 2),
		// 			"y": -(network.config.dims.fixedHeight / 4 * 2 - 20)
		// 		}])

		// 	})
		// 	// .style("stroke-dasharray", ("5, 5"))
		// 	.style("stroke-width", 2)
		// network.SVG.centerNode = network.SVG.centerNodeG
		// 	.append("circle")
		// 	.attr("class", "innerNode n")
		// 	.attr("r", 25)
		// 	.style("stroke-width", 2)

		// 	.moveToFront();

		// network.SVG.outerNodeG = network.SVG
		// 	.append("g")
		// 	.attr("transform", "translate(" + (network.config.dims.fixedWidth / 4) + "," + (network.config.dims.fixedHeight / 4) + ")");			
		// network.SVG.outerNode = network.SVG.outerNodeG
		// 	.append("circle")
		// 	.attr("class", "innerNode n")
		// 	.attr("r", network.config.dims.width * .05)
		// 	.style("fill", "white")
		// 	// .style("stroke-dasharray", ("5, 5"))

		// 	.style("stroke-width", 2)
		// 	.moveToFront();
		// network.SVG.outerNodeG.append("text")
		// 	.attr("class", "l")
		// 	.attr("x", -(network.config.dims.width * .1  / 2) + network.config.dims.width * .1 + 5)
		// 	.attr("y",  (network.config.dims.width * .1  / 4))
		// 	.text("x" + network.filteredData.edges.data.length)
		// network.SVG.labelText = network.SVG.append("text")
		// 	.attr("class", "l")
		// 	.attr("x", 20)
		// 	.attr("y",  network.config.dims.height - 10)	
		// 	.text(network.filteredData.nodes.data.label || "")
		// network.SVG.centerNodeG.moveToFront();
		// network.SVG.outerNodeG.moveToFront();


	}
	return network;
}