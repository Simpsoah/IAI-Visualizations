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


	Utilities.applyEventToElements([{
		id: "sort-az",
		event: "onclick",
		func: sortAZ
	}, {
		id: "sort-val",
		event: "onclick",
		func: sortVal
	}]);


	svg.bars.on("mouseover", function(d, i) {
		var currNode = parentSVG.selectAll(".n" + d.id);
		d3.select(this).classed("selected", true);
		currNode.classed("selected", true);
	}).on("mouseout", function(d, i) {
		var currNode = parentSVG.selectAll(".n" + d.id);
		d3.select(this).classed("selected", false);
		currNode.classed("selected", false);
	}).on("mousedown", function(d, i) {
		d3.select(this).classed("selected", true);
		d3.event.preventDefault();
		parentVis.SVG.links.classed("deselected", false).classed("selected", false);
		var edges = parentVis.SVG.selectAll(".s" + d.id).mergeSelections(parentVis.SVG.selectAll(".t" + d.id));
		edges.classed("deselected", false);
		edges.classed("selected", true);		
	});
	parentVis.SVG.gnodes.on("mousedown.selectBar", function(d, i) {
		ntwrk.SVG.selectAll(".b" + d.id).classed("selected", true);
	}).on("mouseover.selectBar", function(d, i) {
		ntwrk.SVG.selectAll(".b" + d.id).classed("selected", true);
	}).on("mouseout.deselectBar", function(d, i) {
		ntwrk.SVG.selectAll(".b" + d.id).classed("selected", false);
	})
	svg.bars.on("mousedown.updateBarMetadataDisplay", function(d, i) {
		var currNode = parentSVG.select(".n" + d.id);		
		var currNodeData = currNode.data()[0];		
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");
		$("#main-vis-node-sel-disp-circ").css("fill", parentVis.SVG.select(".n" + currNodeData.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", parentVis.SVG.select(".n" + currNodeData.id).style("stroke-width"));
		var objList = "";
		Object.keys(d).forEach(function(attr) {
			objList += "<b>" + (parentVis.config.meta.nodes.prettyMap[attr] || attr) + "</b>:" + currNodeData[attr] + "</br>";
		})
		$("#selection-about").html(objList);
		var edges = parentVis.SVG.selectAll(".s" + d.id).mergeSelections(parentVis.SVG.selectAll(".t" + d.id));
	});
}