/**
 * Created by Lcom32 on 12/20/17.
 */
var express = require('express');
var router =  express.Router();
var user = require('./User.controller');


// router.get('/' ,function (req,res) {
//     res.send({message:'User Model Root'})
// });

router.get('/', function(req, res, next) {
    res.send('Welcome to user demo');
});


router.post('/RegisterUser',function (req,res) {
    user.RegisterUser(req,res);
})

router.post('/login',function (req,res) {
    user.loginUser(req,res);
})


router.use(function (req,res,next) {
    var token = user.getToken(req.headers);
    if(token)
    {
        console.log('user is authorized');
        next()
    }
    else {
        res.send({message:'user is unAuthorized'});
    }
})

router.post("/Upload", function (req, res) {
    user.profileImageUpload(req,res);
});

router.post("/UploadMultiple", function (req, res) {
    user.multipleImageUpload(req,res);
});



// router.use('/api', user.checkAuthenticationToken());


router.post('/checkAuthentication',function (req,res) {
    user.checkAuthentication(req,res);
})

router.post('/getAllUsers',function (req,res) {
    user.getAllUsers(req,res);
})


router.post('/checkAuthenticationToken',function (req,res) {

    user.checkAuthenticationToken(req,res);

  //  console.log('hello world');
    // user.checkAuthentication(req,res).then((res) =>{
    //     user.checkAuthenticationToken(req,res);
    //
    // }).catch((err) => {})

})


module.exports = router;
