configs.triangleLegend = {
    "class": "triangle",
    "shape": "triangle-up"
}
configs.squareLegend = {
    "class": "rectangle",
    "shape": "square"
}
configs.diamondLegend = {
    "class": "diamond",
    "shape": "diamond"
}
dataprep.triangleLegend = function(ntwrk) {
    ntwrk.filteredData = visualizations[ntwrk.AngularArgs.opts.ngComponentFor].SVG.triangleScale;
}
dataprep.squareLegend = function(ntwrk) {
    ntwrk.filteredData = visualizations[ntwrk.AngularArgs.opts.ngComponentFor].SVG.rectangleScale;
}
dataprep.diamondLegend = function(ntwrk) {
    ntwrk.filteredData = visualizations[ntwrk.AngularArgs.opts.ngComponentFor].SVG.diamondScale;
}

visualizationFunctions.ComponentShapeSizeLegend = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.config = network.CreateBaseConfig();
    network.parentVis = visualizations[opts.ngComponentFor];
    network.SVG = d3.select(element[0])
        .append("svg")
        .attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
        .attr("height", network.config.dims.height + network.config.margins.top - network.config.margins.bottom)
        .style("background", "none")
        .append("g")
        .attr("class", "canvas " + opts.ngIdentifier);
    network.parentVis = visualizations[opts.ngComponentFor];
    network.VisFunc = function() {
        var data = [.1, .5, .9]
        network.SVG.shapeGroup = network.SVG.append("g")
            .attr("transform", "translate(0,0)").selectAll("." + network.config.meta.class)
            .data(data)
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                var x = network.config.dims.fixedWidth * d
                var y = (network.config.dims.fixedHeight / 4);
                return "translate(" + x + "," + y + ")"
            })

        var rangeArr = network.filteredData.range();
        [8, 64]

        var sizeScale = d3.scale.linear()
            .domain([0, 1, 2])
            .range([d3.min(rangeArr), d3.mean(rangeArr), d3.max(rangeArr)])
        network.SVG.shape = network.SVG.shapeGroup
            .append("path")
            .attr("class", network.config.meta.class)
            .attr("transform", function(d, i) {
                if (sizeScale(0) == sizeScale(data.length - 1) && i != Math.floor(d3.mean([0, data.length]))) {
                    d3.select(this).remove();
                } else {
                    var curr = d3.select(this);
                    curr.attr("d", d3.svg.symbol().type(network.config.meta.shape).size(sizeScale(i)))
                    var currNode = d3.select(this).node();
                    var currNodeBBox = currNode.getBoundingClientRect();
                    var x = 0;
                    var y = -currNodeBBox.height / 2;
                    return "translate(" + (x) + "," + (y) + ")";
                }
            })

        network.SVG.text = network.SVG.shapeGroup
            .append("text")
            .attr("class", "l")
            .attr("y", 45)
            .attr("text-anchor", "middle")
            .text(function(d, i) {
                if (sizeScale(0) == sizeScale(data.length - 1) && i != Math.floor(d3.mean([0, data.length]))) {
                    d3.select(this).remove();
                } else {
                    if (i == 0) {
                        return d3.min(network.filteredData.domain())
                    }
                    if (i == 1) {
                        return d3.mean(network.filteredData.domain())
                    }
                    if (i == 2) {
                        return d3.max(network.filteredData.domain())
                    }
                }
            })

    }
    return network;
}
