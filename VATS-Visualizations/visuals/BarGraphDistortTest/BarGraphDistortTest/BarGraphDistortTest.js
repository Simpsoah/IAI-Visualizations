visualizationFunctions.BarGraphDistortTest = function(element, data, opts) {
	var network = visualizations[opts.ngIdentifier];
	network.parentVis = visualizations[opts.ngComponentFor];
	network.config = network.CreateBaseConfig();
	network.SVG = network.config.easySVG(element[0])
		.attr('background', 'white')
		.attr('class', 'canvas ' + opts.ngIdentifier)
		.style("overflow", "scroll")
		.append('g')
		.attr('transform', 'translate(' + (network.config.margins.left) + ',' + (network.config.margins.top) + ')')
	network.VisFunc = function() {
		var useData = network.filteredData[network.PrimaryDataAttr].data;
		var barHeight = 20;
		var heightFixed = 20 * useData.length;
		network.Scales.x = d3.scale.log()
			.domain([0.1, 1.1])
			.range([0, network.config.dims.fixedWidth])
		network.Scales.x1 = d3.scale.log()
			.domain([0.1, 1.1])
			.range([0, network.config.dims.fixedWidth])
		network.Scales.y = d3.scale.linear()
			.domain([0, 1])
			.range([0, heightFixed])
		network.Scales.y1 = d3.scale.linear()
			.domain([0, 1])
			.range([0, heightFixed])


		network.config.margins.left = 150;
		network.config.easyGraphLayout(network);
		network.config.easyGraph(network, {
			x: {
				scale1: network.Scales.x,
				scale2: network.Scales.x1,
				orient: "top",
				label: ""
			},
			y: {
				scale1: network.Scales.y,
				scale2: network.Scales.y1,
				orient: "right",
				label: ""
			},
			t: {
				orient: "top",
				label: ""	
			}
		});
		network.SVG.yAxisG.remove();
		network.SVG.barG = network.SVG.graphArea.selectAll(".barG")
			.data(useData)
			.enter()
			.append("g")
			.attr("transform", function(d, i) {
				return "translate(0, " + (20 * i) + ")"
			})

		network.SVG.bar = network.SVG.barG.append("rect")
			.attr("width", 20)
			.attr("height", barHeight - 1)
			.attr("fill", "green")
		network.SVG.barText = network.SVG.barG.append("text")
			.attr("x", -4)
			.attr("y", barHeight * .75)
			.attr("text-anchor", "end")
			.text("Null")

		// var offset = 20;
		// var zoomLevels = [1, 3];
		// var fixedFixedWidth = network.config.dims.fixedWidth - offset - 120;
		// var fixedFixedHeight = network.config.dims.fixedHeight - offset * 3;
		// var barHeight = Math.max(fixedFixedHeight / useData.length, 1);
		// var barPadding = 2;

		// network.Scales.xScale = d3.scale.log()
		// 	.domain([0.1, 1.1])
		// 	.range([0, fixedFixedWidth])
		// network.Scales.yScale = d3.scale.linear()
		// 	.domain([0, 1])
		// 	.range([0, fixedFixedHeight / useData.length])

		// network.SVG.xAxis = d3.svg.axis()
		// 	// .scale(network.Scales.xScale)
		// 	.ticks(4)
		// 	.tickSize(-fixedFixedHeight)
		// 	.orient('bottom');

		// var zoom = d3.behavior.zoom()
		// 	.y(network.Scales.yScale)
		// 	.scaleExtent(zoomLevels)
		// 	.on('zoom', zoomed);

		// network.SVG.chartArea = network.SVG.append('g')
		// 	.attr("transform", "translate(0,0)")

		// network.SVG.zoomArea = network.SVG.chartArea.append('svg:rect')
		// 	.attr("width", fixedFixedWidth)
		// 	.attr("height", fixedFixedHeight)
		// 	.attr("fill", "white")
		// network.SVG.xAxisG = network.SVG.append("g")
		// 	.attr("class", "x axis")
		// 	.attr("transform", "translate(0," + fixedFixedHeight + ")")

		// network.SVG.barG = network.SVG.chartArea.selectAll('.barG')
		// 	.append('g')
		// 	.attr('transform', 'translate(0,' + (fixedFixedHeight) + ')')
		// 	.call(network.SVG.xAxis)
		// 	.data(useData)
		// 	.enter()

		// network.SVG.bar = network.SVG.barG
		// 	.append('rect')
		// 	.attr("class", function(d, i) {
		// 		return "b b" + d.id
		// 	})
		// 	.attr('y', function(d, i) {
		// 		return barHeight * i
		// 	})
		// 	.attr('width', function(d, i) {
		// 		return 2
		// 	})
		// 	.attr('height', barHeight - barPadding);


		// network.SVG.barText = network.SVG.barG
		// 	.append('text')
		// 	.style("text-anchor", "end")
		// 	.attr("x", -2)
		// 	.attr('y', function(d, i) {
		// 		return barHeight * i + (barHeight / 2) + barPadding
		// 	})
		// 	.style("font-size", ((barHeight - barPadding) + "px"))
		// 	.text("asd")

		// network.SVG.clipPath = network.SVG.append('clipPath')
		// 	.attr('id', 'clip')
		// 	.append('rect')
		// 	.attr('x', -network.config.dims.fixedWidth)
		// 	.attr('width', network.config.dims.fixedWidth * 2)
		// 	.attr('height', fixedFixedHeight);

		// network.SVG.chartArea.attr('clip-path', function(d, i) {
		// 	return 'url(#clip)'
		// })

		// function zoomed() {
		// 	//Take this out...Not sure what the problem is.
		// 	network.parentVis.SVG.force.start()
		// 	var trans = zoom.translate();
		// 	var scale = zoom.scale();
		// 	var tx = Math.min(0, Math.max(fixedFixedWidth * (1 - scale), trans[0]));
		// 	var ty = Math.min(0, Math.max(fixedFixedHeight * (1 - scale), trans[1]));
		// 	network.SVG.bar
		// 		.attr('transform', 'translate(0,' + ty + ')')
		// 		.attr("height", scale * barHeight - barPadding)
		// 		.attr("y", function(d, i) {
		// 			return scale * (barHeight * i)
		// 		})

		// 	network.SVG.barText
		// 		.attr('transform', 'translate(0,' + ty + ') scale(' + d3.event.scale + ')');
		// }
		// network.SVG.call(zoom)
	}
	return network;
}
