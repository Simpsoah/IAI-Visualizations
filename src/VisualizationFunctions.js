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
	out.margins = {};
	out.dims = {};
	out.meta;
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
var edgeStrokeScale;
var nodeSizeScale;
var nodeColorScale;
var nodeDataDebug;
var edgeDataDebug;
var configDebug;
var visualizationFunctions = {
	/****************************************************************************
	  **************************************************************************
		IND:FORCE:FUNC
	  **************************************************************************
	*****************************************************************************/
	forceNetwork: function(element, data, opts) {
		var config = createBaseConfig(element, opts);
		configDebug = config;
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
			nodeDataDebug = nodeData;
			edgeDataDebug = edgeData;
			parseMetaFuncs(config.meta, [nodeData, config]);
			/***************************************************************************
				IND:FORCE:SCALES
			  ***************************************************************************/
			nodeSizeScale = d3.scale.linear()
				.domain(makeSimpleRange(nodeData, config.meta.nodes.styleEncoding.radius.attr))
				.range(config.meta.nodes.styleEncoding.radius.range);
			nodeColorScale = d3.scale.linear()
				.domain(makeSimpleRange(nodeData, config.meta.nodes.styleEncoding.color.attr))
				.range(config.meta.nodes.styleEncoding.color.range)
			edgeStrokeScale = d3.scale.linear()
				.domain(makeSimpleRange(edgeData, config.meta.edges.styleEncoding.strokeWidth.attr))
				.range(config.meta.edges.styleEncoding.strokeWidth.range);
			edgeOpacityScale = d3.scale.linear()
				.domain(makeSimpleRange(edgeData, config.meta.edges.styleEncoding.opacity.attr))
				.range(config.meta.edges.styleEncoding.opacity.range);

			/***************************************************************************
				IND:FORCE:LAYOUT
			  ***************************************************************************/
			force = d3.layout.force()
				.nodes(nodeData)
				.links(edgeData)
				force.charge(-25);
				force.start();

			setTimeout(function() {
				force.stop();
				Object.keys(config.meta.visualization.forceLayout).forEach(function(layoutAttr) {
					if (config.meta.visualization.forceLayout[layoutAttr] != null) {
						force[layoutAttr](config.meta.visualization.forceLayout[layoutAttr])
					}
				})
				force.start();	
			}, 500);

			var drag = force.drag()
				.on("dragstart", clickpin);

			var i = 0;
			/* 	IND:FORCE:LAYOUT:TICKS	*/
			force.on("tick", function() {
				if (i % 3 == 0) {
					links
						.attr("d", function(d) {
							return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
						});

					$(".node").each(function(ind, node) { 
						var currNode = d3.select(node);
						currNode.attr("transform", function(d) {
							return "translate(" + forceBoundsCollisionCheck(d.x, config.dims.width) + "," + forceBoundsCollisionCheck(d.y, config.dims.height) + ")"
						});
					});
				}
				if (i >= 100) i = 0;
				i++;
			});
			function updateAll() {
				updateNodes();
				updateLinks();
				updateNodeTexts();
				d3.selectAll("circle").moveToFront();
				d3.selectAll("text").moveToFront();
			}
			/***************************************************************************
				IND:FORCE:LINKS
			  ***************************************************************************/
			var links = svg.selectAll(".link")
				.data(edgeData)
				.enter().append("path")
				.attr("d", "M0,0L0,0")
				.attr("class", "link")
				.call(force.drag);

			function updateLinks() {
				links
					.style("stroke-width", function(d) {
						return edgeStrokeScale(d[config.meta.edges.styleEncoding.strokeWidth.attr]);
					})
					.style("opacity", function(d) {
						return edgeOpacityScale(d[config.meta.edges.styleEncoding.opacity.attr]);
					})
			}

			/***************************************************************************
				IND:FORCE:NODES
			  ***************************************************************************/
			var nodes = svg.selectAll(".node")
				.data(nodeData)
				.enter().append("g")
				.attr("class", function(d, i) {
					return "node " + config.meta.nodes.identifier.format.replace("%s", d[config.meta.nodes.identifier.attr]);
				})
				.call(drag);
			nodes.append("circle")
				.on("dblclick", clickunpin);
			nodes.append("text")
				.attr("dx", 0)
				.attr("dy", ".0em")
			function updateNodes() {
				d3.selectAll("circle")
					.attr("r", function(d, i) {
						if (d[config.meta.nodes.styleEncoding.radius.attr] > 30) {
						}
						return nodeSizeScale(d[config.meta.nodes.styleEncoding.radius.attr])
					})
					.style("fill", function(d, i) {
						return nodeColorScale(d[config.meta.nodes.styleEncoding.color.attr])
					})
			}
			function updateNodeTexts() {
				d3.selectAll("text")
					.text(function(d) { 
						if (d[config.meta.nodes.styleEncoding.radius.attr] > nodeSizeScale.domain()[1] * config.meta.labels.styleEncoding.displayTolerance) {
							return d[config.meta.labels.styleEncoding.attr];
						} else {
							this.remove();
						}
					})
			}
			function clickunpin(d) {
				d3.select(this).classed("fixed", d.fixed = false).moveToFront();
				d3.selectAll("text").moveToFront();
			}
			function clickpin(d) {
				d3.select(this).classed("fixed", d.fixed = true).moveToFront();
				d3.selectAll("text").moveToFront();
			}
			/***************************************************************************
				IND:FORCE:OTHER
			  ***************************************************************************/
			updateAll();
			function forceBoundsCollisionCheck(val, lim) {
				if (val <= -lim / 2) {
					return -lim / 2;
				}
				if (val >= lim / 2) {
					return lim / 2;
				}
				return val;
			}
			// $(document).addClass("nightmode");
			// d3.selectAll(".node").classed("nightmode", true);
			// d3.selectAll("text").classed("nightmode", true);
			// d3.selectAll(".link").classed("nightmode", true);
		}
	}
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function() {
		this.parentNode.appendChild(this);
	});
};

function makeSimpleRange(data, attr) {
	return d3.extent(data, function(d) {
		return d[attr];
	})
};

function parseMetaFuncs(o,args) {
	for (var i in o) {
		if (o[i] !== null && typeof(o[i])=="object") parseMetaFuncs(o[i],args);
		if (typeof o[i]=="function") o[i] = o[i](args);
	}
}

