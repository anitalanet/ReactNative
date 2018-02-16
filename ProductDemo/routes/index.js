var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var database_url = 'mongodb://localhost:27017/stockDB';
var db = mongoose.connection;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });

    mongoose.connect(database_url);
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log('we are connected');
    });


});


module.exports = router;
