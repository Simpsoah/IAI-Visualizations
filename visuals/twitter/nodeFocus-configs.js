events.nodeFocus = function(ntwrk) {
	if (visualizations.barChart01) {
		visualizations.barChart01.SVG.bar.mergeSelections(ntwrk.parentVis.SVG.gnodes).on("click.createNodeFocus", function(d, i) {
			var currNode = ntwrk.parentVis.SVG.select(".wvf-node" + d.id);
			var currNodeData = currNode.data()[0];
			// var edges = ntwrk.parentVis.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.parentVis.SVG.selectAll(".t" + d.id));
			ntwrk.filteredData.nodes.data = currNodeData;
			var currEdgeList = [];
			// ntwrk.parentVis.excludedEdges.forEach(function(d, i) {
			// 	if (d.source == currNodeData.id || d.target == currNodeData.id) {
			// 		if (currEdgeList.indexOf(d) == -1) {
			// 			currEdgeList.push(d);
			// 		}
			// 	}
			// });
			ntwrk.filteredData.edges.data = currEdgeList;
			ntwrk.RunVis({lazyRun:true, empty:true});
			//TODO: Do something about this. Add callback to Visualization?
			// ntwrk.SVG.select(".innerNode").style("fill", currNode.style("fill"));
			// ntwrk.SVG.select(".innerNode").attr("r", currNode.attr("r"));
		});
	}
	ntwrk.parentVis.SVG.background.mergeSelections(ntwrk.parentVis.SVG.links).on("click.removeNodeFocus", function() {
		ntwrk.ClearVis({empty: true});
	});

}
