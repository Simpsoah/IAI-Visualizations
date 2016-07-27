configs.barChart01 = {
	"type": "org.cishell.json.vis.metadata",
	//This is "nodes" instead of "records" because the parent is a network.
	"nodes": {
		"styleEncoding": {
			"size": {
				"attr": "userTC",
				"scale": "log"
			},
			"size2": {
				"attr": 30
			},
			"color": {
				"attr": "inRP",
				"range": ["#8DC63F", "#F6DFA4"]
			}
		},
		"identifier": {
			"attr": "id"
		}
	},
	"labels": {
		"styleEncoding": {
			"attr": "label",
			"displayTolerance": 0
		},
		"identifier": {
			"attr": "id"
		}
	},
	"other": {
		"nih": "NIH",
		"ctsa": "CTSA"
	}
}

events.barChart01 = function(ntwrk) {
	var useData = ntwrk.filteredData[ntwrk.PrimaryDataAttr].data;
	var max = d3.max(useData, function(d, i) {
			return d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr]
		})
	var nextStep = Math.pow(10, max.toString().length)
	var numTicks = 4;
	var tickArr = [];
	for (var i = 0; i < numTicks; i++) {
		tickArr.push(Math.pow(10, i))
	}
	ntwrk.Scales.x
		.domain([1, nextStep])
	ntwrk.Scales.xAxis
		.ticks(4)
		.scale(ntwrk.Scales.x)
		.tickSize(ntwrk.SVG.attr("height"))
		.tickValues(tickArr)
		.tickFormat(function(d) {
			return parseInt(d);
		})

	ntwrk.SVG.xAxisG.call(ntwrk.Scales.xAxis).attr("transform", "translate(0," + ntwrk.SVG.attr("height") + ")");

	ntwrk.SVG.bar.attr("width", function(d, i) {
		ntwrk.Scales.x(d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr])

		var adjustedVal = d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr];
		if (adjustedVal == 0) adjustedVal += .1
		return d3.max([ntwrk.Scales.x(adjustedVal) + 2, 0])
	})

	ntwrk.SVG.barText.text(function(d, i) {
		return d[ntwrk.config.meta.labels.styleEncoding.attr]
	}).on("click", function() {
		d3.event.preventDefault();
	})

	ntwrk.SVG.bar.classed("nih", function(d, i) {
		if (d[ntwrk.config.meta.other.nih] == 1) return true;
	})

	ntwrk.SVG.bar.classed("ctsa", function(d, i) {
		if (d[ntwrk.config.meta.other.ctsa] == 1) return true;
	})

	ntwrk.SVG.barText.on("click", function() {
		d3.event.preventDefault();
	})

	ntwrk.parentVis.SVG.gnodes.on("mousedown.selectBar", function(d, i) {
		ntwrk.SVG.selectAll(".wvf-rect" + d.id).classed("selected", true);
	}).on("mouseover.selectBar", function(d, i) {
		ntwrk.SVG.selectAll(".wvf-rect" + d.id).classed("selected", true);
	}).on("mouseout.deselectBar", function(d, i) {
		ntwrk.SVG.selectAll(".wvf-rect" + d.id).classed("selected", false);
	})

	ntwrk.SVG.bar.on("mouseover", function(d, i) {
			ntwrk.parentVis.SVG.force.tick();
			var currNode = ntwrk.parentVis.SVG.selectAll(".wvf-node" + d.id);
			d3.select(this).classed("selected", true);
			currNode.classed("selected", true);
		})
		.on("mouseout", function(d, i) {
			ntwrk.parentVis.SVG.force.tick();
			var currNode = ntwrk.parentVis.SVG.selectAll(".wvf-node" + d.id);
			d3.select(this).classed("selected", false);
			currNode.classed("selected", false);
		})
		.on("click", function(d, i) {
			ntwrk.parentVis.SVG.force.tick();
		})
		.on("click.updateNodeMetadataDisplay", function(d, i) {
			ntwrk.parentVis.SVG.force.tick();
			$("#main-vis-node-sel-disp").css("display", "block");
			$("#main-vis-edge-sel-disp").css("display", "none");
			$("#main-vis-node-sel-disp-circ").css("fill", ntwrk.parentVis.SVG.select(".wvf-node" + d.id).style("fill"));
			$("#main-vis-node-sel-disp-circ").css("stroke-width", ntwrk.parentVis.SVG.select(".wvf-node" + d.id).style("stroke-width"));
			var objList = "<table class='tg'>";
			ntwrk.parentVis.config.meta.other.nodeFocusFields.forEach(function(attr) {
				objList += "<tr><td class='tg-yw41'>" + (ntwrk.parentVis.config.meta.nodes.prettyMap[attr] || attr) + "</td>"
				objList += "<td class='tg-lqy6'>" + Utilities.round(d[attr], 2) + "</td></tr>"
			});
			objList += "</table>"		
			$("#selection-about").html(objList);			
		});
}

dataprep.barChart01 = function(ntwrk) {
	ntwrk.filteredData.nodes.data = ntwrk.filteredData.nodes.data.sort(function(a, b) {
		var sortAttr = configs.barChart01.nodes.styleEncoding.size.attr;
		return b[sortAttr] - a[sortAttr]
	})
}