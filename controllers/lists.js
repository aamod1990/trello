var async = require('async');

var List = require('../models/lists');

exports.createList = function(req, res, next) {
	var list = new List();

	var body = req.body.data;

	list.name = body.list.name;
	list.boardId = body.boardId;
	list.createdBy = req.user._id;

	list.save(function(err, success) {
		if (err) {
			var error = {
				status: 'false',
				message: 'Something went wrong, please try again.'
			}
			console.log(err);
			res.send(error);
		} else {
			var data = {
				status: 'success',
				message: 'List created successfully.'
			}
			res.send(data);
		}
	})
};

exports.getList = function(req, res, next) {

	List.find({
		'boardId': req.params.boardId
	}).sort('name').populate('createdBy').populate('cards.createdBy').exec(function(err, lists) {
		if (err) {
			var error = {
				status: 'false',
				message: 'Something went wrong, please try again.'
			}
			console.log(err);
			res.send(error);
		} else {
			var data = {
				'lists': lists,
				'userId': req.user._id
			}
			res.send(data);

		}
	})
};

exports.renameList = function(req, res, next) {
	var body = req.body.listInfo;

	async.waterfall([

		function(cb) {
			List.findById(body.listId).populate('boardId').exec(function(err, list) {
				if (err) {
					var error = {
						status: false,
						message: 'List id does not exist.'
					}
					cb(error);
				} else {
					cb(null, list);
				}
			});
		},
		function(list, cb) {
			if ((list.createdBy.toString() == req.user._id) || (list.boardId.createdBy.toString() == req.user._id)) {
				List.update({
					'_id': body.listId
				}, {
					$set: {
						'name': body.newName,
						'updatedAt': new Date()
					}
				}).exec(function(err, result) {
					if (err) {
						var error = {
							status: false,
							message: 'Something went wrong, please try again.'
						}
						cb(error)
					} else {
						var success = {
							status: true,
							message: 'List name has been updated successfully.'
						}
						cb(null, success);
					}
				});
			} else {
				var success = {
					status: 'unauthorized',
					message: 'Access denied.'
				}
				cb(null, success);
			}

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

exports.deleteList = function(req, res, next) {

	async.waterfall([

		function(cb) {
			List.findById(req.params.listId).populate('boardId').exec(function(err, list) {
				if (err) {
					var error = {
						status: false,
						message: 'List id does not exist.'
					}
					cb(error);
				} else {
					cb(null, list);
				}
			});
		},
		function(list, cb) {
			if ((list.createdBy.toString() == req.user._id) || (list.boardId.createdBy.toString() == req.user._id)) {

				List.remove({
					'_id': req.params.listId
				}, function(err, result) {
					if (err) {
						var error = {
							status: false,
							message: 'Something went wrong, please try again.'
						}
						cb(error)
					} else {
						var success = {
							status: true,
							message: 'List has been deleted successfully.'
						}
						cb(null, success);
					}
				});
			} else {
				var success = {
					status: 'unauthorized',
					message: 'Access denied.'
				}
				cb(null, success);
			}

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