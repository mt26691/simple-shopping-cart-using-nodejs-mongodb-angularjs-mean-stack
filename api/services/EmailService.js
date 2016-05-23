/**
* @module      :: Email Servie
* @description	:: Node Mailer service and setup
*/
var nodemailer = require("nodemailer");
var mail = require("../config/MailConfig");
var config = require("../config/WebConfig");
var _ = require("lodash");
var defaultFrom = "mywebSite";
var fromEmail = "hotro@hocdai.com"

module.exports = {

    send: function (emailData, callback) {
        mail.template(emailData.template, emailData.data, function (err, html, text) {

            var message = {
                from: defaultFrom + ' <' + fromEmail + '>',
                subject: emailData.subject,
                generateTextFromHTML: true,
                html: html,
                text: text
            };

            if (!_.isArray(emailData.to)) {
                emailData.to = [emailData.to];
            }
            //send email to log account, so we can track every email which is sent to clients.
            emailData.to.push({
                name: config.defaultName,
                email: config.defaultEmail
            });

            var recipients = [];
            emailData.to.forEach(function (recipient) {
                recipients.push(recipient.name + ' <' + recipient.email + '>');
            });

            message.to = recipients.join();

            //send email
            mail.sendMail(message, function (error, info) {
                if (error) {
                    return console.log(error);
                }
                console.log('Message sent: ' + info.response);

            });
            //callback function
            callback();
        });
    }

};


