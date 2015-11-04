visualizationFunctions.forceNetwork = function(element, data, opts) {
		var network = visualizations[opts.ngIdentifier];
		var nodeData;
		var edgeData;
		var data = data;
		data.nodes = data.nodes || {};
		data.nodes.data = data.nodes.data || {};
		data.edges = data.edges || {};
		data.edges.data = data.edges.data || {};
		network.parentVis = visualizations[opts.ngComponentFor];
		network.config = network.CreateBaseConfig();

		var zoom = d3.behavior.zoom()
			.scaleExtent([-3, 15])
			.on("zoom", zoomed);

		network.SVG = network.config.easySVG(element[0])
			.attr("background", "white")
			.attr("class", "canvas " + opts.ngIdentifier)
		    .call(zoom)
			.append("g")
			.attr("transform", "translate(" + (network.config.margins.left + network.config.dims.width / 2) + "," + (network.config.margins.top + network.config.dims.height / 2) + ")")
		function zoomed() {
  			network.SVG.attr("transform", "translate(" + ((network.config.margins.left + network.config.dims.width / 2) + d3.event.translate[0]) + "," + ((network.config.margins.top + network.config.dims.height / 2) + d3.event.translate[1]) + ")scale(" + d3.event.scale + ")");
		}
		nodeData = data.nodes.data;
		edgeData = data.edges.data;
		// This is to add a clickable background. The opacity MUST be greater than 0 to register a click. We don't want it overriding any background elements, so it's just baaaarely visible.
		network.SVG.background = network.SVG.append("rect")
			.attr("x", -(network.config.margins.left + network.config.dims.width / 2))
			.attr("y", -(network.config.margins.top + network.config.dims.height / 2))
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("fill", "white")
			.style("opacity", .0000000001)

		Utilities.runJSONFuncs(network.config.meta, [nodeData, network.config]);
		network.meta = network.config.meta;
		network.Scales.nodeSizeScale = null;
		network.Scales.nodeTextScale = null;
		network.Scales.nodeColorScale = null;
		network.Scales.edgeStrokeScale = null;
		network.Scales.edgeOpacityScale = null;
		network.SVG.force = d3.layout.force()
		// network.SVG.force = cola.d3adaptor()
			.nodes(nodeData)
			.links(edgeData)

		network.VisFunc = function() {
			nodeData = network.AngularArgs.data.nodes.data;
			edgeData = network.AngularArgs.data.edges.data;
			network.SVG.force.physicsOn = true;
			network.SVG.force.physicsToggle = function() {
				if (network.SVG.force.physicsOn) {
					network.SVG.force.physicsOn = false;
					this.stop();
				} else {
					network.SVG.force.physicsOn = true;
					this.start();
				};
			};
			var drag = network.SVG.force.drag()
				.on("dragstart", function() {
			  		d3.event.sourceEvent.stopPropagation();
				})
			Object.keys(network.meta.visualization.forceLayout).forEach(function(layoutAttr) {
				if (network.meta.visualization.forceLayout[layoutAttr] != null) {
					network.SVG.force[layoutAttr](network.meta.visualization.forceLayout[layoutAttr]);
				};
			});
			network.SVG.force.start();
			network.SVG.force.on("tick", function() {
				network.SVG.gnodes.selectAllToleranceFiltered(true).each(function() {
					var currNode = d3.select(this);
					var x;
					var y;
					var nodeR = network.SVG.select("." + opts.ngIdentifier + "n" + currNode.data()[0].id).attr("r");
					currNode.attr("transform", function(d) {
						x = forceBoundsCollisionCheck(d.x, network.config.dims.width, nodeR);
						y = forceBoundsCollisionCheck(d.y, network.config.dims.height, nodeR);
						return "translate(" + x + "," + y + ")"
					}).attr("storedX", x).attr("storedY", y);
				});
				network.SVG.links.selectAllToleranceFiltered(true).each(function() {
					var currLink = d3.select(this);
					currLink.attr("d", function(d) {
						var x1 = forceBoundsCollisionCheck(d.source.x, network.config.dims.width);
						var x2 = forceBoundsCollisionCheck(d.target.x, network.config.dims.width);
						var y1 = forceBoundsCollisionCheck(d.source.y, network.config.dims.height);
						var y2 = forceBoundsCollisionCheck(d.target.y, network.config.dims.height);
						return "M" + x1 + "," + y1 + "L" + x2 + "," + y2;
					});
				});
			});
			network.SVG.updateAll = function() {
				network.SVG.updateNodes();
				network.SVG.updateLinks();
				network.RunChildVisualizations();
			}
			var links = network.SVG.selectAll(".link")
				.data(edgeData)
				.enter().append("path")
				.attr("class", function(d, i) {
					// var dashed = (Math.floor(Math.random() * 20) % 2 == 0) ? "dashed" : "";
					// return dashed 
					return ""
					+ " link e s s" + d.source.id + " t t" + d.target.id;
				})
				.call(drag);
			network.SVG.links = links;

			network.SVG.updateLinks = function() {
				var notFilteredEdges = visualizations.mainVis.SVG.links.selectAllToleranceFiltered(true).data();
				network.Scales.edgeStrokeScale = Utilities.makeDynamicScale(
					notFilteredEdges,
					network.config.meta.edges.styleEncoding.strokeWidth.attr,
					"linear",
					network.config.meta.edges.styleEncoding.strokeWidth.range
				);
				network.Scales.edgeOpacityScale = Utilities.makeDynamicScale(
					notFilteredEdges,
					network.config.meta.edges.styleEncoding.opacity.attr,
					"linear",
					network.config.meta.edges.styleEncoding.opacity.range
				);

				network.Scales.edgeColorScale = Utilities.makeDynamicScale(
					notFilteredEdges,
					network.config.meta.edges.styleEncoding.color.attr,
					"linear",
					network.config.meta.edges.styleEncoding.color.range
				);

				links
					.style("stroke-width", function(d) {
						return network.Scales.edgeStrokeScale(d[network.config.meta.edges.styleEncoding.strokeWidth.attr]);
					})
					.style("opacity", function(d) {
						return network.Scales.edgeOpacityScale(d[network.config.meta.edges.styleEncoding.opacity.attr]);
					})
					// .style("stroke", function(d) {
					// 	return network.Scales.edgeColorScale(d[network.config.meta.edges.styleEncoding.color.attr]);
					// });
			};
			//TODO: Line up isolated nodes
			var gnodes = network.SVG.selectAll(".node")
				.data(nodeData)
				.enter().append("g")
				.attr("class", function(d, i) {
					return "node g g" + d[network.config.meta.nodes.identifier.attr];
				}).call(drag);
			var nodes = gnodes.append("circle")
				.attr("class", function(d, i) {
					return d[network.config.meta.labels.styleEncoding.attr] + " n " + opts.ngIdentifier + "n" + d[network.config.meta.nodes.identifier.attr];
				})


			network.SVG.gnodes = gnodes;
			network.SVG.nodes = nodes;
			network.SVG.append("g")
				.attr("class", "legendSize")
				.attr("transform", "translate(20, 40)");

			network.SVG.updateNodes = function() {
				var notFilteredGnodes = visualizations.mainVis.SVG.gnodes.selectAllToleranceFiltered(true);
				var notFilteredNodes = notFilteredGnodes.each(function(d) {
					return network.SVG.select("." + opts.ngIdentifier + "n" + d.id);
				});
				network.Scales.nodeSizeScale = Utilities.makeDynamicScale(
					notFilteredGnodes.data(),
					network.config.meta.nodes.styleEncoding.radius.attr,
					"linear",
					network.config.meta.nodes.styleEncoding.radius.range
				);
				network.Scales.nodeColorScale = Utilities.makeDynamicScale(
					notFilteredGnodes.data(),
					network.config.meta.nodes.styleEncoding.color.attr,
					"linear",
					network.config.meta.nodes.styleEncoding.color.range
				);

				//TODO: Only update not filtered node sizes
				network.SVG.nodes.selectAllToleranceFiltered(true)
					.attr("r", function(d, i) {
						return network.Scales.nodeSizeScale(d[network.config.meta.nodes.styleEncoding.radius.attr]);
					})
					.style("fill", function(d, i) {
						return network.Scales.nodeColorScale(d[network.config.meta.nodes.styleEncoding.color.attr]);
					})
				network.SVG.selectAll("text").remove();

				network.Scales.nodeTextScale = Utilities.makeDynamicScale(
					notFilteredNodes.data(),
					network.config.meta.nodes.styleEncoding.radius.attr,
					"linear",
					network.config.meta.labels.styleEncoding.range
				);



				network.SVG.gnodes.append("text").attr("class", function(d, i) {
					return "l l" + d[network.config.meta.nodes.identifier.attr];
				});
				network.SVG.selectAll("text")
					.attr("dx", 0)
					.attr("dy", 10)
					.style("font-size", function(d, i) {
						return network.Scales.nodeTextScale(d[network.config.meta.nodes.styleEncoding.radius.attr]);
					})
					.text(function(d, i) {
						if (d[network.config.meta.nodes.styleEncoding.radius.attr] > network.Scales.nodeSizeScale.domain()[1] * network.config.meta.labels.styleEncoding.displayTolerance) {
							return d[network.config.meta.labels.styleEncoding.attr];
						} else {
							try {
								this.remove();
							} catch (exception) {}
						};
					});
				gnodes.moveToFront();
				network.SVG.selectAll("text").moveToFront();
				network.SVG.selectAll("text").each(function() {
					d3.select(d3.select(this).node().parentNode).moveToFront();
				})
			};

			network.SVG.updateAll();
			//TODO: Change this to work with the outer bounds
				//TODO: Fix this. Is it an issue with the canvas dimensions?
			function forceBoundsCollisionCheck(val, lim, off) {
				var offset = 0;
				if (off) {
					offset = off;
				}
				if (val <= -lim / 2 - offset) return -lim / 2 - offset;
				if (val >= lim / 2 - offset) return lim / 2 - offset;
				return val;
			};

			// network.SVG.append("rect")
			// 	.attr("x", 20)
			// 	.attr("y", 20)
			// 	.attr("width", 250)
			// 	.attr("height", 250)
			// 	.style("fill", "none")
			// 	.style("stroke", "#FFF")

		}
		return network;
	}