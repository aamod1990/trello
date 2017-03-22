var app = angular.module('Home', ['ui.bootstrap', 'ngDraggable', 'ngTagsInput', 'angularModalService', 'listService', 'userService', 'customDirective', 'boardService', 'ngNotify']);

app.controller('HomeCtrl', ['$rootScope', '$scope', '$rootScope', '$routeParams', 'ngNotify', '$location', 'debounce', 'BoardFactory', '$window', 'userFactory',
	function($rootScope, $scope, $rootScope, $routeParams, ngNotify, $location, debounce, BoardFactory, $window, userFactory) {
		$rootScope.authorised = true;
		$rootScope.searchResultShow = true;
		$scope.logout = function() {
			userFactory.logoutUser($scope.form).then(function(data) {
				$rootScope.authorised = true;
				$window.location = '#/'
			}, function(err) {
				console.log(err);
			});
		}
		$scope.searchBoard = debounce(getSearchResults, 350, false);

		function getSearchResults(query) {
			var urlpart = $location.url().split('/')[1];
			var searchQuery = query.replace(/ +/g, " ");
			if (searchQuery) {
				BoardFactory.getSearchResult(searchQuery, urlpart).then(function(data) {
					$rootScope.searchResultShow = false;
					$rootScope.searchPalceHide = false;
					if (data.status) {
						$window.location = '#/login';
						return false;
					}
					if (data.length == 0) {
						$rootScope.searchResultShow = false;
						$rootScope.searchPalceHide = false;
						ngNotify.set('No results found.', 'default');
					} else {
						$rootScope.searchPalceHide = true;
						$scope.searchData = data;
					}

				}, function(err) {
					console.log(err);
					ngNotify.set('Something went wrong, please try again.', 'error');
				});
			} else {
				$rootScope.searchResultShow = true;
				$rootScope.searchPalceHide = true;
			}
		};
		$scope.goToBoardDetail = function(boardId) {
			$rootScope.searchResultShow = true;
			$location.path('/board/' + boardId);
		};
		$scope.goToDashboard = function() {
			$rootScope.searchResultShow = true;
			$window.location = '#/dashboard'
		}
	}
]);

app.controller('DashboardCtrl', ['$rootScope', '$scope', '$rootScope', '$window', 'ngNotify', '$location', 'userFactory', 'BoardFactory', 'boardData',
	function($rootScope, $scope, $rootScope, $window, ngNotify, $location, userFactory, BoardFactory, boardData) {
		$rootScope.authorised = false;
		$rootScope.showLoader = false;
		$scope.navbarURL = 'partials/navbar.html';
		$scope.newBoard = {
			templateUrl: 'createBoardTemplate.html'
		};

		$scope.createNewBoard = function() {
			BoardFactory.createNewBoard($scope.newBoard).then(function(data) {
				if (data.status == false) {
					ngNotify.set(data.message, 'error');
				} else {
					$scope.newBoard.name = '';
					ngNotify.set(data.message, 'success');
					$rootScope.$broadcast('newBoardCreated');
				}
			}, function(err) {
				console.log(err);
				ngNotify.set('Something went wrong, please try again.', 'error');
			});
		};

		if (boardData.status) {
			$window.location = '#/login';
		} else {
			$rootScope.showLoader = true;
			$scope.boards = boardData;
		}
		$rootScope.$on('newBoardCreated', function() {
			BoardFactory.getAllBoards().then(function(boards) {
				$scope.boards = boards;
			}, function(err) {
				ngNotify.set('Something went wrong, please try again.', 'error');
				console.log(err)
			});
		});

		$scope.goToBoard = function(boardId, shared) {
			$location.path('/board/' + boardId)
		}
	}

]);

