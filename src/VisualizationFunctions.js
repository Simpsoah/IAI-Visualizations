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
	out.margins.top 	= opts.ngMarginsTop || Utilities.removeCharactersFromString($(element).css("margin-top"));
	out.margins.right 	= opts.ngMarginsRight || Utilities.removeCharactersFromString($(element).css("margin-right"));
	out.margins.bottom 	= opts.ngMarginsBottom || Utilities.removeCharactersFromString($(element).css("margin-bottom"));
	out.margins.left 	= opts.ngMarginsLeft || Utilities.removeCharactersFromString($(element).css("margin-left"));
	out.dateFormat 		= opts.ngDateFormat || "%d-%b-%y";
	out.dims.width 		= (opts.ngWidth || $(element[0]).width()) - out.margins.left - out.margins.right;
	out.dims.height 	= (opts.ngHeight || $(element[0]).height()) - out.margins.top - out.margins.bottom;
	out.dims.fixedWidth = out.dims.width + out.margins.left - out.margins.right;
	out.dims.fixedHeight= out.dims.height + out.margins.top - out.margins.bottom;
	out.colors 			= opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362", "#FFD24F", "#FF661C", "#DB4022", "#FF5373", "#EE81A8", "#EE43A9", "#B42672", "#91388C", "#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5", "#0067C9", "#008FDE", "#009ADC", "#007297", "#12978B", "#00BBB5", "#009778", "#75A33D", "#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"];
	out.easySVG 		= function(selector) {
		return d3.select(selector)
			.append("svg")
			.attr("width", out.dims.width + out.margins.left - out.margins.right)
			.attr("height", out.dims.height + out.margins.top - out.margins.bottom)

	}
	return out;
}

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
		var svg 				= config.easySVG(element[0]).append("g")
			.attr("class", "canvas " + opts.ngIdentifier)
			.attr("transform", "translate(" 
				+ (config.margins.left + config.dims.width / 2) + "," 
				+ (config.margins.top + config.dims.height / 2) + ")");

		var force 				= null;
		var defaultNodeData 	= data.nodes.data.slice(0);
		var defaultEdgeData 	= data.edges.data.slice(0);
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
			svg.selectAll('*').remove();
			runJSONFuncs(config.meta, [nodeData, config]);
			/***************************************************************************
				IND:FORCE:SCALES
			  ***************************************************************************/
			forceNetwork.nodeSizeAttr = config.meta.nodes.styleEncoding.radius.attr;

			var nodeSizeScale;
			var nodeColorScale;
			var edgeStrokeScale;
			var edgeOpacityScale;

			/***************************************************************************
				IND:FORCE:LAYOUT
			  ***************************************************************************/
			force = d3.layout.force()
				.nodes(nodeData)
				.links(edgeData);	
			force.physicsToggle = function() {
				if (this.physicsOn) {
					this.stop();
				} else {
					this.start();
				};
			};
			var drag = force.drag().on("dragstart", clickpin);
			Object.keys(config.meta.visualization.forceLayout).forEach(function(layoutAttr) {
				if (config.meta.visualization.forceLayout[layoutAttr] != null) {
					force[layoutAttr](config.meta.visualization.forceLayout[layoutAttr]);
				};
			});
			force.start();
			var i = 0;
			/* 	IND:FORCE:LAYOUT:TICKS	*/
			force.on("tick", function() {
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
			function updateAll() {
				updateNodes();
				updateLinks();
			}
			/***************************************************************************
				IND:FORCE:LINKS
			  ***************************************************************************/
			var links = svg.selectAll(".link")
				.data(edgeData)
				.enter().append("path")
				.attr("class", function(d, i) {
					var sourceClass = config.meta.edges.identifier.format.source.replace("%s", d.source.id);
					var targetClass = config.meta.edges.identifier.format.target.replace("%s", d.target.id);
					var dashed = (Math.floor(Math.random() * 20) % 2 == 0) ? "dashed" : "";
					return dashed + " link filtered " + sourceClass + " " + targetClass;
				});
			links.call(drag);
			function updateLinks(args) {
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

				edgeStrokeScale = d3.scale.linear()
					.domain(makeSimpleRange(edgeData, width))
					.range(config.meta.edges.styleEncoding.strokeWidth.range);
				edgeOpacityScale = d3.scale.linear()
					.domain(makeSimpleRange(edgeData, opacity))
					.range(config.meta.edges.styleEncoding.opacity.range);

				links
					.style("stroke-width", function(d) {
						return edgeStrokeScale(d[width]);
					})
					.style("opacity", function(d) {
						return edgeOpacityScale(d[opacity]);
					});
			};
			/***************************************************************************
				IND:FORCE:NODES
			  ***************************************************************************/
			var nodes = svg.selectAll(".node")
				.data(nodeData)
				.enter().append("g")
				.attr("class", function(d, i) {
					return "node filtered " + d[config.meta.labels.styleEncoding.attr] + " " + config.meta.nodes.identifier.format.replace("%s", d[config.meta.nodes.identifier.attr]);
				});
			nodes.append("circle");
			function updateNodes(arg) {
				var size;
				var colr;
				if (arg == "" || typeof arg == "undefined") {
					forceNetwork.nodeSizeAttr = config.meta.nodes.styleEncoding.radius.attr;
					colr = config.meta.nodes.styleEncoding.color.attr;
				} else {
					forceNetwork.nodeSizeAttr = arg;
					colr = arg;
				}
				nodeSizeScale = d3.scale.linear()
					.domain(makeSimpleRange(nodeData, forceNetwork.nodeSizeAttr))
					.range(config.meta.nodes.styleEncoding.radius.range);
				nodeColorScale = d3.scale.linear()
					.domain(makeSimpleRange(nodeData, colr))
					.range(config.meta.nodes.styleEncoding.color.range);
				svg.selectAll("circle")
					.attr("r", function(d, i) {
						return nodeSizeScale(d[forceNetwork.nodeSizeAttr]);
					})
					.style("fill", function(d, i) {
						return nodeColorScale(d[colr]);
					});

				svg.selectAll("text").remove();
				nodes.append("text");
				svg.selectAll("text")
					.attr("dx", 0)
					.attr("dy", 10)
					.text(function(d, i) {
						if (d[forceNetwork.nodeSizeAttr] > nodeSizeScale.domain()[1] * config.meta.labels.styleEncoding.displayTolerance) {
							return d[config.meta.labels.styleEncoding.attr];						
						} else {
							this.remove();
						};
					});
				svg.selectAll("circle").moveToFront();
				svg.selectAll("text").moveToFront();
			};

			nodes.call(drag).on("dblclick", clickunpin);

			function clickpin(d) {
				var currNode = d3.select(this);
				currNode.classed("fixed", d.fixed = true).moveToFront();
				d3.selectAll("text").moveToFront();

				//TODO: Remove for production.
				d3.selectAll("rect").filter(function(f) {
					return d.id == f.id;
				}).attr("storedColor", function(d) {
					return d3.select(this).attr("fill");
				}).style("fill", "red");

				//TODO: Remove for production.
				var htmlOut = "";
				Object.keys(d).forEach(function(d1) {
					htmlOut += "<b>" + d1 + "</b>: " + d[d1] + "</br>";
				});
				$("#node_data").html(htmlOut);
			};

			function clickunpin(d) {
				d3.select(this).classed("fixed", d.fixed = false).moveToFront();
				svg.selectAll("text").moveToFront();
				svg.selectAll("rect").filter(function(f) {
					return d.id == f.id;
				}).style("fill", function(d) {
					return d3.select(this).attr("stroedColor");
				});
			};

			/***************************************************************************
				IND:FORCE:OTHER
			  ***************************************************************************/
			updateAll();

			document.getElementById("togglePhysics").onclick = function() {
				force.physicsToggle();
			};
			setTimeout(function() {
				document.getElementById("innerButton").onclick = function() {
					updateNodes(document.getElementById("txt").value);
					var childVisualizations = visualizations[opts.ngIdentifier].children;
					Object.keys(childVisualizations).forEach(function(d, i) {
						childVisualizations[d].vis.resetVis(svg.selectAll(".node").filter(function() {return !d3.select(this).classed("filtered")}).data());
					})					
				};
				document.getElementById("innerButton2").onclick = function() {
					updateLinks(document.getElementById("txt2").value);
				};
				document.getElementById("innerButton3").onclick = function() {
					var arg = document.getElementById("txt3").value;
					if (arg !== "" || typeof arg !== "undefined") {
						var argSplit = arg.replaceAll(" ","").split(",");
						svg
							.selectAll("circle")
							.filter(function(d) {
								return argSplit.indexOf(d.label) >= 0;
							})
							//TODO: Fit this into CSS
							.style("fill", "red");
					};
				};

				function initFilter(range, mi, ma) {
					var min = range[0];
					var max = range[1];
					if (mi != null) min = mi;
					if (ma != null) max = ma;
					var select = document.getElementById('input-select');
					for ( var i = range[0]; i <= range[1]; i++ ){
						var option = document.createElement("option");
							option.text = i;
							option.value = i;
						select.appendChild(option);
					};
					var html5Slider = document.getElementById('html5');
					noUiSlider.create(html5Slider, {
						start: [min, max],
						connect: true,
						range: {
							'min': range[0],
							'max': range[1]
						}
					});
					var inputNumber = document.getElementById('input-number');
					html5Slider.noUiSlider.on('update', function( values, handle ) {
						var value = values[handle];
						if ( handle ) {
							inputNumber.value = value;
						} else {
							select.value = Math.round(value);
						};
					});
					select.addEventListener('change', function(){
						html5Slider.noUiSlider.set([this.value, null]);
					});
					inputNumber.addEventListener('change', function(){
						html5Slider.noUiSlider.set([null, this.value]);
					});
				};
				if (!isSliderReady) {
					initFilter(d3.extent(nodeData, function(a) {
						return a.weight;
					}), 15, null);	
					isSliderReady = true;
				}
				filterOut(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));

				
				document.getElementById("innerButton4").onclick = function() {
					filterOut(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));
				};

				function filterOut(min, max) {
					svg.selectAll("*").removeToleranceFilter();
					svg.selectAll(".node").filter(function(d,i) { 
						var currNode = d3.select(this);
						if (d.weight < min || d.weight > max) {
							currNode.applyToleranceFilter();
							svg.selectAll(".s" + d.id).applyToleranceFilter();
							svg.selectAll(".t" + d.id).applyToleranceFilter();
						};
					});
					force.tick();
					var childVisualizations = visualizations[opts.ngIdentifier].children;
					Object.keys(childVisualizations).forEach(function(d, i) {
						var currentChildVis = childVisualizations[d];
						currentChildVis.vis = currentChildVis.visFunc(currentChildVis.iElement, svg.selectAll(".node").filter(function() {return !d3.select(this).classed("filtered")}).data(), currentChildVis.iAttrs)
					});
				};
				initVis.filterOut = filterOut;
			}, 500);
			
			function forceBoundsCollisionCheck(val, lim) {
				if (val <= -lim / 2) return -lim / 2;
				if (val >= lim / 2)	 return lim / 2;
				return val;
			};

			setTimeout(function() {
				if (svg.selectAll("g")[0].length - 1 > nodeData.length) {
					alert("Node count:  " + nodeData.length + "\nGroup count: " + (svg.selectAll("g")[0].length - 1));
				};
			}, 1000);

			initVis.force = force;
			initVis.updateAll = updateAll;
			initVis.links = links;
			initVis.updateLinks = updateLinks;
			initVis.nodes = nodes;
			initVis.updateNodes = updateNodes;
			initVis.force = force;
			return initVis;
		};
		forceNetwork.svg 		= svg;
		forceNetwork.data 		= data;
		forceNetwork.resetVis 	= resetVis;
		forceNetwork.initVis	= initVis;
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
						return nodeBarSizeScale(d);
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
						return nodeBarSizeScale(d);
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

			nodeBarSizeScale = d3.scale.linear()
				.domain(makeSimpleRange(initData, parentVis.nodeSizeAttr))
				.range([5, orientation.range]);

			var bars = svg.selectAll(".bar")
				.data(initData)
				.enter().append("rect")
				.attr("class", "bar")
				


			$(".bar").each(function(ind, b) {
				var bar = d3.select(b);
				var barData = bar.data()[0];
				var barNode = parentVis.svg.selectAll("circle").filter(function(d) {
					return d.id == barData.id;
				});
				var barNodeR = parseInt(barNode.attr().style().attr("r"));
				var barWidth = orientation.barWidth(barData[parentVis.nodeSizeAttr]);
				var barHeight = orientation.barHeight(barData[parentVis.nodeSizeAttr]);
				bar
					.attr("x", orientation.x(barWidth, ind))
					.attr("y", orientation.y(barHeight, ind))
					.attr("width", barWidth)
					.attr("height", barHeight)
					.attr("fill", barNode.attr().style("fill"))
					.on("mouseover", function() {
						barNode.attr("r", 50);
					}).on("mouseout", function() {
						barNode.transition().duration(275).attr("r", barNodeR);
					});
			});
			return initVis;
		};
		barGraph.svg 		= svg;
		barGraph.data 		= data;
		barGraph.resetVis 	= resetVis;
		barGraph.initVis	= initVis;
		return barGraph;
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
	})
}

d3.selection.prototype.applyToleranceFilter = function() {
	return this.each(function() {
		return d3.select(this).classed("filtered", true).style("display","none");
	})
}

d3.selection.prototype.removeToleranceFilter = function() {
	return this.each(function() {
		return d3.select(this).classed("filtered", false).style("display","block");
	})
}

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
		this.physicsOn = true;
		return cached_forceStart.apply(this, arguments);
	};
}());
d3.layout.force.stop = (function() {
	var cached_forceStart = d3.layout.force.stop;
	return function() {
		this.physicsOn = false;
		return cached_forceStart.apply(this, arguments);
	};
}());
