Events.nodeFocus = function(ntwrk) {
	visualizations.barVis.SVG.gBars.mergeSelections(ntwrk.parentVis.SVG.gnodes).on("click.createNodeFocus", function(d, i) {
		var currNode = ntwrk.parentVis.SVG.select(".n" + d.id);
		var currNodeData = currNode.data()[0];
		// var edges = ntwrk.parentVis.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.parentVis.SVG.selectAll(".t" + d.id));
		ntwrk.AngularArgs.data = ntwrk.GetData();
		ntwrk.filteredData.nodes.data = currNodeData;
		var currEdgeList = [];
		ntwrk.parentVis.excludedEdges.forEach(function(d, i) {
			if (d.source == currNodeData.id || d.target == currNodeData.id) {
				if (currEdgeList.indexOf(d) == -1) {
					currEdgeList.push(d);
				}
			}
		});
		ntwrk.filteredData.edges.data = currEdgeList;
		ntwrk.RunVis({lazyRun:true});
		//TODO: Do something about this. Add callback to Visualization?
		setTimeout(function() {
			ntwrk.SVG.select(".innerNode").style("fill", currNode.style("fill"));
			ntwrk.SVG.select(".innerNode").attr("r", currNode.attr("r"));
		}, 10);
	});

	ntwrk.parentVis.SVG.background.mergeSelections(ntwrk.parentVis.SVG.links).on("click.removeNodeFocus", function() {
		ntwrk.ClearVis();
	});

}
