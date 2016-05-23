/**
 * Node Mailer service and setup
 */

var nodemailer = require("nodemailer");


var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: '266127@gmail.com',
        pass: '38133813'
    }
}

module.exports = nodemailer.createTransport(smtpConfig, {
    // default values for sendMail method
    from: 'My Blog',
    headers: {
        'My blog by hocdai.com': 'this email is from nodemailer'
    }
});


