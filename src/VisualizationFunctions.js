/*
	INDEX:
		CONFIG:
			IND:CONFIG 			-- 		Initial visualization configuration
		FORCE:
			IND:FORCE:FUNC 		--		Visualization function
			IND:FORCE:SCALES 	--	 	Ordinal scale definitions
			IND:FORCE:LAYOUT 	--		Force setup and parameter handling
				IND:FORCE:LAYOUT:TICKS		--		Tick actions
			IND:FORCE:NODES  	--		Node creation, updating
			IND:FORCE:LINKS 	--		Link creation, updating
			IND:FORCE:OTHER 	--		Other general functions for the visualization
*/

/***************************************************************************
  *************************************************************************
   ***********************************************************************
		IND:CONFIG
   ***********************************************************************	
  *************************************************************************
****************************************************************************/
var isSliderReady = false;
function createBaseConfig(element, opts) {
	var out = {};
	out.margins 		= {};
	out.dims 			= {};
	out.meta 			= meta[opts.ngVisType];
	out.margins.top 	= parseFloat(opts.ngMarginsTop || Utilities.removeCharactersFromString($(element).css("margin-top")));
	out.margins.right 	= parseFloat(opts.ngMarginsRight || Utilities.removeCharactersFromString($(element).css("margin-right")));
	out.margins.bottom 	= parseFloat(opts.ngMarginsBottom || Utilities.removeCharactersFromString($(element).css("margin-bottom")));
	out.margins.left 	= parseFloat(opts.ngMarginsLeft || Utilities.removeCharactersFromString($(element).css("margin-left")));
	out.dateFormat 		= opts.ngDateFormat || "%d-%b-%y";
	out.dims.width 		= (opts.ngWidth || $(element[0]).width()) - out.margins.left - out.margins.right;
	out.dims.height 	= (opts.ngHeight || $(element[0]).height()) - out.margins.top - out.margins.bottom;
	out.dims.fixedWidth = out.dims.width - out.margins.left - out.margins.right;
	out.dims.fixedHeight= out.dims.height - out.margins.top - out.margins.bottom;
	out.colors 			= opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362", "#FFD24F", "#FF661C", "#DB4022", "#FF5373", "#EE81A8", "#EE43A9", "#B42672", "#91388C", "#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5", "#0067C9", "#008FDE", "#009ADC", "#007297", "#12978B", "#00BBB5", "#009778", "#75A33D", "#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"];
	out.easySVG 		= function(selector) {
		return d3.select(selector)
			.append("svg")
			.attr("transform", "translate(" + out.margins.left + "," + out.margins.top + ")")
			.attr("width", out.dims.width - out.margins.left - out.margins.right)
			.attr("height", out.dims.height - out.margins.top - out.margins.bottom)

	}
	return out;
}
var debug;

