const nodemailer = require('nodemailer');
const replaceHtml = require('../utils/replaceMessage')
const translatorNext=require('./translatorNext')
const fs = require('fs').promises
const sendEmail = async options => {

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  let htmlContent =await fs.readFile('./views/message.html','utf-8')
  
  htmlContent=replaceHtml(htmlContent,{
    tittle: translatorNext(options.req,options.typeTemplate===1?"PASSWORD_RESET_TITLE":"MESSAGE_VERIFICATION_TITLE"),
    message01: translatorNext(options.req,options.typeTemplate===1?"PASSWORD_RESET_CONTENT_01":"MESSAGE_VERIFICATION_CONTENT_01"),
    password: options.passwordTemp,
    message02: translatorNext(options.req,options.typeTemplate===1?"PASSWORD_RESET_CONTENT_02":"MESSAGE_VERIFICATION_CONTENT_02"),
    urlName: translatorNext(options.req,options.typeTemplate===1?"PASSWORD_RESET_BUTTON_TEXT":"MESSAGE_VERIFICATION_BUTTON_TEXT"),
    url: options.url,
    messagenot: translatorNext(options.req,options.typeTemplate===1?"PASSWORD_RESET_NOTE":"MESSAGE_VERIFICATION_NOTE"),
  })



  const mailOptions = {
    from: 'Jonas Schmedtmann <steve@dev.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html:htmlContent
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
