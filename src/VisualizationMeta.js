//TODO: From now on, scales MUST have at least 3 values. It's just not good to work with otherwise.
var meta = {
	"mainVis": { 
		"type": 						"org.cishell.json.vis.metadata",
		"nodes": {
			"filterAttr": "usertc",
			"initialFilter": [20, Number.POSITIVE_INFINITY],
			"styleEncoding": {
				"size": {
					"attr": 			"usertc",
					//TODO: This breaks if using more than 2 values. Redo it taking 3+
					"range": 			[4, 16.5, 25]
				},
				"color": {
					"attr": 			"rt2taratio",
					//TODO: Look at modifying JSON from d3 selection
					"range": 			["orange", "white", "teal"]
				}
			},
			"identifier": {
				"attr": 				"id"
			},
			"prettyMap": {
				"id": "id",
				"label": "Node label",
				"ctsa": "CTSA Account",
				"asstc": "Number of Tweets mentioning the user",
				"assmentions": "Count of instances when the user is mentioned by other",
				"usertc": "Number of Tweets made by the user",
				"userwoi": "Count of User's Tweets without interactions (Mentions)",
				"userwi": "Count of User's Tweets with interactions (Mentions)",
				"totmentcount": "Total number of mentions made by the user",
				"unqusermentcount": "Count of unique users mentioned by the user",
				"mentpertweet": "Average count of user's mentioned per tweet",
				"mentperuuser": "Average count of user's interactions per unique user",
				"conversation1": "Conversation Index Score 1",
				"conversation2": "Conversation Index Score 2",
				"countrp": "Count of User's Replies",
				"countrt": "Count of User's Retweets",
				"countrtrp": "Count of User's Retweet Replies",
				"countta": "Count of User's Direct Mentions",
				"rt2taratio": "Retweet to Directed Tweets Ratio",
				"tothtcount": "Count of Hash tags",
				"htpertwt": "Average Hash tag per Tweet",
				"avgfriend": "Average Friend Count",
				"avgfollow": "Average Follower Count"
			}
		},
		"edges": {
			"filterAttr": 				"cooc",
			"styleEncoding": {
				"strokeWidth": {
					"attr": 			"rpw",
					"range": 			[1, 6.5, 12]
				},
				"opacity": {
					"attr": 			"taw",
					"range": 			[0.125, .4375, .75]
				},
				"color": {
					"attr": 			"countrp",
					"range": 			["orange", "blue"]
				}
			},
			"identifier": {
				"attr": 				"id",
			},
			"prettyMap": {
				"source": "Source Node",
				"target": "Target Node",
				"slabel": "Source Node Label",
				"tlabel": "Target Node Label",
				"rpw": "Replies",
				"rtw": "Retweet",
				"rtrpw": "Retweet Replies",
				"taw": "Directed Mentions",
				"dirw": "Directed",
				"dirw_frac": "Fractional Mentions",
				"coocw": "Co-Occurrence",
				"cooc": "Co-Occurrence Edge",
				"sl": "Self Loop",
				"slw": "Self Loop Weight"
			}			
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"range": 				[8, 24],
				"displayTolerance": 	.25
			},
			"identifier": {
				"attr": 				"id"
			}
		},
		"visualization": {
			"forceLayout": {
				"linkStrength": 		null,
				"friction": 			.9,
				"linkDistance": 		12,
				"charge": 				function(args) {return -8 / Math.sqrt(args[0].length / (args[1].dims.fixedWidth * args[1].dims.fixedHeight)); },
				// "chargeDistance": 		function(args) {return 1 * Math.sqrt(args[0].length * 100 / (args[1].dims.width * args[1].dims.height)); },
				"gravity": 				1,
				"theta": 				null,
				"alpha": 				-10
			}
		}
	},
	"barVis": { 
		"type": 						"org.cishell.json.vis.metadata",
		//This is "nodes" instead of "records" because the parent is a network.
		"nodes": {
			"styleEncoding": {
				"mainWoH": {
					"attr": 			"usertc",
					"range": 			[4, 16.5, 25]
				},
				"secondaryWoH": {
					"attr": 			30,
					"range": 			[4, 16.5, 25]
				},
				"color": {
					"attr": 			"rt2taratio",
					"range": 			["orange", "white", "teal"]
				}
			},
			"identifier": {
				"attr": 				"id"
			}
		},
		"labels": {
			"styleEncoding": {
				"attr":					"label",
				"displayTolerance": 	0
			},
			"identifier": {
				"attr": 				"id"
			}
		}
	}
}
