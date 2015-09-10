var meta = {
	"forceNetwork": { 
		"type": 						"org.cishell.json.vis.metadata",
		"nodes": {
			"styleEncoding": {
				"radius": {
					"attr": 			"TotNumTwts",
					"range": 			[4, 25]	
				},
				"color": {
					"attr": 			"RT2TA",
					"range": 			["#00B08C", "orange"]
				}
			},
			"identifier": {
				"attr": 				"id"			
			}
		},
		"edges": {
			"styleEncoding": {
				"strokeWidth": {
					"attr": 			"Count",
					"range": 			[1, 12]
				},
				"opacity": {
					"attr": 			"Count",
					"range": 			[.5, 0.00125]
				}
			},
			"identifier": {
				"attr": 				"id"
			}
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"displayTolerance": 	.25
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
				"charge": 				function(args) {return -10 / Math.sqrt(args[0].length * 100 / (args[1].dims.fixedWidth * args[1].dims.fixedHeight)); },
				// "chargeDistance": 		function(args) {return 1 * Math.sqrt(args[0].length * 100 / (args[1].dims.width * args[1].dims.height)); },
				"gravity": 				null,
				"theta": 				null,
				"alpha": 				null
			}
		}
	}
}
