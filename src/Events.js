var Events = {
	"mainVis": {
		bindEvents: function(ntwrk) {
				var svg = ntwrk.SVG;
				var visData = ntwrk.AngularArgs.data;
				svg.selectAll("*").applyToleranceFilter();
				function togglePhysics() {
					svg.updateNodes();
					svg.force.physicsToggle();
				}
				function changeNodeAttr() {
					svg.updateNodes(document.getElementById("txt").value);
					resetAllComponents();
				}
				function changeEdgeAttr() {
					svg.updateLinks(document.getElementById("txt2").value);
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
					document.getElementById("innerButton").onclick = null;
					document.getElementById("innerButton2").onclick = null;
					document.getElementById("innerButton3").onclick = null;
					document.getElementById("innerButton4").onclick = null;
					document.getElementById("togglePhysics").onclick = togglePhysics;
					document.getElementById("innerButton").onclick = changeNodeAttr;
					document.getElementById("innerButton2").onclick = changeEdgeAttr;
					document.getElementById("innerButton3").onclick = highlightNodesByLabels;
					document.getElementById("innerButton4").onclick = applyWeightFilter;
				} catch (exception) {
					throw exception
					// console.log("No debug bar. Remove this block if it no longer exists.");
				}

				function applyFilter(min, max) {
					svg.selectAll("*").removeToleranceFilter();
					svg.selectAll(".g").filter(function(d,i) { 
						var currNode = d3.select(this);
						if (d.weight < min || d.weight > max) {
							currNode.applyToleranceFilter();
							svg.selectAll(".s" + d.id).applyToleranceFilter();
							svg.selectAll(".t" + d.id).applyToleranceFilter();
						};
					});
					svg.updateNodes(document.getElementById("txt").value);
					svg.force.tick();
					resetAllComponents();
				}

				function resetAllComponents() {
					try {
						visualizations.mainVis.Children.forEach(function(d, i) {
							visualizations[d].RunVis();
						})
						// visualizations.barVis.ResetVis();
					} catch (exception) {
						// console.log("No component graph. Remove this block if it no longer exists.");
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
						html5Slider.noUiSlider.set([this.value, null]);
					});
					inputNumber.addEventListener('change', function(){
						html5Slider.noUiSlider.set([null, this.value]);
					});
				};

				try {	
					if (ntwrk.isFirstRun) {
						//TODO: Match with Node/Bar attr on debug bar
						initFilter(d3.extent(visData.nodes.data, function(a) {
							return a.weight;
						}), 12, null);	
					}
				} catch (exception) {
					console.log("No debug bar. Remove this block if it no longer exists.");
				}
				applyFilter(parseInt($("#input-select")[0].value), parseInt($("#input-number")[0].value));


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
				//TODO: Ask Chun Lei about impaired users.
				svg.nodes.on("mousedown", function(d, i) {
					svg.select(".n" + d.id).classed("highlighted", true);
					try {
						var currBar = visualizations.barVis.SVG.selectAll(".b" + d.id);
						currBar.classed("highlighted", true);
					} catch (exception) {
						console.log("No component graph. Remove this block if it no longer exists.");
					}
				}).on("mouseup", function(d, i) {
					svg.select(".n" + d.id).classed("highlighted", false);
					try {
						var currBar = visualizations.barVis.SVG.selectAll(".b" + d.id);
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
						// if (m[0] >= 860 && m[0] <= 1100 && m[1] >= 400 && m[1] <= 650) {
						// 	ntwrk.inspectedNodes["id" + d.id] = d;
						// 	Object.keys(d).forEach(function(obj) {
						// 		if (typeof ntwrk.inspectedAgg[obj] == "number") {
						// 			console.log(d[obj])
						// 			ntwrk.inspectedAgg[obj] += d[obj]
						// 		} else {
						// 			ntwrk.inspectedAgg[obj] += d[obj] + ", ";
						// 		}
						// 	})


						// 	//TODO: Store data in inspectedNodes
						// 	//On mouseup, remove that ntwrkent from inspectedNodes
						// 	//If nothing exists in #node_data, make it from the keys and aggregate everything that has a typeof number
						// }
					} else {
						d.fixed = false;
					}
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
	}
}
