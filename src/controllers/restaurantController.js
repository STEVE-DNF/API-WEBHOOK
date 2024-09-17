const restaurantService = require('../services/restaurantService');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField');
const { link } = require('../routes/paymentRoute');

exports.getMe = catchAsync(async(req,res,next)=>{
    req.params.id=req.system.restaurant
    next()
  })
  

exports.getRestaurant = catchAsync(async (req,res,next)=>{
    const id = req.params.id
    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await restaurantService.getRestaurantService(id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getAllRestaurant = catchAsync(async (req,res,next)=>{
    const response = await restaurantService.getAllRestaurantService()
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.updateRestaurant = catchAsync(async (req,res,next)=>{

    const {name,currency,language} = req.body
    const restaurant = req.system.restaurant

    if (requireField(restaurant)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await restaurantService.updateRestaurantService(restaurant,name,currency,language)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
exports.deleteRestaurant = catchAsync(async (req,res,next)=>{

    const id = req.params.id
    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await restaurantService.deleteRestaurantService(id)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.activeRestaurant = catchAsync(async (req,res,next)=>{

    const id = req.params.id
    if (requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await restaurantService.ActiveRestaurantService(id)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.getAllMenuRestaurant = catchAsync(async (req,res,next)=>{
    const {restaurant} = req.system

    if (requireField(restaurant)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await restaurantService.getAllMenuRestaurantService(restaurant)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.updateMenuRestaurant = catchAsync(async (req,res,next)=>{

    const {restaurant} = req.system
    const {link,title} = req.body
    const menuId = req.params.menuId

    if (requireField(restaurant,link,title,menuId)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await restaurantService.updateMenuRestaurantService(restaurant,menuId,link,title)

    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.deleteMenuRestaurant = catchAsync(async (req,res,next)=>{

    const {restaurant} = req.system
    const menuId = req.params.menuId

    if (requireField(restaurant,menuId)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await restaurantService.deleteMenuRestaurantService(restaurant,menuId)
    
    if(!response.success){
        return next(new appError(translatorNext(req,response.code), 400))
    }
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.createMenuRestaurant = catchAsync(async (req,res,next)=>{

    const {restaurant} = req.system
    const {link,title} = req.body

    if (requireField(restaurant,link,title)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await restaurantService.createMenuRestaurantService(restaurant,link,title)
    
    if(!response.success){
        return next(new appError(translatorNext(req,response.code), 400))
    }

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.createOrUpdteAddress = catchAsync(async(req,res,next)=>{

    const {restaurant} = req.system
    const {name,reference,lat,long} = req.body

    if (requireField(restaurant,name,reference,lat,long)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await restaurantService.createOrUpdateAddressService(restaurant,name,reference,lat,long)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.updateName = catchAsync(async(req,res,next)=>{

    const {restaurant} = req.system
    const {name} = req.body

    if (requireField(restaurant,name)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await restaurantService.updateNameService(restaurant,name)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})



