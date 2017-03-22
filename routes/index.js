var user = require('../controllers/users');
var board = require('../controllers/boards');
var list = require('../controllers/lists');
var card = require('../controllers/cards');

module.exports = function(app, passport) {
  app.post('/signup', function(req, res, next) {
    next();
  }, passport.authenticate('local-signup'), user.register);

  /*Logout*/
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login'), user.login);


  app.get('/user/profile', function(req, res, next) {
    next();
  }, user.getUserProfile);

  app.post('/board', isLoggedin, board.createBoard);
  app.get('/board', isLoggedin, board.getAllBoards);
  app.get('/board/detail/:boardId', isLoggedin, board.boardDetail);
  app.put('/board', isLoggedin, board.renameBoard);
  app.post('/board/close', isLoggedin, board.closeBoard);
  app.post('/board/reopen', isLoggedin, board.openBoard);
  app.get('/all/closed/boards', isLoggedin, board.getAllcloseBoards);
  app.post('/list', isLoggedin, list.createList);
  app.get('/list/:boardId', isLoggedin, list.getList);
  app.get('/search/query/:query/part/:part', isLoggedin, board.getSearchResult);
  app.post('/board/share', isLoggedin, board.shareBoard);
  app.delete('/board', isLoggedin, board.deleteBoard);
  app.post('/user/email', isLoggedin, user.getUserEmails);
  app.post('/list/card', isLoggedin, card.createCard);
  app.put('/list', isLoggedin, list.renameList);
  app.delete('/list/listId/:listId', isLoggedin, list.deleteList);
  app.put('/list/card', isLoggedin, card.renameCard);
  app.delete('/list/listid/:listid/card/cardid/:cardid', isLoggedin, card.deleteCard);
  app.put('/list/card/status/', isLoggedin, card.cardStatus);
};

// Define a middleware function to be used for every secured routes
var isLoggedin = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    var data = {
      status: 'false',
      message: 'Login is required.'
    }
    return res.send(data);
  }
};