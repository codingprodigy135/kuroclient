const express = require('express')
const csrf_ = require('csurf')
const csrf = csrf_({ cookie: true })
const json = express.json({limit: "1mb"})


module.exports = {
    csrf,
    json
 }