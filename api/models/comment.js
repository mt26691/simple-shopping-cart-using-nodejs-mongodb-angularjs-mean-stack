var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;
var emailService = require("../services/EmailService");

//comment schema
var commentSchema = new mongoose.Schema({

    content: {
        type: String,
        required: true,
        maxlength: 2048
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true
    },
    inActiveReason: {
        type: String
    },
    //article which comment belong to
    article: { type: Schema.Types.ObjectId, ref: 'Article', required: true, },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

//pre update
commentSchema.pre('update', function() {
    this.update({}, { $set: { updatedAt: new Date() } });
});

//send notify email to admin to let them know about newly created comment by users
commentSchema.methods.sendNotifyEmail = function() {
    var self = this;

    self.populate('createdBy article', function(err) {
        var data = {
            content: self.content,
            createdByName: self.createdBy.name,
            createdByEmail: self.createdBy.email,
            lecture: self.article.name
        };
        var emailData = {
            to: {
                name: webConfig.defaultName,
                email: webConfig.defaultEmail
            },
            subject: "Some one comment on your site",
            data: {
                content: self.content,
                createdByName: self.createdBy.name,
                createdByEmail: self.createdBy.email,
                lecture: self.article.name,
                lectureUrl: webConfig.url + "/" + self.article.nameUrl + "/" + self.article.id
            },
            template: 'user-comment'
        }
        
        //send email
        emailService.send(emailData, function(err, resData) {
        });
    });

};

module.exports = commentSchema;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