app.controller('BoardCtrl', ['$scope', '$rootScope', '$timeout', '$window', 'ngNotify', '$route', 'debounce', 'BoardFactory', 'ListFactory', 'userFactory',
	function($scope, $rootScope, $timeout, $window, ngNotify, $route, debounce, BoardFactory, ListFactory, userFactory) {
		var boardId = $route.current.params.boardId;
		var listId, cardId, index, parentIndex;
		var errorMessage = 'Something went wrong, please try again.';

		$rootScope.authorised = false;
		$rootScope.showLoader = false;
		$scope.list = {};
		$scope.board = {};

		$scope.onDropComplete = function(parentIndex, index, listId, cardId, data, evt) {
			var index = $scope.list.lists.lists[parentIndex].cards.indexOf(data);
			var cardInfo = {
				name: data.name,
				listId: listId,
				status: data.status
			}
			if (index = -1) {
				$timeout(function() {
					ListFactory.createCard(cardInfo).then(function(data) {
					}, function(err) {
						ngNotify.set(errorMessage, 'error');
						console.log(err);
					});
				}, 500)

			}
		}

		$scope.onDragSuccess = function(parentIndex, index, listId, cardId, data, evt) {
			var index = $scope.list.lists.lists[parentIndex].cards.indexOf(data);

			if (index > -1) {
				$scope.list.lists.lists[parentIndex].cards.splice(index, 1);
				$timeout(function() {
					ListFactory.deleteCard(cardId, listId).then(function(data) {
								$rootScope.$broadcast('newListCreated');
						if (data.status == false) {
							ngNotify.set(data.message, 'error');
						}
					}, function(err) {
						ngNotify.set(errorMessage, 'error');
						console.log(err);
					});
				}, 500);

			}
		}

		$scope.navbarURL = 'partials/navbar.html';
		$scope.newList = {
			templateUrl: 'createListTemplate.html'
		};
		$scope.newCard = {
			templateUrl: 'createCardTemplate.html'
		};

		BoardFactory.getBoardDetail($route.current.params.boardId).then(function(data) {
			if (data.status) {
				$window.location = '#/login';
			} else {
				$rootScope.showLoader = true;
				$scope.boardDetail = data;
				ListFactory.getAllList(boardId).then(function(data) {
					$scope.list.lists = data;
				}, function(err) {
					ngNotify.set(errorMessage, 'error');
					console.log(err);
				});
			}
		}, function(err) {

		});

		$scope.createNewList = function() {
			var lisInfo = {
				list: $scope.newList,
				boardId: boardId
			}
			ListFactory.createList(lisInfo).then(function(data) {
				$scope.newList.name = '';
				ngNotify.set(data.message, 'success');
				$rootScope.$broadcast('newListCreated');
			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			})
		};

		$scope.createNewCard = function(item) {
			var cardInfo = {
				name: $scope.newCard.name,
				listId: item._id,
				status: false
			}
			ListFactory.createCard(cardInfo).then(function(data) {
				if (data.status == false) {
					ngNotify.set(data.message, 'error');
				} else {
					$rootScope.$broadcast('newListCreated');
					$scope.newCard.name = '';
					ngNotify.set(data.message, 'success');
				}

			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			});
		}

		$rootScope.$on('newListCreated', function() {
			ListFactory.getAllList(boardId).then(function(data) {
				$scope.list.lists = data;
			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			});
		});

		$scope.openCardBox = function(parentIndex, index) {
			$scope.list.lists.lists[parentIndex].cards[index].showCardEdit = true;
			$scope.list.newCardName = $scope.list.lists.lists[parentIndex].cards[index].name;
			//$scope.list.lists.lists[parentIndex].cards[index].showStatus = true;

		}

		$scope.updateCardName = function(parentIndex, index, listId, cardId) {

			if (($scope.list.newCardName) && $scope.list.newCardName != ($scope.list.lists.lists[parentIndex].cards[index].name)) {

				var cardInfo = {
					newName: $scope.list.newCardName,
					listId: listId,
					cardId: cardId
				}

				ListFactory.updateCard(cardInfo).then(function(data) {
					if (data.status == false) {
						ngNotify.set(data.message, 'error');
					} else if (data.status == 'unauthorized') {
						ngNotify.set(data.message, 'error');
					} else {
						$scope.list.lists.lists[parentIndex].cards[index].showCardEdit = false;
						$scope.list.lists.lists[parentIndex].cards[index].name = $scope.list.newCardName;
						ngNotify.set(data.message, 'success')
					}
				}, function(err) {
					console.log(err);
					ngNotify.set(errorMessage, 'error');
				});
			} else {
				$scope.list.lists.lists[parentIndex].cards[index].showCardEdit = false;

			}
		};

		$scope.cardStatus = function(parentIndex, index, listId, cardId) {
			var cardInfo = {
				status: $scope.list.lists.lists[parentIndex].cards[index].status,
				listId: listId,
				cardId: cardId
			}
			ListFactory.cardStatus(cardInfo).then(function(data) {
				if (data.status == false) {
					ngNotify.set(data.message, 'error');
				} else if (data.status == 'unauthorized') {
					$scope.list.lists.lists[parentIndex].cards[index].showCardEdit = false;

					ngNotify.set(data.message, 'error');
				} else {
					$scope.list.lists.lists[parentIndex].cards[index].showCardEdit = false;

					ngNotify.set(data.message, 'success')
				}
			}, function(err) {
				console.log(err);
				ngNotify.set(errorMessage, 'error');
			});
		}

		$scope.openListBox = function(index) {
			$scope.list.lists.lists[index].show = true;
			$scope.list.newListName = $scope.list.lists.lists[index].name;
		}

		$scope.updateListName = function(index, listId) {
			var listInfo = {
				newName: $scope.list.newListName,
				listId: listId
			}
			if (($scope.list.newListName) && ($scope.list.newListName) != ($scope.list.lists.lists[index].name)) {

				ListFactory.updateList(listInfo).then(function(data) {
					if (data.status == false) {
						ngNotify.set(data.message, 'error');
					} else if (data.status == 'unauthorized') {
						ngNotify.set(data.message, 'error');
					} else {
						$scope.list.lists.lists[index].show = false;
						$scope.list.lists.lists[index].name = $scope.list.newListName;
						ngNotify.set(data.message, 'success')
					}
				}, function(err) {
					ngNotify.set(errorMessage, 'error');
				});
			} else {
				$scope.list.lists.lists[index].show = false;
			}

		}

		$scope.openInputBox = function() {
			$rootScope.renameStatus = true;
			$scope.board.renameValue = $scope.boardDetail.board[0].name;
		}

		$scope.renameBoard = function() {
			var newValue = {
				newName: $scope.board.renameValue,
				boardId: boardId
			};
			if (($scope.board.renameValue) && ($scope.board.renameValue) != ($scope.boardDetail.board[0].name)) {
				BoardFactory.renameBoard(newValue).then(function(data) {
					$scope.boardDetail.board[0].name = $scope.board.renameValue;
					$rootScope.renameStatus = false;
					if (data.status == false) {
						ngNotify.set(data.message, 'error');
					} else if (data.status == 'unauthorized') {
						ngNotify.set(data.message, 'error');
					} else {
						ngNotify.set(data.message, 'success')
					}

				}, function(err) {
					ngNotify.set(errorMessage, 'error');
					console.log(err);
				});
			} else {
				$rootScope.renameStatus = false;
			}

		}

		$scope.closeBoard = function() {
			BoardFactory.closeBoard(boardId).then(function(data) {
				if (data.status == 'unauthorized') {
					ngNotify.set(data.message, 'error');
				} else {
					ngNotify.set(data.message, 'success');
					$window.location = '#/dashboard';
				}
				$rootScope.renameStatus = false;
			}, function(er) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			})
		}

		$scope.deleteBoard = function() {
			BoardFactory.deleteBoard(boardId).then(function(data) {
				if (data.status == false) {
					ngNotify.set(errorMessage, 'error');
				} else {
					ngNotify.set(data.message, 'success');
					$window.location = '#/dashboard'
				}

			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			});
		}

		$scope.shareBoard = function() {
			if (!$scope.emails) {
				$scope.invalid = true;
				$timeout(function() {
					$scope.invalid = false;
				}, 2000);
				return false;
			}
			var emails = $scope.emails.map(function(e1) {
				return e1.text
			});
			var shareDetail = {
				emailIds: emails,
				boardId: boardId,
				message: $scope.message
			}
			BoardFactory.shareBoardToUser(shareDetail).then(function(data) {
				$rootScope.renameStatus = false;
				switch (data.status) {
					case false:
						ngNotify.set(data.message, 'error');
						break;
					case 'unauthorized':
						ngNotify.set(data.message, 'error');
						break;
					case 'self':
						ngNotify.set(data.message, 'error');
						break;
					default:
						ngNotify.set(data.message, 'success');
				}

			}, function(err) {
				console.log(err);
				ngNotify.set(errorMessage, 'error');
			});
			$scope.test = 'modal'
		};
		$scope.loadUserEmailIds = function(query) {
			return userFactory.getUserEmails(query);
		};
		$rootScope.$on('listToBeDeleted', function(event, args) {
			listId = args.listId;
			index = args.index;
		});

		$scope.deleteList = function() {
			ListFactory.deleteList(listId).then(function(data) {
				if (data.status == false) {
					ngNotify.set(data.message, 'error');
				} else if (data.status == 'unauthorized') {
					ngNotify.set(data.message, 'error');
				} else {
					$rootScope.$broadcast('listDeleted');
					ngNotify.set(data.message, 'success');
				}

			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			});
		};

		$rootScope.$on('cardToBeDeleted', function(event, args) {
			cardId = args.cardId;
			listId = args.listId;
			index = args.index;
			parentIndex = args.parentIndex;
		});

		$scope.deleteCard = function() {
			ListFactory.deleteCard(cardId, listId).then(function(data) {
				if (data.status == false) {
					ngNotify.set(data.message, 'error');
				} else if (data.status == 'unauthorized') {
					ngNotify.set(data.message, 'error');
				} else {
					$rootScope.$broadcast('cardDeleted');
					ngNotify.set(data.message, 'success');
				}

			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			});
		};

		$rootScope.$on('listDeleted', function() {
			$scope.list.lists.lists = ListFactory.updatedList(listId);
		});

		$rootScope.$on('cardDeleted', function() {
			$scope.list.lists.lists = ListFactory.updatedCard(cardId, parentIndex);
		});
	}
]);

