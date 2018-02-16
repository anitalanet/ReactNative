var mongoose = require('mongoose');


const category = new mongoose.Schema({
    catId: {
        type: String,
        unique: true
    },
    catName: {
        type: String,
        required:true
    },
    catQty: {
        type: Number,
        default:0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

category.method({});

var categoryObj = mongoose.model('Category', category);
module.exports = categoryObj;