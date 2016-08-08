/**
 * @namespace  app
 * @type {Object}
 * @description Angular app. Binds events to Angular DOM elements. 
 */
var app = angular.module('app', ['smart-table']);

app.service('Data', ['$rootScope', '$http', function($rootScope, $http) {
    /**
     * @namespace  service
     * @memberOf  app
     * @description Angular service. Provides global data binding tools.
     * @property mapDatasource {@link globalDatasourceMap}
     * @property {Array} dataQueue Collection of unique URL strings. Used to prevent duplicate data loading from the same URL.
     * @property {Function} addToDataQueue {@link app.addToDataQueue}
     * @property {Function} retrieveData {@link app.retrieveData}
     * @property {Function} getData {@link app.getData}
     * @property {Function} getAllData {@link app.getAllData}
     */
    var service = {
            getParams: function() {
                var search = location.search.substring(1);
                if (search.length > 0) {
                    return JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
                }
                return {};
            },
            parameterizeTemplate: function(url, overrideParams) {
                var params = this.getParams();
                var overrideParams = overrideParams || {};
                var defaults = globalDatasourceMap.master.default;

                //Apply updated parameters from 'overrideParams' in place of existing parameters.
                Object.keys(overrideParams).forEach(function(d, i) {
                    params[d] = overrideParams[d];
                })

                //Find all undefined parameters by pairing the defaults object from the datasourceMap to the parameter list.
                var fallbacks = $.grep(Object.keys(defaults || {}), function(el) {
                    return $.inArray(el, Object.keys(params || {})) == -1
                });

                //Apply all defaults to the parameters list.
                fallbacks.forEach(function(d, i) {
                    params[d] = defaults[d];
                })

                var finalURL = url

                if (params.q != "null") $("#qparam").html("'" + params.q + "'")

                //Replace the %param placeholder with the new values.
                Object.keys(params).forEach(function(d, i) {
                    finalURL = finalURL.replace("%" + d, params[d])
                })
                return finalURL
            },

            mapDatasource: globalDatasourceMap,
            dataQueue: [],
            /**
             * @memberOf app
             * @function addToDataQueue
             * @description Adds URL string to {@link dataQueue} if it doesn't already exist.
             * @param {String} s URL string.
             */
            addToDataQueue: function(s) {
                if (this.dataQueue.indexOf(s) < 0) {
                    this.dataQueue.push(s);
                }
            },
            /**
             * @memberOf app
             * @function retrieveData
             * @description Performs an $http GET request on the specified URL, then calls the callback function upon completion.
             * @param {String} datasource URL string.
             * @param {String} cb Callback function after the $http request has completed.
             */
            retrieveData: function(datasource, cb) {
                var that = this;
                if (datasource) {
                    if (verbose) console.log("Getting " + datasource + " data...");


                    var params = that.getParams();
                    if (datasource == "master") {
                        //Apply all defaults to the parameters list.
                        masterprocessor();

                        function masterprocessor() {
                            var context = globalDatasourceMap.master;
                            var urlList = {};
                            ["pubs", "trials", "awards", "awardsFromPubs", "pubsFromAwards"].forEach(function(d, i) {
                                urlList[d + "URL"] = context.url + context[d]
                            })
                            oneA(urlList, {})
                        }

                        //Naming follows this structure (for now): http://wiki.cns.iu.edu/display/DEV/Expertise+Query+Structure
                        function oneA(urls, data) {
                            $http({
                                method: 'GET',
                                url: that.parameterizeTemplate(urls.pubsURL)
                            }).then(function(res) {
                                data.pubs = res.data.response;
                                oneB(urls, data)
                            });
                        }

                        function oneB(urls, data) {
                            $http({
                                method: 'GET',
                                url: that.parameterizeTemplate(urls.awardsURL)
                            }).then(function(res) {
                                data.awards = res.data.response;
                                oneC(urls, data)
                            });
                        }

                        function oneC(urls, data) {
                            $http({
                                method: 'GET',
                                url: that.parameterizeTemplate(urls.trialsURL)
                            }).then(function(res) {
                                console.log(res);
                                data.trials = res.data.response;
                                twoA(urls, data)
                            });
                        }

                        function twoA(urls, data) {
                            var pubAwards = [];
                            data.pubs.docs.forEach(function(d, i) {
                                pubAwards = pubAwards.concat(d.grantid)
                            });
                            var awardString = pubAwards.join(",");
                            console.log(that.parameterizeTemplate(urls.awardsFromPubsURL, { q: awardString }));
                            $http({
                                method: 'GET',
                                //TODO: Modify this to take the new parameters
                                url: that.parameterizeTemplate(urls.awardsFromPubsURL, { q: awardString })
                            }).then(function(res) {
                                data.pubAwards = res.data.response;
                                twoB(urls, data)
                            });
                        }

                        function twoB(urls, data) {
                            var awardPubs = [];
                            data.pubAwards.forEach(function(d, i) {
                                awardPubs = awardPubs.concat(d.grantid)
                            });
                            var pubString = awardPubs.join(",");
                            $http({
                                method: 'GET',
                                //TODO: Modify this to take the new parameters
                                url: urls.pubsFixedURL
                            }).then(function(res) {
                                data.awardPubs = res.response;
                                threeA(urls, data)
                            });
                        }

                        function threeA(urls, data) {
                            data.unprocessedPubs = data.pubs.docs.concat(data.awardPubs.docs);
                            data.unprocessedAwards = data.awards.docs.concat(data.pubAwards.docs);
                            data.unprocessedTrials = data.trials;
                            data.finalPubs = createPublications(data.unprocessedPubs.docs)
                            data.finalAwards = createAwards(data.unprocessedAwards.docs)
                            data.finalTrials = createTrials(data.unprocessedTrials.docs)
                        }
                    }

                    //TODO: Test. Tried this on an API, denied access due to the wrong headers. But both ends managed to connect. 
                    var url = "";
                    var ds = this.mapDatasource[datasource]
                    if (!ds) {
                        that.mapDatasource[datasource]
                        that.mapDatasource[datasource].url = url;
                        url = datasource;
                    } else {
                        if (ds.dummy) {
                            url = ds.url.replace("%d", params.set);
                        } else {
                            url = ds.url;
                        }
                    }
                    $http({
                        method: 'GET',
                        url: url
                    }).then(function(res) {
                        if (verbose) console.log("Got " + datasource + " data!");
                        if (ds.dummy) {
                            var fixedData = {};
                            if (datasource == "trials720") {
                                var trialsRes = { data: createTrials(res.data.response.docs) }
                                cb(trialsRes)
                            }
                            if (datasource == "pubmed720") {
                                var pubsRes = { data: createPublications(res.data.response.docs) }
                                cb(pubsRes)
                            }
                            if (datasource == "reporter720") {
                                cb(res)
                            }
                        } else {
                            cb(res);
                        }
                    });
                }
            },
            /**
             * @memberOf app
             * @function getData
             * @description Calls {@link app.retrieveData} with specified callback that broadcasts to all visualization listeners that the data has been retrieved.
             * @param {String} datasource URL string.
             * @returns {Object} Data of GET request.
             */
            getData: function(datasource) {
                var that = this;
                this.retrieveData(datasource, function(res) {
                    that.mapDatasource[datasource].data = res.data;
                    if (verbose) console.log("Broadcasting: " + datasource + " updated.");
                    $rootScope.$broadcast(datasource + '.update', res.data);
                    that.mapDatasource[datasource].dataPrepared = true;
                    return res.data;
                })
            },
            /**
             * @memberOf app
             * @function getAllData
             * @description Calls {@link app.getData} on all queued sources.
             */
            getAllData: function() {
                var that = this;
                this.dataQueue.forEach(function(d, i) {
                    that.getData(d);
                })
            }
        }
        //Maps attributes before processing. 
    Object.keys(service.mapDatasource).map(function(d, i) {
        service.mapDatasource[d].data = {};
        service.mapDatasource[d].dataPrepared = false;
    });
    return service;
}])



