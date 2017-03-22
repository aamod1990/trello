var User=require('../models/users');

exports.register=function(req,res,next){
	res.send('Registered successfully');
}

exports.login=function(req,res,next){
	res.send('Logged in successfully');
}
exports.getUserProfile=function(req,res,next){
	var emailId = req.user;
	User.findOne({'local.eamil':emailId},function(err,user){

	});
};

exports.getUserEmails=function(req,res,next){
	User.find({
		'email':{
			'$regex':req.body.query,
			'$options':'i',
			'$nin':[req.user.email]

		}
	},{'email':1,'_id':0},function(err,emailIds){
		if(err){
 console.log(err);
      var error = {
        status: false,
        message: 'Something went wrong, please try again.'
      }
      res.send(error);
		}else{
			res.send(emailIds);
		}
	})
};