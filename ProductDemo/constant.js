function ValidateEmail(mail)
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
        return (true)
    }
    return (false)
}

module.exports = {
    secret: 'NODE_JS_DEMO',
    database: 'mongodb://localhost:27017/stockDB'
};
module.exports.ValidateEmail = ValidateEmail;
