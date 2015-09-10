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
			$scope.getData = function() {
				$http({
					method:'GET',
					url: 'data/IAI-twitter-MayJune-interactionNet.cishellgraph.json'
				}).then(function(res) {
					$scope.datum = res.data;
				})
			}
		}],
		link: function(scope, iElement, iAttrs, ctrl) {
			scope.getData(iAttrs.ngDataField);
			scope.$watch('datum', function(newData) {
				if (JSON.stringify(newData) != JSON.stringify(scope.data)) {
					var useData = newData;
					visualizations[iAttrs.ngIdentifier] = visualizationFunctions[iAttrs.ngVisType](iElement, newData, iAttrs);
					if (typeof iAttrs.ngComponentFor == "undefined") {
						visualizations[iAttrs.ngIdentifier].RunVis(useData);
					}
					scope.data = newData;
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
