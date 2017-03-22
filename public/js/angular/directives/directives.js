var app = angular.module('customDirective', []);

app.directive('a', function() {
	return {
		restrict: 'E',
		link: function(scope, elem, attrs) {
			if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
				elem.on('click', function(e) {
					e.preventDefault();
				});
			}
		}
	};
});


app.directive('stopPropgation', [

	function() {
		return {
			link: function(scope, element, attr) {
				element.click(function(event) {
					event.stopPropagation();
				});

				scope.$on('$destroy', function() {
					element.off('click');
				});
			}
		}
	}
]);
app.directive('openBoard', ['$modal', '$rootScope', 'ModalService',
	function($modal, $rootScope, ModalService) {
		return {
			restrict: 'A',

			link: function(scope, element, attrs) {
				scope.show = function(boardId) {

					ModalService.showModal({
						templateUrl: 'openModal.html',
						controller: 'ClosedBoardCtrl'
					}).then(function(modal) {
						$rootScope.$broadcast('boardToRename', {
							'boardId': boardId
						});

						modal.element.modal();
					});

				};
			}
		}
	}
])

app.directive('closeBoard', ['$modal', '$rootScope', 'ModalService',
	function($modal, $rootScope, ModalService) {
		return {
			restrict: 'A',

			link: function(scope, element, attrs) {
				scope.closeBoard = function(boardId) {
					ModalService.showModal({
						templateUrl: 'closeModal.html',
						controller: 'BoardCtrl'
					}).then(function(modal) {
						modal.element.modal();
					});

				};
			}
		}
	}
]);

app.directive('deleteBoard', ['$modal', '$rootScope', 'ModalService',
	function($modal, $rootScope, ModalService) {
		return {
			restrict: 'A',

			link: function(scope, element, attrs) {
				scope.deleteBoard = function(boardId) {
					ModalService.showModal({
						templateUrl: 'deleteModal.html',
						controller: 'BoardCtrl'
					}).then(function(modal) {
						modal.element.modal();
					});

				};
			}
		}
	}
]);

app.directive('deleteList', ['$modal', '$rootScope', 'ModalService',
	function($modal, $rootScope, ModalService) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.deleteList = function(listId,index) {
					ModalService.showModal({
						templateUrl: 'deleteListModal.html',
						controller: 'BoardCtrl'
					}).then(function(modal) {
						$rootScope.$broadcast('listToBeDeleted', {
						listId: listId,
						index:index
					});

						modal.element.modal();
					});

				};
			}
		}
	}
]);

app.directive('deleteCard', ['$modal', '$rootScope', 'ModalService',
	function($modal, $rootScope, ModalService) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				scope.deleteCard = function(listId,cardId,index,parentIndex) {
					ModalService.showModal({
						templateUrl: 'deleteCardModal.html',
						controller: 'BoardCtrl'
					}).then(function(modal) {
						$rootScope.$broadcast('cardToBeDeleted', {
						cardId: cardId,
						listId:listId,
						index:index,
						parentIndex:parentIndex
					});

						modal.element.modal();
					});

				};
			}
		}
	}
]);