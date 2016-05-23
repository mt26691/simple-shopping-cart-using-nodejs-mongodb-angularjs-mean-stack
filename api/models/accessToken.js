var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;

var accessTokenSchema = new mongoose.Schema({
    //acces Token
    key: { type: String, required: true },
    //login ip address
    ipAddress: { type: String },
    //last time use, to check whether it's expired or not
    lastTimeUse: { type: Date, default: Date.now },
    
    user: { type: Schema.Types.ObjectId, ref: 'User' },
});


module.exports = accessTokenSchema  ;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
