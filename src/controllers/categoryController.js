const categoryService = require('../services/categoryService')
const catchAsync = require('../utils/catchAsync')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('./../utils/requireField')
const resSend= require('../utils/resSend')

exports.createCategory = catchAsync(async (req,res,next)=>{

    const {name,description} = req.body


    const {restaurant}= req.system
    if(requireField(restaurant,name,description)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data=await categoryService.createCategoryService(restaurant,name,description)

    resSend(res,{statusCode:201,status:"success",data})
})

exports.updateCategory = catchAsync(async (req,res,next)=>{
    const id = req.params.id
    const {name,description} = req.body
    if(requireField(id,name,description)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data=await categoryService.updateCategoryService(id,name,description)

    resSend(res,{statusCode:201,status:"success",data})
})

exports.getCategory = catchAsync(async (req,res,next)=>{
    const id = req.params.id

    if(requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data=await categoryService.getCategoryService(id)

    if(!data.success) return next(new appError(translatorNext(req,data.code), 400));
    resSend(res,{statusCode:201,status:"success",data})
})

exports.getAllCategory = catchAsync(async (req,res,next)=>{

    const {restaurant}= req.system


    if (requireField(restaurant)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data=await categoryService.getAllCategoryService(restaurant,req.query)
    resSend(res,{statusCode:201,status:"success",data})
})

exports.activeCategory = catchAsync(async (req,res,next)=>{
    const id = req.params.id
    
    if(requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data=await categoryService.activeCategoryService(id)
    resSend(res,{statusCode:201,status:"success",data})
})

exports.deleteCategory = catchAsync(async (req,res,next)=>{
    const id = req.params.id

    if(requireField(id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const data=await categoryService.deleteCategoryService(id)
    resSend(res,{statusCode:201,status:"success",data})

})
