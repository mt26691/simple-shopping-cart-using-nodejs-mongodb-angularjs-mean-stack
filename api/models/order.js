var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;
var emailService = require("../services/EmailService");
var product = require("product");

//product schema
var orderSchema = new mongoose.Schema({
    state: {
        type: String,
        enum: ['cart', 'checkout', 'ordered', 'shipping', 'shipped', 'paid', 'cancel'],
    },
    line_items: [
        {
            product_id: { type: Schema.Types.ObjectId, ref: 'Product' },
            quantity: 1,
            pricing: { type: Number, min: 0 },
        }
    ],
    shipping_address: {
        street: { type: String, minlength: 2, maxlength: 256 },
        city: { type: String, minlength: 2, maxlength: 256 },
    },
    sub_total: {
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
