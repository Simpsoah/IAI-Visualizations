Events.barVis = function(ntwrk) {
	var svg = ntwrk.SVG;
	var visData = ntwrk.data;
	var parentVis = visualizations.mainVis;
	var parentSVG = parentVis.SVG;
	var parentVisData = parentVis.AngularArgs.data;

	$("#sizeCodingAttr").html(parentVis.config.meta.nodes.styleEncoding.radius.attr)

	function sortAZ() {
		ntwrk.SVG.sortFunction = function(a, b) {
			return d3.descending(b.label.toLowerCase(), a.label.toLowerCase());
		}
		ntwrk.ResetVis();
	}

	function sortVal() {
		ntwrk.SVG.sortFunction = function(a, b) {
			return d3.descending(a[parentVis.config.meta.nodes.styleEncoding.radius.attr], b[parentVis.config.meta.nodes.styleEncoding.radius.attr]);
		}
		ntwrk.ResetVis();
	}

	try {
		document.getElementById("sortAZ").onclick = null;
		document.getElementById("sortVal").onclick = null;
		document.getElementById("sortAZ").onclick = sortAZ;
		document.getElementById("sortVal").onclick = sortVal;
	} catch (exception) {
		// throw exception
		// console.log("No debug bar. Remove this block if it no longer exists.");
	}
	svg.selectAll("rect").on("mouseover", function(d, i) {
		var currNode = parentSVG.selectAll(".n" + d.id);
		d3.select(this).classed("highlighted", true);
		currNode.classed("highlighted", true);
	}).on("mouseout", function(d, i) {
		var currNode = parentSVG.selectAll(".n" + d.id);
		d3.select(this).classed("highlighted", false);
		currNode.classed("highlighted", false);
	});
}