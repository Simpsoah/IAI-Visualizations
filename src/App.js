//http://www.ng-newsletter.com/posts/directives.html 
var app = angular.module('app', [])
var visualizations = {};
var globalScope;
var showOrder = true;

app.directive('ngVisContainer', function($http) {
	return {
		restrict: 'A',
		require: '',
		transclude: false,
		scope: {
			ngVis: '@',
		},
		controller: ['$scope', '$http', function($scope, $http) {
			$scope.mapDatasource = {
				"twitterNetwork": 'data/IAI-twitter-MayJune-interactionNet.cishellgraph.json',
				"bigtwitterNetwork": 'data/CTSA-Twitter-AugSep.graphml.cishellgraph.json.cishellgraph.json.cishellgraph.json'
			}
			$scope.getData = function(source, cb) {
				if (showOrder) console.log("Getting data...");
				$http({
					method: 'GET',
					url: source
				}).then(function(res) {
					if (showOrder) console.log("Got data!");
					cb(res.data);
				})
			}
		}],
		link: {
			pre: function(scope, iElement, iAttrs, ctrl) {	
				if (showOrder) console.log("Container pre link")
			},
			post: function(scope, iElement, iAttrs, ctrl, $timeout) {
				if (showOrder) console.log("Container post link")
				scope.$watch('parentReady', function() {
					console.log("Ding, parent ready")
					scope.getData(scope.mapDatasource[iAttrs.ngDataField], function(data) {
						Object.keys(visualizations).forEach(function(v) {
							visualizations[v].AngularArgs.data = data;
							visualizations[v].RunVis();
						})
					})
				})
			}
		}
	}
});
app.directive('ngVisParent', function($http) {
	return {
		restrict: 'A',
		require: '',
		transclude: false,
		scope: {
			ngVis: '@',
		},
		controller: ['$scope', '$http', function($scope, $http, $timeout){
		}],
		link: {
			pre: function(scope, iElement, iAttrs, ctrl) {
				if (showOrder) console.log("Parent pre link")
				visualizations[iAttrs.ngIdentifier] = new VisualizationClass();
				visualizations[iAttrs.ngIdentifier].Vis = visualizationFunctions[iAttrs.ngVisType];
				visualizations[iAttrs.ngIdentifier].SetAngularArgs(iElement, {}, iAttrs);
				visualizations[iAttrs.ngIdentifier].family = "parent";
				scope.$broadcast('parentDone', true)
			},
			post: function(scope, iElement, iAttrs, ctrl) {
				if (showOrder) console.log("Parent post link")
				scope.$emit('parentReady', true)
			}
		}
	}
});

app.directive('ngVisChild', function($http) {
	var parentVisChild;
	var childVis;
	return {
		restrict: 'A',
		require: '',
		transclude: false,
		scope: {
			ngVis: '@',
		},
		controller: ['$scope', '$http', function($scope, $http) {

		}],
		link: {
			pre: function(scope, iElement, iAttrs, ctrl) {
				if (showOrder) console.log("Child pre link")
			},
			post: function(scope, iElement, iAttrs, ctrl) {
				if (showOrder) console.log("Child post link")
				scope.$watch('parentDone', function() {
					console.log("Ding, parent done")
					parentVisChild = visualizations[iAttrs.ngComponentFor].Children[iAttrs.ngIdentifier]
					childVis = new VisualizationClass();
					childVis.Vis = visualizationFunctions[iAttrs.ngVisType];
					childVis.SetAngularArgs(iElement, {}, iAttrs);
					childVis.family = "child";
					visualizations[iAttrs.ngComponentFor].Children[iAttrs.ngIdentifier] = childVis					
				})
			}
		}
	}
});

angular.element(document).ready(function() {
	angular.bootstrap(document, ['app']);
})
