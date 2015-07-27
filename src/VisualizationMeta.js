var meta = {
	"force": { 
		"type": 						"org.cishell.json.vis.metadata",
		"nodes": {
			"styleEncoding": {
				"radius": {
					"attr": 			"NumTwts",
					"range": 			[3, 25]	
				},
				"color": {
					"attr": 			"AvgMt",
					"range": 			["orange", "red"]
				}
			},
			"identifier": {
				"attr": 				"id",
				"format": 				"nodeId-%s"
			}
		},
		"edges": {
			"styleEncoding": {
				"strokeWidth": {
					"attr": 			"Count",
					"range": 			[.5, 6]
				},
				"opacity": {
					"attr": 			"Count",
					"range": 			[.5, 0.0125]
				}
			},
			"identifier": {
				"attr": {
					"source": 			"source",
					"target": 			"target"
				},
				"format": 				"s%s t%t"
			}
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"displayTolerance": 	.25
			}
		},
		"visualization": {
			"forceLayout": {
				"linkStrength": 		null,
				"friction": 			.75,
				"linkDistance": 		null,
				"charge": 				function(args) {return -10 / Math.sqrt(args[0].length * 100 / (args[1].dims.width * args[1].dims.height)); },
				// "chargeDistance": 		function(args) {return 100 * Math.sqrt(args[0].length / (args[1].width * args[1].height)); },
				"gravity": 				null,
				"theta": 				null,
				"alpha": 				null
			}
		}
	}
}
