Events.mainVis = function(ntwrk) {
	
	var svg = ntwrk.SVG;
	var visData = ntwrk.GetData();
	// svg.selectAll("*").applyToleranceFilter();
	// ntwrk.AngularArgs.data.nodes.schema.push({
	// 	"name": "weight",
	// 	"type": "numeric"
	// });

	var nodeList = "";
	var nodeArr = [];
	ntwrk.AngularArgs.data.nodes.schema.forEach(function(d, i) {
		nodeArr.push(d);
		nodeList += d.name + ", ";
	});
	var edgeList = "";
	var edgeArr = [];
	ntwrk.AngularArgs.data.edges.schema.forEach(function(d, i) {
		edgeArr.push(d);
		edgeList += d.name + ", ";
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
			visualizations.barVis.config.meta[visualizations.barVis.ParimaryDataAttr].styleEncoding.mainWoH.attr = text1s;
			visualizations.barVis.config.meta[visualizations.barVis.ParimaryDataAttr].styleEncoding.color.attr = text1c;
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
	try {
		document.getElementById("toggle-physics").onclick = null;
		document.getElementById("toggle-labels").onclick = null;
		document.getElementById("inner-button-1s").onclick = null;
		document.getElementById("inner-button-1c").onclick = null;
		document.getElementById("inner-button-2w").onclick = null;
		document.getElementById("inner-button-2o").onclick = null;
		document.getElementById("inner-button-4").onclick = null;
		document.getElementById("toggle-physics").onclick = togglePhysics;
		document.getElementById("toggle-labels").onclick = toggleLabels;
		document.getElementById("inner-button-1s").onclick = changeNodeAttr;
		document.getElementById("inner-button-1c").onclick = changeNodeAttr;
		document.getElementById("inner-button-2w").onclick = changeEdgeAttr;
		document.getElementById("inner-button-2o").onclick = changeEdgeAttr;
		document.getElementById("inner-button-4").onclick = applyWeightFilter;
	} catch (exception) {
		console.log("No debug bar? Remove this block if it no longer exists.");
	}

	function applyFilter(min, max) {
		svg.selectAll("*").removeToleranceFilter();
		// svg.gnodes.filter(function(d,i) { 
		// 	var currNode = d3.select(this);
		// 	if (d[ntwrk.config.meta.nodes.filterAttr] < min || d[ntwrk.config.meta.nodes.filterAttr] > max) {
		// 		currNode.applyToleranceFilter();
		// 		svg.selectAll("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).applyToleranceFilter();
		// 		svg.selectAll(".s" + d.id).applyToleranceFilter();
		// 		svg.selectAll(".t" + d.id).applyToleranceFilter();
		// 	};
		// });
		
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


	var rangeFinder = function(a) {
		return +a[ntwrk.config.meta.nodes.filterAttr];
	}
	
	//exec
	try {
		if (!ntwrk.filterReady) {
			//TODO: Find a different slider or something. This doesn't reset with the node attr. Hard to work with. 
			initFilter(d3.extent(visData.nodes.data, function(a) {
				return a[ntwrk.config.meta.nodes.filterAttr];
			}), null, null);	
			// }), null, null);	
		}
		ntwrk.filterReady = true;
		
	} catch (exception) {
		throw exception
	}

	//TODO: separate out delegates
	svg.gnodes.moveToFront();
	svg.gnodes.on("mouseup", function(d, i) {
		if(d3.event.shiftKey) {
			d.fixed = true;
		} else {
			d.fixed = false;
		}
	}).on("mousedown", function(d, i) {
		svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).classed("selected", true);
		try {
			var currBar = visualizations.barVis.SVG.selectAll(".b" + d.id);
			currBar.classed("selected", true);
		} catch (exception) {
			console.log("No component graph. Remove this block if it no longer exists.");
		}
		d3.event.preventDefault();
		ntwrk.SVG.links.classed("deselected", false);
		ntwrk.SVG.links.classed("selected", false);
		var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id));
		edges.classed("deselected", false);
		edges.classed("selected", true);
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");

		$("#main-vis-node-sel-disp-circ").css("fill", svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).style("stroke-width"));

		var objList = "";
		Object.keys(d).forEach(function(attr) {
			objList += "<b>" + (ntwrk.config.meta.nodes.prettyMap[attr] || attr) + "</b>:" + d[attr] + "</br>";
		})
		$("#selection-about").html(objList);
		var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id));		
	}).on("mouseover", function(d, i) {
		svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).classed("selected", true);
		visualizations.barVis.SVG.selectAll(".b" + d.id).classed("selected", true);
	}).on("mouseout", function(d, i) {
		svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).classed("selected", false);
		visualizations.barVis.SVG.selectAll(".b" + d.id).classed("selected", false);
	});

	svg.links.on("mousedown", function(d, i) {
		svg.nodes.classed("selected", false);
		svg.links.classed("selected", false);

		d3.select(this).classed("selected", true);
		svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.source.id).classed("selected", true);
		svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.target.id).classed("selected", true);

		$("#main-vis-node-sel-disp").css("display", "none");
		$("#main-vis-edge-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp-circ-source").css("fill", svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.source.id).style("fill"));
		$("#main-vis-edge-sel-disp-circ-target").css("fill", svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.target.id).style("fill"));
		var objList = "";
		Object.keys(d).forEach(function(attr) {
			objList += "<b>" + (ntwrk.config.meta.edges.prettyMap[attr] || attr) + "</b>:" + d[attr] + "</br>";
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
}