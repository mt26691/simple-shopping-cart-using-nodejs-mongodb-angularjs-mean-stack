var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var tokenService = require("../services/TokenService");
var webConfig = require("../config/WebConfig");
var emailService = require("../services/EmailService");
var Schema = mongoose.Schema;

var userSchema = new mongoose.Schema({
    //name
    name: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 48,
    },
    //user email, we use match to check is it a right email
    //only allow lowercase
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        maxlength: 256,
        match: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    },
    password: {
        type: String,
        required: true,
    },
    //token to reset password
    passwordResetToken: {
        value: {
            type: String
        },
        issuedAt: {
            type: Date
        }
    },
    role: {
        type: String,
        enum: ['admin', 'normal'],
        required: true,
        default: 'normal',
        //if isActive == false, set user role to normal
        set: function (value) {
            if (value == "admin") {
                this.accessRight = 9;
            }
            else if (value == "editor") {
                this.accessRight = 8;
            }
            else {
                this.accessRight = 1;
            }
            return value;
        }
    },
    accessRight: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        max: 9
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
});

/**
 * Pre Saving data, hash password if it was changed
 */
userSchema.pre('save', function (next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();
    //hash password
    bcrypt.hash(user.password, 10, function (err, hash) {
        user.password = hash;
        next();
    });

});

/**
 * Compare password, user.comparePassword("demoPassword",callback(err,isMath){});
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

//send password reset email
userSchema.methods.sendPasswordResetEmail = function (callback) {
    var self = this;
    this.passwordResetToken = tokenService.generate();
    this.save(function (err, savedUser) {
        // Send email data
        var emailData = {
            to: {
                name: self.name,
                email: self.email
            },
            subject: "Reset password",
            data: {
                name: self.name,
                email: self.email,
                resetURL: webConfig.url + webConfig.resetPasswordUrl + savedUser.passwordResetToken.value
            },
            tags: ['reset password'],
            template: 'password-reset'
        }
        //send email
        emailService.send(emailData, function () {
            callback();
        });
    });
};

//pre update
userSchema.pre('update', function () {
    this.update({}, { $set: { updatedAt: new Date() } });
});

module.exports = userSchema;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
