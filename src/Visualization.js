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
	this.AngularArgs = {
		element: "",
		data: "",
		opts: ""
	},
	this.Log = true,
	this.GetData = function() {
		return this.AngularArgs.data;
	}
	this.CreateBaseConfig = function() {
		var out 				= {};
		out.margins 			= {};
		out.dims 				= {};
		out.meta 				= meta[this.AngularArgs.opts.ngVisType];
		out.margins.top 		= 1
		out.margins.right		= 1
		out.margins.bottom 		= 1
		out.margins.left 		= 1
		out.dateFormat 			= this.AngularArgs.opts.ngDateFormat || "%d-%b-%y";
		out.dims.width 			= (this.AngularArgs.opts.ngWidth || $(this.AngularArgs.element[0]).width()) - out.margins.left - out.margins.right;
		out.dims.height 		= (this.AngularArgs.opts.ngHeight || $(this.AngularArgs.element[0]).height()) - out.margins.top - out.margins.bottom;
		out.dims.fixedWidth 	= out.dims.width - out.margins.left - out.margins.right;
		out.dims.fixedHeight 	= out.dims.height - out.margins.top - out.margins.bottom;
		out.colors 				= this.AngularArgs.opts.ngColors || 
									["#AC52C4", "#FF4338", "#FFA700", "#DEA362", 
									"#FFD24F", "#FF661C", "#DB4022", "#FF5373", 
									"#EE81A8", "#EE43A9", "#B42672", "#91388C", 
									"#B37AC5", "#8085D6", "#A0B3C9", "#5AACE5", 
									"#0067C9", "#008FDE", "#009ADC", "#007297", 
									"#12978B", "#00BBB5", "#009778", "#75A33D", 
									"#96DB68", "#C0BC00", "#DFC10F", "#BE8A20"];
		out.easySVG = function(selector) {
			return d3.select(selector)
				.append("svg")
				.attr("transform", "translate(" + out.margins.left + "," + out.margins.top + ")")
				.attr("width", out.dims.width - out.margins.left - out.margins.right)
				.attr("height", out.dims.height - out.margins.top - out.margins.bottom)
		}
		return out;
	},
	this.ClearVis = function() {
		this.AngularArgs.element.empty();
		try {
			this.SVG.selectAll("*").remove();
		} catch (exception) {
		}
		return this;
	},
	this.ResetVis = function(data) {
		this.ClearVis();
		this.RunVis(data);
		return this;
	},
	this.RunEvents = function() {
		Events[this.AngularArgs.opts.ngIdentifier].bindEvents(visualizations[this.AngularArgs.opts.ngIdentifier]);
		if (this.Log) console.log("Events bound for: " + this.AngularArgs.opts.ngIdentifier);
		return this;
	},
	this.RunChildVisualizations = function() {
		this.Children.forEach(function(v) {
			visualizations[v].RunVis();
		})
	},
	this.RunVis = function(data) {
		this.isReady = false;
		this.Vis(this.AngularArgs.element, this.AngularArgs.data, this.AngularArgs.opts);
		if (this.Log) console.log("Created visualization: " + this.AngularArgs.opts.ngIdentifier);
		this.RunChildVisualizations();
		this.RunEvents();
		this.isReady = true;
		return this;
	},
	this.SetAngularArgs = function(element, data, opts) {
		this.AngularArgs.element = element;
		this.AngularArgs.data = data;
		this.AngularArgs.opts = opts;
	}
};