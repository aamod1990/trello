var async = require('async');

var List = require('../models/lists');

exports.createCard = function(req, res, next) {
	var body = req.body.cardInfo;

	async.waterfall([

		function(cb) {
			List.findById(body.listId, function(err, list) {

				if (err) {
					var error = {
						status: false,
						message: 'List id does not exist.'
					}
					cb(error);
				} else {
					cb(null, list);
				}
			})
		},
		function(list, cb) {
			List.update({
				'_id': body.listId
			}, {
				$push: {
					'cards': {
						'name': body.name,
						'createdBy': req.user._id,
						'status': body.status
					}
				}
			}, function(err, card) {
				if (err) {
					var error = {
						status: false,
						message: 'Something went wrong, please try again.'
					}
					cb(error)
				} else {
					var success = {
						status: true,
						message: 'Card has been created successfully.'
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
			res.send(result);
		}
	});
};

exports.renameCard = function(req, res, next) {
	var body = req.body.cardInfo;
	async.waterfall([

		function(cb) {
			List.findOne({
				'_id': body.listId,
				'cards._id': body.cardId
			}, {
				'boardId': 1,
				'createdBy': 1,
				'cards.$': 1
			}).populate('boardId').exec(function(err, card) {
				if (err) {
					var error = {
						status: false,
						message: 'Card id does not exist.'
					}
					cb(error);
				} else {
					cb(null, card);
				}
			})
		},
		function(card, cb) {
			if ((card.cards[0].createdBy.toString() == req.user._id) || (card.boardId.createdBy.toString() == req.user._id)) {
				List.update({
					'cards._id': body.cardId
				}, {
					$set: {
						'cards.$.name': body.newName
					}
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
							message: 'Card name has been updated successfully.'
						}
						cb(null, success);
					}
				})
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

exports.deleteCard = function(req, res, next) {

	async.waterfall([

			function(cb) {

				List.findOne({
					'_id': req.params.listid,
					'cards._id': req.params.cardid
				}, {
					'boardId': 1,
					'createdBy': 1,
					'cards.$': 1
				}).populate('boardId').exec(function(err, card) {
					if (err) {
						var error = {
							status: false,
							message: 'Card id does not exist.'
						}
						cb(error);
					} else {
						cb(null, card);
					}
				})
			},
			function(card, cb) {
					if ((card.cards[0].createdBy.toString() == req.user._id) || (card.boardId.createdBy.toString() == req.user._id)) {

						List.update({
							'_id': req.params.listid,
							'cards.createdBy': req.user._id
						}, {
							$pull: {
								'cards': {
									'_id': req.params.cardid
								}
							}
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
									message: 'Card has been deleted successfully.'
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
		],
		function(err, result) {
			if (err) {
				console.log(err);
				res.send(err);
			} else {
				res.send(result)
			}
		});
};

exports.cardStatus = function(req, res, next) {
	var body = req.body.cardInfo;

	async.waterfall([

		function(cb) {
			List.findOne({
				'_id': body.listId,
				'cards._id': body.cardId
			}, {
				'boardId': 1,
				'createdBy': 1,
				'cards.$': 1
			}).populate('boardId').exec(function(err, card) {
				if (err) {
					var error = {
						status: false,
						message: 'Card id does not exist.'
					}
					cb(error);
				} else {
					cb(null, card);
				}
			})
		},
		function(card, cb) {
			if ((card.cards[0].createdBy.toString() == req.user._id) || (card.boardId.createdBy.toString() == req.user._id)) {
				List.update({
					'cards._id': body.cardId //ObjectId("55caee2dfc584263138efc69")
				}, {
					$set: {
						'cards.$.status': body.status
					}
				}, function(err, result) {
					console.log(err)
					if (err) {
						var error = {
							status: false,
							message: 'Something went wrong, please try again.'
						}
						cb(error)
					} else {
						var success = {
							status: true,
							message: 'Status has been updated successfully.'
						}
						cb(null, success);
					}
				})
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