var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;
ObjectId = Schema.ObjectId;
// define the schema for our board model
var boardSchema = Schema({
	id: ObjectId,
	name: {
		type: String,
		required: true
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	active: {
		type: Boolean,
		default: true
	},
	collaborators:{
		type:Array,
		default:[]
	}
});


// create the model for boards and expose it to our app
module.exports = mongoose.model('Boards', boardSchema);