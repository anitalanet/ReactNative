var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var modelCat = require('./Category.model');
var app = express();
var catVC = require('./Category.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Welcome to category demo');
});

router.post('/addCategory',function (req,res) {

    catVC.addCategory(req,res);
});

router.post('/updateCategory',function (req,res) {

    catVC.updateCategory(req,res);
});
router.post('/deleteCategory',function (req,res) {

    catVC.deleteCategory(req,res);
});
router.get('/getAllCategory',function (req,res) {

    catVC.getAllCategory(req,res);
});

router.get('/getAllCategoryWithProduct',function (req,res) {

    catVC.getAllCategoryWithProduct(req,res);
});

module.exports = router;
