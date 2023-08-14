require('dotenv').config({path: './../.env'});
var ejs = require('ejs');
var path = require('path');
const moment = require('moment');
var geoip = require('fast-geoip');
var nodemailer = require('nodemailer');

const EMAIL = process.env.CONTACT_EMAIL
const PASSWORD = process.env.NAMECHEAP_PRIVATEMAIL_PASSWORD
const CONTACT_EMAIL = process.env.CONTACT_EMAIL

var transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  auth: {
      user: EMAIL,
      pass: PASSWORD
  }
});

//This shouldnt work but does
async function changePasswordNotifyEmail(email, data){
    try{

        const ip = data.ip
        const geo = await geoip.lookup(data.ip);
        location = ``
        if(geo){
            location = `${geo.city}, ${geo.region}`
        }
        const time = moment().format('MMMM Do YYYY, h:mm:ss a')
        const html = await ejs.renderFile(path.join(__dirname, 'changed-password.ejs'), { ip: ip, time: time, location: location })
        var mailOptions = {
          from: CONTACT_EMAIL,
          to: email,
          subject: 'You changed your password',
          html: html
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
          } else {
              return true
          }
        });
    }catch(e){
      console.log(e)
      return false
    }
}
async function sendChangePasswordEmail(email, subject, content){
    try{
        var mailOptions = {
          from: CONTACT_EMAIL,
          to: email,
          subject: subject,
          text: content
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
          } else {
              return true
          }
        });
    }catch(e){
      console.log(e)
      return false
    }
}

async function sendVerifyEmail(email, link){
    try{
        var mailOptions = {
          from: CONTACT_EMAIL,
          to: email,
          subject: 'Verify your email',
          text: `Click here to verify your email\n${link}`
        };
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
              return false
          } else {
              return true
          }
        });
    }catch(e){
      console.log(e)
      return false
    }
}


module.exports = {
  sendChangePasswordEmail,
  changePasswordNotifyEmail,
  sendVerifyEmail
}
