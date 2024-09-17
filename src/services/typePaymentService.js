const typePaymentRepository = require('../repositories/orderManagementRepositories/typePaymentRepository')


exports.createTypePaymentService=async(methodEs,methodEn)=>{
    const typePayment = await typePaymentRepository.createTypePayment({method:{es:methodEs,en:methodEn}})
    if(!typePayment) return createResponse({})
    return createResponse({success:true,data:typePayment})
}
exports.updateTypePaymentService=async(_id,methodEs,methodEn)=>{
    const typePayment = await typePaymentRepository.updateTypePayment({_id},{method:{es:methodEs,en:methodEn}})
    return createResponse({success:true,data:typePayment})
}
exports.getTypePaymentService=async(_id)=>{
    const typePayment = await typePaymentRepository.getTypePayment({_id})
    if(!typePayment) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:typePayment})
}
exports.getAllTypePaymentService=async()=>{
    const typePayment = await typePaymentRepository.getAllTypePayment()
    return createResponse({success:true,data:typePayment})
}
exports.activeTypePaymentService=async(_id)=>{
    const typePayment = await typePaymentRepository.activeTypePayment({_id})
    return createResponse({success:true,data:typePayment})
}
exports.deleteTypePaymentService=async(_id)=>{
    const typePayment = await typePaymentRepository.deleteTypePayment({_id})
    return createResponse({success:true,data:typePayment})
}