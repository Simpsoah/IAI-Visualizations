// TODO: SUCH a good tut: http://www.ng-newsletter.com/posts/directives.html 
var app = angular.module('app', [])
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
				var currData = masterData;
				try {
					dataField.split(".").forEach(function(sub) {
						currData = currData[sub];
					});					
				} catch (e) {
					$scope.datum = currData[dataField];
				}
				$scope.datum = currData;
			}
		}],
		link: function(scope, iElement, iAttrs, ctrl) {
			scope.getData(iAttrs.ngDataField);
			scope.$watch('datum', function(newData) {
				if (newData) {
					//TODO: This should be fixed
					setTimeout(function() {
						visualizationFunctions[iAttrs.ngVisType](iElement, newData, iAttrs);
					}, 250);
				}
			});
		}
	}
});

app.directive('ngVis', function() {
	return {
		controller: function($scope) {}
	}
});

angular.bootstrap(document, ['app']);
