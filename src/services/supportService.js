const supportRepository = require('../repositories/orderManagementRepositories/supportRepository')
const createResponse = require('./../utils/createResponse')

exports.createSupportService=async(restaurant,customer,order,description)=>{
    const support = await supportRepository.createSupport({restaurant,customer,order,description})
    if(!support) return createResponse({})
    return createResponse({success:true,data:support})
}
exports.getSupportService=async(_id)=>{
    const support = await supportRepository.getSupport({_id})
    if(!support) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:support})
}
exports.getAllSupportService=async(restaurant,query)=>{
    const support = await supportRepository.getAllSupport({restaurant},query)
    return createResponse({success:true,data:support})
}
exports.updateProgressSupport=async(_id,support_id)=>{
    const support = await supportRepository.updateSupport({_id},{support:support_id,status:'In Progress'})
    return createResponse({success:true,data:support})
}
exports.updateResolvedSupport=async(_id)=>{
    const support = await supportRepository.updateSupport({_id},{status:'Resolved'})
    return createResponse({success:true,data:support})
}