app.directive('ngCnsVisual', ['$rootScope', 'Data', function($rootScope, Data) {
    /**
     * @namespace  ngCnsVisual
     * @memberOf  app
     * @description Angular directive. Binds visualization functions and data to Angular DOM elements.
     * @property {Function} link {@link app.link}
     */
    return {
        restrict: "A",
        controller: ['$scope', '$http', function($scope, $http) {}],
        /**
         * @memberOf app
         * @object link
         * @description Functions ran before and after DOM binding. 
         * @property {Object} pre {@link app.pre}
         * @property {Object} post {@link app.post}
         */
        link: {
            /**
             * @memberOf app
             * @function pre
             * @description Creates new visualization class, stores visualization class and instance, and prepares instance. Adds Angular listeners and broadcasters. If the visualization has the (ng-component-for) attribute, it will listen for the parent to be ready. If the visualization is a parent, it will broadcast it's completion to all component listeners.
             * @param {Object} scope Angular scope.
             * @param {Object} elem Angular DOM element.
             * @param {Object} attrs Angular attributes from DOM.
             * @param {Object} ctrl Angular controller.
             */
            pre: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Visual pre link for: " + attrs.ngIdentifier);
                Data.addToDataQueue(attrs.ngDataField);
                visualizations[attrs.ngIdentifier] = new VisualizationClass();
                visualizations[attrs.ngIdentifier].Vis = visualizationFunctions[attrs.ngVisType];

                visualizations[attrs.ngIdentifier].SetAngularElement(elem);
                visualizations[attrs.ngIdentifier].SetAngularOpts(attrs);
                //TODO: Remove
                visualizations[attrs.ngIdentifier].AngularArgs.ctrl = ctrl;
                if (attrs.ngComponentFor) {
                    scope.$watch(attrs.ngComponentFor + '.created', function() {
                        visualizations[attrs.ngComponentFor].Children.push(attrs.ngIdentifier);
                    })
                } else {
                    $rootScope.$broadcast(attrs.ngIdentifier + '.created')
                }
            },
            /**
             * @memberOf app
             * @function post
             * @description Adds listeners to elements with the (ng-data-field) attribute. If the data changes, trigger an update to each visualization instance listener.
             * @param {Object} scope Angular scope.
             * @param {Object} elem Angular DOM element.
             * @param {Object} attrs Angular attributes from DOM.
             * @param {Object} ctrl Angular controller.
             */
            post: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Visual post link for: " + attrs.ngIdentifier);
                if (attrs.ngDataField) {
                    scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
                        if (verbose) console.log("Updating: " + attrs.ngIdentifier);
                        //TODO: Method to update args a little better 
                        if (newVal !== oldVal) {
                            //TODO: This may need to be updated if we want to periodically push new data WITHOUT redrawing the whole visualization
                            visualizations[attrs.ngIdentifier].SetAngularData(newVal);
                            visualizations[attrs.ngIdentifier].Update();
                        }
                    })
                }
            }
        }
    }
}])


