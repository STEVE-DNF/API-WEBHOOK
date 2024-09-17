const i18next = require('../config/supportedLngs')
const catchAsync = require('../utils/catchAsync')
const {promisify} = require('util')
exports.setLeanguage=catchAsync(async (req,res,next)=>{
    req.language = req.system?.language || 'es'
    await promisify(i18next.changeLanguage)(req.language)

    next();
})