require('dotenv').config({path: '../.env'});

const express = require('express');
const tools = require('../src/util/tools.js');
const {User} = require('../src/mongo/db.js');
const {json, csrf} = require('../src/middleware/general.js');
const selfbot = require('../src/discord/selfbot.js');
const router = express.Router()

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD


async function adminPassword(req, res, next){
    if(req.body.password !== ADMIN_PASSWORD){
        return res.json({success : 'false', error: 'Unauthorized'})
    }
    next()
}


router.post('/changeplan', json, adminPassword, async (req, res, next) =>{
    try{
        var account_id = req.body.account_id
        var plan = req.body.plan
        if(plan === 'pro' || plan === 'ultimate' || plan === 'free'){
            await User.updateOne({account_id: account_id},{$set: {plan: plan}})
            await selfbot.reload_session(account_id, {plan: plan})
            return res.json({success : true})
        }
    }catch(e){
        console.log(e)
        return res.json({success : false})
    }
})


router.get('/sessions', json, adminPassword, async (req, res, next) =>{
    try{
        console.log(selfbot.sessions)
        return res.json({success : true})
    }catch(e){
        console.log(e)
        return res.json({success : false})
    }
})

router.post('/forcelogout', json, adminPassword, async (req, res, next) =>{
    try{
        const token = req.body.token
        const token_user = await User.find({discord_token: token})
        if(token_user.length !== 0){
            const account_id = token_user[0].account_id
            await selfbot.removeSession(account_id)
            await User.updateOne({discord_token: token}, {$set: {discord_token: 'none'}})
            return res.json({success: true})
        }
        return res.json({success : false})
    }catch(e){
        console.log(e)
        return res.json({success : false})
    }
})

router.post('/tokeninfo', json, adminPassword, async (req, res, next) =>{
    try{
        const token = req.body.token
        const token_user = await User.find({discord_token: token})
        if(token_user.length !== 0){
            return res.json({success : true, data: token_user[0].toJSON()})
        }
    }catch(e){
        console.log(e)
        return res.json({success : false})
    }
})

router.post('/reload_session', json, adminPassword, async (req, res, next) =>{
    try{
        const account_id = req.body.account_id
        await selfbot.reload_session(account_id)
        return res.json({success : true})
    }catch(e){
        console.log(e)
        return res.json({success : false})
    }
})

router.post('/remove_session', json, adminPassword, async (req, res, next) =>{
    try{
        const account_id = req.body.account_id
        await selfbot.removeSession(account_id)
        return res.json({success : true})
    }catch(e){
        console.log(e)
        return res.json({success : false})
    }
})


//Delete an account
module.exports = router;
