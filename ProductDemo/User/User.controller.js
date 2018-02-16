/**
 * Created by Lcom32 on 12/20/17.
 */
import cons from '../constant'
import User from './User.model'
var jwt    = require('jsonwebtoken');
const saltRounds = 10;


// var User = require('/User/User.model');
var getToken;
//var bcrypt = require('bcryptjs');
var bcrypt = require('bcrypt');

var salt = bcrypt.genSaltSync(10);
var hash = bcrypt.hashSync("B4c0/\/", salt);

//MARK:- image related function
var multer  =   require('multer');

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'public/images/');
    },
    filename: function (req, file, callback) {
        console.log(file.originalname.split('.')[1])
        callback(null, file.fieldname + '-' + Date.now() +'.'+ file.originalname.split('.')[1]);
    }
});

//var upload = multer({ storage : storage}).single('userPhoto');
var upload = multer({ storage : storage}).array({name:'files'});


function RegisterUser(req,res) {

    if(req.body)
    {
    let checkUser = false;

    if(req.body.userName.match('') == false)
    {
       checkUser = req.body.userName.count < 15 ? checkUser= false:checkUser=true;
    }
     if(req.body.userEmail.match('') == false)
    {
        checkUser = cons.ValidateEmail(req.body.userEmail) ? checkUser= false:checkUser=true;
    }
    if(req.body.userSecAnswer.match('') == false)
    {
        checkUser = req.body.userSecAnswer.count >= 7 ? checkUser= false:checkUser=true;
    }

    if(checkUser)
    {
        var pass = bcrypt.hashSync(req.body.userPassword, 10);
        req.body.userPassword = pass;
        User.find({userEmail:req.body.userEmail})
            .then((user) =>
        {
            if(user.length > 0)
            {
                res.send({message:"Email aleady exixt",statusCode:200,error:false})

            }
            else
            {
                new User(req.body).save()
                    .then((user) => {
                        res.send({message:'User created sucessfully',statusCode:200,data:user,error:false});

                    })
                    .catch((err) => {
                        res.send({message:err,statusCode:err.statusCode,error:true});

                    })
            }
        })
        .catch ((err) => {

            res.send({message:err,statusCode:err.statusCode,error:true});

        })
    }
    }
    else
    {
        res.send({message:'Please add params for user to add'});
    }

}

function loginUser(req,res) {

    if(req.body.userEmail.match('') == false || req.body.userPassword.match('') == false ) {

        User.findOne({userEmail: req.body.userEmail})
            .then((user) => {

                var token = jwt.sign({name:user.userEmail},
                                      cons.secret,
                                    { expiresIn: 60*60*24});


                User.aggregate( [
                    {
                        $addFields: {
                            "token": token
                        }
                    }
                ] )


              //  var userObj = user.toJSON()
              //  userObj['token'] = token;

                // var pass = bcrypt.hashSync(req.body.userPassword, 10);

                bcrypt.compare(req.body.userPassword, user.userPassword, function(err, doesMatch){
                    if (doesMatch){

                        user.userPassword = undefined;
                        return res.send({
                            message: 'user found',
                            token :token,
                            data:user,
                            error: false
                        })

                    }else{
                        //go away
                        return res.send({message:'Wrong password',data:[],error:true})

                    }});

              })
            .catch((err) => {
                res.send({message:'Sorry, user not found '+err})
            });
    }




}

function profileImageUpload(req,res) {
        upload(req, res, function (err) {
            if (err) {
                return res.end("Something went wrong!" + err.error);
            }
            return res.end("File uploaded sucessfully!.");
        });


}

function multipleImageUpload(req,res) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!" +err);
        }
        return res.end("File uploaded sucessfully!.");
    });

}


function forgotPassword(req,res) {

}

function checkAuthenticationToken() {

}

function  checkAuthentication(req,res,next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    token = getToken(req.headers);

    // if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    //     token =  req.headers.authorization.split(' ')[1];
    // }

    if(token){
        jwt.verify(token, cons.secret, function(err,decoded){
            if(err){
                return res.json({success:false, message:'Failed to authenticate token.'});
            } else {
                return res.send({message:'requested user is authorized user'})
                req.decoded = decoded;
               next();
                console.log(decoded);
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }

}

function  getUserDetails(req,res) {

}

function getAllUsers(req,res) {

   User.find({})
       .then((user) =>{

                res.send({message:'User found',data:user,error:false});
       })
       .catch((err) =>{
                res.send({message:'no users found'});
       })
}

function updateUser(req,res) {

}

function deleteUser(req,res) {

}

getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
}

module.exports.RegisterUser = RegisterUser;
module.exports.loginUser = loginUser;
module.exports.checkAuthentication = checkAuthentication;
module.exports.getAllUsers = getAllUsers;
module.exports.checkAuthenticationToken = checkAuthenticationToken;
module.exports.getToken = getToken;
module.exports.profileImageUpload = profileImageUpload;
module.exports.multipleImageUpload = multipleImageUpload;

