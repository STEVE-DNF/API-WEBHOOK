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

exports.updateCustomerContext = async (_id, context) => {
    const validContexts = ['order_context', 'address_add_context', 'address_update_context','normal_context'];

    if (!validContexts.includes(context)) {
        return createResponse({ success: false, code: 'USER_UPDATE' });
    }
    const customer = await customerRepository.updateCustomer(
        { _id },
        { context },
        null,
        { new: true }
    );

    if (!customer) {
        return createResponse({code: 'USER_UPDATE'});
    }

    return createResponse({ success: true, data: customer });
};

exports.setOrderContext = async (_id) => {
    return await exports.updateCustomerContext(_id, 'order_context');
};
exports.setAddressAddContext = async (_id) => {
    return await exports.updateCustomerContext(_id, 'address_add_context');
};
exports.setAddressUpdateContext = async (_id) => {
    return await exports.updateCustomerContext(_id, 'address_update_context');
};
exports.setNormalUpdateContext = async (_id) => {
    return await exports.updateCustomerContext(_id, 'normal_context');
};


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