var VisualizationClass = function() {
	this.config = null,
		this.VisFunc = null,
		this.isReady = false,
		this.Vis = null,
		this.SVG = null,
		this.Scales = {},
		this.Children = [],
		this.Events = null,
		this.isFirstRun = true,
		this.PrimaryDataAttr = "nodes",
		this.filteredData = {},
		this.AngularArgs = {
			element: "",
			data: "",
			opts: ""
		},
		this.Verbose = verbose || false,
		this.GetData = function() {
			if (Object.keys(this.filteredData).length == 0) {
				switch (this.AngularArgs.data.topology) {
					case "graph":
						this.AngularArgs.data[this.PrimaryDataAttr].data.map(function(d, i) {
							d.storedId = d.id;
						})
						this.AngularArgs.data.edges.data.map(function(d, i) {
							d.storedSource = d.source;
							d.storedTarget = d.target;
						});
						break;
					case "table":
						this.AngularArgs.data[this.PrimaryDataAttr].data.map(function(d, i) {
							d.storedId = d.id;
						})
						break;
					default:
						this.AngularArgs.data.map(function(d, i) {
							d.storedId = d.id;
						});
						break;
				}
				this.RunDataFilter();
			}
			return this.filteredData;
		},
		this.CreateBaseConfig = function() {
			var out = {};
			out.margins = {};
			out.dims = {};
			out.meta = meta[this.AngularArgs.opts.ngIdentifier];
			out.margins.top = 0
			out.margins.right = 0
			out.margins.bottom = 0
			out.margins.left = 0
			out.dateFormat = this.AngularArgs.opts.ngDateFormat || "%d-%b-%y";
			out.dims.width = (this.AngularArgs.opts.ngWidth || $(this.AngularArgs.element[0]).width()) - out.margins.left - out.margins.right;
			out.dims.height = (this.AngularArgs.opts.ngHeight || $(this.AngularArgs.element[0]).height()) - out.margins.top - out.margins.bottom;
			out.dims.fixedWidth = out.dims.width - out.margins.left - out.margins.right;
			out.dims.fixedHeight = out.dims.height - out.margins.top - out.margins.bottom;
			out.colors = this.AngularArgs.opts.ngColors || ["#AC52C4", "#FF4338", "#FFA700", "#DEA362",
				"#FFD24F", "#FF661C", "#DB4022", "#FF5373",
				"#EE81A8", "#EE43A9", "#B42672", "#91388C",
				"#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5",
				"#0067C9", "#008FDE", "#009ADC", "#007297",
				"#12978B", "#00BBB5", "#009778", "#75A33D",
				"#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"
			];
			out.easySVG = function(selector) {
				return d3.select(selector)
					.append("svg")
					.attr("transform", "translate(" + out.margins.left + "," + out.margins.top + ")")
					.attr("width", out.dims.width - out.margins.left - out.margins.right)
					.attr("height", out.dims.height - out.margins.top - out.margins.bottom);
			}
			return out;
		},
		this.ClearVis = function() {
			try {
				this.SVG.selectAll("*").remove();
			} catch (exception) {
				// console.log(exception)
			}
			return this;
		},
		this.FilterData = function(data, attr, range) {
			var filteredRange = range || [];
			if (filteredRange[0] == null) {
				filteredRange[0] = d3.min(data, function(d, i) {
					return +d[attr];
				});
			}
			if (filteredRange[1] == null) {
				filteredRange[1] = d3.max(data, function(d, i) {
					return +d[attr];
				});
			}
			return data.filter(function(d, i) {
				return d[attr] >= filteredRange[0] && d[attr] <= filteredRange[1];
			})
		},
		this.RunDataFilter = function(range) {
			var that = this;
			if (!this.filteredData[this.PrimaryDataAttr]) this.filteredData[this.PrimaryDataAttr] = {};
			var masterNodeData = this.AngularArgs.data[this.PrimaryDataAttr].data;
			var masterNodeDataClone = $.extend(true, [], masterNodeData);
			this.filteredData[this.PrimaryDataAttr].data = this.FilterData(masterNodeDataClone, this.config.meta[this.PrimaryDataAttr].filterAttr, range || []);
			var nodeIdMap = this.filteredData[this.PrimaryDataAttr].data.map(function(d, i) {
				return +d.id;
			});
			var idMap = {
				// 23:1	old:new
			}
			var i = 0;
			this.filteredData[this.PrimaryDataAttr].data.map(function(d0, i0) {
				if (!idMap[d0.storedId]) {
					idMap[d0.storedId] = i;
					i++;
				}
				d0.id = idMap[d0.storedId];
			});

			switch (this.AngularArgs.data.topology) {
				case "graph":
					if (!this.filteredData.edges) this.filteredData.edges = {};
					var masterEdgeData = this.AngularArgs.data.edges.data;
					var masterEdgeDataClone = $.extend(true, [], masterEdgeData);
					this.filteredData.edges.data = masterEdgeDataClone.filter(function(d, i) {
						return nodeIdMap.indexOf(d.source) > -1 && nodeIdMap.indexOf(d.target) > -1
					});
					that.filteredData.edges.data.map(function(d1, i1) {
						d1.source = idMap[d1.source];
						d1.target = idMap[d1.target];
						d1.id = i1;
					})
					break;
				default:
					this.filteredData = this.FilterData(this.AngularArgs.data, this.config.meta[this.PrimaryDataAttr].filterAttr, range || []);
					break;
			}
		},
		this.ResetVis = function(data) {
			this.ClearVis();
			this.RunVis(data);
			return this;
		},
		this.RunEvents = function() {
			if (Events[this.AngularArgs.opts.ngIdentifier])
				Events[this.AngularArgs.opts.ngIdentifier](visualizations[this.AngularArgs.opts.ngIdentifier]);
			var indent = "     ";
			if (this.AngularArgs.opts.ngComponentFor != null) indent += indent;
			if (this.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Events bound: " + this.AngularArgs.opts.ngIdentifier);
			return this;
		},
		this.RunChildVisualizations = function() {
			this.Children.forEach(function(v) {
				visualizations[v].Update();
			})
		},
		//Simple duplicate request removal. Kills the timeout and reruns it within 10ms. Will this work with huge datasets?
		this.RunVisQueue;
		this.DataRange = [];
		this.RunVis = function(skipEvents) {
			var timeout = this.RunVisQueue;
			clearTimeout(timeout);
			var that = this;


			if (that.AngularArgs.data.topology == "table") that.PrimaryDataAttr = "records";


			this.RunVisQueue = setTimeout(function() {
				that.isReady = false;
				that.ClearVis();
				if (that.isFirstRun) {
					that.Vis(that.AngularArgs.element, that.AngularArgs.data, that.AngularArgs.opts);
				}
				if (that.AngularArgs.data.topology) {
					that.RunDataFilter(that.config.meta[that.PrimaryDataAttr].initialFilter);
				}
				try {
					that.VisFunc();
				} catch (exception) {
					if (that.Verbose) console.log("Visualization failed: " + that.AngularArgs.opts.ngIdentifier);
					throw exception;
				}
				that.RunChildVisualizations();
				var indent = " ";
				if (that.AngularArgs.opts.ngComponentFor != null) indent += "     ";
				if (that.Verbose) console.log(new Date().toLocaleTimeString() + ":" + indent + "Created visualization: " + that.AngularArgs.opts.ngIdentifier);
				angular.element(document).ready(function() {
					if (!skipEvents) that.RunEvents();
				});
				that.isFirstRun = false;
				that.isReady = true;
				// $(window).resize(function() {
				// 	that.RunVis();
				// });
			}, 10);
			return that;
		},
		this.SetAngularArgs = function(element, data, opts) {
			this.SetAngularElement(element);
			this.SetAngularData(data || {});
			this.SetAngularOpts(opts);
		},
		this.SetAngularElement = function(element) {
			this.AngularArgs.element = element;
		},
		this.SetAngularData = function(data) {
			this.AngularArgs.data = data;
		},
		this.SetAngularOpts = function(opts) {
			this.AngularArgs.opts = opts;
		},
		this.Update = function() {
			this.RunVis();
		}
};
