var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var listSchema = Schema({
	id: ObjectId,
	name: {
		type: String,
		required: true
	},
	boardId: {
		type: Schema.Types.ObjectId,
		ref: 'Boards',
		required: true
	},
	cards: [{
		name: {
			type: String,
			required: true
		},
		createdBy:{
			type:Schema.Types.ObjectId,
			ref:'User',
			required:true
		},
		status:{
			type:Boolean,
			default:false
		}
	}],
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date
	}
});

// create the model for list and expose it to our app
module.exports = mongoose.model('List', listSchema);