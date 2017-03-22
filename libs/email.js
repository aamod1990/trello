var nodemailer = require('nodemailer');

var config= require('../config.js');

module.exports.sendEmail = function (mailOptions,cb) {
var transporter = nodemailer.createTransport({
    service: "Gmail",
 debug: true,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.pass
    }
    })

mailOptions.from =  '<no-reply@marelloapp.com>';
transporter.sendMail(mailOptions,cb);
};
