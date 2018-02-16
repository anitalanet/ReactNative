var express = require('express');
var router = express.Router();
var vc = require('./Product.controller');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Welcome to product demo');
});

router.post('/addProduct',function (req,res) {
    vc.addProduct(req,res);
});

router.post('./updateProduct',function (req,res) {
    vc.updateProduct(req,res)
})




module.exports = router;
