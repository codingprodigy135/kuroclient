require('dotenv').config({path: '../.env'});
const axios = require('axios');
const { User } = require('../mongo/db.js');
const { stringify } = require('querystring');
const GOOGLE_SECRET_KEY = process.env.GOOGLE_SECRET_KEY

async function accountIdAuthorization(req, res, next) {
    if (!req.headers["authorization"]) {
        return res.send({success: 'false', error: 'Unauthorized'});
    }
    const user = await User.find({account_id: req.headers.authorization})
    if(user.length == 0){
        return res.send({success: 'false', error: 'Unauthorized'})
    }
    req.user = user[0]
    req.account_id = req.headers.authorization
    next();
}

async function accountIdAuthorizationProPlan(req, res, next) {
    if (!req.headers["authorization"]) {
        return res.send({success: 'false', error: 'Unauthorized'});
    }
    const user = await User.find({account_id: req.headers.authorization})
    if(user.length == 0){
        return res.send({success: 'false', error: 'Unauthorized'})
    }
    if(user[0].plan !== 'pro'){
        return res.send({success: 'false', error: 'This route is only available for pro users'})
    }
    req.user = user[0]
    req.account_id = req.headers.authorization
    next();
}

async function accountIdInCookie(req, res, next) {
    if (!req.cookies.account_id) {
        return res.redirect('/login')
    }
    const user = await User.find({account_id: req.cookies.account_id})
    if(user.length == 0){
        return res.redirect('/login')
    }
    req.user = user[0]
    req.account_id = req.cookies.account_id
    next();
}

async function captchaVerify(req, res, next) {
    try{
        var captcha = req.body.captcha
        if(captcha === undefined || captcha == null || captcha.length == 0){
            return res.json({status : 'error', error: 'No captcha provided'})
        }

        const query = stringify({
            secret: GOOGLE_SECRET_KEY,
            response: req.body.captcha,
            remoteip: req.connection.remoteAddress
        });

        const resp = await axios(`https://google.com/recaptcha/api/siteverify?${query}`);
        if(!resp.data.success){
            return res.json({status : 'error', error: 'Captcha failed'})
        }
        next()
    }catch(e){
        return res.json({status : 'error', error: 'Captcha failed'})
    }
}

async function verifyRequired(req, res, next) {
    if (!req.user.verified) {
        return res.send({success: 'false', error: 'Email unverified'})
    }
    next();
}

module.exports = {
    captchaVerify,
    verifyRequired,
    accountIdInCookie,
    accountIdAuthorization,
    accountIdAuthorizationProPlan
 }
 