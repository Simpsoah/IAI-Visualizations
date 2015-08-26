// TODO: SUCH a good tut: http://www.ng-newsletter.com/posts/directives.html 
var i = 0;
var app = angular.module('app', [])
var visualizations = {};

app.directive('ngDashVis', function($http) {
	return {
		restrict: 'A',
		require: '',
		transclude: true,
		scope: {
			ngVis: '@',
		},
		template: '<div class="dashVis"><div ng-transclude></div><div class="graph"></div></div>',
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.getData = function(dataField) {
				$http.get("data/IAI-twitter-MayJune-interactionNet.cishellgraph.json")
					.then(function(res){
						var currData = res.data;
						if (dataField == "") {
								$scope.datum = currData;
						} else {
							try {
								dataField.split(".").forEach(function(sub) {
									currData = currData[sub];
								});					
							} catch (e) {
								$scope.datum = currData[dataField];	
							}	
						}
					});
			}
		}],
		link: function(scope, iElement, iAttrs, ctrl) {
			scope.getData(iAttrs.ngDataField);
			scope.$watch('datum', function(newData) {
				// TODO: Find out why this is being called three times (one null, two with the full set). Check the amount of nodes as well to make sure we aren't Dublin up.
				if (newData) {
					if (typeof iAttrs.ngComponentFor == "undefined") {
						visualizations[iAttrs.ngIdentifier] = {
							"vis": visualizationFunctions[iAttrs.ngVisType](iElement, newData, iAttrs),
							"children": {}
						};	
					} else {
						if (typeof visualizations[iAttrs.ngComponentFor].children != "undefined") {
							visualizations[iAttrs.ngComponentFor].children[iAttrs.ngIdentifier] = {
								"visFunc": visualizationFunctions[iAttrs.ngVisType],
								"iElement": iElement,
								"data": newData,
								"iAttrs": iAttrs,

							}
						}
							
					}
				}
			},true);
		}
	}
});

app.directive('ngVis', function() {
	return {
		controller: function($scope) {}
	}
});

angular.bootstrap(document, ['app']);
