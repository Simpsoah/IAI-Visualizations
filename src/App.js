//http://www.ng-newsletter.com/posts/directives.html 
var app = angular.module('app', [])

var globalScope;
var verbose = false;
//TODO: Change color attribute
//TODO: No size coding if the scale has hard interval (etc: RT2TA || -1 to 1)
//TODO: Talk to Michael/Cath about node click information display
//
//TODO: Remove attributes stuff
//TODO: Temporarily remove highlight
//
//TODO: KNOWN ISSUES
//	- Toggling physics off, then dragging an element turns physics back on. This doesn't reregister properly though. 
//		So to turn physics off again, the button in the debug bar needs to be clicked twice
//	- Highlighting the nodes doesn't work. I need to think of a better way to access nodes instead of node groups
//	- The tolerance slider doesn't reset so the values slip out of range if you change the node size attribute
//TODO: Scroll bar
app.service('Data', ['$rootScope', '$http', function($rootScope, $http) {
	var service = {
		mapDatasource: {
			twitterNetwork: {
				url: 'data/IAI-twitter-MayJune-interactionNet.cishellgraph.json'
			},
			bigtwitterNetwork: {
				url: 'data/CTSA-Twitter-AugSep.graphml.cishellgraph.json.cishellgraph.json.cishellgraph.json'
			}
		},
		dataQueue: [],
		//TODO: Test this
		addToDataQueue: function(s) {
			if (this.dataQueue.indexOf(s) < 0) {
				this.dataQueue.push(s);
			}
		},
		retrieveData: function(datasource, cb) {
			if (datasource) {
				if (verbose) console.log("Getting " + datasource + " data...");
				$http({
					method: 'GET',
					url: this.mapDatasource[datasource].url
				}).then(function(res) {
					if (verbose) console.log("Got " + datasource + " data!");
					cb(res);
				});
			}
		},
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
		getAllData: function() {
			var that = this;
			this.dataQueue.forEach(function(d, i) {
				that.getData(d);
			})
		}
	}
	Object.keys(service.mapDatasource).map(function(d, i) { 
		service.mapDatasource[d].data = {}; 
		service.mapDatasource[d].dataPrepared = false;
	});
	return service;
}])


app.directive('ngCnsVisual', ['$rootScope', 'Data', function($rootScope, Data) {
	return {
		restrict: "A",
		controller: ['$scope', '$http', function($scope, $http) {
		}],
		link: {
			pre:  function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Visual pre link for: " + attrs.ngIdentifier);
				Data.addToDataQueue(attrs.ngDataField);
				visualizations[attrs.ngIdentifier] = new VisualizationClass();
				visualizations[attrs.ngIdentifier].Vis = visualizationFunctions[attrs.ngVisType];
				visualizations[attrs.ngIdentifier].SetAngularArgs(elem, {}, attrs);
				if(attrs.ngComponentFor) {
					scope.$watch(attrs.ngComponentFor + '.created', function() {
						visualizations[attrs.ngComponentFor].Children.push(attrs.ngIdentifier);
					})
				} else {
					$rootScope.$broadcast(attrs.ngIdentifier + '.created')
				}
			},
			post: function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Visual post link for: " + attrs.ngIdentifier);
				// TODO: Fix this. Check if the data field exists, not if it's a parent
				if (!attrs.ngComponentFor) {
					scope.$on(attrs.ngDataField + '.update', function(oldVal, newVal) {
						if (verbose) console.log("Updating: " + attrs.ngIdentifier);
						//TODO: Method to update args a little better 
						if (newVal !== oldVal) {
							//TODO: This may need to be updated if we want to periodically push new data WITHOUT redrawing the whole visualization
							visualizations[attrs.ngIdentifier].SetAngularData(newVal);
							visualizations[attrs.ngIdentifier].RunVis();
							if (verbose) console.log("Updated: " + attrs.ngIdentifier);
						}
					})
				}
			}
		}
	}
}])

app.directive('ngCnsVisRunner', ['$rootScope', '$timeout', 'Data', function($rootScope, $timeout, Data) {
	return {
		restrict: "A",
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.attrs = {};
			$scope.postHelper = function() {
				$timeout(function() {
					Data.getAllData()
				}, 1);
			}
		}],
		link: {
			pre:  function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Runner pre link");
			},
			post: function(scope, elem, attrs, ctrl) {
				if (verbose) console.log("Runner post link");
				scope.postHelper();
			}
		}
	}
}]);




