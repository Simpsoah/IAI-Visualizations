//http://bl.ocks.org/mpmckenna8/429a8eb651ce35a252da

visualizationFunctions.D3ProportionalSymbol = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.parentVis = visualizations[opts.ngComponentFor];



    network.VisFunc = function() {
        network.config = network.CreateBaseConfig();
        network.SVG = network.config.easySVG(element[0], {})
        var shapeData = usShapeData;
        network.SVG.projection = d3.geo.albersUsa()
            .scale(network.config.dims.fixedWidth)
            .translate([network.config.dims.fixedWidth / 2, network.config.dims.fixedHeight / 2])
        network.SVG.background = network.SVG.append("rect")
            .attr("opacity", .000001)
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("x", 0)
            .attr("y", 0)
            .on("click", function() {
                network.SVG.nodeG.property("clicked", "false");
                network.SVG.tip.hide();
            })

        var path = d3.geo.path()
            .projection(network.SVG.projection)
        states = topojson.feature(shapeData, shapeData.objects.states).features

        network.SVG.g = network.SVG.append("g")


        network.SVG.pathG = network.SVG.g.selectAll("path")
            .data(states)
            .enter()


        network.SVG.path = network.SVG.pathG
            .append("path")
            .classed("feature wvf-path", true)
            .attr("d", path)
            // .on("click", clicked)




        network.update = function(filteredData) {
            try { network.SVG.nodeG.selectAll("*").remove(); } catch (e) {};
            network.SVG.nodeG = network.SVG.g.selectAll(".nodeG")
                .data(filteredData)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", function(d, i) {
                    var arr = [d.values.longitude, d.values.latitude]
                    var proj = network.SVG.projection(arr)
                    if (proj == null) {
                        d3.select(this).remove()
                    } else {
                        return "translate(" + (proj[0]) + "," + (proj[1]) + ")"
                    }
                })

            // })
            network.SVG.nodes = network.SVG.nodeG
                .append("circle")
                .classed("balloon node", true)
                .attr("r", 2)
                .attr("cx", 0)
                .attr("cy", 0)

            labelForce = d3.force_labels(network.SVG)
                .linkDistance(0.0)
                .gravity(0)
                .nodes([]).links([])
                .charge(-60)
                .chargeDistance(1000)
                .theta(1)
                .on("tick", redrawLabels)


            network.SVG.nodeG.call(labelForce.update)
            network.SVG.labels = network.SVG.g.selectAll(".labels").data(filteredData)
            network.SVG.newLabels = network.SVG.labels.enter().append("g").attr("class", "labels")
            network.SVG.newLabels.append("line").attr("class", "link balloon")
            network.SVG.links = network.SVG.g.selectAll(".link")

            network.SVG.newLabelBox = network.SVG.newLabels.append("g").attr("class", "labelbox balloon").property("clicked", false)
            network.SVG.newLabelBox.append("circle").attr("class", "wvf-node").attr("r", 10).style("opacity", .5)
            labelBox = network.SVG.g.selectAll(".labels").selectAll(".labelbox")
            network.SVG.labeltext = network.SVG.newLabelBox.append("text")
                .text(function(d, i) {
                    return d.key
                })
                .attr("x", function(d, i) {
                    if (d.labelPos.x >= network.config.dims.fixedWidth / 2) {
                        return -10
                    }
                    return 10
                })
                .attr("y", -10)
                .attr("class", "wvf-label-2")
                .attr("display", "none")
                .style("text-anchor", function(d, i) {
                    if (d.labelPos.x >= network.config.dims.fixedWidth / 2) {
                        return "end"
                    }
                    return "start"
                })

            function redrawLabels() {
                labelBox
                    .attr("transform", function(d) {
                        return "translate(" + d.labelPos.x + " " + d.labelPos.y + ")"
                    })

                network.SVG.links
                    .attr("x1", function(d) {
                        return d.anchorPos.x
                    })
                    .attr("y1", function(d) {
                        return d.anchorPos.y
                    })
                    .attr("x2", function(d) {
                        return d.labelPos.x
                    })
                    .attr("y2", function(d) {
                        return d.labelPos.y
                    })
            }
            network.SVG.selectAll("circle").moveToFront();
        }




        network.update(network.filteredData.records.data[network.currCategory]);
        var centered;


        // function clicked(d) {
        //     network.SVG.nodeG.property("clicked", "false");
        //     network.SVG.tip.hide();
        //     var x, y, k;

        //     if (d && centered !== d) {
        //         var centroid = path.centroid(d);
        //         x = centroid[0];
        //         y = centroid[1];
        //         k = 4;
        //         centered = d;
        //     } else {
        //         x = network.config.dims.fixedWidth / 2;
        //         y = network.config.dims.fixedHeight / 2;
        //         k = 1;
        //         centered = null;
        //     }

        //     network.SVG.g.selectAll("path")
        //         .classed("active", centered && function(d) {
        //             return d === centered;
        //         });

        //     network.SVG.g.transition()
        //         .duration(750)
        //         .attr("transform", "translate(" + network.config.dims.fixedWidth / 2 + "," + network.config.dims.fixedHeight / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
        //         .style("stroke-width", 1.5 / k + "px");
        // }
    }
    return network;
}


d3.force_labels = function force_labels(canv) {
    var labels = d3.layout.force();

    // Update the position of the anchor based on the center of bounding box
    function updateAnchor() {
        if (!labels.selection) return;
        labels.selection.each(function(d, i) {
            var bbox = this.getBoundingClientRect(),
                x = bbox.left - canv.node().getBoundingClientRect().left + bbox.width / 2,
                y = bbox.top - canv.node().getBoundingClientRect().top + bbox.height / 2;

            d.anchorPos.x = x;
            d.anchorPos.y = y;

            // If a label position does not exist, set it to be the anchor position 
            if (d.labelPos.x == null) {
                d.labelPos.x = x;
                d.labelPos.y = y;
            }
        });
    }

    //The anchor position should be updated on each tick
    labels.on("tick.labels", updateAnchor);

    // This updates all nodes/links - retaining any previous labelPos on updated nodes
    labels.update = function(selection) {
        labels.selection = selection;
        var nodes = [],
            links = [];
        selection[0].forEach(function(d) {
            if (d && d.__data__) {
                var data = d.__data__;

                if (!d.labelPos) d.labelPos = { fixed: false };
                if (!d.anchorPos) d.anchorPos = { fixed: true };

                // Place position objects in __data__ to make them available through 
                // d.labelPos/d.anchorPos for different elements
                data.labelPos = d.labelPos;
                data.anchorPos = d.anchorPos;

                links.push({ target: d.anchorPos, source: d.labelPos });
                nodes.push(d.anchorPos);
                nodes.push(d.labelPos);
            }
        });
        labels
            .stop()
            .nodes(nodes)
            .links(links);
        updateAnchor();
        labels.start();
        setTimeout(function(d, i) {
            labels.stop()
        }, 2500)
    };
    return labels;
};
