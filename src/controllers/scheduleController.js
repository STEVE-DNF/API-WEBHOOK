const scheduleService = require('../services/scheduleService');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')

exports.getMe = catchAsync(async(req,res,next)=>{
    req.params.id=req.system.restaurant
    next()
})


exports.updateSchedule= catchAsync(async(req,res,next)=>{

    const id = req.params.id
    const {hourStart,minStart,hourEnd,minEnd} = req.body

    if (requireField(id,hourStart,minStart,hourEnd,minEnd)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await scheduleService.updateScheduleService(id,hourStart,minStart,hourEnd,minEnd)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getAllSchedule= catchAsync(async(req,res,next)=>{
    const id = req.params.id
    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await scheduleService.getAllScheduleService(id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.activeSchedule= catchAsync(async(req,res,next)=>{

    const id = req.params.id
    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await scheduleService.activeScheduleService(id)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
exports.deleteSchedule = catchAsync(async (req,res,next)=>{
    
    const id = req.params.id
    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await scheduleService.deleteScheduleService(id)
    resSend(res,{statusCode:201,status:"success",data:response.data})

})
