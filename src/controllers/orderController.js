const orderService = require('../services/orderService');
const catchAsync = require('../utils/catchAsync')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')
const resSend= require('../utils/resSend')

exports.getAllOrder = catchAsync(async (req,res,next)=>{
    const {restaurant} = req.system
    if(requireField(restaurant)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 

    const response=await orderService.getAllOrderService(restaurant,req.query)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getOrder = catchAsync(async (req,res,next)=>{
    const {restaurant} = req.system
    const {id} = req.params
    if(requireField(restaurant)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 
    const response=await orderService.getOrderService(id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
    const {status } = req.body;
    const {id} = req.params
    
    if (requireField(id,status)) {
        return next(new appError(translatorNext(req, 'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await orderService.createOrderStatusService(id, status);

    if (!response.success) {
        return next(new appError(translatorNext(req, 'ORDER_NOT_FOUND'), 404));
    }

    resSend(res, { statusCode: 200, status: 'success', data: response.data });
});