app.controller('ClosedBoardCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'ngNotify', 'BoardFactory', 'ModalService',
	function($scope, $rootScope, $window, $timeout, ngNotify, BoardFactory, ModalService) {
		$rootScope.authorised = false;
		$rootScope.showLoader = false;
		var boardId;
		var errorMessage = 'Something went wrong, please try again.';
		$scope.navbarURL = 'partials/navbar.html';

		$rootScope.$on('boardToRename', function(event, args) {
			boardId = args.boardId
		})
		BoardFactory.getAllcloseBoards().then(function(allCloseBoards) {
			if (allCloseBoards == undefined) {
				$window.location = '#/login';
			} else {
				$rootScope.showLoader = true;
				$scope.closedBoardsData = allCloseBoards;
			}

		}, function(err) {
			ngNotify.set(errorMessage, 'error');
			console.log(err);
		});
		$scope.reOpenBoard = function() {
			BoardFactory.reOpenBoard(boardId).then(function(data) {
				BoardFactory.updateClosedBoards(boardId);
				if (data.status == 'unauthorized') {
					ngNotify.set(data.message, 'error');
				} else {
					$rootScope.$broadcast('updateClosedBoard');
					ngNotify.set(data.message, 'success');
				}
			}, function(err) {
				ngNotify.set(errorMessage, 'error');
				console.log(err);
			})
		}
		$rootScope.$on('updateClosedBoard', function() {
			$scope.closedBoardsData = BoardFactory.getUpdatedClosedBoards();
		});
	}
]);

