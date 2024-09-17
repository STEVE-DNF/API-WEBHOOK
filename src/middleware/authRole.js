const catchAsync = require("../utils/catchAsync");
const appError = require('../utils/appError')
const translatorNext = require('../utils/translatorNext')

exports.authRole = function(...roles){
    return catchAsync(async (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new appError(translatorNext(req,'ERROR_DENIED_ACCESS')))
        }
        next()
    })
}
