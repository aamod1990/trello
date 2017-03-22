var app = angular.module('boardService', []);

app.factory('BoardFactory', ['$http', '$q',
	function($http, $q) {
		return {
			boards: [],
			closedBoards: [],
			createNewBoard: function(boardInfo) {
				var deffered = $q.defer();
				$http.post('/board', {
					boardName: boardInfo.name
				}).success((function(data) {
					deffered.resolve(data);

				}).bind(this)).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			getAllBoards: function() {
				var deffered = $q.defer();
				$http.get('/board').success((function(data) {
					this.boards = data;
					deffered.resolve(this.boards);
				}).bind(this)).error(function(err) {
					deffered.reject(err);
				})
				return deffered.promise;
			},
			getBoardDetail: function(boardId) {
				var deffered = $q.defer();
				$http.get('/board/detail/' + boardId).success((function(data) {
					deffered.resolve(data);
				}).bind(this)).error(function(err) {
					deffered.reject(err);
				})
				return deffered.promise;
			},
			renameBoard: function(newValue) {
				var deffered = $q.defer();
				$http.put('/board', {
					newValue: newValue
				}).success((function(data) {
					deffered.resolve(data);
				}).bind(this)).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			closeBoard: function(boardId) {
				var deffered = $q.defer();
				$http.post('/board/close', {
					boardId: boardId
				}).success((function(data) {
					deffered.resolve(data);
				}).bind(this)).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			reOpenBoard: function(boardId) {
				var deffered = $q.defer();
				$http.post('/board/reopen', {
					boardId: boardId
				}).success((function(data) {
					deffered.resolve(data);

				}).bind(this)).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			getAllcloseBoards: function() {
				var deffered = $q.defer();
				$http.get('/all/closed/boards').success((function(data) {
					this.closedBoards = data.closedBoards;
					deffered.resolve(data);
				}).bind(this)).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			updateClosedBoards: function(boardId) {
				this.closedBoards.some((function(board, index) {
					if (board._id == boardId) {
						this.closedBoards.splice(index, 1);
						return true;
					}
					return false;
				}).bind(this));
			},
			getUpdatedClosedBoards: function() {
				return this.closedBoards;
			},
			getSearchResult: function(query, urlpart) {
				var deffered = $q.defer();
				$http.get('/search/query/'+query+'/part/'+urlpart).success(function(data) {
					deffered.resolve(data);
				}).error(function(err) {
					deffered.reject(err);
				});
				return deffered.promise;
			},
			shareBoardToUser:function(shareDetail){
				var deffered=$q.defer();
				$http.post('/board/share',shareDetail).success(function(data){
					deffered.resolve(data);
				}).error(function(err){
					deffered.reject(err);
				});
				return deffered.promise;
			},
			deleteBoard:function(boardId){
				var deffered=$q.defer();
				$http.delete('/board',{boardId:boardId}).success(function(data){
					deffered.resolve(data);
				}).error(function(err){
					deffered.reject(err);
				});
				return deffered.promise;
			}
		}
	}
]);