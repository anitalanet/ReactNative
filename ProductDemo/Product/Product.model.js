var mongoose = require('mongoose');

var Schema = mongoose.Schema;

const product = new mongoose.Schema({
    prodId: {
        type: String,
        unique: true
    },
    prodName: {
        type: String,
    },
    productQty: {
        type: Number,
    },
    prodPrice: {
        type: Number,
    },
    prodStock: {
        type: Number,
    },
    prodCategory: {
        type: String,
        default:"",
    },
    catId:
        {
         type: Schema.ObjectId,
         ref: 'Category'
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


product.method({});

var productModel = mongoose.model('Product', product);
// export default mongoose.model('User', product);
module.exports = productModel;
