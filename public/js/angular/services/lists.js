var app = angular.module('listService', []);

app.factory('ListFactory', ['$http', '$q',
	function($http, $q) {
		return {
			lists: [],
			cards: [],
			createList: function(listInfo) {
				var deffered = $q.defer();
				$http.post('/list', {
					data: listInfo
				}).success((function(data) {
					deffered.resolve(data);

				}).bind(this)).error(function(err) {
					deffered.reject(err);
				})
				return deffered.promise;
			},
			getAllList: function(boardId) {
				var deffered = $q.defer();
				$http.get('/list/' + boardId).success((function(data) {
					this.lists = data;
					deffered.resolve(this.lists);
				}).bind(this)).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			createCard: function(cardInfo) {
				var deffered = $q.defer();
				$http.post('/list/card', {
					cardInfo: cardInfo
				}).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			getAllCards: function() {
				var deffered = $q.defer();
				$http.get('/list/card').success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			updateList: function(listInfo) {
				var deffered = $q.defer();
				$http.put('/list', {
					listInfo: listInfo
				}).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			deleteList: function(listId) {
				var deffered = $q.defer();
				$http.delete('/list/listId/' + listId).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			updatedList: function(listId) {
				this.lists.lists.forEach((function(list, index) {
					if (list._id == listId) {
						this.lists.lists.splice(index, 1);
					}
				}).bind(this));
				return this.lists.lists;
			},
			updatedCard: function(cardId, parentIndex) {
				this.lists.lists[parentIndex].cards.forEach((function(card, index) {
					if (card._id == cardId) {
						this.lists.lists[parentIndex].cards.splice(index, 1);
					}
				}).bind(this));
				return this.lists.lists;
			},
			updateCard: function(cardInfo) {
				var deffered = $q.defer();
				$http.put('/list/card', {
					cardInfo: cardInfo
				}).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			deleteCard: function(cardId, listId) {
				var deffered = $q.defer();
				$http.delete('/list/listid/' + listId + '/card/cardid/' + cardId).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			cardStatus: function(cardInfo) {
				var deffered = $q.defer();
				$http.put('/list/card/status/', {
					cardInfo: cardInfo
				}).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			}
		};
	}
]);