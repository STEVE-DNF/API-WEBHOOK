const paymentRepository = require('../repositories/orderManagementRepositories/paymentRepository');
const catchAsync = require('../utils/catchAsync')
const resSend = require('../utils/resSend')
const appError= require('../utils/appError')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')
const createResponse = require('./../utils/createResponse')

exports.createPaymentService = async(restaurant,typepayment)=>{
    const payment = await paymentRepository.createPayment({restaurant,typepayment})
    if(!payment) return createResponse({})
    return createResponse({success:true,data:payment})
}

exports.getAllPaymentService = async (restaurant,query)=>{

    let filter = {restaurant}
    const payment = await paymentRepository.getAllPayment(filter,query,"typepayment")
    return createResponse({success:true,data:payment})
}

exports.getPaymentService = async (_id)=>{
    const payment = await paymentRepository.getPayment({_id})
    if(!payment) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:payment})
}

exports.activePaymentService = async(_id)=>{
    const payment = await paymentRepository.activePayment({_id})
    return createResponse({success:true,data:payment})
}
exports.deletePaymentService = async (_id)=>{
    const payment = await paymentRepository.deletePayment({_id})
    return createResponse({success:true,data:payment})

}

exports.getModelPayment=()=>paymentRepository.getModelPayment

