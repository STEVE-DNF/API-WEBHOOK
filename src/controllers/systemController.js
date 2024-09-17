const systemService = require('../services/systemService');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext= require('../utils/translatorNext')
const requireField = require('../utils/requireField');

exports.getMe = catchAsync(async(req,res,next)=>{
    req.params.id=req.system._id
    next()
})
  
exports.createSystem =catchAsync(async(req,res,next)=>{

    const {restaurant,name} = req.body

    if(requireField(restaurant,name)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response= await systemService.createSystemService(restaurant,name)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.deleteSystem = catchAsync(async (req,res,next)=>{

    const {id} = req.params

    if(!id){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await systemService.deleteSystemService(id)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.activeSystem = catchAsync(async (req,res,next)=>{

    const {id} = req.params

    if(!id){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await systemService.ActivateSystemService(id)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getSystem = catchAsync(async (req,res,next)=>{

    const {id} = req.params

    if(!id){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await systemService.getSystemService(id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
exports.getAllSystem= catchAsync(async(req,res,next)=>{

    const response = await systemService.getAllSystemService(req.query)

    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.changeName= catchAsync(async(req,res,next)=>{

    const {id} = req.params
    const {name}= req.body

    if(requireField(id,name)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await systemService.changeNameService(id,name)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.changeConfig= catchAsync(async(req,res,next)=>{

    const {id} = req.params
    const {color , language}= req.body

    if(requireField(id,color,language)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await systemService.changeConfigSystemService(id,color,language)
    
    resSend(res,{statusCode:201,status:"success",data:response.data})
})