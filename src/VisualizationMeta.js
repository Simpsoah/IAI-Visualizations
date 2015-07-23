var meta = {
	"force": { 
		"type": 					"org.cishell.json.vis.metadata",
		"nodes": {
			"styleEncoding": {
				"radius": {
					"attr": 		"NumTwts",
					"range": 		[3, 25]	
				}
			},
			"identifier": {
				"attr": 			"id",
				"format": 			"%s"
			}
		},
		"edges": {
			"styleEncoding": {
				"strokeWidth": {
					"attr": 		"Count",
					"range": 		[.5, 12]
				},
				"opacity": {
					"attr": 		"Count",
					"range": 		[1, 0.0125]
				}
			},
			"identifier": {
				"attr": {
					"source": 		"source",
					"target": 		"target"
				},
				"format": 			"s%s t%t"
			}
		},
		"labels": {
			"styleEncoding": {
				"attr":				"label",
				"displayTolerance": .25
			}
		}
	}
}