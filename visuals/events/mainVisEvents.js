Events.mainVis = function(ntwrk) {
	var svg = ntwrk.SVG;
	var visData = ntwrk.AngularArgs.data;
	svg.selectAll("*").applyToleranceFilter();

	visData.nodes.schema.push({
		"name": "weight",
		"type": "numeric"
	});

///TODO: Paramswtf
	function attrListHelper(dataset,idSelector1,idSelector2,attribute1,attribute2,f1,g1) {
		var attrList = "";
		var attrArr = [];
		dataset.schema.forEach(function(d, i) {
			attrArr.push(d);
			attrList += d.name + ", ";
		});
		attrArr.forEach(function(d) {
			if (d.type == "numeric") {
				$("#" + idSelector1).append($("<option value=" + d.name + "></option>")
					.attr("value", d.name)
					.text(d.name));
				$("#" + idSelector2).append($("<option value=" + d.name + "></option>")
					.attr("value", d.name)
					.text(d.name));						
			}
			$("#" + idSelector1 + " option[value='" + attribute1 + "']").prop("selected", true)
			$("#" + idSelector2 + " option[value='" + attribute2 + "']").prop("selected", true)
		});
	}
	// svg.updateNodes();

	function togglePhysics() {
		svg.updateNodes();
		svg.force.physicsToggle();
	}
	//TODO: name doesn't imply how things are changing, just that they are
	function changeNodeAttr() {
		var text1s = $("#txt1s option:selected").html();
		var text1c = $("#txt1c option:selected").html();
		//TODO: This is basically the best solution probably. If we always use the config and update those values, we can toggle seamlessly between parent and child
		ntwrk.config.meta.nodes.styleEncoding.radius.attr = text1s;
		ntwrk.config.meta.nodes.styleEncoding.color.attr = text1c;
		visualizations.barVis.config.meta.bars.styleEncoding.mainWoH.attr = text1s;
		visualizations.barVis.config.meta.bars.styleEncoding.color.attr = text1c;
		svg.updateNodes();
		resetAllComponents();
	}
	function changeEdgeAttr() {
		var text2w = $("#txt2w option:selected").html();
		var text2o = $("#txt2o option:selected").html();
		ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr = text2w;
		ntwrk.config.meta.edges.styleEncoding.opacity.attr = text2o;
		svg.updateLinks();
		resetAllComponents();
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

	try {
		document.getElementById("toggle-physics").onclick = null;
		document.getElementById("inner-button-1s").onclick = null;
		document.getElementById("inner-button-1c").onclick = null;
		document.getElementById("inner-button-2w").onclick = null;
		document.getElementById("inner-button-2o").onclick = null;
		document.getElementById("inner-button-3").onclick = null;
		document.getElementById("inner-button-4").onclick = null;
		document.getElementById("toggle-physics").onclick = togglePhysics;
		document.getElementById("inner-button-1s").onclick = changeNodeAttr;
		document.getElementById("inner-button-1c").onclick = changeNodeAttr;
		document.getElementById("inner-button-2w").onclick = changeEdgeAttr;
		document.getElementById("inner-button-2o").onclick = changeEdgeAttr;
		document.getElementById("inner-button-3").onclick = highlightNodesByLabels;
		document.getElementById("inner-button-4").onclick = applyWeightFilter;
	} catch (exception) {
		// throw exception
		// console.log("No debug bar. Remove this block if it no longer exists.");
	}

	function applyFilter(min, max) {
		svg.selectAll("*").removeToleranceFilter();
		svg.gnodes.filter(function(d,i) { 
			var currNode = d3.select(this);
			if (d[ntwrk.config.meta.nodes.styleEncoding.radius.attr] < min || d[ntwrk.config.meta.nodes.styleEncoding.radius.attr] > max) {
				currNode.applyToleranceFilter();
				svg.selectAll("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).applyToleranceFilter();
				svg.selectAll(".s" + d.id).applyToleranceFilter();
				svg.selectAll(".t" + d.id).applyToleranceFilter();
			};
		});
		changeNodeAttr();
		changeEdgeAttr();
		svg.force.tick();

	}

	function applyFilterAndUpdate(min, max) {
		applyFilter(min, max)
		changeNodeAttr();
		changeEdgeAttr();
		svg.force.tick();
	}

//TODO: Rename to reflect more accurately what it does
	function resetAllComponents() {
		try {
			ntwrk.RunChildVisualizations();
		} catch (exception) {
			throw exception
		}
	};

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
			if ( handle ) {
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
		return +a[ntwrk.config.meta.nodes.styleEncoding.radius.attr];
	}
	
	//exec
	attrListHelper(visData.nodes, "txt1s", "txt1c", ntwrk.config.meta.nodes.styleEncoding.radius.attr, ntwrk.config.meta.nodes.styleEncoding.color.attr, "nodeAttrList", ntwrk.config.meta.nodes.prettyMap)
	attrListHelper(visData.edges, "txt2w", "txt2o", ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr, ntwrk.config.meta.edges.styleEncoding.opacity.attr, "edgeAttrList", ntwrk.config.meta.edges.prettyMap)

	try {
		if (ntwrk.isFirstRun) {
			//TODO: Find a different slider or something. This doesn't reset with the node attr. Hard to work with. 
			initFilter(d3.extent(visData.nodes.data, function(a) {
				return a[ntwrk.config.meta.nodes.styleEncoding.radius.attr];
			}), (d3.max(visData.nodes.data, rangeFinder) - d3.min(visData.nodes.data, rangeFinder)) / 12, null);	
			// }), null, null);	
		}
		applyFilter(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));

	} catch (exception) {
		// console.log(exception)
		// console.log("No debug bar. Remove this block if it no longer exists.");
	}

	//TODO: Ask IAI about impaired users.
		//Update: They didn't seem to have considered this, it may not be part of the agreement.
		//	Carry on without support for now.

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
		// ntwrk.SVG.links.classed("deselected", false);
		// ntwrk.SVG.links.classed("selected", false);
		// var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id));
		// edges.classed("deselected", false);
		// edges.classed("selected", true);
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");

		$("#main-vis-node-sel-disp-circ").css("fill", svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", svg.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).style("stroke-width"));

		//TODO: Reimplement once the styles are fixed
		// var objList = "<section class='table_specification'>";
		// Object.keys(d).forEach(function(attr) {
		// 	objList += "<dl><dt><b>" + attr + ": </b></dt><dd>" + d[attr] + "</br></dd></dl>" 
		// })
		// objList += "</section>"

		var objList = "";
		Object.keys(d).forEach(function(attr) {
			objList += "<b>" + (ntwrk.config.meta.nodes.prettyMap[attr] || attr) + "</b>:" + d[attr] + "</br>";
		})
		// objList += "</section>"
		$("#selection-about").html(objList);
		var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id));		
		//TODO: Re-enable this to show component force network
		// visualizations.notmainVis.AngularArgs.data = ntwrk.AngularArgs.data;
		// visualizations.notmainVis.AngularArgs.data.nodes.data = new Object(d3.select(this).data());
		// visualizations.notmainVis.AngularArgs.data.edges.data = edges.data();

		// edges.data().forEach(function(d, i) {
		// 	visualizations.notmainVis.AngularArgs.data.nodes.data.push(new Object(d.source));
		// 	visualizations.notmainVis.AngularArgs.data.nodes.data.push(new Object(d.target));
		// });

		// visualizations.notmainVis.RunVis();
		// visualizations.notmainVis.SVG.select("." + visualizations.notmainVis.AngularArgs.opts.ngIdentifier + "g" + d.id).attr("transform", "translate(0,0)")
		// visualizations.notmainVis.SVG.force.tick();
		// visualizations.notmainVis.SVG.force.stop();
		// visualizations.notmainVis.SVG.select("." + ntwrk.AngularArgs.opts.ngIdentifier + "n" + d.id).classed("fixed", true);
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
		})
		// objList += "</section>"
		$("#selection-about").html(objList);
		// var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id));		


		// var objList = "<section class='table_specification'>";
		// Object.keys(d).forEach(function(attr) {
		// 	objList += "<dl><dt><b>" + attr + ": </b></dt><dd>" + d[attr] + "</br></dd></dl>" 
		// })
		// objList += "</section>"
		// $("#selection-about").html(objList);

	})


	ntwrk.SVG.background.on("click", function() {
		d3.event.preventDefault();
		$("#main-vis-node-sel-disp").css("display", "none");
		$("#main-vis-edge-sel-disp").css("display", "none");

		ntwrk.SVG.selectAll("*").classed("selected", false).classed("deselected", false);
		$("#selection-about").html("");
	});
	// d3.selectAll("*").on("click", function(evt) {
	// 	d3.event.stopPropagation(); 
	// 	$("#selectedClasses").html(d3.select(this).attr("class"));
	// 	ntwrk.SVG.links.classed("selected", false);
	// })
}


//TODO: Maybe implement something like this?
// function constructClasses(classList, additions) {	
// 	var tempStr = classList.replaceAll(" ", "");
// 	var classArr = tempStr.split(",");
// 	var classStr = "";
// 	classArr.forEach(function(d, i) {
// 		classStr += d + " ";
// 		additions.forEach(function(d1, i1) {
// 			classStr += d + d1 + " ";
// 		})
// 	})
// 	return classStr;
// }
// console.log(constructClasses("l, n ,a", ["vis-div", 1, "q"]))



//Hovering over a node should:
	//Highlight the node
	//Highlight the corresponding bar
	//Highlight all immediate edges
//Hovering over a bar should:
	//Highlight the bar
	//Highlight the corresponding node
//Shift+clicking a node should:
	//Pin the node in place
