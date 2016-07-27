function titleCase(str) {
    var newstr = str.split(" ");
    for (i = 0; i < newstr.length; i++) {
        newstr[i] = newstr[i].charAt(0).toUpperCase() + newstr[i].substring(1).toLowerCase();
    }
    newstr = newstr.join(" ");
    return newstr;
}


events.angularTableAuthors = function(ntwrk) {}
configs.angularTableAuthors = {
    table: {
        attributes: [{
            prettyLabel: 'Name',
            attr: 'name',
            format: ''
        }, {
            prettyLabel: 'Institution',
            attr: 'institution',
            format: ''
        }, {
            prettyLabel: '#Public.',
            attr: 'pub_count',
            format: ''
        }, {
            prettyLabel: '#Awards',
            attr: 'award_count',
            format: ''
        }],
        pagination: -1,
        globalSearch: true,
        removeRow: false
    },
}
dataprep.angularTableAuthors = function(ntwrk) {
    var authors = {};

    visualizations.angularTablePubs.AngularArgs.data.get("records").data.forEach(function(d, i) {
        var keyString = d.author + "||" + d.ctsahub
        if (authors[keyString]) {
            authors[keyString].pubs.push(d);
        } else {
            authors[keyString] = {
                pubs: [d],
                awards: []
            }
        }
    })

    visualizations.angularTableAwards.AngularArgs.data.get("records").data.forEach(function(d, i) {
        var authorSplit = d.pis.split("|");
        var cleanAuthors = [];
        authorSplit.forEach(function(d1, i1) {
            var nameSplit = d1.split(",");
            var newName = nameSplit[1].trim() + " " + nameSplit[0].trim()
            if (newName.length > 0 && newName != " ") {
                cleanAuthors.push(newName);
            }
        })
        cleanAuthors.forEach(function(d1, i1) {
            var keyString = d1 + "||" + d.org_name
            if (authors[keyString]) {
                authors[keyString].awards.push(d);
            } else {
                authors[keyString] = {
                    pubs: [],
                    awards: [d]
                }
            }
        })
    })


    var authorData = [];
    Object.keys(authors).forEach(function(d, i) {
        var obj = new Object();
        var split = d.split("||");
        obj.name = titleCase(split[0]);
        obj.institution = titleCase(split[1]);
        obj.pubs = authors[d].pubs;
        obj.pub_count = authors[d].pubs.length
        obj.awards = authors[d].awards;
        obj.award_count = authors[d].awards.length
        authorData.push(obj)
    })
    ntwrk.filteredData.records.data = authorData;
}
events.angularTablePubs = function(ntwrk) {
    ntwrk.AngularArgs.element.find("td.title").each(function(i) {
        var str = $(this).html();
        $(this).html("");
        $(this).append("<a href='https://www.ncbi.nlm.nih.gov/pubmed/" + ntwrk.filteredData.records.data[i].pmid + "' target='_blank'>" + str + "</a>")
    })
}
configs.angularTablePubs = {
    table: {
        attributes: [{
            prettyLabel: 'Title',
            attr: 'title',
            format: ''
        }, {
            prettyLabel: 'Institution',
            attr: 'ctsahub',
            format: ''
        }, {
            prettyLabel: 'Journal Name',
            attr: 'journal_name',
            format: ''
        }, {
            prettyLabel: 'Publication Year',
            attr: 'pub_year',
            format: ''
        }],
        pagination: -1,
        globalSearch: true,
        removeRow: false
    },
}

events.angularTableTrials = function(ntwrk) {
    ntwrk.AngularArgs.element.find("td.title").each(function(i) {
        var str = $(this).html();
        $(this).html("");
        $(this).append("<a href='" + ntwrk.filteredData.records.data[i].url + "' target='_blank'>" + str + "</a>")
    })
}
configs.angularTableTrials = {
    table: {
        attributes: [{
            prettyLabel: "Title",
            attr: "title",
            format: ''
        }, {
            prettyLabel: "Institution",
            attr: "facility",
            format: ''
        }, {
            prettyLabel: "Status",
            attr: "status",
            format: ''
        }, {
            prettyLabel: "Start Date",
            attr: "start_date",
            format: ''
        }],
        pagination: -1,
        globalSearch: true,
        removeRow: false
    },
}
dataprep.angularTableTrials = function(ntwrk) {
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        if (d.start_date) {
            var dateSplit = d.start_date.split(" ");
            d.start_date = dateSplit[dateSplit.length - 1]
        }
    })
}

events.angularTableAwards = function(ntwrk) {
    ntwrk.AngularArgs.element.find("td.project_title").each(function(i) {
        var str = $(this).html();
        $(this).html("");
        $(this).append("<a href='https://projectreporter.nih.gov/reporterapi.cfm?PROJECTNUM=%5" + ntwrk.filteredData.records.data[i].core_project_num + "%5d&Fy=2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016' target='_blank'>" + str + "</a>")
    })
}
configs.angularTableAwards = {
    table: {
        attributes: [{
                prettyLabel: "Title",
                attr: "project_title",
                format: ''
            }, {
                prettyLabel: "Institution",
                attr: "ctsa_hub",
                format: ''
            }, {
                prettyLabel: "Amount",
                attr: "funding",
                format: ''
            }
            // , {
            //     prettyLabel: "Status",
            //     attr: "status",
            //     format: ''
            // }
            , {
                prettyLabel: "Start Date",
                attr: "project_start",
                format: ''
            }
        ],
        pagination: -1,
        globalSearch: true,
        removeRow: false
    }
}

dataprep.angularTableAwards = function(ntwrk) {
    ntwrk.filteredData.records.data.forEach(function(d, i) {
        if (d.funding) {
            d.funding = '$' + d.funding.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");

        }
        if (d.project_start) {
            var dateSplit = d.project_start.split("/");
            d.project_start = dateSplit[dateSplit.length - 1]
        }
        d.org_name = titleCase(d.org_name)
    })
}
