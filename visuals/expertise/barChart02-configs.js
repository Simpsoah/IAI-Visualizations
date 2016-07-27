//TODO: Extract


events.barChart02 = function(ntwrk) {
    var useData = ntwrk.filteredData.records.data;

    ntwrk.Scales.x
        .domain(d3.extent(useData, function(d, i) {
            return d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr]
        }))

    var tickVals = [];
    var range = (ntwrk.Scales.x.domain()[1] - ntwrk.Scales.x.domain()[0]) / 3;
    //TODO: WHy do I need this>
    for (var i = 0; i < 4; i++) {
        tickVals.push(ntwrk.Scales.x.domain()[0] + (range * i))
    }
    ntwrk.Scales.xAxis
        .tickValues(tickVals)
        .tickSize(ntwrk.SVG.attr("height"))
        .tickFormat(function(d) {
            return Utilities.round(parseFloat(d), 1);
        })
    ntwrk.SVG.xAxisG
        .attr("transform", "translate(" + (ntwrk.Scales.x(ntwrk.Scales.x.domain()[0]) + 1) + "," + ntwrk.SVG.attr("height") + ")").call(ntwrk.Scales.xAxis);

    ntwrk.applyFilter = function(val) {

        var filt = useData.filter(function(d, i) {
            var asdf = false;
            if (d.hub.toString().toLowerCase().indexOf(val.toLowerCase()) >= 0) asdf = true;
            // ntwrk.filteredData.records.schema.forEach(function(d1, i1) {
            //     var fill = "";
            //     if (d1.type == "numeric") fill = 0;
            //     d[d1.name] = d[d1.name] || fill;
            //     if (d[d1.name].toString().toLowerCase().indexOf(val.toLowerCase()) >= 0) asdf = true;
            // })
            return asdf;
        });
        if (val.length == 0) {
            filt = useData
        }

        ntwrk.update(filt)
    }

    ntwrk.SVG.bar
        .attr("class", "wvf-rect bar")
        .attr("width", function(d, i) {
            //TODO: Look into the offset
            ntwrk.Scales.x(d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr])

            var adjustedVal = d[ntwrk.config.meta[ntwrk.PrimaryDataAttr].styleEncoding.size.attr];
            return Math.max(ntwrk.Scales.x(adjustedVal) + 1, 1)
        })

    ntwrk.SVG.bar.on("click", function(d, i) {
        $("tr").removeClass("selected");
        var p = $("td").filter(function() {
            return $.text([this]).toLowerCase() == d.hub.toLowerCase();
        }).parent()
        p.addClass("selected")
    })

    ntwrk.SVG.barG.on("click.nodes", function(d, i) {
        visualizations.proportionalSymbol01.SVG.tip.hide();
        visualizations.proportionalSymbol01.SVG.newLabelBox.selectAll("circle").classed("selected", false)
        visualizations.proportionalSymbol01.SVG.newLabelBox.property("clicked", false);
        ntwrk.SVG.barG.selectAll("rect").classed("selected", false)
        if (d3.select(this).property("clicked") == true) {
            d3.select(this).property("clicked", false)
            d3.select(this).selectAll("rect").classed("selected", false)
        } else {
            visualizations.proportionalSymbol01.SVG.newLabelBox.each(function(d1, i1) {
                if (d1.key == d.hub) {
                    d3.select(this).selectAll("circle").classed("selected", true)
                }
            })
            d3.select(this).property("clicked", true)
            d3.select(this).selectAll("rect").classed("selected", true)
        }
    })


    ntwrk.SVG.barG.on("click.tables", function(d, i) {
        visualizations.angularTablePubs.applySort(d.hub, "ctsahub");
        visualizations.angularTableAuthors.applySort(d.hub, "institution");
        visualizations.angularTableTrials.applySort(d.hub, "facility");
        visualizations.angularTableAwards.applySort(d.hub, "ctsa_hub");
    });

    ntwrk.SVG.background.on("click.clear", function(d, i) {
        $("tr").removeClass("selected");
        visualizations.proportionalSymbol01.SVG.tip.hide();
        ntwrk.SVG.barG.selectAll("rect").classed("selected", false);
        visualizations.proportionalSymbol01.SVG.newLabelBox.selectAll("circle").classed("selected", false)
    })

    ntwrk.SVG.barText.text(function(d, i) {
        return d[configs.barChart02.records.identifier.attr]
    })
}
configs.barChart02 = {
    "type": "org.cishell.json.vis.metadata",
    //This is "nodes" instead of "records" because the parent is a network.
    "records": {
        "styleEncoding": {
            "size": {
                "attr": "expertise"
            },
            "size2": {
                "attr": 30
            },
            "color": {
                "attr": "expertise",
                "range": ["#8DC63F", "#F6DFA4"]
            }
        },
        "identifier": {
            "attr": "hub"
        }
    },
    "labels": {
        "styleEncoding": {
            "attr": "hub",
            "displayTolerance": 0
        },
        "identifier": {
            "attr": "hub"
        }
    }
}

