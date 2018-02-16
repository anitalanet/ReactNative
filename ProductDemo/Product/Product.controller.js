var mongoose = require('mongoose');
var modelProduct = require('./Product.model');


function addProduct(req,res) {

    console.log('function is calling');
    console.log(req.body);
    var prod = new modelProduct(req.body)
    prod.save().then((modelProduct)=> {
        res.send({'message':'Product is sucessfully added',statusCode:200,error:false});

    }).catch((err) => {
       console.log(err);
    });
}

function updateProduct(req,res) {

   console.log('Function for update product calling');
   //var product= modelProductd();
   modelProduct.findByIdAndUpdate({_id:req.body.productId},{$set:req.body},{new:true})
       .then((product) => {
            console.log('Product data is sucessfully updated');
            res.send({message:"Product is sucessfully updated",statusCode:200,error:false})
                .catch((err) => {
                     console.log(err);
                     res.send({message:err,statusCode:err.statusCode,error:true});
                });
       });
}

function deleteProduct() {
    
}

function getProductByCategoryID() {
    
}

function deleteProductByCategory() {
    
}






module.exports.addProduct = addProduct;
module.exports.updateProduct = updateProduct;