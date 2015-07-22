var Utilities = {
	round: function(n, precision) {
		var prec = Math.pow(10, precision);
		return Math.round(n*prec)/prec;
	},
	format: function(n) {
		var base = Math.floor(Math.log(Math.abs(n))/Math.log(1000));
		var suffix = 'KMBT'[base-1];
		return suffix ? round(n/Math.pow(1000,base),2) + suffix : ''+n;
	},
	parseDateUTC: function(input) {
		var reg = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/;
		var parts = reg.exec(input);
		return parts ? (new Date(Date.UTC(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]))) : null;
	},
	removeCharactersFromString: function(str) {
		return parseInt(str.replace(/\D/g,''));
	},
	svgAddDefs: function(svg) {
		svg.append("defs").selectAll("marker")
			.data(["suit", "licensing", "resolved"])
			.enter().append("marker")
				.attr("id", function(d) { return d; })
				.attr("viewBox", "0 -5 10 10")
				.attr("refX", 25)
				.attr("refY", 0)
				.attr("markerWidth", 6)
				.attr("markerHeight", 6)
				.attr("orient", "auto")
				.append("path")
				.attr("d", "M0,-5L10,0L0,5 L10,0 L0, -5")
				.style("stroke", "#4679BD")
				.style("opacity", "0.6");
	}
}