app.directive('ngCnsVisRunner', ['$rootScope', '$timeout', 'Data', function($rootScope, $timeout, Data) {
    /**
     * @namespace  ngCnsVisRunner
     * @memberOf  app
     * @description Angular directive. Surrounds all {@link app.ngCnsVisual} to allow for synchronous operations. Gets data after all visualizations have been bound. 
     */
    return {
        restrict: "A",
        controller: ['$scope', '$http', function($scope, $http) {
            $scope.attrs = {};
            $scope.postHelper = function() {
                $timeout(function() {
                    Data.getAllData();
                }, 1);
            }
        }],
        link: {
            pre: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Runner pre link");

                if (attrs.ngDataField) {
                    Data.addToDataQueue(attrs.ngDataField);
                }
            },
            post: function(scope, elem, attrs, ctrl) {
                if (verbose) console.log("Runner post link");
                scope.postHelper();
            }
        }
    }
}]);





app.controller("basicCtrl", ["$scope", function($scope) {
    $scope.rowCollection = [];
    $scope.setrowCollection = function(d) {
        $scope.rowCollection = d;
        $scope.displayedCollection = [].concat($scope.rowCollection);
    }
    $scope.setitemsByPage = function(d) {
        $scope.itemsByPage = d;
    }
    $scope.itemsByPage = 10;
    $scope.removeItem = function removeItem(row) {
        var index = $scope.rowCollection.indexOf(row);
        if (index !== -1) {
            $scope.rowCollection.splice(index, 1);
        }
    }

    $scope.filter = function(val) {
        val = val || ''
        $scope.displayedCollection = [];
        $scope.rowCollection.forEach(function(d, i) {
            var include = false;
            Object.keys(d).forEach(function(d1, i1) {
                try {
                    if (d[d1].toString().toLowerCase().indexOf(val.toString().toLowerCase()) >= 0) {
                        include = true;
                    }
                } catch (e) {

                }
            })
            if (include) {
                $scope.displayedCollection.push(d)
            }
        })
    }

    $scope.prioritize = function(val, attr) {
        val = val || ''
        $scope.displayedCollection = [];
        var others = []
        $scope.rowCollection.forEach(function(d, i) {
            if (d[attr].toString().toLowerCase() == val.toString().toLowerCase()) {
                $scope.displayedCollection.push(d);
            } else {
                others.push(d);
            }
        })
        $scope.displayedCollection = $scope.displayedCollection.concat(others);
    }
}])
app.filter('myFilter', [function() {
    return function(array, expression) {
        console.log("eh")
            //an example
        return array.filter(function(val, index) {
            return val > val;
        });
    }
}]);

