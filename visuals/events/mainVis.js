Events.mainVis = function(ntwrk) {
	var svg = ntwrk.SVG;
	var visData = ntwrk.GetData();
	createNodeOptionList();
	createEdgeOptionList();


	svg.nodes.classed("nih", function(d, i) {
		if (d.nih == 1) return true;
	})

	svg.nodes.classed("ctsa", function(d, i) {
		if (d.ctsa == 1) return true;
	})

	Object.keys(ntwrk.meta.visualization.forceLayout).forEach(function(layoutAttr) {
		if (ntwrk.meta.visualization.forceLayout[layoutAttr] != null) {
			ntwrk.SVG.force[layoutAttr](ntwrk.meta.visualization.forceLayout[layoutAttr]);
		};
	});
	ntwrk.SVG.force.start();
	// Utilities.applyEventToElements([{
	// 	id: "toggle-physics",
	// 	event: "onclick",
	// 	func: togglePhysics
	// }, {
	// 	id: "toggle-labels",
	// 	event: "onclick",
	// 	func: toggleLabels
	// }, {
	// 	id: "inner-button-1s",
	// 	event: "onclick",
	// 	func: changeNodeAttr
	// }, {
	// 	id: "inner-button-1c",
	// 	event: "onclick",
	// 	func: changeNodeAttr
	// }, {
	// 	id: "inner-button-2w",
	// 	event: "onclick",
	// 	func: changeEdgeAttr
	// }, {
	// 	id: "inner-button-2o",
	// 	event: "onclick",
	// 	func: changeEdgeAttr
	// }]);

	ntwrk.nodeFocusFields = ["label","usertc","userwi","unqusermentcount","avgfriend","avgfollow"];
	svg.gnodes.on("mouseup", function(d, i) {
		if(d3.event.shiftKey) {
			d.fixed = true;
		} else {
			d.fixed = false;
		}
	}).on("mousedown", function(d, i) {
		svg.select(".n" + d.id).classed("selected", true);
		d3.event.preventDefault();
		ntwrk.SVG.links.classed("deselected", false);
		ntwrk.SVG.links.classed("selected", false);
		var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id))
			.classed("deselected", false)
			.classed("selected", true);
	}).on("mouseover", function(d, i) {
		svg.select(".n" + d.id).classed("selected", true);
	}).on("mouseout", function(d, i) {
		svg.select(".n" + d.id).classed("selected", false);
	}).on("mousedown.updateNodeMetadataDisplay", function(d, i) {
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");
		$("#main-vis-node-sel-disp-circ").css("fill", svg.select(".n" + d.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", svg.select(".n" + d.id).style("stroke-width"));
		var objList = "";
		ntwrk.nodeFocusFields.forEach(function(attr) {
			objList += "<b>" + (ntwrk.config.meta.nodes.prettyMap[attr] || attr) + "</b>: " + d[attr] + "</br>";
		});
		$("#selection-about").html(objList);
	});
	svg.links.on("mousedown", function(d, i) {
		svg.nodes.classed("selected", false);
		svg.links.classed("selected", false);
		d3.select(this).classed("selected", true);
		svg.select(".n" + d.source.id).mergeSelections(svg.select(".n" + d.target.id)).classed("selected", true);
	})
	.on("mousedown.updateEdgeMetadataDisplay", function(d, i) {
		$("#main-vis-node-sel-disp").css("display", "none");
		$("#main-vis-edge-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp-circ-source").css("fill", svg.select(".n" + d.source.id).style("fill"));
		$("#main-vis-edge-sel-disp-circ-target").css("fill", svg.select(".n" + d.target.id).style("fill"));
		var objList = "";
		Object.keys(d).forEach(function(attr) {
			console.log(attr)
			objList += "<b>" + (ntwrk.config.meta.edges.prettyMap[attr] || attr) + "</b>: " + d[attr] + "</br>";
		});
		$("#selection-about").html(objList);
	});

	ntwrk.SVG.background.on("click", function() {
		d3.event.preventDefault();
		$("#main-vis-node-sel-disp").css("display", "none");
		$("#main-vis-edge-sel-disp").css("display", "none");
		ntwrk.SVG.selectAll("*").classed("selected", false).classed("deselected", false);
		$("#selection-about").html("");
	});

	ntwrk.SVG.updateAll = function() {
		ntwrk.SVG.updateNodes();
		ntwrk.SVG.updateLinks();
	}
	ntwrk.SVG.updateLinks = function() {
		var notFilteredEdges = visualizations.mainVis.SVG.links.data();
		ntwrk.Scales.edgeStrokeScale = Utilities.makeDynamicScale(
			notFilteredEdges,
			ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr,
			"linear",
			ntwrk.config.meta.edges.styleEncoding.strokeWidth.range
		);
		ntwrk.Scales.edgeOpacityScale = Utilities.makeDynamicScale(
			notFilteredEdges,
			ntwrk.config.meta.edges.styleEncoding.opacity.attr,
			"linear",
			ntwrk.config.meta.edges.styleEncoding.opacity.range
		);


		//TODO: For demo purposes. Remove transition
		ntwrk.SVG.links.transition().duration(250)
			.style("stroke-width", function(d) {
				return ntwrk.Scales.edgeStrokeScale(d[ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr]);
			})
			.style("opacity", function(d) {
				return ntwrk.Scales.edgeOpacityScale(d[ntwrk.config.meta.edges.styleEncoding.opacity.attr]);
			});
	};

	ntwrk.SVG.updateNodes = function() {
		var notFilteredGnodes = visualizations.mainVis.SVG.gnodes;
		var notFilteredNodes = notFilteredGnodes.each(function(d) {
			return ntwrk.SVG.select(".n" + d.id);
		});
		ntwrk.Scales.nodeSizeScale = Utilities.makeDynamicScale(
			notFilteredGnodes.data(),
			ntwrk.config.meta.nodes.styleEncoding.size.attr,
			"linear",
			ntwrk.config.meta.nodes.styleEncoding.size.range
		);
		ntwrk.Scales.nodeColorScale = Utilities.makeDynamicScale(
			notFilteredGnodes.data(),
			ntwrk.config.meta.nodes.styleEncoding.color.attr,
			"linear",
			ntwrk.config.meta.nodes.styleEncoding.color.range
		);
		//TODO: For demo purposes. Remove transition
		ntwrk.SVG.nodes.transition().duration(250)
			.attr("r", function(d, i) {
				return ntwrk.Scales.nodeSizeScale(d[ntwrk.config.meta.nodes.styleEncoding.size.attr]);
			})
			.style("fill", function(d, i) {
				return ntwrk.Scales.nodeColorScale(d[ntwrk.config.meta.nodes.styleEncoding.color.attr]);
			})
		ntwrk.SVG.selectAll("text").remove();

		ntwrk.Scales.nodeTextScale = Utilities.makeDynamicScale(
			notFilteredNodes.data(),
			ntwrk.config.meta.nodes.styleEncoding.size.attr,
			"linear",
			ntwrk.config.meta.labels.styleEncoding.range
		);

		ntwrk.SVG.gnodes.append("text").attr("class", function(d, i) {
			return "l l" + d[ntwrk.config.meta.nodes.identifier.attr];
		});
		ntwrk.SVG.selectAll("text")
			.attr("dx", 0)
			.attr("dy", 10)
			.style("font-size", function(d, i) {
				return ntwrk.Scales.nodeTextScale(d[ntwrk.config.meta.nodes.styleEncoding.size.attr]);
			})
			.text(function(d, i) {
				// if (d[ntwrk.config.meta.nodes.styleEncoding.size.attr] > ntwrk.Scales.nodeSizeScale.domain()[1] * ntwrk.config.meta.labels.styleEncoding.displayTolerance) {
					return d[ntwrk.config.meta.labels.styleEncoding.attr];
				// } else {
				// 	try {
				// 		this.remove();
				// 	} catch (exception) {}
				// };
			});
		ntwrk.SVG.gnodes.moveToFront();
		ntwrk.SVG.selectAll("text").moveToFront();
	};

	ntwrk.SVG.updateAll();

	function createNodeOptionList() {	
		var nodeList = "";
		var nodeArr = [];
		visData.nodes.schema.forEach(function(d, i) {
			nodeArr.push(d);
			nodeList += d.name + ", ";
		});
		nodeArr.forEach(function(d) {
			if (d.type == "numeric") {
				$("#txt1s").append($("<option value=" + d.name + "></option>")
					.attr("value", d.name)
					.text(d.name));
				$("#txt1c").append($("<option value=" + d.name + "></option>")
					.attr("value", d.name)
					.text(d.name));
			}
			$("#txt1s" + " option[value='" + ntwrk.config.meta.nodes.styleEncoding.size.attr + "']").prop("selected", true);
			$("#txt1c" + " option[value='" + ntwrk.config.meta.nodes.styleEncoding.color.attr + "']").prop("selected", true);
		});
	}
	function createEdgeOptionList() {	
		var edgeList = "";
		var edgeArr = [];
		visData.edges.schema.forEach(function(d, i) {
			edgeArr.push(d);
			edgeList += d.name + ", ";
		});
		edgeArr.forEach(function(d) {
			if (d.type == "numeric") {
				$("#txt2w").append($("<option value=" + d.name + "></option>")
					.attr("value", d.name)
					.text(d.name));
				$("#txt2o").append($("<option value=" + d.name + "></option>")
					.attr("value", d.name)
					.text(d.name));						
			}
			$("#txt2w" + " option[value='" + ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr + "']").prop("selected", true);
			$("#txt2o" + " option[value='" + ntwrk.config.meta.edges.styleEncoding.opacity.attr + "']").prop("selected", true);
		});
	}
	function togglePhysics() {
		svg.force.physicsToggle();
	}
	function changeNodeAttr() {
		var text1s = $("#txt1s option:selected").html();
		var text1c = $("#txt1c option:selected").html();
		//This is basically the best solution probably. If we always use the config and update those values, we can toggle seamlessly between parent and child
		ntwrk.config.meta.nodes.styleEncoding.size.attr = text1s;
		ntwrk.config.meta.nodes.styleEncoding.color.attr = text1c;
		try {
			visualizations.barVis2.config.meta[visualizations.barVis2.PrimaryDataAttr].styleEncoding.size.attr = text1s;
			visualizations.barVis2.config.meta[visualizations.barVis2.PrimaryDataAttr].styleEncoding.color.attr = text1c;
		} catch(exception) {
			console.log(exception);
		}
		svg.updateNodes();
		ntwrk.RunChildVisualizations();
	}
	function changeEdgeAttr() {
		var text2w = $("#txt2w option:selected").html();
		var text2o = $("#txt2o option:selected").html();
		ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr = text2w;
		ntwrk.config.meta.edges.styleEncoding.opacity.attr = text2o;
		svg.updateLinks();
		ntwrk.RunChildVisualizations();
	}
	function highlightNodesByLabels() {
		var arg = document.getElementById("txt3").value;
		if (arg !== "" || typeof arg !== "undefined") {
			var argSplit = arg.replaceAll(" ","").split(",");
			svg.nodes
				.filter(function(d) {
					return argSplit.indexOf(d.label) >= 0;
				}).style("fill", "red")
		};
	}
	function applyWeightFilter() {
		applyFilter(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));
	}
	function toggleLabels() {
		if (document.getElementById("toggle-labels").value == "off") {
			document.getElementById("toggle-labels").value = "on";
			svg.selectAll("text").style("display", "none");
		} else {
			document.getElementById("toggle-labels").value = "off";
			svg.selectAll("text").style("display", "block");			
		}
	}
	function applyFilter(min, max) {
		svg.selectAll("*").removeToleranceFilter();
		ntwrk.config.meta[ntwrk.PrimaryDataAttr].initialFilter = [min, max]
		// ntwrk.RunDataFilter([min, max]);
		ntwrk.RunVis();
		changeNodeAttr();
		changeEdgeAttr();
		svg.force.tick();
	}
	function applyFilterAndUpdate(min, max) {
		applyFilter(min, max);
		// changeNodeAttr();
		// changeEdgeAttr();
		svg.force.tick();
	}
	function initFilter(range, mi, ma) {
		var min = range[0];
		var max = range[1];
		if (mi != null) min = mi;
		if (ma != null) max = ma;
		var select = document.getElementById('input-select');
		for ( var i = range[0]; i <= range[1]; i++ ){
			var option = document.createElement("option");
				option.text = i;
				option.value = i;
			select.appendChild(option);
		};
		var html5Slider = document.getElementById('html5');
		noUiSlider.create(html5Slider, {
			start: [min, max],
			connect: true,
			range: {
				'min': range[0],
				'max': range[1]
			}
		});
		var inputNumber = document.getElementById('input-number');
		html5Slider.noUiSlider.on('update', function( values, handle ) {
			var value = values[handle];
			if (handle) {
				inputNumber.value = value;
			} else {
				select.value = Math.round(value);
			};
		});
		select.addEventListener('change', function(){
			html5Slider.noUiSlider.set([this.value ,null]);
		});
		inputNumber.addEventListener('change', function(){
			html5Slider.noUiSlider.set([null, this.value]);
		});
	};
}