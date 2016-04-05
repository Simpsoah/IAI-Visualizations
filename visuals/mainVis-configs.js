configs.mainVis = {
    "type": "org.cishell.json.vis.metadata",
    "nodes": {
        "styleEncoding": {
            "size": {
                "attr": "userWI",
                "scale": "log",
                "range": [1, 10]
            },
            "color": {
                "attr": "outRT",
                "range": ["#F4FCD4", "#BCE57A", "#8DC63F"]
            }
        },
        "identifier": {
            "attr": "id"
        },
        "prettyMap": {
            "id": "id",
            "label": "Node label",
            "CTSA": "CTSA account",
            "assTC": "Number of tweets mentioning the user",
            "assMentions": "Count of instances when the user is mentioned by other",
            "userTC": "Number of tweets",
            "userWOI": "Count of user's tweets without interactions (mentions)",
            "userWI": "Count of user's tweets with interactions (mentions)",
            "totMentCount": "Total number of mentions made by the user",
            "unqUserMentCount": "Count of unique users mentioned by the user",
            "mentpertweet": "Average count of user's mentioned per tweet",
            "mentperuuser": "Average count of user's interactions per unique user",
            "conversation1": "Conversation index score #1",
            "conversation2": "Conversation index score #2",
            "outRP": "Count of user's replies",
            "outRT": "Count of user's retweets",
            "outRTRP": "Count of user's retweet replies",
            "outTA": "Count of user's direct mentiones",
            "rt2taratio": "Retweet to directed tweets ratio",
            "tothtcount": "Count of hash tags",
            "htpertwt": "Average hashtag per tweet",
            "avgfriend": "Average friend count",
            "avgFollowers": "Average follower count",
            "avgFollowing": "Average following count",
            "outDirTC": "Out-degree",
            "inDirTC": "In-degree",
            "inRT": "Inbound retweets",
            "inRP": "Inbound replies"
        }
    },
    "edges": {
        "filterAttr": "cooc",
        "styleEncoding": {
            "strokeWidth": {
                "attr": "dirRTW",
                "range": [1, 6.5, 12]
            },
            "opacity": {
                "attr": "dirRTW",
                "range": [0.125, .5675, 1]
            },
            "color": {
                "attr": "sl",
                "range": ["orange", "blue"]
            }
        },
        "identifier": {
            "attr": "id",
        },
        "prettyMap": {
            "source": "Source node",
            "target": "Target node",
            "slabeL": "Source node label",
            "tlabeL": "Target node label",
            "dirRPW": "Replies",
            "dirRTW": "Number of retweets",
            "dirRTRPW": "Retweet replies",
            "dirTAW": "Directed mentions",
            "dirWeightCount": "Directed",
            "dirWeightFractCount": "Fractional mentions",
            "coocWeightCount": "Co-Occurrence",
            "cooc": "Co-Occurrence edge",
            "sl": "Self loop",
            "slw": "Self loop weight",
        }
    },
    "labels": {
        "styleEncoding": {
            "attr": "label",
            "range": [14, 30],
            "displayTolerance": .2
        },
        "identifier": {
            "attr": "id"
        }
    },
    "visualization": {
        "forceLayout": {
            // "linkStrength": 10,
            // "friction": .2,
            // "linkDistance": 6,
            "charge": function(args) {
                return -1.75 / Math.sqrt(args[0].length / (args[1].dims.fixedWidth * args[1].dims.fixedHeight)); },
            // "chargeDistance": 		function(args) {return 1 * Math.sqrt(args[0].length * 5 / (args[1].dims.width * args[1].dims.height)); },
            "gravity": .225,
            // "theta": null,
            // "alpha": -100
        }
    },
    "other": {
		"nih": "NIH",
		"ctsa": "CTSA",
		"nodeFocusFields": ["avgFollowers", "avgFollowing", "totMentCount", "inDirTC", "outDirTC"]
	}
}

