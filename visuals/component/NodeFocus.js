visualizationFunctions.NodeFocus = function(element, data, opts) {
    var network = visualizations[opts.ngIdentifier];
    network.config = network.CreateBaseConfig();
    network.parentVis = visualizations[opts.ngComponentFor];

    network.VisFunc = function() {
        network.SVGBase = d3.select(element[0])
            .append("svg")
            .attr("width", network.config.dims.width + network.config.margins.left - network.config.margins.right)
            .attr("height", network.config.dims.height + network.config.margins.top - network.config.margins.bottom)
            .style("background", "none")
        network.SVG = network.SVGBase.append("g")
            .attr("class", "canvas " + opts.ngIdentifier);


        var focusNodeR = 20;
        var outNodeR = 6;

        network.SVG.focusNodeG = network.SVG.append("g")
            .attr("transform", "translate(" + (network.config.dims.fixedWidth / 2) + "," + (network.config.dims.fixedHeight / 2) + ")")
        network.SVG.focusNode = network.SVG.focusNodeG.append("circle")
            .attr("class", "n")
            .attr("r", focusNodeR)
            .style("fill", network.parentVis.SVG.selectAll(".n" + network.filteredData.nodes.data.id).style("fill"))

        //TODO: Put centernode title above and bolded
        //Take the CSS from the dev site
        //Sentence case everything
        //Titles should be as they are in data

        //TODO: Update name
        function processTopConnections(str) {
            var order = ["id", "weight", "weight2", "weight3"];
            try {
                top5InArr = str.split(";");
                finalArr = [];
                top5InArr.forEach(function(d, i) {
                    dArr = d.split(",");
                    var finalObj = new Object();
                    order.forEach(function(d1, i1) {
                        finalObj[d1] = dArr[i1]
                    });
                    finalArr.push(finalObj);
                })
                return finalArr;
            } catch(e) {
                return [];
            }
        }

        var inStr = network.filteredData.nodes.data.top5InDegreeUsers
        var outStr = network.filteredData.nodes.data.top5OutDegreeUsers

        try {
            inStr = inStr.replaceAll('"', '');
        } catch (e) {}

        try {
            outStr = outStr.replaceAll('"', '');
        } catch (e) {}

        var inData = processTopConnections(inStr).reverse();
        var outData = processTopConnections(outStr);

        console.log(inData)

        var dat = network.parentVis.filteredData.nodes.data;

        network.SVG.inNodeG = network.SVG.focusNodeG.selectAll(".in")
            .data(inData)
            .enter()
            .append("g");

        network.SVG.outNodeG = network.SVG.focusNodeG.selectAll(".out")
            .data(outData)
            .enter()
            .append("g");

        network.Scales.textOffsetIn = d3.scale.linear()
            .domain([0, (Math.floor(inData.length / 2)), (inData.length - 1)])
            .range([10, 0, -10]);
        network.Scales.textOffsetOut = d3.scale.linear()
            .domain([0, (Math.floor(outData.length / 2)), (outData.length - 1)])
            .range([-10, 0, 10]);

        network.SVGBase.append("svg:defs").selectAll("markerIn")
            .data(["arrowIn"])
            .enter().append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 45)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
        network.SVGBase.append("svg:defs").selectAll("markerOut")
            .data(["arrowOut"])
            .enter()
            .append("svg:marker")
            .attr("id", String)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 22)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");

        network.SVG.outNodeG.each(function(d, i) {
            var elem = d3.select(this);
            var x = (focusNodeR * 2) + (focusNodeR * 2) * Math.cos((i / outData.length) * (Math.PI * 1) + 5.1)
            var y = (focusNodeR / 2) + (focusNodeR * 2) * Math.sin((i / outData.length) * (Math.PI * 1) + 5.1)
            elem.append("circle")
                .attr("class", "n")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", outNodeR)
            elem.append("path")
                .attr("class", "e")
                .attr("d", Utilities.lineFunction([{
                    "x": x,
                    "y": y
                }, {
                    "x": x / 2,
                    "y": y / 2
                }, {
                    "x": 0,
                    "y": 0
                }].reverse()))
                .attr("marker-end", "url(#arrowOut)")
                .style("stroke", "black")
            elem.append("text")
                .attr("x", x + outNodeR * 1.5)
                .attr("y", y + outNodeR * .5 + network.Scales.textOffsetOut(i))
                .attr("text-anchor", "start")
                .text(d.id)
        })

        network.SVG.inNodeG.each(function(d, i) {
            var elem = d3.select(this);
            var x = -(focusNodeR * 2) + (focusNodeR * 2) * Math.cos((i / inData.length) * (Math.PI * 1) + 1.8)
            var y = (focusNodeR / 2) + (focusNodeR * 2) * Math.sin((i / inData.length) * (Math.PI * 1) + 1.8)
            elem.append("circle")
                .attr("class", "n")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", outNodeR)
            elem.append("path")
                .attr("class", "e")
                .attr("d", Utilities.lineFunction([{
                    "x": x,
                    "y": y
                }, {
                    "x": x / 2,
                    "y": y / 2
                }, {
                    "x": 0,
                    "y": 0
                }]))
                .attr("marker-end", "url(#arrowIn)")
            elem.append("text")
                .attr("x", x - outNodeR * 1.5)
                .attr("y", y + outNodeR * .5 + network.Scales.textOffsetIn(i))
                .attr("text-anchor", "end")
                .text(d.id)
        })
        network.SVG.append("text")
            .attr("x", network.config.dims.fixedWidth / 2)
            .attr("y", network.config.dims.fixedHeight / 12)
            .attr("text-anchor", "middle")
            .text(network.filteredData.nodes.data.label)
        network.SVG.selectAll("circle").moveToFront();
    }
    return network;
}
