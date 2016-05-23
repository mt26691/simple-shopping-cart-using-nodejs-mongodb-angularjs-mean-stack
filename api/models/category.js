var mongoose = require('mongoose');
var webConfig = require("../config/WebConfig");
var Schema = mongoose.Schema;

var categorySchema = new mongoose.Schema({
    //name of category
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
    //article description
    description: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 256
    },
    parent_id: { type: Schema.Types.ObjectId, ref: 'Category' },
    ancestors: [{ type: Schema.Types.ObjectId, ref: 'Category' }],

    //set default createdAt and updatedAt
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' }

});

//pre update
categorySchema.pre('update', function () {
    this.update({}, { $set: { updatedAt: new Date() } });
});

module.exports = categorySchema;
module.exports.set('toObject', { virtuals: true });
module.exports.set('toJSON', { virtuals: true });
