events.proportionalSymbol01 = function(ntwrk) {
    var zoomExtent = [.1, 3]
    var zoom = d3.behavior.zoom()
        .scaleExtent(zoomExtent)
        .on("zoom", zoomed);
    ntwrk.event = {};
    ntwrk.event.scale = 1;
    ntwrk.event.translate = [0, 0];

    createPopup();
    createShapes();
    hideIrrelevant();
    ntwrk.applyFilter = function(val) {
        ntwrk.SVG.newLabelBox.style('display', 'none');
        ntwrk.SVG.links.style('display', 'none');
        ntwrk.SVG.newLabelBox.each(function(d, i) {
            var currNode = d3.select(this);
            currNode.data()[0].values.children.forEach(function(d1, i1) {

                Object.keys(d1).forEach(function(d2, i2) {
                    if (d1[d2].toString().toLowerCase().indexOf(val.toLowerCase()) >= 0) currNode.style("display", "block")
                })
            })
        })
        ntwrk.SVG.links.each(function(d, i) {
            var currNode = d3.select(this);
            currNode.data()[0].values.children.forEach(function(d1, i1) {

                Object.keys(d1).forEach(function(d2, i2) {
                    if (d1[d2].toString().toLowerCase().indexOf(val.toLowerCase()) >= 0) currNode.style("display", "block")
                })
            })
        })
    }

    ntwrk.SVG.newLabelBox.on("click.tables", function(d, i) {
        visualizations.angularTablePubs.applySort(d.key, "ctsahub");
        visualizations.angularTableAuthors.applySort(d.key, "institution");
        visualizations.angularTableTrials.applySort(d.key, "facility");
        visualizations.angularTableAwards.applySort(d.key, "ctsa_hub");
    });

    ntwrk.SVG.path.mergeSelections(ntwrk.SVG.background).on("click.clear", function(d, i) {
        ntwrk.SVG.newLabelBox.property("clicked", false);
        $("tr").removeClass("selected");
        ntwrk.SVG.tip.hide();
        visualizations.barChart02.SVG.barG.selectAll("rect").classed("selected", false);
        ntwrk.SVG.newLabelBox.selectAll("circle").classed("selected", false)

    })

    ntwrk.SVG.newLabelBox.on("mouseover.labels", function(d, i) {
        d3.select(this).selectAll("text").attr("display", "inline");
    });
    ntwrk.SVG.newLabelBox.on("mouseout.labels", function(d, i) {
        d3.select(this).selectAll("text").attr("display", "none");
    });

    ntwrk.SVG.newLabelBox.on("click.bars", function(d, i) {
        ntwrk.SVG.newLabelBox.property("clicked", false);
        ntwrk.SVG.newLabelBox.selectAll("circle").classed("selected", false)
        visualizations.barChart02.SVG.barG.selectAll("rect").classed("selected", false);
        if (d3.select(this).property("clicked") == true) {
            visualizations.barChart02.SVG.barG.selectAll("rect").classed("selected", false);
            d3.select(this).property("clicked", false)
            d3.select(this).selectAll("circle").classed("selected", false)
            return ntwrk.SVG.tip.hide(d)
        } else {
            visualizations.barChart02.SVG.barG.each(function(d1, i1) {
                if (d1.hub == d.key) {
                    d3.select(this).selectAll("rect").classed("selected", true)
                }
            })
            d3.select(this).property("clicked", true)
            d3.select(this).selectAll("circle").classed("selected", true)
            return ntwrk.SVG.tip.show(d)
        }
    })

    function zoomed() {
        ntwrk.SVG.tip.hide();
        ntwrk.SVG.g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        visualizations.triangleLegend.SVG.selectAll("path").attr("transform", "scale(" + (d3.event.scale) + ")");
        visualizations.squareLegend.SVG.selectAll("path").attr("transform", "scale(" + (d3.event.scale) + ")");
        visualizations.diamondLegend.SVG.selectAll("path").attr("transform", "scale(" + (d3.event.scale) + ")");
        ntwrk.event = d3.event;
    }
    setTimeout(function() {
        ntwrk.SVG.call(zoom);
    }, 2501)


    function progZoom(dir) {
        var newZoom = ntwrk.event.scale;
        if (dir == "in") {
            newZoom = ntwrk.event.scale / 0.7236346238225785;
        } else {
            newZoom = ntwrk.event.scale * 0.7236346238225785;
        }
        if (newZoom < zoomExtent[1] && newZoom > zoomExtent[0]) {
            zoom.scale(newZoom);
            zoom.event(ntwrk.SVG);
            ntwrk.event.scale = newZoom;
        }
    }
    $("#plus").on("click", function() {
        progZoom("in")
    })
    $("#minus").on("click", function() {
        progZoom("out")
    })

    function hideIrrelevant() {
        ntwrk.SVG.newLabels.each(function(d, i) {
            if (d.values.children[0].awardeesize + d.values.children[0].pubsize + d.values.children[0].trialsize == 0) {
                d3.select(this).style("opacity", .1)
            }
        })
    }

    function createShapes() {
        if (ntwrk.SVG.rectangles) {
            ntwrk.SVG.rectangles.remove();
        }
        if (ntwrk.SVG.triangles) {
            ntwrk.SVG.triangles.remove();
        }
        if (ntwrk.SVG.diamonds) {
            ntwrk.SVG.diamonds.remove();
        }
        var trialrange = getNestedRange("trialsize")
        var pubrange = getNestedRange("pubsize")
        var awardeerange = getNestedRange("awardeesize")
        var shapeRange = [8, 64];
        var shapeMinRange = [0, 0];
        var shapeMaxRange = [64, 64];
        ntwrk.SVG.triangleScale = d3.scale.linear()
            .domain(trialrange)
            .range(shapeRange)
        ntwrk.SVG.rectangleScale = d3.scale.linear()
            .domain(pubrange)
            .range(shapeRange)
        ntwrk.SVG.diamondScale = d3.scale.linear()
            .domain(awardeerange)
            .range(shapeRange)

        if (trialrange[0] == trialrange[1]) {
            ntwrk.SVG.triangleScale.range(shapeMaxRange)
        }
        if (trialrange[0] == -1) {
            ntwrk.SVG.triangleScale.domain([0, 0])
            ntwrk.SVG.triangleScale.range(shapeMinRange)
        }
        if (pubrange[0] == pubrange[1]) {
            ntwrk.SVG.rectangleScale.range(shapeMaxRange)
        }        
        if (pubrange[0] == -1) {
            ntwrk.SVG.rectangleScale.domain([0, 0])
            ntwrk.SVG.rectangleScale.range(shapeMinRange)
        }
        if (awardeerange[0] == awardeerange[1]) {
            ntwrk.SVG.diamondScale.range(shapeMaxRange)
        }
        if (awardeerange[0] == -1) {
            ntwrk.SVG.diamondScale.domain([0, 0])
            ntwrk.SVG.diamondScale.range(shapeMinRange)
        }
        ntwrk.SVG.rectangles = ntwrk.SVG.newLabelBox
            .append("path")
            .attr("class", "rectangle")
            .attr("transform", function(d, i) {
                // console.log(d.values.children[0].size);
                var size = (d.values.children[0].pubsize);
                var curr = d3.select(this);
                if (size > 0) {
                    curr.attr("d", d3.svg.symbol().type("square").size(ntwrk.SVG.rectangleScale(size)))
                    curr.property("area", ntwrk.SVG.rectangleScale(size))
                    var currNode = d3.select(this).node();
                    var currNodeBBox = currNode.getBoundingClientRect();
                    var x = currNodeBBox.width / 2;
                    var y = currNodeBBox.height / 2;
                    return "translate(" + (-x) + "," + (y) + ")";
                }
            })
        ntwrk.SVG.triangles = ntwrk.SVG.newLabelBox
            .append("path")
            .attr("class", "triangle")
            .attr("transform", function(d, i) {
                var size = (d.values.children[0].trialsize);
                var curr = d3.select(this);
                if (size > 0) {
                    curr.attr("d", d3.svg.symbol().type("triangle-up").size(ntwrk.SVG.triangleScale(size)))
                    curr.property("area", ntwrk.SVG.triangleScale(size))
                    var currNode = d3.select(this).node();
                    var currNodeBBox = currNode.getBoundingClientRect();
                    var x = currNodeBBox.width / 2;
                    var y = currNodeBBox.height / 2;
                    return "translate(" + (x) + "," + (-y) + ")";
                }

            })
        ntwrk.SVG.diamonds = ntwrk.SVG.newLabelBox
            .append("path")
            .attr("class", "diamond")
            .attr("transform", function(d, i) {
                var size = (d.values.children[0].awardeesize);
                var curr = d3.select(this);
                if (size > 0) {
                    curr.attr("d", d3.svg.symbol().type("diamond").size(ntwrk.SVG.diamondScale(size)))
                    curr.property("area", ntwrk.SVG.diamondScale(size))
                    var currNode = d3.select(this).node();
                    var currNodeBBox = currNode.getBoundingClientRect();
                    var x = 0;
                    var y = currNodeBBox.height / 2;
                    return "translate(" + (x) + "," + (-y) + ")";
                }
            })

        $("#togglePubs").on("click", function() {
            toggleShapes("rectangles")
        })
        $("#toggleTrials").on("click", function() {
            toggleShapes("triangles")
        })
        $("#toggleAwards").on("click", function() {
            toggleShapes("diamonds")
        })
        toggleShapes("rectangles")
        toggleShapes("diamonds")
        toggleShapes("triangles")
    }

    function toggleShapes(str) {
        var focus = ntwrk.SVG[str];
        if (focus.property("hidden") == "null") {
            focus.property("hidden", false);
        }
        if (focus.property("hidden")) {
            focus.property("hidden", false);
            focus.style("display", "none")
        } else {
            focus.property("hidden", true);
            focus.style("display", "block")
        }
    }

    function getNestedRange(attr) {
        var attrmin = d3.min(ntwrk.filteredData.records.data.name, function(d, i) {
            return d3.min(d.values.children, function(d1, i1) {
                if (d1[attr] > 0) {
                    return d1[attr];
                }
            })
        })
        var attrmax = d3.max(ntwrk.filteredData.records.data.name, function(d, i) {
            return d3.max(d.values.children, function(d1, i1) {
                return d1[attr];
            })
        })
        return [attrmin || -1, attrmax]
    }

    function createPopup() {
        var tipHTML = "";
        $.ajax({
            url: "templates/popup-template.html",
            success: function(res) {
                tipHTML = res;
            },
            error: function(res) {
                tipHTML = "ERROR: Template not found"
            }
        })

        ntwrk.SVG.tip = d3.tip()
            .attr("class", "d3-tip")
            .offset([-10, 0])
            .html(function(d) {
                $("tr").removeClass("selected");
                var p = $("td").filter(function() {
                    return $.text([this]).toLowerCase() == d.key.toLowerCase();
                }).parent()
                p.addClass("selected")
                return tipHTML.replace("%d", d.key)
                    .replace("%d", d.values.children[0].trialsize)
                    .replace("%d", d.values.children[0].pubsize)
                    .replace("%d", d.values.children[0].awardeesize)
                    .replace("%d", d.values.children[0].trialsize + d.values.children[0].pubsize + d.values.children[0].awardeesize)
            })
        ntwrk.SVG.call(ntwrk.SVG.tip);
    }
}
configs.proportionalSymbol01 = {
    nodes: {
        styleEncoding: {
            size: {
                attr: 'val',
                range: [4, 12]
            },
            color: {
                attr: '',
                range: ['#F0A71B']
            }
        },
        identifier: {
            attr: 'id'
        },
        popup: {
            content: {
                lat: {
                    prettyLabel: 'Latitude',
                    format: ''
                },
                lng: {
                    prettyLabel: 'Longitude',
                    format: ''
                }
            },
            title: {
                prettyLabel: '',
                attr: 'key'
            }
        }
    }
}
dataprep.proportionalSymbol01 = function(ntwrk) {
    ntwrk.filteredData.records.data.map(function(d, i) {
        d.latitude = parseFloat(d.latitude);
        d.longitude = parseFloat(d.longitude);
        d.id = i;
        d.pubsize = 0;
        d.trialsize = 0;
        d.awardeesize = 0;
    });
    var categories = ['name'];
    var categoryBank = {};

    visualizations.angularTablePubs.AngularArgs.data.get("records").data.forEach(function(d, i) {
        ntwrk.filteredData.records.data.forEach(function(d1, i1) {
            d.ctsahub.split(";").forEach(function(d2, i2) {
                if (d2.length > 0) {
                    if (d1.name == d2) {
                        d1.pubsize += 1;
                    }
                }
            })
        })
    })
    visualizations.angularTableTrials.AngularArgs.data.get("records").data.forEach(function(d, i) {
        ntwrk.filteredData.records.data.forEach(function(d1, i1) {
            if (d.facility) {
                d.facility.split(";").forEach(function(d2, i2) {
                    if (d2.length > 0) {
                        if (d1.name == d2) {
                            d1.trialsize += 1;
                        }
                    }
                })
            }
        })
    })
    visualizations.angularTableAwards.AngularArgs.data.get("records").data.forEach(function(d, i) {
        ntwrk.filteredData.records.data.forEach(function(d1, i1) {
            d.ctsa_hub.split(";").forEach(function(d2, i2) {
                if (d2.length > 0) {
                    if (d1.name.toLowerCase() == d2.toLowerCase()) {
                        d1.awardeesize += 1;
                    }
                }
            })
        })
    })
    categories.forEach(function(category, i) {
        categoryBank[category] = nest(category, i);
    })

    function nest(category, i) {
        return d3.nest()
            .key(function(d) {
                return d[category];
            })
            .rollup(function(leaves) {
                var obj = {
                    children: leaves
                };
                ntwrk.AngularArgs.data.get("records").schema.forEach(function(d) {
                    if (d.type == "numeric") {
                        obj[d.name] = d3.mean(leaves, function(d1) {
                            return d1[d.name];
                        })
                    } else {}
                })
                return obj;
            })
            .entries(ntwrk.filteredData.records.data);
    }
    ntwrk.filteredData.records.data = categoryBank;
    ntwrk.currCategory = 'name';

}
