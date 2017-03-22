var async = require('async');

var Board = require('../models/boards');
var User = require('../models/users');
var email = require('../libs/email');

exports.createBoard = function(req, res, next) {

  var board = new Board();
  board.name = req.body.boardName;
  board.createdBy = req.user._id;
  board.save(function(err, data) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Please enter a valid board name.'
      }
      res.send(error);
    } else {
      var data = {
        status: true,
        message: 'Board has been created successfully.'
      }
      res.send(data);
    }
  });
};

exports.getAllBoards = function(req, res, next) {
  async.parallel([

    function(cb) {
      Board.find({
        'createdBy': req.user._id,
        'active': true
      }, {
        collaborators: 0
      }).populate('createdBy').exec(function(err, boards) {
        if (err) {
          cb(err);
        } else {
          var data = {
            boards: boards
          }
          cb(null, data);
        }
      });

    },
    function(cb, data) {
      Board.find({
        'collaborators': req.user.email,
        'active': true
      }, {
        'collaborators.$': 1,
        'name': 1,
        'createdBy': 1,
        'active': 1,
        'updatedAt': 1,
        'createdAt': 1
      }).populate('createdBy').exec(function(err, sharedBoards) {
        if (err)
          cb(err)
        else {
          var data = {
            sharedBoards: sharedBoards
          }
          cb(null, data);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else {
      var data = {
        'results': result,
        'userId': req.user._id
      }
      res.send(data);
    }

  });
};

exports.boardDetail = function(req, res, next) {
  Board.find({
    '_id': req.params.boardId
  }, function(err, board) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else {
      var data = {
        board: board,
        userId: req.user._id
      }
      res.send(data);
    }
  });
};

exports.renameBoard = function(req, res, next) {
  var body = req.body.newValue;

  async.waterfall([

    function(cb) {
      Board.findById(body.boardId, function(err, board) {
        if (err) {
          var error = {
            status: false,
            message: 'Board id does not exist.'
          }
          cb(error);
        } else {
          cb(null, board);
        }
      })
    },
    function(board, cb) {
      Board.update({
        '_id': body.boardId,
        'createdBy': req.user._id
      }, {
        $set: {
          'name': body.newName,
          'updatedAt': new Date()
        }
      }, function(err, result) {
        if (err) {
          var error = {
            status: false,
            message: 'Something went wrong, please try again.'
          }
          cb(error)
        } else if (result == 0) {
          var success = {
            status: 'unauthorized',
            message: 'Access denied.'
          }
          cb(null, success);
        } else {
          var success = {
            status: true,
            message: 'Board name has been updated successfully.'
          }
          cb(null, success);
        }
      })

    }
  ], function(err, result) {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      res.send(result)
    }
  });

};

exports.closeBoard = function(req, res, next) {
  Board.update({
    '_id': req.body.boardId,
    'createdBy': req.user._id
  }, {
    $set: {
      'active': false
    }
  }, function(err, success) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else if (success == 0) {
      var data = {
        status: 'unauthorized',
        message: 'Access denied.'
      }
      res.send(data);
    } else {
      var data = {
        status: true,
        message: 'Board has been closed successfully.'
      }
      res.send(data);
    }
  })
};
exports.openBoard = function(req, res, next) {
  Board.update({
    '_id': req.body.boardId,
    'createdBy': req.user._id
  }, {
    $set: {
      'active': true
    }
  }, function(err, success) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else if (success == 0) {
      var data = {
        status: 'unauthorized',
        message: 'Access denied.'
      }
      res.send(data);
    } else {
      var data = {
        status: true,
        message: 'Board has been opened successfully.'
      }
      res.send(data);
    }
  })
};

exports.getAllcloseBoards = function(req, res, next) {
  Board.find({
    'createdBy': req.user._id,
    'active': false
  }).populate('createdBy').exec(function(err, closedData) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else {
      var data = {
        'closedBoards': closedData,
        'userId': req.user._id
      }
      res.send(data);
    }
  })
};

exports.getSearchResult = function(req, res, next) {

  var isClosed = true;
  if (req.params.part == 'closed') {
    isClosed = false;
  }
  Board.find({
    'name': {
      '$regex': req.params.query,
      '$options': 'i'
    },
    'active': isClosed
  }).populate('createdBy').exec(function(err, result) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else {
      res.send(result);
    }
  })
};

exports.shareBoard = function(req, res, next) {
  var flag = 0;

  async.waterfall([
    function(cb) {
      req.body.emailIds.forEach(function(item, index) {
        if (req.user.email == item) {
          flag = 1;
        }
      });
      if (flag == 1) {
        var data = {
          status: 'self',
          message: 'You can not share board yourself.'
        }
        return res.send(data);
      }
      Board.findById(req.body.boardId, {
        'collaborators': 1
      }).exec(function(err, board) {
        if (err) {
          var error = {
            status: false,
            message: 'Something went wrong, please try again.'
          }
          cb(error);
        } else {
          cb(null, board);
        }
      });
    },
    function(board, cb) {
      req.body.emailIds = req.body.emailIds.filter(function(val) {
        return board.collaborators.indexOf(val) == -1;
      });
      Board.update({
        '_id': req.body.boardId,
        'createdBy': req.user._id
      }, {
        $addToSet: {
          'collaborators': {
            $each: req.body.emailIds
          }
        }
      }).exec(function(err, success) {
        if (err) {
          cb(err)
        } else {
          var mailOptions = {
            to: '' + req.body.emailIds.toString() + '', // list of receivers
            subject: 'Testing Email', // Subject line
            text: ''+req.body.message+'', // plaintext body
            html: ''+req.body.message+'' // html body
          };
          // email.sendEmail(mailOptions, function(err, info) {
          //   console.log(err);
          //   console.log(info);
          // });
          cb(null, success)
        }
      });
    }

  ], function(err, success) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else if (success == 0) {
      var data = {
        status: 'unauthorized',
        message: 'Access denied.'
      }
      res.send(data);
    } else {
      var data = {
        status: true,
        message: 'The board has been shared successfully.'
      }
      res.send(data);
    }
  });
};

exports.deleteBoard = function(req, res, next) {
  Board.update({
    '_id': req.body.boardId
  }, {
    $pull: {
      'collaborators': {
        'emailId': req.user.email
      }
    }
  }, function(err, success) {
    if (err) {
      console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
    } else {
      var data = {
        status: true,
        message: 'The board has been deleted successfully.'
      }
      res.send(data);
    }
  });
};