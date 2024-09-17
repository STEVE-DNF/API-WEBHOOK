const productService = require('../services/productService');
const catchAsync = require('../utils/catchAsync')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')
const resSend= require('../utils/resSend')

exports.createProduct = catchAsync(async (req,res,next)=>{

    const {category,name,description,price} = req.body
    const {restaurant} = req.system
    if(requireField(restaurant,category,name,price)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 

    const response=await productService.createProductService(restaurant,category,name,description,price)
    if(!response.success){
        return next(new appError(translatorNext(req,response.code,{name:"Category"}),400))
    }
    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.updateProduct = catchAsync(async (req,res,next)=>{

    const id = req.params.id
    const {category,name,description,price,max_quantity,isOutOfStock} = req.body

    if(requireField(id)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 
    const response=await productService.updateProductService(id,category,name,description,price,max_quantity,isOutOfStock)
    
    if(!response.success){
        return next(new appError(translatorNext(req,response.code,{name:"Category"}),400))
    }

    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getProduct = catchAsync(async (req,res,next)=>{
    const id = req.params.id

    if(requireField(id)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 
    const response=await productService.getProductService(id)
    if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.getAllProduct = catchAsync(async (req,res,next)=>{

    const {restaurant} = req.system
    if (requireField(restaurant)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response=await productService.getAllProductService(restaurant,req.query)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.activeProduct = catchAsync(async (req,res,next)=>{
    const id = req.params.id

    if(requireField(id)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 
    const response=await productService.activeProductService(id)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.deleteProduct = catchAsync(async (req,res,next)=>{
    const id = req.params.id

    if(requireField(id)){
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
    } 
    const response=await productService.deleteProductService(id)
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
