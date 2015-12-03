Events.barVis2 = function(ntwrk) {
	var useData = ntwrk.parentVis.GetData()[ntwrk.parentVis.PrimaryDataAttr].data;

	ntwrk.Scales.xScale
		.domain(d3.extent(useData, function(d, i) { return d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr]}))

	ntwrk.SVG.xaxis.scale(ntwrk.Scales.xScale)
	ntwrk.SVG.gxaxis.call(ntwrk.SVG.xaxis)
	ntwrk.SVG.gxaxis.moveToFront();
	//TODO: For demo purposes. Remove transition
	ntwrk.SVG.barRects.transition().duration(250).attr("width", function(d, i) {
		return ntwrk.Scales.xScale(d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr]) - 2
	})

	ntwrk.SVG.barLabels.text(function(d, i) {
		//TODO: Fix this so if the visualization is a component, it takes the parent config.
		return d[ntwrk.config.meta.labels.styleEncoding.attr]
	}).on("click", function() {
		d3.event.preventDefault();
	})

	ntwrk.SVG.barLabels.on("click", function() {
		d3.event.preventDefault();
	})

	ntwrk.parentVis.SVG.gnodes.on("mousedown.selectBar", function(d, i) {
		ntwrk.SVG.selectAll(".b" + d.id).classed("selected", true);
	}).on("mouseover.selectBar", function(d, i) {
		ntwrk.SVG.selectAll(".b" + d.id).classed("selected", true);
	}).on("mouseout.deselectBar", function(d, i) {
		ntwrk.SVG.selectAll(".b" + d.id).classed("selected", false);
	})

	ntwrk.SVG.gBars.on("mouseover", function(d, i) {
		var currNode = ntwrk.parentVis.SVG.selectAll(".n" + d.id);
		d3.select(this).select("rect").classed("selected", true);
		currNode.classed("selected", true);
	})
	.on("mouseout", function(d, i) {
		var currNode = ntwrk.parentVis.SVG.selectAll(".n" + d.id);
		d3.select(this).select("rect").classed("selected", false);
		currNode.classed("selected", false);
	})
	.on("click", function(d, i) {
		ntwrk.parentVis.SVG.force.start();
		ntwrk.SVG.gBars.attr("transform", function(d, i) {
			return "translate(" + (ntwrk.config.dims.fixedWidth * .35) + "," + (ntwrk.Scales.yScale(i) + 25) + ")";
		});
		ntwrk.SVG.barRects.attr("height", function(d, i) {
			return ntwrk.Scales.yScale(1) - 2
		});
		ntwrk.SVG.barLabels.attr("y", ntwrk.Scales.yScale(1) / 2)
			.style("font-size", ntwrk.Scales.yScale(1) - 2 + "px")		
		if (d3.select(this).property("focused")) {


			// d3.select(this).select("text")
			// 	.transition().duration(125)
			// 	.attr("y", ntwrk.Scales.yScale(1) / 2)
			// 	.style("font-size", ntwrk.Scales.yScale(1) - 2 + "px")
			d3.select(this).property("focused", false);
		} else {
			for (var j = i + 1; j < useData.length; j++) {
				
				ntwrk.SVG.gBars.filter(".i" + j).transition().delay(1).attr("transform", function(d, i) {
					return "translate(" + (ntwrk.config.dims.fixedWidth * .35) + "," + (ntwrk.Scales.yScale(j) + 75) + ")";
				})
				d3.select(this).select("rect").transition().delay(1).attr("height", function(d, i) {
					return ntwrk.Scales.yScale(1) + 50 - 2
				})							
				d3.select(this).select("text")
					.attr("y", ntwrk.Scales.yScale(1) + 25)
					.style("font-size", "12px")

			}
			d3.select(this).property("focused", true)
		}
	})
.on("click.updateNodeMetadataDisplay", function(d, i) {
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");
		$("#main-vis-node-sel-disp-circ").css("fill", ntwrk.parentVis.SVG.select(".n" + d.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", ntwrk.parentVis.SVG.select(".n" + d.id).style("stroke-width"));
		var objList = "";
		ntwrk.parentVis.nodeFocusFields.forEach(function(attr) {
			objList += "<b>" + (ntwrk.parentVis.config.meta.nodes.prettyMap[attr] || attr) + "</b>: " + d[attr] + "</br>";
		});
		$("#selection-about").html(objList);
	});
}