const customerService = require('../../services/customerService')


exports.createOrUpdateCustomer = async (restaurant,code,phone_number)=>{
    const customer=await customerService.createOrUpdateCustomerService({restaurant,code,phone_number})
    return customer
}
exports.getAllCustomer = async (restaurant)=>{
    const customer=await customerService.getAllCustomerService({restaurant})
    return customer
}

exports.activeCustomer =async (_id)=>{
    const customer=await customerService.activeCustomerService({_id})
    return customer
}

exports.deleteCustomer =async (_id)=>{
    const customer=await customerService.deleteCustomerService({_id})
    return customer
}
