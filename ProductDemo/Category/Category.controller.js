var mongoose = require('mongoose');
var modelCat = require('./Category.model');
var express = require('express');
var app = express();

function addCategory(req,res) {

    console.log(req.body);
    var cat = new modelCat(req.body).save().then((modelCat) => {
        res.send({'message':'Category is sucessfully added',statusCode:200,error:false});

    }).catch((err) => {
        res.send({'message':err,statusCode:200,error:true});

    });
}

function updateCategory(req,res) {

    console.log("Category update api is calling");
    modelCat.findByIdAndUpdate({catId:req.body.catId},{$set:req.body},{new:true})
        .then((modelCat) => {
            res.send({message:"Category updated sucessfully",statusCode:200,error:false})
        })
        .catch((err) => {
            res.send({message:err.message,statusCode:err.statusCode,error:true})
        });
}

function deleteCategory(req,res) {

    modelCat.findByIdAndRemove({_id:req.body.catId})
        .then((modelCat) => {
            res.send({message:"Category sucessfully deleted"});
        })
        .catch ((err) => {
        console.log(err);
    })
}

function getAllCategory(req,res) {
    modelCat.find({})
        .then((arrObjOfCategory) => {

            res.send({
                message:"Categories are found",
                data : arrObjOfCategory,
                statusCode : 200,
                error: false
            })

        })
        .catch((err) => {
            res.send({
                message:"Categories not found",
                data : [],
                statusCode : err.statusCode,
                error: true
            })
        });
}

function getAllCategoryWithProduct(req,res) {

    modelCat.aggregate([
        {
            $lookup:
                {
                    from: "products",
                    localField: "catName",
                    foreignField: "prodCategory",
                    as: "products"
                }
        }
    ]).then((arrOFCatWithProd) =>
        {
            res.send({message:"Category with Products",data:arrOFCatWithProd})
        })
}

function searchCategory() {
    
}

module.exports.addCategory = addCategory;
module.exports.updateCategory = updateCategory;
module.exports.deleteCategory = deleteCategory;
module.exports.getAllCategory = getAllCategory;
module.exports.getAllCategoryWithProduct = getAllCategoryWithProduct;
module.exports.searchCategory = searchCategory;

