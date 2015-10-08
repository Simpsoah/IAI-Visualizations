var visualizationFunctions = {
	//TODO: Change color attribute
	//TODO: No size coding if the scale has hard interval (etc: RT2TA || -1 to 1)
	//TODO: Talk to Michael/Cath about node click information display
	//
	//
	//
	//TODO: Split size and color coding *DONE*
	//TODO: Node color RT2TA fix so both don't update *DONE*
	//TODO: Fix highlighting *DONE*
	//TODO: List all possible attributes for nodes and edges in debug bar *DONE*
	//TODO: Change Node size coding - RT2TA to Change to Node size coding - {{Size Coding}} with background to not overlap *DONE*
	//TODO: Add data panel with all attributes *DONE*
	//
	//TODO: Remove attributes stuff
	//TODO: Temporarily remove highlight
	//
	//TODO: KNOWN ISSUES
	//	- Toggling physics off, then dragging an element turns physics back on. This doesn't reregister properly though. 
	//		So to turn physics off again, the button in the debug bar needs to be clicked twice
	//	- Highlighting the nodes doesn't work. I need to think of a better way to access nodes instead of node groups
	//	- The tolerance slider doesn't reset so the values slip out of range if you change the node size attribute
	forceNetwork: function(element, data, opts) {
		var network = visualizations[opts.ngIdentifier];
		var nodeData = data.nodes.data;
		var edgeData = data.edges.data;
		network.config = network.CreateBaseConfig();
		network.SVG = network.config.easySVG(element[0])
			.append("g")
			.attr("class", "canvas " + opts.ngIdentifier)
			.attr("transform", "translate(" + (network.config.margins.left + network.config.dims.width / 2) + "," + (network.config.margins.top + network.config.dims.height / 2) + ")")

		// This is to add a clickable background. The opacity MUST be greater than 0 to register a click. We don't want it overriding any background elements, so it's just baaaarely visible.
		network.SVG.background = network.SVG.append("rect")
			.attr("x", -(network.config.margins.left + network.config.dims.width / 2))
			.attr("y", -(network.config.margins.top + network.config.dims.height / 2))
			.attr("width", "100%")
			.attr("height", "100%")
			.attr("fill", "white")
			.style("opacity", .0000000001)

		Utilities.runJSONFuncs(network.config.meta, [nodeData, network.config]);
		var nodeData = network.AngularArgs.data.nodes.data;
		var edgeData = network.AngularArgs.data.edges.data;
		network.meta = network.config.meta;
		network.Scales.nodeSizeScale = null;
		network.Scales.nodeColorScale = null;
		network.Scales.edgeStrokeScale = null;
		network.Scales.edgeOpacityScale = null;
		network.VisFunc = function() {
			network.SVG.force = d3.layout.force()
				.nodes(nodeData)
				.links(edgeData);
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
			var drag = network.SVG.force.drag();
			Object.keys(network.meta.visualization.forceLayout).forEach(function(layoutAttr) {
				if (network.meta.visualization.forceLayout[layoutAttr] != null) {
					network.SVG.force[layoutAttr](network.meta.visualization.forceLayout[layoutAttr]);
				};
			});
			network.SVG.force.start();
			var i = 0;
			//TODO: Look into Bin Pack for multiple networks (or some algorithm to keep everything visually centered)
			//TODO: Start scale at 0 if positive range?
			//                                                                       #0000ff #fff    #008080
			//TODO: For values with diverging metrics, use an unbalanced scale? Ex:     |-----|---------|
			//                                                                         60     0        220 
			network.SVG.force.on("tick", function() {
				if (i % 1 == 0) {
					network.SVG.gnodes.selectAllToleranceFiltered(true).each(function() {
						var currNode = d3.select(this);
						var x;
						var y;
						var nodeR = network.SVG.select(".n" + currNode.data()[0].id).attr("r");
						currNode.attr("transform", function(d) {
							x = forceBoundsCollisionCheck(d.x, network.config.dims.width, nodeR);
							y = forceBoundsCollisionCheck(d.y, network.config.dims.height, nodeR);
							return "translate(" + x + "," + y + ")"
						}).attr("storedX", x).attr("storedY", y)
					});
					network.SVG.links.selectAllToleranceFiltered(true).each(function() {
						var currLink = d3.select(this);
						currLink.attr("d", function(d) {
							var x1 = forceBoundsCollisionCheck(d.source.x, network.config.dims.width)
							var x2 = forceBoundsCollisionCheck(d.target.x, network.config.dims.width)
							var y1 = forceBoundsCollisionCheck(d.source.y, network.config.dims.height)
							var y2 = forceBoundsCollisionCheck(d.target.y, network.config.dims.height)
							return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
						});
					});
				};
				if (i >= 100) i = 0;
				i++;
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
					var dashed = (Math.floor(Math.random() * 20) % 2 == 0) ? "dashed" : "";
					return dashed + " link e s s" + d.source.id + " t t" + d.target.id;
				}).call(drag);
			network.SVG.links = links;

			network.SVG.edgeWeightAttr = network.config.meta.edges.styleEncoding.strokeWidth.attr;
			network.SVG.edgeOpacityAttr = network.config.meta.edges.styleEncoding.opacity.attr;
			network.SVG.edgeColorAttr = network.config.meta.edges.styleEncoding.color.attr;

			network.SVG.updateLinks = function(arg) {
				if (arg) {
					//TODO: Clean this up.
					if (arg.edgeWeightAttr == "" || typeof arg.edgeWeightAttr == "undefined") {
					} else {
						network.SVG.edgeWeightAttr = arg.edgeWeightAttr;
					}
					if (arg.edgeOpacityAttr == "" || typeof arg.edgeOpacityAttr == "undefined") {
					} else {
						network.SVG.edgeOpacityAttr = arg.edgeOpacityAttr;
					}
					if (arg.edgeColorAttr == "" || typeof arg.edgeColorAttr == "undefined") {
					} else {
						network.SVG.edgeColorAttr = arg.edgeColorAttr;
					}					
				}
				var notFilteredEdges = visualizations.mainVis.SVG.selectAll(".link").selectAllToleranceFiltered(true).data();

				network.Scales.edgeStrokeScale = makeDynamicScale(
					notFilteredEdges,
					network.SVG.edgeWeightAttr,
					"linear",
					network.config.meta.edges.styleEncoding.strokeWidth.range
				);

				network.Scales.edgeOpacityScale = makeDynamicScale(
					notFilteredEdges,
					network.SVG.edgeOpacityAttr,
					"linear",
					network.config.meta.edges.styleEncoding.opacity.range
				);

				network.Scales.edgeColorScale = makeDynamicScale(
					notFilteredEdges,
					network.SVG.edgeColorAttr,
					"linear",
					network.config.meta.edges.styleEncoding.color.range
				);

				links
					.style("stroke-width", function(d) {
						return network.Scales.edgeStrokeScale(d[network.SVG.edgeWeightAttr]);
					})
					.style("opacity", function(d) {
						return network.Scales.edgeOpacityScale(d[network.SVG.edgeOpacityAttr]);
					})
					.style("stroke", function(d) {
						return network.Scales.edgeColorScale(d[network.SVG.edgeColorAttr]);
					});
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
					return d[network.config.meta.labels.styleEncoding.attr] + " n n" + d[network.config.meta.nodes.identifier.attr];
				})

			network.SVG.gnodes = gnodes;
			network.SVG.nodes = nodes;
			network.SVG.append("g")
				.attr("class", "legendSize")
				.attr("transform", "translate(20, 40)");
			network.SVG.nodeSizeAttr = network.config.meta.nodes.styleEncoding.radius.attr
			network.SVG.nodeColorAttr = network.config.meta.nodes.styleEncoding.color.attr

			network.SVG.updateNodes = function(arg) {
				if (arg) {
					//TODO: Clean this up.
					if (arg.nodeSizeAttr == "" || typeof arg.nodeSizeAttr == "undefined") {
					} else {
						network.SVG.nodeSizeAttr = arg.nodeSizeAttr;
					}
					if (arg.nodeColorAttr == "" || typeof arg.nodeColorAttr == "undefined") {
					} else {
						network.SVG.nodeColorAttr = arg.nodeColorAttr;
					}
				}
				var notFilteredGnodes = visualizations.mainVis.SVG.gnodes.selectAllToleranceFiltered(true);
				var notFilteredNodes = notFilteredGnodes.each(function(d) {
					return network.SVG.select(".n" + d.id);
				});
				network.Scales.nodeSizeScale = makeDynamicScale(
					notFilteredGnodes.data(),
					network.SVG.nodeSizeAttr,
					"linear",
					network.config.meta.nodes.styleEncoding.radius.range
				);
				network.Scales.nodeColorScale = makeDynamicScale(
					notFilteredGnodes.data(),
					network.SVG.nodeColorAttr,
					"linear",
					network.config.meta.nodes.styleEncoding.color.range
				);

				//TODO: Only update not filtered node sizes
				network.SVG.selectAll(".n").selectAllToleranceFiltered(true)
					.attr("r", function(d, i) {
						try {
							return network.Scales.nodeSizeScale(d[network.SVG.nodeSizeAttr]);
						} catch (exception) {
							//Throws exceptions when the node size is lower than 0. 
							//This happens when resizing filtered nodes. No problem.
						}
					})
					.style("fill", function(d, i) {
						return network.Scales.nodeColorScale(d[network.SVG.nodeColorAttr]);
					})
				network.SVG.selectAll("text").remove();
				network.SVG.gnodes.append("text").attr("class", function(d, i) {
					return "l l" + d[network.config.meta.nodes.identifier.attr];
				});
				network.SVG.selectAll("text")
					.attr("dx", 0)
					.attr("dy", 10)
					.text(function(d, i) {
						if (d[network.SVG.nodeSizeAttr] > network.Scales.nodeSizeScale.domain()[1] * network.config.meta.labels.styleEncoding.displayTolerance) {
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

			// network.SVG.updateAll();
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
	},
	//TODO: Scroll bar
	componentBarGraph: function(element, data, opts) {
		$(element).css({'overflow-y':'auto', 'overflow-x':'hidden'});
		var newElem = document.createElement("div");
		newElem.id = "inner-" + opts.ngIdentifier;
		$(element).append(newElem);
		var network = visualizations[opts.ngComponentFor].Children[opts.ngIdentifier];
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
		network.VisFunc = function() {
			var initData = visualizations.mainVis.SVG.gnodes.selectAllToleranceFiltered(true).data();
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

			network.Scales.nodeBarSizeScale = makeDynamicScale(
				initData,
				network.parentVis.SVG.nodeSizeAttr,
				"linear", 
				[5, orientation.range - textOffset - 5]
			);

			//TODO: Get rid of this
			network.Scales.nodeBarSizeScaleReversed = makeDynamicScale(
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
	},
	componentNodeSizeLegend: function(element, data, opts) {
		var network = visualizations[opts.ngComponentFor].Children[opts.ngIdentifier];
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
			var legendData = [];
			network.Scales.legendScale = d3.scale.linear()
				.domain([0, 3])
				.range(network.parentVis.Scales.nodeSizeScale.range());
			network.Scales.legendTextScale = d3.scale.linear()
				.domain([0, 3])
				.range(network.parentVis.Scales.nodeSizeScale.domain());				
			for (var i = 0; i < 4; i++) {
				legendData.push(network.Scales.legendScale(i));
			}
			var legendGroup = network.SVG.selectAll(".legendItem")
				.data(legendData)
				.enter()
				.append("g")
				.attr("class", "legendItem legend");

			function setCX(d, i) {
				var base = network.Scales.legendScale.range()[1];
				if (i > 0) {
					base += d * i + legendData[0] * i + 10 * i;
				}
				return base;
			}

			function setCY(d, i) {
				var base = network.Scales.legendScale.range()[1] * 2 - 20;
				if (i < legendData.length - 1) {
					base += (legendData[legendData.length - 1] - d);
				}
				return base;
			}
			legendGroup.append("circle")
				.attr("class", ".n")
				.attr("r", function(d, i) {
					return d;
				})
				.attr("cx", function(d, i) {
					return setCX(d, i);
				})
				.attr("cy", function(d, i) {
					return setCY(d, i);
				})
				.style("fill", "none")

			legendGroup.append("text")
				.attr("class", "legendItemText")
				.attr("dx", function(d, i) {
					return setCX(d, i);
				})
				.attr("dy", function(d, i) {
					return setCY(d, i) + d + 13;
				})
				.attr("text-anchor", "middle")
				.text(function(d, i) {
					return Math.round(network.Scales.legendTextScale(i));
				})
			network.SVG.append("text")
				.attr("x", "50%")
				.attr("y", "90%")
				.attr("text-anchor", "middle")
				.text(network.parentVis.SVG.nodeSizeAttr);

		}
		return network;
	},
	componentNodeColorLegend: function(element, data, opts) {
		var network = visualizations[opts.ngComponentFor].Children[opts.ngIdentifier];
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
				.text(network.parentVis.SVG.nodeColorAttr)
		}
		return network;
	},
	componentOpacityLegend: function(element, data, opts) {
		var network = visualizations[opts.ngComponentFor].Children[opts.ngIdentifier];
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
			network.SVG.remove();
			var legendData = network.parentVis.Scales.edgeOpacityScale;
			var w = network.config.dims.width * .75;
			var gradient = network.SVG.append("svg:defs")
				.append("svg:linearGradient")
				.attr("id", "gradient")
				.attr("x1", "05%")
				.attr("y1", "0%")
				.attr("x2", "100%")
				.attr("y2", "0%")
				.attr("spreadMethod", "pad");
			gradient.append("svg:stop")
				.attr("offset", "0%")
				.attr("stop-color", "grey")
				.attr("stop-opacity", 0);
			gradient.append("svg:stop")
				.attr("offset", "100%")
				.attr("stop-color", "grey")
				.attr("stop-opacity", 1);				
			network.SVG.append("text")
				.attr("x", "10%")
				.attr("y", "70%")
				.attr("text-anchor", "start")
				.text(legendData.domain()[0])
			network.SVG.append("text")
				.attr("x", "90%")
				.attr("y", "70%")
				.attr("text-anchor", "end")
				.text(legendData.domain()[legendData.domain().length - 1])

			network.SVG.append("svg:rect")
				.attr("class", "gradientRect")
				.attr("width", w)
				.attr("height", "25%")
				.attr("x", "12.5%")
				.attr("y", "20%")
				.style("fill", "url(#gradient)");
			network.SVG.append("text")
				.attr("x", "50%")
				.attr("y", "90%")
				.attr("text-anchor", "middle")
				.text(network.parentVis.SVG.edgeOpacityAttr)
		}
		return network;
	},
	componentEdgeWidthLegend: function(element, data, opts) {
		var network = visualizations[opts.ngComponentFor].Children[opts.ngIdentifier];
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
			var legendData = network.parentVis.Scales.edgeStrokeScale;
			var w = network.config.dims.width * .75;
			network.SVG.append("line")
				.attr("x1", "10%")
				.attr("y1", "10%")
				.attr("x2", "70%")
				.attr("y2", "10%")
				.style("stroke-width", legendData.range()[0])
				.style("stroke", "black")
			network.SVG.append("line")
				.attr("x1", "10%")
				.attr("y1", "30%")
				.attr("x2", "70%")
				.attr("y2", "30%")
				.style("stroke-width", legendData.range()[1])
				.style("stroke", "black")
			network.SVG.append("line")
				.attr("x1", "10%")
				.attr("y1", "50%")
				.attr("x2", "70%")
				.attr("y2", "50%")
				.style("stroke-width", legendData.range()[2])
				.style("stroke", "black")
			network.SVG.append("text")
				.attr("x", "80%")
				.attr("y", "15%")
				.attr("text-anchor", "middle")
				.text(legendData.domain()[0])
			network.SVG.append("text")
				.attr("x", "80%")
				.attr("y", "35%")
				.attr("text-anchor", "middle")
				.text(legendData.domain()[1])
			network.SVG.append("text")
				.attr("x", "80%")
				.attr("y", "55%")
				.attr("text-anchor", "middle")
				.text(legendData.domain()[2])
			network.SVG.append("text")
				.attr("x", "50%")
				.attr("y", "90%")
				.attr("text-anchor", "middle")
				.text(network.parentVis.SVG.edgeWeightAttr)
		}
		return network;
	}


};

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.selectAllToleranceFiltered = function(invert) {
	return this.filter(function() {
		var isFiltered = d3.select(this).property("filtered");
		if (invert) {
			return !isFiltered;
		}
		return isFiltered;
	});
};

d3.selection.prototype.applyToleranceFilter = function() {
	return this.each(function() {
		var curr = d3.select(this);
		curr.property("filtered", true);
		return curr.classed("filtered", true).style("display", "none");
	});
};

d3.selection.prototype.removeToleranceFilter = function() {
	return this.each(function() {
		var curr = d3.select(this);		
		curr.property("filtered", false);
		return curr.classed("filtered", false).style("display", "block");
	});
};

d3.selection.prototype.mergeSelections = function(sel) {
	var merged = this;
	sel.each(function() {
		merged[0].push(d3.select(this).node());
	});
	return merged;
};

function makeDynamicScale(data, attr, scaleType, range) {
	var fullDomain = [];
	var tempScale = d3.scale.linear()
		.domain([1, range.length])
		.range(d3.extent(data, function(d) {
			return d[attr]
		}));
	for (var i = 1; i <= range.length; i++) {
		fullDomain.push(tempScale(i));
	}
	return d3.scale[scaleType]()
		.domain(fullDomain)
		.range(range);
}


d3.layout.force.physicsOn = false;
d3.layout.force.start = (function() {
	var cached_forceStart = d3.layout.force.start;
	return function() {
		return cached_forceStart.apply(this, arguments);
	};
}());
d3.layout.force.stop = (function() {
	var cached_forceStart = d3.layout.force.stop;
	return function() {
		return cached_forceStart.apply(this, arguments);
	};
}());
