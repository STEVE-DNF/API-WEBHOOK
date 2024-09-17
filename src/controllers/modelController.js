const productService = require('../services/productService');
const apiService = require('../services/apiService');
const catchAsync = require('../utils/catchAsync')
const appError = require('./../utils/appError')
const requireField = require('./../utils/requireField')
const resSend = require('../utils/resSend')
const translatorNext = require('../utils/translatorNext')
const { processJsonFile, processExcelFile } = require('../utils/fileProcess');
const uploadSingleFile = require('../utils/fileUploads')


exports.statusModel = catchAsync(async (req,res,next)=>{

    const restaurant_id = req.restaurantId
    
    if (requireField(restaurant_id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await apiService.statusModel(restaurant_id)

    if(!response.success)return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.trainModel = catchAsync(async (req, res, next) => {
    uploadSingleFile(req, res, async (err) => {
        if (err) {
            return next(new appError(err.message, 400));
        }
        const restaurant_id = req.restaurantId;
        if (!restaurant_id) {
            return next(new appError(translatorNext('MISSING_REQUIRED_FIELDS'), 400));
        }

        if (!req.file) {
            return next(new appError(translatorNext('CHECK_FILE_VALID_ERROR'), 400));
        }

        let productos = [];
        let categorias = [];
        let precios = [];
        try {
            if (req.file.mimetype === 'application/json') {
                ({ productos, categorias,precios } = await processJsonFile(req.file.buffer));
            } else if (req.file.mimetype.includes('sheet') || req.file.mimetype.includes('excel')) {
                ({ productos, categorias,precios } = await processExcelFile(req.file.buffer));
            }

            if(productos.length !== categorias.length ){
                return next(new appError(translatorNext('CHECK_PRODUCT'), 400));
            }

        } catch (error) {
            return next(new appError(error.message, 400));
        }

        const response = await apiService.trainModel(restaurant_id, { productos, categorias,precios });
        
        if(!response.success)return next(new appError(translatorNext(req,response.code), 400));

        const responseProducts=await productService.createAllProductService(restaurant_id,response.success)

        if(!responseProducts.success)return next(new appError(translatorNext(req,responseProducts.code), 400));

        resSend(res,{statusCode:201,status:"success",data:responseProducts.data})
    });
});

exports.listContainers = catchAsync(async (req,res,next)=>{
    const response = await apiService.listContainers()

    if(!response.success)return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.startAllContainers = catchAsync(async (req,res,next)=>{
    const response = await apiService.startAllContainers()

    if(!response.success)return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.stopContainer = catchAsync(async (req,res,next)=>{

    const restaurant_id = req.restaurantId
    
    if (requireField(restaurant_id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await apiService.stopContainer(restaurant_id)

    if(!response.success)return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.startContainer = catchAsync(async (req,res,next)=>{

    const restaurant_id = req.restaurantId
    
    if (requireField(restaurant_id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }

    const response = await apiService.startContainer(restaurant_id)

    if(!response.success)return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.createContainer = catchAsync(async (req,res,next)=>{

    const restaurant_id = req.restaurantId
    
    if (requireField(restaurant_id)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const response = await apiService.createContainer(restaurant_id)

    if(!response.success)return next(new appError(translatorNext(req,response.code), 400));
    resSend(res,{statusCode:201,status:"success",data:response.data})
})
