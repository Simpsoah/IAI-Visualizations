var Events = {
	"mainVis": {
		bindEvents: function(ntwrk) {
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
				$("#txt1s option[value='" + svg.nodeSizeAttr + "']").prop("selected", true)
				$("#txt1c option[value='" + svg.nodeColorAttr + "']").prop("selected", true)
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
				$("#txt2w option[value='" + svg.edgeWeightAttr + "']").prop("selected", true)
				$("#txt2o option[value='" + svg.edgeOpacityAttr + "']").prop("selected", true)								
				$("#edgeAttrList").html(edgeAttrList.substring(0, edgeAttrList.length - 2))

				// svg.updateNodes();

				function togglePhysics() {
					svg.updateNodes();
					svg.force.physicsToggle();
				}
				function changeNodeAttr() {
					svg.updateNodes({"nodeSizeAttr": $("#txt1s option:selected").html()});
					svg.updateNodes({"nodeColorAttr": $("#txt1c option:selected").html()});
					resetAllComponents();
				}
				function changeEdgeAttr() {
					svg.updateLinks({"edgeWeightAttr": $("#txt2w option:selected").html()});
					svg.updateLinks({"edgeOpacityAttr": $("#txt2o option:selected").html()});
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
					console.log("No debug bar. Remove this block if it no longer exists.");
				}

				function applyFilter(min, max) {
					svg.selectAll("*").removeToleranceFilter();
					svg.selectAll(".g").filter(function(d,i) { 
						var currNode = d3.select(this);
						if (d[svg.nodeSizeAttr] < min || d[svg.nodeSizeAttr] > max) {
							currNode.applyToleranceFilter();
							svg.selectAll(".s" + d.id).applyToleranceFilter();
							svg.selectAll(".t" + d.id).applyToleranceFilter();
						};
					});
					changeNodeAttr();
					changeEdgeAttr();
					svg.force.tick();
				}

				function resetAllComponents() {
					try {
						ntwrk.RunChildVisualizations();
					} catch (exception) {
						// console.log(exception);
					}
					// try {
					// 	visualizations.mainVis.Children.forEach(function(d, i) {
					// 		visualizations.mainVis.Children[d].RunVis();
					// 	})
					// 	// visualizations.barVis.ResetVis();
					// } catch (exception) {
					// 	// console.log("No component graph. Remove this block if it no longer exists.");
					// }
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
					return +a[svg.nodeSizeAttr];
				}

				try {	
					if (ntwrk.isFirstRun) {
						//TODO: Find a different slider or something. This doesn't reset with the node attr. Hard to work with. 
						initFilter(d3.extent(visData.nodes.data, function(a) {
							return a[svg.nodeSizeAttr];
						}), (d3.max(visData.nodes.data, rangeFinder) - d3.min(visData.nodes.data, rangeFinder)) / 12, null);	
						// }), null, null);	
					}
					applyFilter(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));

				} catch (exception) {
					console.log(exception)
					console.log("No debug bar. Remove this block if it no longer exists.");
				}


				ntwrk.inspectedNodes = {};
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
				svg.nodes.on("mouseover", function(d, i) {
					svg.select(".n" + d.id).classed("highlighted", true);
					try {
						var currBar = ntwrk.Children.barVis.SVG.selectAll(".b" + d.id);
						currBar.classed("highlighted", true);
					} catch (exception) {
						console.log("No component graph. Remove this block if it no longer exists.");
					}
				}).on("mouseout", function(d, i) {
					svg.select(".n" + d.id).classed("highlighted", false);
					try {
						var currBar = ntwrk.Children.barVis.SVG.selectAll(".b" + d.id);
						currBar.classed("highlighted", false);
					} catch (exception) {
						console.log("No component graph. Remove this block if it no longer exists.");
					}
				}).on("mouseup", function(d, i) {
					delete ntwrk.inspectedNodes["id" + d.id];
					var m = [];
					m[0] = d3.event.pageX;
					m[1] = d3.event.pageY;
					if(d3.event.shiftKey) {
						d.fixed = true;
					} else {
						d.fixed = false;
					}
				}).on("click", function(d, i) {
					ntwrk.SVG.links.classed("deselected", true);
					ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id)).classed("deselected", false).classed("selected", true);
					var objList = "";
					Object.keys(d).forEach(function(attr) {
						objList += "<b>" + attr + ": </b>" + d[attr] + "</br>" 
					})
					$("#about").html(objList)
				});
				ntwrk.SVG.background.on("click", function() {
					ntwrk.SVG.selectAll("*").classed("selected", false).classed("deselected", false);
					$("#about").html("");
				})

		}
	},
	"barVis": {
		bindEvents: function(ntwrk) {
			var svg = ntwrk.SVG;
			var visData = ntwrk.data;
			var parentVis = visualizations.mainVis;
			var parentSVG = parentVis.SVG;
			var parentVisData = parentVis.AngularArgs.data;

			$("#sizeCodingAttr").html(parentSVG.nodeSizeAttr)

			function sortAZ() {
				console.log("changing");
				ntwrk.SVG.sortFunction = function(a, b) {
					return d3.descending(b.label, a.label);
				}
				ntwrk.ResetVis();
			}

			function sortVal() {
				ntwrk.SVG.sortFunction = function(a, b) {
					return d3.descending(a[ntwrk.parentVis.SVG.nodeSizeAttr], b[ntwrk.parentVis.SVG.nodeSizeAttr]);
				}
				ntwrk.ResetVis();
			}

			try {
				document.getElementById("sortAZ").onclick = null;
				document.getElementById("sortVal").onclick = null;
				document.getElementById("sortAZ").onclick = sortAZ;
				document.getElementById("sortVal").onclick = sortVal;				
			} catch (exception) {
				throw exception
				// console.log("No debug bar. Remove this block if it no longer exists.");
			}

			svg.bars.on("mouseover", function(d, i) {
				var currNode = parentSVG.selectAll(".n" + d.id);
				d3.select(this).classed("highlighted", true);
				currNode.classed("highlighted", true);
			}).on("mouseout", function(d, i) {
				var currNode = parentSVG.selectAll(".n" + d.id);
				d3.select(this).classed("highlighted", false);
				currNode.classed("highlighted", false);
			});
		}
	},
	"mainVisSizeLegend": {
		bindEvents: function(ntwrk) {		
		}
	},
	"mainVisColorLegend": {
		bindEvents: function(ntwrk) {		
		}
	},
	"mainVisOpacityLegend": {
		bindEvents: function(ntwrk) {		
		}
	},
	"mainVisWidthLegend": {
		bindEvents: function(ntwrk) {		
		}
	}
}