dataprep.barChart02 = function(ntwrk) {
    ntwrk.PrimaryDataAttr = "records";
    var hubNames = [];
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        hubNames.push(d.name);
    });
    

    //awardee_organization
    visualizations.angularTableAwards.AngularArgs.data.get("records");
    //agency
    visualizations.angularTableTrials.AngularArgs.data.get("records");
    //ctsa_hub
    visualizations.angularTablePubs.AngularArgs.data.get("records");
    // var awards = [];
    // var trials = [];
    // var pubs = [];
    var newData = [];
    // pubs = 0;
    // trials = 0;
    // awards = 0;
    // visualizations.angularTablePubs.AngularArgs.data.get("records").data.forEach(function(d, i) {
    //     hubNames.forEach(function(d1, i1) {
    //         d.ctsa_hub.split(";").forEach(function(d2, i2) {
    //             if (d2.length > 0) {
    //                 if (d1.indexOf(d2) > -1) {
    //                     pubs += 1;
    //                 }
    //             }
    //         })
    //     })
    // })
    // visualizations.angularTableTrials.AngularArgs.data.get("records").data.forEach(function(d, i) {
    //     hubNames.forEach(function(d1, i1) {
    //         d.agency.split(";").forEach(function(d2, i2) {
    //             if (d2.length > 0) {
    //                 if (d1.indexOf(d2) > -1) {
    //                     trials += 1;
    //                 }
    //             }
    //         })
    //     })
    // })
    // visualizations.angularTableAwards.AngularArgs.data.get("records").data.forEach(function(d, i) {
    //     hubNames.forEach(function(d1, i1) {
    //         d.awardee_organization.split(";").forEach(function(d2, i2) {
    //             if (d2.length > 0) {
    //                 if (d1.toLowerCase().indexOf(d2.toLowerCase()) > -1) {
    //                     awards += 1;
    //                 }
    //             }
    //         })
    //     })
    // })





    hubNames.forEach(function(d, i) {
        var out = new Object();
        out.hub = d;
        out.awards = 0;
        visualizations.angularTableAwards.AngularArgs.data.get("records").data.forEach(function(d1, i1) {
            d1.ctsa_hub.split(";").forEach(function(d2, i2) {
                if (d2.length > 0) {
                    if (d.toLowerCase() == d2.toLowerCase()) {
                        out.awards += 1;
                    }
                }
            });
        })
        out.trials = 0;
        visualizations.angularTableTrials.AngularArgs.data.get("records").data.forEach(function(d1, i1) {
            if (d1.facility) {
                if (d.toLowerCase() == d1.facility.toLowerCase()) {
                    out.trials += 1;
               }
            }
        })
        out.pubs = 0;
        visualizations.angularTablePubs.AngularArgs.data.get("records").data.forEach(function(d1, i1) {
            d1.ctsahub.split(";").forEach(function(d2, i2) {
                if (d2.length > 0) {
                    if (d.toLowerCase() == d2.toLowerCase()) {
                        out.awards += 1;
                    }
                }
            });
        })        

        out.expertise = out.awards + out.trials + out.pubs
        newData.push(out);
    })

    newData = newData.sort(function(a, b) {
        return b.expertise - a.expertise
    })
    newData.forEach(function(d, i) {
})
    ntwrk.filteredData.records.data = newData;

}
