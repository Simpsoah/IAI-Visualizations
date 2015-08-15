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
	out.colors 			= opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362", "#FFD24F", "#FF661C", "#DB4022", "#FF5373", "#EE81A8", "#EE43A9", "#B42672", "#91388C", "#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5", "#0067C9", "#008FDE", "#009ADC", "#007297", "#12978B", "#00BBB5", "#009778", "#75A33D", "#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"];
	out.easySVG 		= function(selector) {
		return d3.select(selector)
			.append("svg")
			// .attr("viewBox", "0 0 " + (out.dims.width - out.margins.left - out.margins.right) + " " + (out.dims.height + out.margins.top - out.margins.bottom))
			// .style("fill", "#000")
			// .attr("preserveAspectRatio", "xMidYMid meet");
			.attr("width", out.dims.width + out.margins.left - out.margins.right)
			.attr("height", out.dims.height + out.margins.top - out.margins.bottom)
	}
	return out;
}


var debugSVG;
var debugForce;
var debugNodes;
var debugData;
var debugInit;
var visualizationFunctions = {
	/****************************************************************************
	  **************************************************************************
		IND:FORCE:FUNC
	  **************************************************************************
	*****************************************************************************/
	forceNetwork: function(element, data, opts) {
		
		init();
		function init() {
			var nodeData 	= data.nodes.data;
			var edgeData 	= data.edges.data;
			debugData 		= {"nodes": nodeData, "edges": edgeData};
			var config 		= createBaseConfig(element, opts);
			config.meta 	= meta.force;
			var svg 		= config.easySVG(element[0])
								.append("g")
								.attr("class", "canvas " + opts.ngIdentifier)
								.attr("transform", "translate(" 
									+ (config.margins.left + config.dims.width / 2) + "," 
									+ (config.margins.top + config.dims.height / 2) + ")");
			svg.selectAll('*').remove();
			debugSVG = svg;
			runJSONFuncs(config.meta, [nodeData, config]);
			/***************************************************************************
				IND:FORCE:SCALES
			  ***************************************************************************/
			var nodeSizeScale;
			var nodeColorScale;
			var edgeStrokeScale;
			var edgeOpacityScale;

			/***************************************************************************
				IND:FORCE:LAYOUT
			  ***************************************************************************/
			var force = d3.layout.force()
				.nodes(nodeData)
				.links(edgeData);
			debugForce = force;
			force.physicsOn = false;
			force.physicsToggle = function() {
				if (this.physicsOn) {
					this.stop();
				} else {
					this.start();
				}
			}
			force.start = (function() {
				var cached_forceStart = force.start;
				return function() {
					this.physicsOn = true;
					return cached_forceStart.apply(this, arguments);
				};
			}());

			force.stop = (function() {
				var cached_forceStart = force.stop;
				return function() {
					this.physicsOn = false;
					return cached_forceStart.apply(this, arguments);
				};
			}());

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
				if (i % 4 == 0) {
					$(".node").each(function(ind, node) {
						var currNode = d3.select(node);
						currNode.attr("transform", function(d) {
							return "translate(" + forceBoundsCollisionCheck(d.x, config.dims.width) + "," + forceBoundsCollisionCheck(d.y, config.dims.height) + ")"
						});
					});
					links
						.attr("d", function(d) {
							return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
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
					return dashed + " link " + sourceClass + " " + targetClass;
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
					return "node " + d[config.meta.labels.styleEncoding.attr] + " " + config.meta.nodes.identifier.format.replace("%s", d[config.meta.nodes.identifier.attr]);
				});
			debugNodes = nodes;
			nodes.append("circle");
			
			function updateNodes(arg) {
				var size;
				var colr;
				if (arg == "" || typeof arg == "undefined") {
					size = config.meta.nodes.styleEncoding.radius.attr;
					colr = config.meta.nodes.styleEncoding.color.attr;
				} else {
					size = arg;
					colr = arg;
				}

				nodeSizeScale = d3.scale.linear()
					.domain(makeSimpleRange(nodeData, size))
					.range(config.meta.nodes.styleEncoding.radius.range);
				nodeColorScale = d3.scale.linear()
					.domain(makeSimpleRange(nodeData, colr))
					.range(config.meta.nodes.styleEncoding.color.range);
				svg.selectAll("circle")
					.attr("r", function(d, i) {
						return nodeSizeScale(d[size]);
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
						if (d[size] > nodeSizeScale.domain()[1] * config.meta.labels.styleEncoding.displayTolerance) {
						// if (i < 21) {
							return d[config.meta.labels.styleEncoding.attr];
						
						} else {
							this.remove();
						};
					});


				var tempData = nodeData.sort(function(a, b) {
					return a[size] < b[size]
				}).slice(0, 150);
				nodeBarSizeScale = d3.scale.linear()
					.domain(makeSimpleRange(tempData, size))
					.range([20, 150]);
				var barWidth = (config.dims.width - config.margins.left - config.margins.right) / tempData.length;

				var bars = svg.selectAll(".bar")
					.data(tempData)
					.enter().append("rect")
					.attr("class", "bar")

				svg.selectAll("path").moveToFront();
				svg.selectAll("g").moveToFront();
				svg.selectAll("text").moveToFront();


				$(".bar").each(function(ind, b) {
					var bar = d3.select(b);
					var barData = bar.data()[0];
					var barNode = d3.selectAll("circle").filter(function(d) {
						return d.id == barData.id
					});
					var barNodeR = parseInt(barNode.attr().style().attr("r"));
					var attr = nodeBarSizeScale(barData[size]);

					svg.selectAll("circle").filter(function(d) {
						return d.id == barData.id;
					});
					var barHeight = attr;
					bar
						.attr("x", function(d, i) {
							return -config.dims.width / 2 + (ind * barWidth);
						})
						.attr("y", config.dims.height / 2 - barHeight)
						.attr("width", barWidth)
						.attr("height", barHeight)
						.attr("fill", barNode.attr().style("fill"))
						.on("mouseover", function(d, i) {
							barNode
								.transition()
								.duration(250)
								.attr("r", 50)
							barNode.moveToFront();
							svg.selectAll("text").moveToFront();
						})
					bar.on("mouseout", function(d, i) {
						barNode
							.transition()
							.duration(275)
							.attr("r", barNodeR);
						svg.selectAll("text").moveToFront();
					});
				});











				svg.selectAll("circle").moveToFront();
				svg.selectAll("text").moveToFront();
			};

			nodes.call(drag)
				.on("dblclick", clickunpin);

			function clickunpin(d) {
				d3.select(this).classed("fixed", d.fixed = false).moveToFront();
				d3.selectAll("text").moveToFront();
				d3.selectAll("rect").filter(function(f) {
					return d.id == f.id
				}).style("fill", function(d) {
					return d3.select(this).attr("stroedColor")
				});

			};

			function clickpin(d) {
				var currNode = d3.select(this);
				currNode.classed("fixed", d.fixed = true).moveToFront();
				d3.selectAll("text").moveToFront();

				d3.selectAll("rect").filter(function(f) {
					return d.id == f.id;
				}).attr("storedColor", function(d) {
					return d3.select(this).attr("fill");
				}).style("fill", "red");

				var htmlOut = "";
				Object.keys(d).forEach(function(d1) {
					htmlOut += "<b>" + d1 + "</b>: " + d[d1] + "</br>";
				});
				htmlOut += "<b>Sources for</b>: " + d3.selectAll(".s" + d.id)[0].length + "</br>";
				htmlOut += "<b>Targets for</b>: " + d3.selectAll(".t" + d.id)[0].length + "</br>";
				$("#node_data").html(htmlOut);
			};

			/***************************************************************************
				IND:FORCE:OTHER
			  ***************************************************************************/
			updateAll();

			//TODO: How to append children to root?
			function removeUnusedGElements() {
				d3.selectAll("g").each(function() {
					if (this.children.length < 2) {
						var child = this.children[0];
						this.parentNode.appendChild(child);
						d3.select(this).attr("class", "node").moveToFront();
					}
				})
			}

			document.getElementById("togglePhysics").onclick = function() {
				force.physicsToggle();
			};
			setTimeout(function() {
				document.getElementById("innerButton").onclick = function() {
					updateNodes(document.getElementById("txt").value);
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
					}
				}

			}, 500);
			







			function forceBoundsCollisionCheck(val, lim) {
				if (val <= -lim / 2) {
					return -lim / 2;
				}
				if (val >= lim / 2) {
					return lim / 2;
				}
				return val;
			};

			setTimeout(function() {
				if (svg.selectAll("g")[0].length - 1 > nodeData.length) {
					alert("Node count:  " + nodeData.length + "\nGroup count: " + (svg.selectAll("g")[0].length - 1));
				}
			}, 2500);
		}
	}
};

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

d3.selection.prototype.toggleSelect = function() {
	return this.each(function() {
		d3.select(this).classed("selected", true);
	})
}

//Add x values to arr??
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
