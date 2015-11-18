Events.barVis = function(ntwrk) {
	var svg = ntwrk.SVG;
	var visData = ntwrk.data;
	var parentVis = visualizations.mainVis;
	var parentSVG = parentVis.SVG;
	var parentVisData = parentVis.filtered;

	$("#main-vis-size-coding-attr").html(parentVis.config.meta.nodes.prettyMap[parentVis.config.meta.nodes.styleEncoding.size.attr] || parentVis.config.meta.nodes.styleEncoding.size.attr)

	function sortAZ() {
		ntwrk.SVG.sortFunction = function(a, b) {
			return d3.descending(b.label.toLowerCase(), a.label.toLowerCase());
		}
		ntwrk.ResetVis();
	}

	function sortVal() {
		ntwrk.SVG.sortFunction = function(a, b) {
			return d3.descending(a[parentVis.config.meta.nodes.styleEncoding.size.attr], b[parentVis.config.meta.nodes.styleEncoding.size.attr]);
		}
		ntwrk.ResetVis();
	}

	try {
		document.getElementById("sort-az").onclick = null;
		document.getElementById("sort-val").onclick = null;
		document.getElementById("sort-az").onclick = sortAZ;
		document.getElementById("sort-val").onclick = sortVal;
	} catch (exception) {
		// throw exception
		// console.log("No debug bar. Remove this block if it no longer exists.");
	}
	svg.bars.on("mouseover", function(d, i) {
		var currNode = parentSVG.selectAll("." + parentVis.AngularArgs.opts.ngIdentifier + "n" + d.id);
		var currNodeData = currNode.data()[0];
		d3.select(this).classed("selected", true);
		currNode.classed("selected", true);
	}).on("mouseout", function(d, i) {
		var currNode = parentSVG.selectAll("." + parentVis.AngularArgs.opts.ngIdentifier + "n" + d.id);
		var currNodeData = currNode.data()[0];
		d3.select(this).classed("selected", false);
		currNode.classed("selected", false);
	}).on("mousedown", function(d, i) {
		var currNode = parentSVG.select("." + parentVis.AngularArgs.opts.ngIdentifier + "n" + d.id);		
		var currNodeData = currNode.data()[0];
		d3.select(this).classed("selected", true);
		d3.event.preventDefault();
		parentVis.SVG.links.classed("deselected", false);
		parentVis.SVG.links.classed("selected", false);
		var edges = parentVis.SVG.selectAll(".s" + d.id).mergeSelections(parentVis.SVG.selectAll(".t" + d.id));
		edges.classed("deselected", false);
		edges.classed("selected", true);
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");
		$("#main-vis-node-sel-disp-circ").css("fill", parentVis.SVG.select("." + parentVis.AngularArgs.opts.ngIdentifier + "n" + currNodeData.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", parentVis.SVG.select("." + parentVis.AngularArgs.opts.ngIdentifier + "n" + currNodeData.id).style("stroke-width"));
		var objList = "";
		Object.keys(d).forEach(function(attr) {
			objList += "<b>" + (parentVis.config.meta.nodes.prettyMap[attr] || attr) + "</b>:" + currNodeData[attr] + "</br>";
		})
		$("#selection-about").html(objList);
		var edges = parentVis.SVG.selectAll(".s" + d.id).mergeSelections(parentVis.SVG.selectAll(".t" + d.id));		
	});





}