events.mainVis = function(ntwrk) {
	var svg = ntwrk.SVG;
	svg.nodes.classed("nih", function(d, i) {
		if (d[ntwrk.config.meta.other.nih] == 1) return true;
	})
	svg.nodes.classed("ctsa", function(d, i) {
		if (d[ntwrk.config.meta.other.ctsa] == 1) return true;
	})

	Object.keys(ntwrk.meta.visualization.forceLayout).forEach(function(layoutAttr) {
		if (ntwrk.meta.visualization.forceLayout[layoutAttr] != null) {
			ntwrk.SVG.force[layoutAttr](ntwrk.meta.visualization.forceLayout[layoutAttr]);
		};
	});
	ntwrk.SVG.force.start();
	
	svg.gnodes.on("mouseup", function(d, i) {
		if(d3.event.shiftKey) {
			d.fixed = true;
		} else {
			d.fixed = false;
		}
	}).on("mousedown", function(d, i) {
		svg.select(".n" + d.id).classed("selected", true);
		d3.event.preventDefault();
		ntwrk.SVG.links.classed("deselected", false);
		ntwrk.SVG.links.classed("selected", false);
		var edges = ntwrk.SVG.selectAll(".s" + d.id).mergeSelections(ntwrk.SVG.selectAll(".t" + d.id))
			.classed("deselected", false)
			.classed("selected", true);
	}).on("mouseover.d", function(d, i) {
		d3.select(this).selectAll("text").style("display", "block");
		svg.select(".n" + d.id).classed("selected", true);
	}).on("mouseout.d", function(d, i) {
		if (d3.select(".g" + d.id).property("labeled") == false) {
			d3.select(this).selectAll("text").style("display", "none");	
		}
		svg.select(".n" + d.id).classed("selected", false);
	}).on("mousedown.updateNodeMetadataDisplay", function(d, i) {
		$("#main-vis-node-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp").css("display", "none");
		$("#main-vis-node-sel-disp-circ").css("fill", svg.select(".n" + d.id).style("fill"));
		$("#main-vis-node-sel-disp-circ").css("stroke-width", svg.select(".n" + d.id).style("stroke-width"));
		var objList = "<table class='tg'>";
		ntwrk.config.meta.other.nodeFocusFields.forEach(function(attr) {
			objList += "<tr><td class='tg-yw41'>" + (ntwrk.config.meta.nodes.prettyMap[attr] || attr) + "</td>"
			objList += "<td class='tg-lqy6'>" + d[attr] + "</td></tr>"
		});
		objList += "</table>"		
		$("#selection-about").html(objList);
	});
	


	svg.links.on("mousedown", function(d, i) {
		svg.nodes.mergeSelections(svg.links).classed("selected", false);
		d3.select(this).classed("selected", true);
		svg.select(".n" + d.source.id).mergeSelections(svg.select(".n" + d.target.id)).classed("selected", true);
	}).on("mousedown.updateEdgeMetadataDisplay", function(d, i) {
		$("#main-vis-node-sel-disp").css("display", "none");
		$("#main-vis-edge-sel-disp").css("display", "block");
		$("#main-vis-edge-sel-disp-circ-source").css("fill", svg.select(".n" + d.source.id).style("fill"));
		$("#main-vis-edge-sel-disp-circ-target").css("fill", svg.select(".n" + d.target.id).style("fill"));
	});



	ntwrk.SVG.background.on("click", function() {
		d3.event.preventDefault();
		$("#main-vis-node-sel-disp").css("display", "none");
		$("#main-vis-edge-sel-disp").css("display", "none");
		ntwrk.SVG.selectAll("*").classed("selected", false).classed("deselected", false);
		$("#selection-about").html("");
	});

	ntwrk.SVG.updateAll = function() {
		ntwrk.SVG.updateNodes();
		ntwrk.SVG.updateLinks();
	}
	ntwrk.SVG.updateLinks = function() {
		var notFilteredEdges = visualizations.mainVis.SVG.links.data();
		ntwrk.Scales.edgeStrokeScale = Utilities.makeDynamicScale(
			notFilteredEdges,
			ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr,
			"linear",
			ntwrk.config.meta.edges.styleEncoding.strokeWidth.range
		);
		ntwrk.Scales.edgeOpacityScale = Utilities.makeDynamicScale(
			notFilteredEdges,
			ntwrk.config.meta.edges.styleEncoding.opacity.attr,
			"linear",
			ntwrk.config.meta.edges.styleEncoding.opacity.range
		);


		//TODO: For demo purposes. Remove transition
		ntwrk.SVG.links
			// .style("stroke-width", function(d) {
			// 	return ntwrk.Scales.edgeStrokeScale(d[ntwrk.config.meta.edges.styleEncoding.strokeWidth.attr]);
			// })
			.style("opacity", function(d) {
				return ntwrk.Scales.edgeOpacityScale(d[ntwrk.config.meta.edges.styleEncoding.opacity.attr]);
			});
	};

	ntwrk.SVG.updateNodes = function() {
		var notFilteredGnodes = visualizations.mainVis.SVG.gnodes;
		var notFilteredNodes = notFilteredGnodes.each(function(d) {
			return ntwrk.SVG.select(".n" + d.id);
		});
		ntwrk.Scales.nodeSizeScale = Utilities.makeDynamicScale(
			notFilteredGnodes.data(),
			ntwrk.config.meta.nodes.styleEncoding.size.attr,
			ntwrk.config.meta.nodes.styleEncoding.size.scale,
			ntwrk.config.meta.nodes.styleEncoding.size.range
		);
		var test = ntwrk.Scales.nodeSizeScale.domain()
		test[0] = test[0] + .1;

		ntwrk.Scales.nodeSizeScale.domain(test);
		ntwrk.Scales.nodeColorScale = Utilities.makeDynamicScale(
			notFilteredGnodes.data(),
			ntwrk.config.meta.nodes.styleEncoding.color.attr,
			"linear",
			ntwrk.config.meta.nodes.styleEncoding.color.range
		);
		//TODO: For demo purposes. Remove transition
		ntwrk.SVG.nodes.transition().duration(250)
			.attr("r", function(d, i) {
				return ntwrk.Scales.nodeSizeScale(d[ntwrk.config.meta.nodes.styleEncoding.size.attr] + .1);
			})
			.style("fill", function(d, i) {
				return ntwrk.Scales.nodeColorScale(d[ntwrk.config.meta.nodes.styleEncoding.color.attr]);
			})
		ntwrk.SVG.selectAll("text").remove();

		ntwrk.Scales.nodeTextScale = Utilities.makeDynamicScale(
			notFilteredNodes.data(),
			ntwrk.config.meta.nodes.styleEncoding.size.attr,
			"linear",
			ntwrk.config.meta.labels.styleEncoding.range
		);

		ntwrk.SVG.gnodes.append("text").attr("class", function(d, i) {
			return "l l" + d[ntwrk.config.meta.nodes.identifier.attr];
		});
		ntwrk.SVG.gnodes.moveToFront();
		ntwrk.SVG.selectAll("text")
			.attr("class", function(d, i) {
				return "text l l" + d[ntwrk.config.meta.nodes.identifier.attr];
			})
			.attr("dx", 0)
			.attr("dy", 10)
			.style("font-size", function(d, i) {
				return ntwrk.Scales.nodeTextScale(d[ntwrk.config.meta.nodes.styleEncoding.size.attr]);
			})
			.text(function(d, i) {
				if (d[ntwrk.config.meta.nodes.styleEncoding.size.attr] > ntwrk.Scales.nodeSizeScale.domain()[1] * ntwrk.config.meta.labels.styleEncoding.displayTolerance) {
					d3.select(".g" + d.id).property("labeled", true)
					d3.select(".g" + d.id).moveToFront();
				} else {
					d3.select(".g" + d.id).property("labeled", false)
					try {
						d3.select(this).style("display", "none");
					} catch (exception) {
						console.log(exception)
					}
				};
				return d[ntwrk.config.meta.labels.styleEncoding.attr];

			});
		ntwrk.SVG.selectAll("text").moveToFront();
	};

	ntwrk.SVG.updateAll();

	function togglePhysics() {
		svg.force.physicsToggle();
	}
}

dataprep.mainVis = function(ntwrk) {}