var visualizationFunctions = {
	/****************************************************************************
	  **************************************************************************
		IND:FORCE:FUNC
	  **************************************************************************
	*****************************************************************************/
	forceNetwork: function(element, data, opts) {
		element.empty();
		var forceNetwork 		= new Object();
		var config 				= createBaseConfig(element, opts);
		var force 				= null;
		var svg 				= config.easySVG(element[0])
			.append("g")
			.attr("class", "canvas " + opts.ngIdentifier)
			.attr("transform", "translate(" 
				+ (config.margins.left + config.dims.width / 2) + "," 
				+ (config.margins.top + config.dims.height / 2) + ")")
		svg.config = config;

		function resetVis(dat) {
			force.stop();
			force = null;
			svg.selectAll("*").remove();
			initVis(dat);
		}
		initVis(data);
		function initVis(dataIn) {
			var nodeData 	= dataIn.nodes.data;
			var edgeData 	= dataIn.edges.data;
			var initVis 	= new Object();
			config.meta 	= meta.force;
			svg.config.meta = config.meta;
			svg.opts = opts;
			svg.selectAll('*').remove();
			runJSONFuncs(config.meta, [nodeData, config]);
			/***************************************************************************
				IND:FORCE:SCALES
			  ***************************************************************************/
			svg.nodeSizeScale=null;
			svg.nodeColorScale=null;
			svg.edgeStrokeScale=null;
			svg.edgeOpacityScale=null;

			/***************************************************************************
				IND:FORCE:LAYOUT
			  ***************************************************************************/
			svg.force = d3.layout.force()
				.nodes(nodeData)
				.links(edgeData);
			svg.force.physicsOn = true;
			svg.force.physicsToggle = function() {
				if (svg.force.physicsOn) {
					svg.force.physicsOn = false;
					this.stop();
				} else {
					svg.force.physicsOn = true;
					this.start();
				};
			};
			var drag = svg.force.drag();
			Object.keys(config.meta.visualization.forceLayout).forEach(function(layoutAttr) {
				if (config.meta.visualization.forceLayout[layoutAttr] != null) {
					svg.force[layoutAttr](config.meta.visualization.forceLayout[layoutAttr]);
				};
			});
			svg.force.start();
			var i = 0;
			/* 	IND:FORCE:LAYOUT:TICKS	*/
			svg.force.on("tick", function() {
				if (i % 1 == 0) {
					nodes.each(function() {
						var currNode = d3.select(this);
						if (!currNode.classed("filtered")) {
							currNode.attr("transform", function(d) {
								return "translate(" + forceBoundsCollisionCheck(d.x, config.dims.width) + "," + forceBoundsCollisionCheck(d.y, config.dims.height) + ")"
							});
						}
					});
					links.each(function() {
						var currLink = d3.select(this);
						if (!currLink.classed("filtered")) {
							currLink.attr("d", function(d) {
								return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
							});
						}
					});
				};
				if (i >= 100) i = 0;
				i++;
			});
			svg.updateAll = function() {
				svg.updateNodes();
				svg.updateLinks();				
			}
			/***************************************************************************
				IND:FORCE:LINKS
			  ***************************************************************************/
			var links = svg.selectAll(".link")
				.data(edgeData)
				.enter().append("path")
				.attr("class", function(d, i) {
					var dashed = (Math.floor(Math.random() * 20) % 2 == 0) ? "dashed" : "";
					return dashed + " link e s" + d.source.id + " t" + d.target.id;
				}).call(drag);
			svg.links = links;
			svg.updateLinks = function(args) {
				var width;
				var opacity;
				if (args == "" || typeof args == "undefined") {
					width = config.meta.edges.styleEncoding.strokeWidth.attr;
					opacity = config.meta.edges.styleEncoding.opacity.attr;
				} else {
					var splitArgs = args.replace(" ", "").split(",");
					width = splitArgs[0];
					opacity = splitArgs[1];
				}

				svg.edgeStrokeScale = d3.scale.linear()
					.domain(makeSimpleRange(edgeData, width))
					.range(config.meta.edges.styleEncoding.strokeWidth.range);
				svg.edgeOpacityScale = d3.scale.linear()
					.domain(makeSimpleRange(edgeData, opacity))
					.range(config.meta.edges.styleEncoding.opacity.range);

				links
					.style("stroke-width", function(d) {
						return svg.edgeStrokeScale(d[width]);
					})
					.style("opacity", function(d) {
						return svg.edgeOpacityScale(d[opacity]);
					});
			};
			/***************************************************************************
				IND:FORCE:NODES
			  ***************************************************************************/
			var nodes = svg.selectAll(".node")
				.data(nodeData)
				.enter().append("g")
				.attr("class", function(d, i) {
					return "node g g" + d[config.meta.nodes.identifier.attr];
				}).call(drag);
			nodes.append("circle")
				.attr("class", function(d, i) {
					return d[config.meta.labels.styleEncoding.attr] + " n n" + d[config.meta.nodes.identifier.attr];
				});
			svg.nodes = nodes;
			svg.append("g")
				.attr("class", "legendSize")
				.attr("transform", "translate(20, 40)");


			svg.updateNodes = function(arg) {
				if (arg == "" || typeof arg == "undefined") {
					forceNetwork.nodeSizeAttr = config.meta.nodes.styleEncoding.radius.attr;
					forceNetwork.nodeColorAttr = config.meta.nodes.styleEncoding.color.attr;
				} else {
					forceNetwork.nodeSizeAttr = arg;
					forceNetwork.nodeColorAttr = arg;
				}
				svg.nodeSizeScale = d3.scale.linear()
					.domain(makeSimpleRange(nodeData, forceNetwork.nodeSizeAttr))
					.range(config.meta.nodes.styleEncoding.radius.range);
				svg.nodeColorScale = d3.scale.linear()
					.domain(makeSimpleRange(nodeData, forceNetwork.nodeColorAttr))
					.range(config.meta.nodes.styleEncoding.color.range);
				// var legendSize = d3.legend.size()
				// 	.scale(svg.nodeSizeScale)
				// 	.shape('circle')
				// 	.shapePadding(15)
				// 	.labelOffset(20)
				// 	.orient('horizontal');
				// svg.select(".legendSize")
				// 	.call(legendSize);

				svg.selectAll(".n")
					.attr("r", function(d, i) {
						return svg.nodeSizeScale(d[forceNetwork.nodeSizeAttr]);
					})
					.style("fill", function(d, i) {
						return svg.nodeColorScale(d[forceNetwork.nodeColorAttr]);
					});

				svg.selectAll("text").remove();
				nodes.append("text").attr("class", function(d, i) {
					return "l l" + d[config.meta.nodes.identifier.attr];
				});
				svg.selectAll("text")
					.attr("dx", 0)
					.attr("dy", 10)
					.text(function(d, i) {
						if (d[forceNetwork.nodeSizeAttr] > svg.nodeSizeScale.domain()[1] * config.meta.labels.styleEncoding.displayTolerance) {
							return d[config.meta.labels.styleEncoding.attr];						
						} else {
							this.remove();
						};
					});
				nodes.moveToFront();
				svg.selectAll("text").moveToFront();
			};

			/***************************************************************************
				IND:FORCE:OTHER
			  ***************************************************************************/
			svg.updateAll();

			function forceBoundsCollisionCheck(val, lim) {
				if (val <= -lim / 2) return -lim / 2;
				if (val >= lim / 2)	 return lim / 2;
				return val;
			};
			// svg.appendLegend = function() {
			// 	var legendData = [];
			// 	var legendScale = d3.scale.linear()
			// 		.domain([0, 3])
			// 		.range(config.meta.nodes.styleEncoding.radius.range);
			// 	for (var i = 0; i < 4; i++) {
			// 		legendData.push(legendScale(i));
			// 	}
			// 	svg.selectAll(".legend").remove();
			// 	var legendItems = svg.selectAll(".legendItem")
			// 		.data(legendData)
			// 		.enter()
			// 		.append("g")
			// 		.attr("class", "legendItem legend");
			// 	function setCX(d, i) {
			// 		var base = -config.dims.fixedWidth / 2 + legendScale.range()[1];
			// 		if (i > 0) {
			// 			base += d * i + legendData[0] * i + 10 * i;
			// 		}
			// 		return base;
			// 	}
			// 	function setCY(d, i) {
			// 		var base = config.dims.fixedHeight / 2 - legendScale.range()[1] * 2 - 25;
			// 		if (i < legendData.length - 1) {
			// 			base += (legendData[legendData.length - 1] - d);
			// 		}
			// 		return base;
			// 	}
			// 	legendItems.append("circle")
			// 		.attr("r", function(d, i) {
			// 			return d;
			// 		})
			// 		.attr("cx", function(d, i) {
			// 			return setCX(d, i);
			// 		})
			// 		.attr("cy", function(d, i) {
			// 			return setCY(d, i);
			// 		})
			// 		.style("stroke", "#FFF")
			// 		.style("fill", "none");

			// 	legendItems.append("text")
			// 		.attr("class", "legendItemText")
			// 		.attr("dx", function(d, i) {
			// 			return setCX(d, i);
			// 		})
			// 		.attr("dy", function(d, i) {
			// 			return setCY(d, i) + d + 13;
			// 		})
			// 		.attr("text-anchor", "middle")
			// 		.text(function(d, i) {
			// 			return d;
			// 		})
			// 	svg.append("text")
			// 		.attr("dx", function() {
			// 			return setCX(1, 3);
			// 		})
			// 		.attr("dy", function() {
			// 			return setCY(1, 2) + 30;
			// 		})
			// 		.attr("text-anchor", "middle")					
			// 		.text(function() {
			// 			return forceNetwork.nodeSizeAttr;
			// 		})
			// }
			// svg.appendLegend();
			return initVis;
		};
		forceNetwork.svg 		= svg;
		forceNetwork.data 		= data;
		forceNetwork.initVis 	= initVis;
		forceNetwork.resetVis 	= resetVis;
		return forceNetwork;
	},
	componentBarGraph: function(element, data, opts) {
		element.empty();
		var barGraph 			= new Object();
		var config 				= createBaseConfig(element, opts);
	
		var svg 				= d3.select(element[0])
									.append("svg")
									.attr("width", config.dims.width + config.margins.left - config.margins.right)
									.attr("height", config.dims.height + config.margins.top - config.margins.bottom)
									// .call(d3.behavior.zoom().on("zoom", function () {
									// 	console.log(d3.mouse(this)[0])
									// 	svg.attr("x", + d3.mouse(this)[0])
									// }))									
									.append("g")									
									.attr("class", "canvas " + opts.ngIdentifier)
		var parentVis			= visualizations[opts.ngComponentFor].vis;
		function resetVis(resetData) {
			svg.selectAll("*").remove();
			initVis(resetData);
		}
		initVis(data);
		function initVis(initData) {
			svg.selectAll('*').remove();
			// svg.call(d3.behavior.drag().on("dragstart", function() {
			// 	this.__translated__ = d3.event.dx;
			// })					
			// .on("drag", function(d, i) {
			// 	console.log(this.__translated__);
			// 	d3.selectAll("rect").attr("x", function(d) {
			// 			return parseInt(d3.select(this).attr("x")) + Math.min(d3.event.dx)
			// 	})
			// }))

			var orientation = {
				"vertical": {
					"range": config.dims.fixedWidth,
					"barWidth": function(d, i) {
						return svg.nodeBarSizeScale(d);
					},
					"barHeight": function(d, i) {
						return config.dims.fixedHeight / initData.length;
					},
					"x": function(d, i) {
						return 0;
					},
					"y": function(d, i) {
						return d * i;
					}
				},
				"horizontal": {
					"range": config.dims.fixedHeight,
					"barWidth": function(d, i) {
						return config.dims.fixedWidth / initData.length;
					},
					"barHeight": function(d, i) {
						return svg.nodeBarSizeScale(d);
					},
					"x": function(d, i) {
						return d * i;
					},
					"y": function(d, i) {
						return config.dims.height - d - config.margins.bottom;
					}
				}			
			}[opts.ngOrientation];
			var initVis = new Object();
			config.meta = meta.force;
			runJSONFuncs(config.meta, [initData, config]);

			svg.nodeBarSizeScale = d3.scale.linear()
				.domain(makeSimpleRange(initData, parentVis.nodeSizeAttr))
				.range([5, orientation.range]);

			var bars = svg.selectAll(".bar")
				.data(initData)
				.enter()
				.append("rect")
				.attr("class", function(d, i) {
					return "b b" + d.id;
				})

			svg.bars = bars;

			bars.each(function(d, i) {
				var currBar = d3.select(this);
				var barNode = parentVis.svg.selectAll(".n" + d.id);
				var barWidth = orientation.barWidth(d[parentVis.nodeSizeAttr]);
				var barHeight = orientation.barHeight(d[parentVis.nodeSizeAttr]);
				currBar
					.attr("x", orientation.x(barWidth, i))
					.attr("y", orientation.y(barHeight, i))
					.attr("width", barWidth)
					.attr("height", barHeight)
					.attr("fill", barNode.attr().style("fill"))				
			})
			return initVis;
		};
		barGraph.svg 		= svg;
		barGraph.data 		= data;
		barGraph.resetVis 	= resetVis;
		barGraph.initVis	= initVis;
		return barGraph;
	},
	componentNodeSizeLegend: function(element, data, opts) {
		element.empty();
		var visOutput 			= new Object();
		var config 				= createBaseConfig(element, opts);
	
		var svg 				= d3.select(element[0])
									.append("svg")
									.attr("width", config.dims.width + config.margins.left - config.margins.right)
									.attr("height", config.dims.height + config.margins.top - config.margins.bottom)
								
									.append("g")									
									.attr("class", "canvas " + opts.ngIdentifier)
		var parentVis			= visualizations[opts.ngComponentFor].vis;
		function resetVis(resetData) {
			svg.selectAll("*").remove();
			initVis(resetData);
		}
		initVis(data);
		function initVis(initData) {
			var legendData = [];
			var legendScale = d3.scale.linear()
				.domain([0, 3])
				.range(parentVis.svg.nodeSizeScale.range());
			for (var i = 0; i < 4; i++) {
				legendData.push(legendScale(i));
			}
			svg.selectAll("*").remove();
			var legendGroup = svg.selectAll(".legendItem")
				.data(legendData)
				.enter()
				.append("g")
				.attr("class", "legendItem legend");
			function setCX(d, i) {
				var base = legendScale.range()[1];
				if (i > 0) {
					base += d * i + legendData[0] * i + 10 * i;
				}
				return base;
			}
			function setCY(d, i) {
				var base = legendScale.range()[1] * 2 - 20;
				if (i < legendData.length - 1) {
					base += (legendData[legendData.length - 1] - d);
				}
				return base;
			}
			legendGroup.append("circle")
				.attr("r", function(d, i) {
					return d;
				})
				.attr("cx", function(d, i) {
					return setCX(d, i);
				})
				.attr("cy", function(d, i) {
					return setCY(d, i);
				})
				.style("stroke", "#FFF")
				.style("fill", "none");

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
					return d;
				})
			svg.append("text")
				.attr("x", "50%")
				.attr("y", "90%")

				.attr("text-anchor", "middle")					
				.text(function() {
					console.log(parentVis);
					return parentVis.nodeSizeAttr;
					// return "asdf";
				})
		}
	},
	componentNodeColorLegend: function(element, data, opts) {
		element.empty();
		var visOutput 			= new Object();
		var config 				= createBaseConfig(element, opts);
	
		var svg 				= d3.select(element[0])
									.append("svg")
									.attr("width", config.dims.width + config.margins.left - config.margins.right)
									.attr("height", config.dims.height + config.margins.top - config.margins.bottom)
									.append("g")									
									.attr("class", "canvas " + opts.ngIdentifier)
		var parentVis			= visualizations[opts.ngComponentFor].vis;
		function resetVis(resetData) {
			svg.selectAll("*").remove();
			initVis(resetData);
		}
		initVis(data);
		function initVis(initData) {
			var legendData = parentVis.svg.nodeColorScale.range();
			svg.selectAll("*").remove();
			var w = config.dims.width * .75;

			var gradient = svg.append("svg:defs")
				.append("svg:linearGradient")
				.attr("id", "gradient")
				.attr("x1", "05%")
				.attr("y1", "0%")
				.attr("x2", "100%")
				.attr("y2", "0%")
				.attr("spreadMethod", "pad");
			for (var i = 0; i < legendData.length; i++) {
				console.log(i);
				gradient.append("svg:stop")
					.attr("offset", w / i)
					.attr("stop-color", legendData[i])
					.attr("stop-opacity", 1);
				svg.append("text")
					.attr("x", w / i + config.dims.width * .1)
					.attr("y", "50%")
					.attr("text-anchor", function(d, i) {
						// if (i > legendData.length / 2) {
						// 	return "start";
						// } if (i < legendData.length / 2) {
						// 	return "end";
						// }
						return "middle"
					})
					.text(parentVis.svg.nodeColorScale.domain()[i])
			}
			svg.append("svg:rect")
				.attr("width", w)
				.attr("height", "25%")
				.attr("x", "12.5%")
				.attr("y", "10%")
				.style("fill", "url(#gradient)");
			svg.append("text")
				.attr("x", "50%")
				.attr("y", "90%")
				.attr("text-anchor", "middle")
				.text(parentVis.nodeColorAttr)

		}
	}
};

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.selectAllToleranceFiltered = function() {
	return this.each(function() {
		return d3.select(this).classed("filtered");
	});
};

d3.selection.prototype.applyToleranceFilter = function() {
	return this.each(function() {
		return d3.select(this).classed("filtered", true).style("display","none");
	});
};

d3.selection.prototype.removeToleranceFilter = function() {
	return this.each(function() {
		return d3.select(this).classed("filtered", false).style("display","block");
	});
};

function makeSimpleRange(data, attr) {
	return d3.extent(data, function(d) {
		return d[attr];
	});
};

function runJSONFuncs(o, args) {
	for (var i in o) {
		if (o[i] !== null && typeof(o[i]) == "object") runJSONFuncs(o[i], args);
		if (typeof o[i] == "function") o[i] = o[i](args);
	};
};

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