app.controller('RegisterCtrl', ['$rootScope', '$scope', '$rootScope', '$window', '$timeout', 'userFactory',
	function($rootScope, $scope, $rootScope, $window, $timeout, userFactory) {
		$scope.submitForm = function() {
			if ($scope.form != undefined) {
				if (!($scope.form.name)) {
					$scope.invalid = true;
					$scope.message = "Please enter a valid name";
					$timeout(function() {
						$scope.invalid = false;
					}, 2000);
					return false;
				}
				if (!$scope.form.email) {
					$scope.invalid = true;
					$scope.message = "Please enter a valid email id";
					$timeout(function() {
						$scope.invalid = false;
					}, 2000);
					return false;
				}
				if (!($scope.form.password)) {
					$scope.invalid = true;
					$scope.message = "The password must be minimum of six characters";
					$timeout(function() {
						$scope.invalid = false;
					}, 2000);
					return false;
				}
				if ($scope.form.password != $scope.form.repeatPassword) {
					$scope.invalid = true;
					$scope.message = "The password and confirm password must be same";
					$timeout(function() {
						$scope.invalid = false;
					}, 2000);
					return false;
				}

				userFactory.registerUser($scope.form).then(function(data) {
					$rootScope.authorised = false;
					$window.location = '#/dashboard';
				}, function(err) {
					$scope.invalid = true;
					$scope.message = "The email is already exist.";
					$timeout(function() {
						$scope.invalid = false;
					}, 2000);
					console.log(err);
				});
			} else {
				$scope.invalid = true;
				$scope.message = "Please enter all details";
				$timeout(function() {
					$scope.invalid = false;
				}, 2000);
			}
		}
	}
]);

app.controller('LoginCtrl', ['$rootScope', '$scope', '$rootScope', '$window', '$timeout', 'userFactory',
	function($rootScope, $scope, $rootScope, $window, $timeout, userFactory) {
		$scope.login = function() {
			if (!$scope.form.email) {
				$scope.invalid = true;
				$scope.message = "Please enter a valid email id";
				$timeout(function() {
					$scope.invalid = false;
				}, 2000);
				return false;
			}
			if (!($scope.form.password)) {
				$scope.invalid = true;
				$scope.message = "The password must be minimum of six characters";
				$timeout(function() {
					$scope.invalid = false;
				}, 2000);
				return false;
			}

			userFactory.loginUser($scope.form).then(function(data) {
				$rootScope.authorised = false;
				$window.location = '#/dashboard';
			}, function(err) {
				console.log(err);
				$scope.invalid = true;
				$scope.message = "Invalid id or password";
				$timeout(function() {
					$scope.invalid = false;
				}, 2000);
				return false;
			});
		}
	}
]);