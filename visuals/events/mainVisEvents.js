Events.mainVis = function(ntwrk) {
	console.log("mainVis'ing")
	var svg = ntwrk.SVG;
	var visData = ntwrk.AngularArgs.data;
	svg.selectAll("*").applyToleranceFilter();

	var nodeAttrList = "";
	var nodeAttrArr = [];
	visData.nodes.schema.push({
		"name": "weight",
		"type": "numeric"
	})
	visData.nodes.schema.forEach(function(d, i) {
		nodeAttrArr.push(d);
		nodeAttrList += d.name + ", ";
	})
	nodeAttrArr.forEach(function(d) {
		if (d.type == "numeric") {
			$("#txt1s").append($("<option value=" + d.name + "></option>")
				.attr("value", d.name)
				.text(d.name));
			$("#txt1c").append($("<option value=" + d.name + "></option>")
				.attr("value", d.name)
				.text(d.name));						
		}
	})
	$("#txt1s option[value='" + ntwrk.config.meta.nodes.styleEncoding.radius.attr + "']").prop("selected", true)
	$("#txt1c option[value='" + visualizations.barVis.config.meta.bars.styleEncoding.color.attr + "']").prop("selected", true)
	$("#nodeAttrList").html(nodeAttrList.substring(0, nodeAttrList.length - 2))


	var edgeAttrList = "";
	var edgeAttrArr = [];
	visData.edges.schema.forEach(function(d, i) {
		edgeAttrArr.push(d);
		edgeAttrList += d.name + ", ";
	})
	edgeAttrArr.forEach(function(d) {
		if (d.type == "numeric") {
			$("#txt2w").append($("<option value=" + d.name + "></option>")
				.attr("value", d.name)
				.text(d.name));
			$("#txt2o").append($("<option value=" + d.name + "></option>")
				.attr("value", d.name)
				.text(d.name));
		}
	})
	$("#txt2w option[value='" + ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr + "']").prop("selected", true)
	$("#txt2o option[value='" + ntwrk.config.meta.edges.styleEncoding.opacity.attr + "']").prop("selected", true)								
	$("#edgeAttrList").html(edgeAttrList.substring(0, edgeAttrList.length - 2))

	// svg.updateNodes();

	function togglePhysics() {
		svg.updateNodes();
		svg.force.physicsToggle();
	}
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
			svg
				.selectAll(".n")
				.filter(function(d) {
					return argSplit.indexOf(d.label) >= 0;
				})
		};
	}
	function applyWeightFilter() {
		applyFilter(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));
	}

	try {
		document.getElementById("togglePhysics").onclick = null;
		document.getElementById("innerButton1s").onclick = null;
		document.getElementById("innerButton1c").onclick = null;
		document.getElementById("innerButton2w").onclick = null;
		document.getElementById("innerButton2o").onclick = null;
		document.getElementById("innerButton3").onclick = null;
		document.getElementById("innerButton4").onclick = null;
		document.getElementById("togglePhysics").onclick = togglePhysics;
		document.getElementById("innerButton1s").onclick = changeNodeAttr;
		document.getElementById("innerButton1c").onclick = changeNodeAttr;
		document.getElementById("innerButton2w").onclick = changeEdgeAttr;
		document.getElementById("innerButton2o").onclick = changeEdgeAttr;
		document.getElementById("innerButton3").onclick = highlightNodesByLabels;
		document.getElementById("innerButton4").onclick = applyWeightFilter;
	} catch (exception) {
		// throw exception
		// console.log("No debug bar. Remove this block if it no longer exists.");
	}

	function applyFilter(min, max) {
		svg.selectAll("*").removeToleranceFilter();
		svg.selectAll(".g").filter(function(d,i) { 
			var currNode = d3.select(this);
			if (d[ntwrk.config.meta.nodes.styleEncoding.radius.attr] < min || d[ntwrk.config.meta.nodes.styleEncoding.radius.attr] > max) {
				currNode.applyToleranceFilter();
				svg.selectAll(".n" + d.id).applyToleranceFilter();
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


	ntwrk.inspectedAgg = {};				
	var aggDataDisplay = "";

	visData.nodes.schema.forEach(function(d, i) {
		if (visData.nodes.schema[i].type == "numeric") {
			ntwrk.inspectedAgg[d.name] = 0;
		} else if (visData.nodes.schema[i].type == "string") {
			ntwrk.inspectedAgg[d.name] = "";
		} else {
			//TODO: Handle?
		}
		aggDataDisplay += "<span id='node_data_" + d + "'></span>";
	})
	// <span id="n"></span>

	$("#node_data").html(aggDataDisplay);
	//TODO: Ask IAI about impaired users.
		//Update: They didn't seem to have considered this, it may not be part of the agreement.
		//	Carry on without support for now.
	svg.gnodes.on("mouseover", function(d, i) {
		svg.select(".n" + d.id).classed("highlighted", true);
		try {
			var currBar = visualizations.barVis.SVG.selectAll(".b" + d.id);
			currBar.classed("highlighted", true);
		} catch (exception) {
			console.log("No component graph. Remove this block if it no longer exists.");
		}
	}).on("mouseout", function(d, i) {
		svg.select(".n" + d.id).classed("highlighted", false);
		try {
			var currBar = visualizations.barVis.SVG.selectAll(".b" + d.id);
			currBar.classed("highlighted", false);
		} catch (exception) {
			console.log("No component graph. Remove this block if it no longer exists.");
		}
	}).on("mouseup", function(d, i) {
		if(d3.event.shiftKey) {
			d.fixed = true;
		} else {
			d.fixed = false;
		}
	}).on("mousedown", function(d, i) {
		d3.event.preventDefault();
		ntwrk.SVG.links.classed("deselected", true);
		ntwrk.SVG.links.classed("selected", false);
		var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id));
		edges.classed("deselected", false);
		edges.classed("selected", true);
		var objList = "";
		Object.keys(d).forEach(function(attr) {
			objList += "<b>" + attr + ": </b>" + d[attr] + "</br>" 
		})
		$("#about").html(objList);
		//TODO: Re-enable this to show component force network
		visualizations.notMainVis.AngularArgs.data = ntwrk.AngularArgs.data;
		visualizations.notMainVis.AngularArgs.data.nodes.data = new Object(d3.select(this).data());
		visualizations.notMainVis.AngularArgs.data.edges.data = edges.data();

		edges.data().forEach(function(d, i) {
			visualizations.notMainVis.AngularArgs.data.nodes.data.push(new Object(d.source));
			visualizations.notMainVis.AngularArgs.data.nodes.data.push(new Object(d.target));
		});
		visualizations.notMainVis.RunVis();
		visualizations.notMainVis.SVG.select(".n" + d.id).classed("fixed", true);

	});
	ntwrk.SVG.background.on("click", function() {
		// ntwrk.SVG.selectAll("*").classed("selected", false).classed("deselected", false);
		$("#about").html("");
	});
	d3.selectAll("*").on("click", function(evt) {d3.event.preventDefault(); d3.event.stopPropagation(); $("#selectedClasses").html(d3.select(this).attr("class"))})
}


//TODO: Maybe implement something like this?
function constructClasses(classList, additions) {
	var tempStr = classList.replaceAll(" ", "");
	var classArr = tempStr.split(",");
	var classStr = "";
	classArr.forEach(function(d, i) {
		classStr += d + " ";
		additions.forEach(function(d1, i1) {
			classStr += d + d1 + " ";
		})
	})
	return classStr;
}
console.log(constructClasses("l, n ,a", ["visDiv", 1, "q"]))