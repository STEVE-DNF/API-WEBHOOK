const customerRepository = require('../repositories/orderManagementRepositories/customerRepository');
const createResponse = require('./../utils/createResponse')

exports.createOrUpdateCustomerService = async (restaurant,code,phone)=>{
    const filter = {restaurant,number:{code,phone}}
    const customer = await customerRepository.getCustomer(filter)

    if(!customer){
        const customerCreate = await customerRepository.createCustomer(filter)

        if(!customerCreate) return createResponse({})

        return createResponse({success:true,data:customerCreate})
    }
    return createResponse({success:true,data:customer})
}
exports.getAllCustomerService = async (restaurant,query)=>{
    const customer=await customerRepository.getAllCustomer({restaurant},query)
    return createResponse({success:true,data:customer})
}

exports.activeCustomerService =async (_id)=>{
    const customer=await customerRepository.activeCustomer({_id})
    return createResponse({success:true,data:customer})
}

exports.deleteCustomerService =async (_id)=>{
    const customer=await customerRepository.deleteCustomer({_id})
    return createResponse({success:true,data:customer})
}