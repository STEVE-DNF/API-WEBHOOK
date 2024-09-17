const roomService = require('../services/roomService');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField');

/*
exports.createRoom = catchAsync(async (req,res,next)=>{
    if (requireField(req.params.id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const data = await roomService.getRoomService({_id:req.params.id})
    
    resSend(res,{statusCode:201,status:"success",data})
})
*/

exports.getRoom = catchAsync(async (req,res,next)=>{

    const {id} = req.params

    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await roomService.getRoomService(id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.getAllRoom = catchAsync(async (req,res,next)=>{

    const {_id} = req.system

    if (requireField(_id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await roomService.getAllRoomService(_id)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