// app.directive('ngVisVisual', function($http) {
// 	return {
// 		restrict: 'A',
// 		require: '',
// 		transclude: false,
// 		scope: {
// 			ngVis: '@',
// 		},
// 		controller: ['$scope', '$http', function($scope, $http) {
// 			$scope.mapDatasource = {
// 				"twitterNetwork": 'data/IAI-twitter-MayJune-interactionNet.cishellgraph.json',
// 				"bigtwitterNetwork": 'data/CTSA-Twitter-AugSep.graphml.cishellgraph.json.cishellgraph.json.cishellgraph.json'
// 			}
// 			$scope.getData = function(source, cb) {
// 				if (verbose) console.log("Getting data...");
// 				$http({
// 					method: 'GET',
// 					url: source
// 				}).then(function(res) {
// 					if (verbose) console.log("Got data!");
// 					cb(res.data);
// 				})
// 			}
// 		}],
// 		link: {
// 			pre: function(scope, iElement, iAttrs, ctrl) {	
// 				if (verbose) console.log("Visual pre link")
// 			},
// 			post: function(scope, iElement, iAttrs, ctrl, $timeout) {
// 				if (verbose) console.log("Visual post link")
// 				scope.$watch('parentReady', function() {
// 					console.log("Ding, parent ready")
// 					scope.getData(scope.mapDatasource[iAttrs.ngDataField], function(data) {
// 						Object.keys(visualizations).forEach(function(v) {
// 							visualizations[v].AngularArgs.data = data;
// 							visualizations[v].RunVis();
// 						})
// 					})
// 				})
// 			}
// 		}
// 	}
// });
// app.directive('ngVisParent', function($http) {
// 	return {
// 		restrict: 'A',
// 		require: '',
// 		transclude: false,
// 		scope: {
// 			ngVis: '@',
// 		},
// 		controller: ['$scope', '$http', function($scope, $http, $timeout){
// 		}],
// 		link: {
// 			pre: function(scope, iElement, iAttrs, ctrl) {
// 				if (verbose) console.log("Parent pre link")
// 				visualizations[iAttrs.ngIdentifier] = new VisualizationClass();
// 				visualizations[iAttrs.ngIdentifier].Vis = visualizationFunctions[iAttrs.ngVisType];
// 				visualizations[iAttrs.ngIdentifier].SetAngularArgs(iElement, {}, iAttrs);
// 				visualizations[iAttrs.ngIdentifier].family = "parent";
// 				scope.$broadcast('parentDone', true)
// 			},
// 			post: function(scope, iElement, iAttrs, ctrl) {
// 				if (verbose) console.log("Parent post link")
// 				scope.$emit('parentReady', true)
// 			}
// 		}
// 	}
// });

// app.directive('ngVisChild', function($http) {
// 	var parentVisChild;
// 	var childVis;
// 	return {
// 		restrict: 'A',
// 		require: '',
// 		transclude: false,
// 		scope: {
// 			ngVis: '@',
// 		},
// 		controller: ['$scope', '$http', function($scope, $http) {

// 		}],
// 		link: {
// 			pre: function(scope, iElement, iAttrs, ctrl) {
// 				if (verbose) console.log("Child pre link")
// 			},
// 			post: function(scope, iElement, iAttrs, ctrl) {
// 				if (verbose) console.log("Child post link")
// 				scope.$watch('parentDone', function() {
// 					console.log("Ding, parent done")
// 					parentVisChild = visualizations[iAttrs.ngComponentFor].Children[iAttrs.ngIdentifier]
// 					childVis = new VisualizationClass();
// 					childVis.Vis = visualizationFunctions[iAttrs.ngVisType];
// 					childVis.SetAngularArgs(iElement, {}, iAttrs);
// 					childVis.family = "child";
// 					visualizations[iAttrs.ngComponentFor].Children[iAttrs.ngIdentifier] = childVis					
// 				})
// 			}
// 		}
// 	}
// });




angular.element(document).ready(function() {
	angular.bootstrap(document, ['app']);
})
