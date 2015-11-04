Events.barVis = function(ntwrk) {
	var svg = ntwrk.SVG;
	var visData = ntwrk.data;
	var parentVis = visualizations.mainVis;
	var parentSVG = parentVis.SVG;
	var parentVisData = parentVis.AngularArgs.data;

	$("#main-vis-size-coding-attr").html(parentVis.config.meta.nodes.prettyMap[parentVis.config.meta.nodes.styleEncoding.radius.attr] || parentVis.config.meta.nodes.styleEncoding.radius.attr)

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
		d3.select(this).classed("selected", true);
		currNode.classed("selected", true);
	}).on("mouseout", function(d, i) {
		var currNode = parentSVG.selectAll("." + parentVis.AngularArgs.opts.ngIdentifier + "n" + d.id);
		d3.select(this).classed("selected", false);
		currNode.classed("selected", false);
	});
}