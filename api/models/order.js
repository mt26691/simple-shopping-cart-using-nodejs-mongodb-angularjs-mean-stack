var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;
var emailService = require("../services/EmailService");
var product = require("./product");

//product schema
var orderSchema = new mongoose.Schema({
    state: {
        type: String,
        enum: ['cart', 'checkout', 'ordered', 'processing', 'processed', 'shipping', 'shipped', 'paid', 'cancel'],
    },
    lineItems: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, min: 0 },
            pricing: { type: Number, min: 0 },
        }
    ],
    shippingAddress: {
        street: { type: String, minlength: 2, maxlength: 256 },
        city: { type: String, minlength: 2, maxlength: 256 },
        receiver: { type: String, minlength: 2, maxlength: 256 },
    },
    trackingCode: {
        type: String,
        minlength: 36,
        maxlength: 36
    },
    subTotal: {
        type: Number,
        min: 0
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

//pre update
orderSchema.pre('update', function () {
    this.update({}, { $set: { updatedAt: new Date() } });
});


module.exports = orderSchema;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
