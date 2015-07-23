function createBaseConfig(element, opts) {
	var out = {};
	out.margins = {};
	out.dims = {};
	out.margins.top = opts.ngMarginsTop || Utilities.removeCharactersFromString($(element).css("margin-top"));
	out.margins.right = opts.ngMarginsRight || Utilities.removeCharactersFromString($(element).css("margin-right"));
	out.margins.bottom = opts.ngMarginsBottom || Utilities.removeCharactersFromString($(element).css("margin-bottom"));
	out.margins.left = opts.ngMarginsLeft || Utilities.removeCharactersFromString($(element).css("margin-left"));
	out.dateFormat = opts.ngDateFormat || "%d-%b-%y";
	out.dims.width = (opts.ngWidth || $(element[0]).width()) - out.margins.left - out.margins.right;
	out.dims.height = (opts.ngHeight || $(element[0]).height()) - out.margins.top - out.margins.bottom;
	out.colors = opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362", "#FFD24F", "#FF661C", "#DB4022", "#FF5373", "#EE81A8", "#EE43A9", "#B42672", "#91388C", "#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5", "#0067C9", "#008FDE", "#009ADC", "#007297", "#12978B", "#00BBB5", "#009778", "#75A33D", "#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"];

	out.easySVG = function(selector) {
		return d3.select(selector)
			.append("svg")
			.attr("x", 0)
			.attr("y", 0)
			.attr("viewBox", "0 0 " + (out.dims.width + out.margins.left + out.margins.right) + " " + (out.dims.height + out.margins.top + out.margins.bottom))
			// .attr("preserveAspectRatio", "xMidYMid meet");
			// .attr("width", out.dims.width + out.margins.left + out.margins.right)
			// .attr("height", out.dims.height + out.margins.top + out.margins.bottom)
	}
	return out;
}
var force;
var edgeOpacityScale;
var nodeScale;
var visualizationFunctions = {
	forceNetwork: function(element, data, opts) {
		var config = createBaseConfig(element, opts);
		config.meta = meta.force;
		var svg = config.easySVG(element[0]).append("g").attr("class", "canvas")
			.attr("transform", "translate(" + (config.margins.left + config.dims.width / 2) + "," + (config.margins.top + config.dims.height / 2) + ")");
		svg.selectAll('*').remove();

		d3.json("data/nodes.json", function(nodes) {
			d3.json("data/edges.json", function(edges) {
				doVis(nodes, edges);
			});
		});
		function doVis(nodeData, edgeData) {
			nodeScale = d3.scale.linear()
				.domain(d3.extent(nodeData, function(d) {
					return d[config.meta.nodes.styleEncoding.radius.attr];
				}))
				.range(config.meta.nodes.styleEncoding.radius.range);

			var edgeScale = d3.scale.linear()
				.domain(d3.extent(edgeData, function(d) {
					return d[config.meta.edges.styleEncoding.strokeWidth.attr];
				}))
				.range(config.meta.edges.styleEncoding.strokeWidth.range);

			edgeOpacityScale = d3.scale.linear()
				.domain(d3.extent(edgeData, function(d) {
					return d[config.meta.edges.styleEncoding.opacity.attr];
				}))
				.range(config.meta.edges.styleEncoding.opacity.range);

			force = d3.layout.force()
				.nodes(nodeData)
				.links(edgeData)
				// .size([config.dims.width, config.dims.height])
				// .linkStrength(0.1)
				// .friction(0.9)
				// .linkDistance(.5)
				.charge(-2)
				.chargeDistance(1000)
				// .gravity(0.012)
				.theta(.5)
				// .alpha(0.1)
				.start();

			setTimeout(function() {
				force.stop();
				force.charge(-25);
				force.start();
			}, 500);

			var drag = force.drag().on("dragstart", dragstart);
			var links = svg.selectAll(".link")
				.data(edgeData)
				.enter().append("line")
				.attr("x1", 0)
				.attr("y1", 0)
				.attr("x2", 0)
				.attr("y2", 0)
				.attr("class", "link");
			var nodes = svg.selectAll(".node")
				.data(nodeData)
				.enter().append("g")
				.attr("class", "node")
			nodes.append("circle")
				.on("dblclick", click)
				.call(drag)
				// .call(force.drag)
			updateAll();

			nodes.append("text")
				.attr("dx", 0)
				.attr("dy", ".35em")
				.text(function(d) { 
					if (d[config.meta.nodes.styleEncoding.radius.attr] > nodeScale.domain()[1] * config.meta.labels.styleEncoding.displayTolerance) {
						return d[config.meta.labels.styleEncoding.attr];
					}
				})

// var fisheye = d3.fisheye.circular()
// 	.radius(120);
// svg.on("mousemove", function() {
// 	force.stop();
// 	fisheye.focus(d3.mouse(this));
// 	nodes.each(function(d) { d.fisheye = fisheye(d); })
// 		.attr("cx", function(d) { return d.fisheye.x; })
// 		.attr("cy", function(d) { return d.fisheye.y; })
// 		.attr("r", function(d)  { return d.fisheye.z * nodeScale(d[nodeRAttr]); });
// 	links
// 		.attr("x1", function(d) { return d.source.fisheye.x; })
// 		.attr("y1", function(d) { return d.source.fisheye.y; })
// 		.attr("x2", function(d) { return d.target.fisheye.x; })
// 		.attr("y2", function(d) { return d.target.fisheye.y; });
// });

			function click(d) {
				d3.select(this).classed("fixed", d.fixed = false);
				// d3.select(this).remove();
			}
			function dragstart(d) {
				d3.select(this).classed("fixed", d.fixed = true);
			}

			function updateAll() {
				updateNodes();
				updateLinks();
			}

			function updateNodes() {
				d3.selectAll("circle")
					.attr("r", function(d, i) {
						if (d[config.meta.nodes.styleEncoding.radius.attr] > 30) {
						}
						return nodeScale(d[config.meta.nodes.styleEncoding.radius.attr])
					})
					.style("fill", function(d, i) {
						return config.colors[i % config.colors.length];
					})
					.style("stroke", "#FFF")
					.style("stroke-width", 1)
			}

			function updateLinks() {
				links
					.call(force.drag)
					.style("stroke-width", function(d) {
						return edgeScale(d[config.meta.edges.styleEncoding.strokeWidth.attr]);
					})
					.style("opacity", function(d) {
						return edgeOpacityScale(d[config.meta.edges.styleEncoding.opacity.attr]);
					})
					.style("stroke", "#CD7F32")
					// .style("marker-end",  "url(#licensing)") // Modified line 
			}
			var i = 0;
			force.on("tick", function() {
				if (i % 2 == 0) {
					links
						.attr("x1", function(d) {
							return d.source.x;
						})
						.attr("y1", function(d) {
							return d.source.y;
						})
						.attr("x2", function(d) {
							return d.target.x;
						})
						.attr("y2", function(d) {
							return d.target.y;
						});

					d3.selectAll("circle")
						.attr("cx", function(d) {
							return d.x;
						})
						.attr("cy", function(d) {
							return d.y;
						});

					d3.selectAll("text")
						.attr("x", function (d) {
							return d.x;
						})
						.attr("y", function (d) {
							return d.y;
						});
				}
				i++;
			});

			function forceBoundsCollisionCheck(val, lim) {
				if (val <= -lim / 2) {
					return -lim / 2;
				}
				if (val >= lim / 2) {
					return lim / 2;
				}
				return val;
			}


		}
	}
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};
