//TODO: From now on, scales MUST have at least 3 values. It's just not good to work with otherwise.
var meta = {
	"forceNetwork": { 
		"type": 						"org.cishell.json.vis.metadata",
		"nodes": {
			"styleEncoding": {
				"radius": {
					"attr": 			"TotNumTwts",
					//TODO: This breaks if using more than 2 values. Redo it taking 3+
					"range": 			[4, 16.5, 25]	
				},
				"color": {
					"attr": 			"RT2TA",
					//TODO: Look at modifying JSON from d3 selection
					// "range": 			["red", "orange", "yellow", "green", "blue", "indigo", "violet"].reverse()
					"range": 			["orange", "white", "teal"]
				}
			},
			"identifier": {
				"attr": 				"id"			
			}
		},
		"edges": {
			"styleEncoding": {
				"strokeWidth": {
					"attr": 			"RT",
					"range": 			[1, 6.5, 12]
				},
				"opacity": {
					"attr": 			"Count",
					"range": 			[0.125, .4375, .75]
				},
				"color": {
					"attr": 			"Count",
					"range": 			["orange", "blue"]
				}				
			},
			"identifier": {
				"attr": 				"id"
			}
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"displayTolerance": 	.15
			},
			"identifier": {
				"attr": 				"id"
			}			
		},
		"visualization": {
			"forceLayout": {
				"linkStrength": 		null,
				"friction": 			.75,
				"linkDistance": 		null,
				"charge": 				function(args) {return -10 / Math.sqrt(args[0].length * 60 / (args[1].dims.fixedWidth * args[1].dims.fixedHeight)); },
				// "chargeDistance": 		function(args) {return 1 * Math.sqrt(args[0].length * 100 / (args[1].dims.width * args[1].dims.height)); },
				"gravity": 				null,
				"theta": 				null,
				"alpha": 				null
			}
		}
	}
}
