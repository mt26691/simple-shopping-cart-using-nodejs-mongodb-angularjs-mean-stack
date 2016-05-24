var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;
var emailService = require("../services/EmailService");
var price = require("./price");

//product schema
var productSchema = new mongoose.Schema({

    //name of product
    name: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 256
    },
    //slug url of product, we use it for user friendly url
    //if product name is "this is a test product" 
    //slug will be "this-is-a-test-product"
    slug: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 256
    },
    sku: {
        type: String
    },
    //product's description
    shortDescription: {
        type: String,
        minlength: 0,
        maxlength: 256
    },
    description: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 4096
    },
    details: {
        weight: {
            type: Number,
            min: 0,
        },
        weight_unit: {
            type: String,
            enum: ['g', 'kg', 'oz', 'lbs'],
        },
        model_num: {
            type: String
        },
        manufacturer: {
            type: String
        },
        color: {
            type: String
        }
    },
    pricing: price,
    priceHistory: [
        price
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    inActiveReason: {
        type: String
    },
    tags: {
        type: String
    },

    //category
    primary_category: { type: Schema.Types.ObjectId, ref: 'Category' },
    category_ids: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    main_cat_id: { type: Schema.Types.ObjectId, ref: 'Category' },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

//pre update
productSchema.pre('update', function () {
    this.update({}, { $set: { updatedAt: new Date() } });
});


module.exports = productSchema;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
