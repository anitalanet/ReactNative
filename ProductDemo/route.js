var express = require('express');
var app = express();
var router = express.Router();


var index = require('./routes/index');
var users = require('./routes/usersac');
var prod = require('./Product/Product.routes');
var cat = require('./Category/Category.routes');
var user = require('./User/User.routes');

//router.use('/users',users);
router.use('/',index);
router.use('/product',prod);
router.use('/category',cat);
router.use('/user',user);

module.exports = router;

