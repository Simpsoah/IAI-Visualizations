// TODO: SUCH a good tut: http://www.ng-newsletter.com/posts/directives.html 
var app = angular.module('app', [])
var visualizations = {};
var globalScope;
var visualizationsBound = 0;
var i = 0;


app.directive('ngDashVis', function($http) {
	return {
		restrict: 'A',
		require: '',
		transclude: true,
		scope: {
			ngVis: '@',
		},
		template: '<div class="dashVis"><div ng-transclude></div></div>',
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.mapDatasource = {
				"twitterNetwork": 'data/IAI-twitter-MayJune-interactionNet.cishellgraph.json'
				// "twitterNetwork": 'data/CTSA-Twitter-AugSep.graphml.cishellgraph.json.cishellgraph.json.cishellgraph.json'
			}
			$scope.getData = function(source, cb) {
				$http({
					method: 'GET',
					url: source
				}).then(function(res) {
					cb(res.data);
				})
			}
			globalScope = $scope;
			$scope.isFirstRun = true;
		}],
		link: {
			pre: function(scope, iElement, iAttrs, ctrl) {
				visualizations[iAttrs.ngIdentifier] = new VisualizationClass();
				visualizations[iAttrs.ngIdentifier].Vis = visualizationFunctions[iAttrs.ngVisType];		
				i += 1
			},
			post: function(scope, iElement, iAttrs, ctrl) {
				scope.getData(scope.mapDatasource[iAttrs.ngDataField], function(data) {
					visualizations[iAttrs.ngIdentifier].SetAngularArgs(iElement, data, iAttrs);
					visualizations[iAttrs.ngIdentifier].RunVis();	
					if (typeof iAttrs.ngComponentFor != "undefined") {
						if (visualizations[iAttrs.ngComponentFor].Children.indexOf(iAttrs.ngComponentFor) == -1) {
							visualizations[iAttrs.ngComponentFor].Children.push(iAttrs.ngIdentifier);
						}
					}
				})
			}
		}
	}
});

app.directive('ngVis', function() {
	return {
		controller: function($scope) {}
	}
});

angular.element(document).ready(function() {
	angular.bootstrap(document, ['app']);
})
