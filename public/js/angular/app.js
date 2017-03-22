var trello = angular.module('Trello', [
  'ngRoute',
  'Home'
]);

trello.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/login', {
      templateUrl: 'partials/login.html',
      controller: 'LoginCtrl'
    }).when('/register', {
      templateUrl: 'partials/register.html',
      controller: 'RegisterCtrl'
    }).when('/dashboard', {
      templateUrl: 'partials/dashboard.html',
      controller: 'DashboardCtrl',
      resolve: {
        boardData: ['BoardFactory',
          function(BoardFactory) {
            return BoardFactory.getAllBoards();
          }
        ]
      }
    }).when('/board/:boardId', {
      templateUrl: 'partials/board.html',
      controller: 'BoardCtrl'
    }).when('/closed',{
      templateUrl:'partials/closedBoard.html',
      controller:'ClosedBoardCtrl'
    }).otherwise({
      redirectTo: '/'
    });
  }
]);