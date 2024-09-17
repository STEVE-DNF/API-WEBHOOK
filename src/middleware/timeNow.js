const catchAsync = require("../utils/catchAsync");

exports.timeNow = (req,res,next)=>{
    req.date=Date.now()
    next()
}