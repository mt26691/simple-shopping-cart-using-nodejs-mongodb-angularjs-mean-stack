var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;

var priceSchema = new mongoose.Schema({
    retail: {
        type: Number,
        min: 0
    },
    sale: {
        type: Number,
        min: 0
    },
    stock: {
        type: Number,
        min: 0
    },
    //set default createdAt and updatedAt
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }

});

//pre update
priceSchema.pre('update', function () {
    this.update({}, { $set: { updatedAt: new Date() } });
});

module.exports = priceSchema;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
