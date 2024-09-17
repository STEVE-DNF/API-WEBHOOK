const typePaymentService = require('../services/typePaymentService');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')

exports.createTypePayment = catchAsync(async (req,res,next)=>{
    const {methodEs,methodEn} = req.body
    if (requireField(methodEs,methodEn)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await typePaymentService.createTypePaymentService(methodEs,methodEn)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.updateTypePayment = catchAsync(async (req,res,next)=>{
    const {id} = req.params
    const {methodEs,methodEn} = req.body

    if (requireField(id,methodEs,methodEn)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await typePaymentService.updateTypePaymentService(id,methodEs,methodEn)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.getAllTypePayment = catchAsync(async (req,res,next)=>{
    const response = await typePaymentService.getAllTypePaymentService()
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getTypePayment = catchAsync(async (req,res,next)=>{

    if (requireField(req.params.id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await typePaymentService.getTypePaymentService(req.params.id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.activeTypePayment = catchAsync(async(req,res,next)=>{
    if (requireField(req.params.id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await typePaymentService.activeTypePaymentService(req.params.id)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
exports.deleteTypePayment = catchAsync(async (req,res,next)=>{

    if (requireField(req.params.id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await typePaymentService.deleteTypePaymentService(req.params.id)
    resSend(res,{statusCode:201,status:"success",data:response.data})

})
