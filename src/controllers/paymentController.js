const paymentService = require('../services/paymentService');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')


exports.createPayment = catchAsync(async (req,res,next)=>{
    const {typepayment} = req.body
    const {restaurant}= req.system

    if (requireField(restaurant,typepayment)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await paymentService.createPaymentService(restaurant,typepayment) 

    resSend(res,{statusCode:201,status:"success",data:response.data})

})

exports.getAllPayment = catchAsync(async (req,res,next)=>{
    const {restaurant} = req.system

    if (requireField(restaurant)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data = await paymentService.getAllPaymentService(restaurant,req.query) 

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getPayment = catchAsync(async (req,res,next)=>{
    const id = req.params.id

    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await paymentService.getPaymentService(id) 
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.activePayment = catchAsync(async(req,res,next)=>{
    const id = req.params.id

    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await paymentService.activePaymentService(id)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
exports.deletePayment = catchAsync(async (req,res,next)=>{

    const id = req.params.id

    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await paymentService.deletePaymentService(id)

    resSend(res,{statusCode:201,status:"success",data:response.data})

})