angular.element(document).ready(function() {
    angular.bootstrap(document, ['app']);
})





pubsTemplate = {
    "topology": "table",
    "schema": [{
        "name": "records",
        "type": "records"
    }],

    "records": {
        "schema": [{
            "name": "title",
            "type": "string"
        }, {
            "name": "journal_name",
            "type": "string"
        }, {
            "name": "pmid",
            "type": "string"
        }, {
            "name": "pub_year",
            "type": "string"
        }, {
            "name": "id",
            "type": "string"
        }, {
            "name": "ctsahub",
            "type": "string"
        }, {
            "name": "author",
            "type": "string"
        }],
        "data": []
    }
}

awardsTemplate = {
    "records": {
        "schema": [{
            "name": "title",
            "type": "string"
        }, {
            "name": "agency",
            "type": "string"
        }, {
            "name": "facility",
            "type": "string"
        }, {
            "name": "end_date",
            "type": "string"
        }, {
            "name": "amount",
            "type": "numeric"
        }, {
            "name": "organization",
            "type": "string"
        }, {
            "name": "grant_id",
            "type": "string"
        }, {
            "name": "start_date",
            "type": "string"
        }, {
            "name": "total_cost",
            "type": "numeric"
        }],
        "data": []
    },
    "topology": "table"
}


trialsTemplate = {
    "topology": "table",
    "schema": [{
        "name": "records",
        "type": "records"
    }],
    "records": {
        "schema": [{
            "name": "title",
            "type": "string"
        }, {
            "name": "end_date",
            "type": "string"
        }, {
            "name": "facility_city",
            "type": "string"
        }, {
            "name": "facility",
            "type": "string"
        }, {
            "name": "agency",
            "type": "string"
        }, {
            "name": "nct_id",
            "type": "string"
        }, {
            "name": "acronym",
            "type": "string"
        }, {
            "name": "facility_state",
            "type": "string"
        }, {
            "name": "status",
            "type": "string"
        }, {
            "name": "url",
            "type": "string"
        }, {
            "name": "facility_country",
            "type": "string"
        }, {
            "name": "facility_zip",
            "type": "string"
        }, {
            "name": "completion_date",
            "type": "string"
        }, {
            "name": "start_date",
            "type": "string"
        }],
        "data": []
    },
    "topology": "table"
}

function createAwards(data) {
    var template = {};
    awardsTemplate.schema.forEach(function(d, i) {
        template[d.name] = null
    })

    var newData = [];
    data.forEach(function(d, i) {
        var record = new Object(template);
        record.title = d.project_title;
        // record.agency = d.org_name;
        record.end_date = d.project_end;
        record.amount = d.total_cost[0];
        record.organization = d.org_name;
        record.grant_id = d.core_project_num;
        record.start_date = d.project_start;
        record.url = d.url_s[0];
        newData.push(record)
    })
    console.log(newData);
    var outData = awardsTemplate;
    outData.records.data = newData
    return outData;

}

function createPublications(data) {
    var template = {};
    pubsTemplate.schema.forEach(function(d, i) {
        template[d.name] = null
    })

    var newData = [];
    data.forEach(function(d, i) {
        var record = new Object();
        record.title = d.title[0];
        record.journal_name = d.journal[0];
        record.pmid = d.id;
        record.pub_year = d.date[0];
        record.ctsahub = d.ctsahub[0];
        record.author = d.author[0];
        newData.push(record)
    })
    var outData = pubsTemplate;
    outData.records.data = newData
    return outData;
}

function createTrials(data) {
    var template = {};
    trialsTemplate.schema.forEach(function(d, i) {
        template[d.name] = null
    })

    var newData = [];
    data.forEach(function(d, i) {
        var record = new Object();
        record.title = d.title_t[0];
        record.end_date = d.end_date_s;
        // record.facility_city
        if (d.agency_ss) record.agency = d.agency_ss[0]
        if (d.facility_ss) record.facility = d.facility_ss[0]
            // record.nct_id
            // record.acronym
            // record.facility_state
        record.status = d.overall_status_s;
        record.url = d.url_s;
        // record.facility_country
        // record.facility_zip
        // record.completion_date
        record.start_date = d.start_date_s;
        newData.push(record)
    })
    var outData = trialsTemplate;
    outData.records.data = newData
    return outData;
}
