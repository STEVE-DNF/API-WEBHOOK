const addressRepository = require('../repositories/orderManagementRepositories/addressRepository');
const createResponse = require('./../utils/createResponse')

exports.createAddressService = async (restaurant,customer,reference,location)=>{

    const addressCount = await addressRepository.countDocuments({customer})

    if(addressCount >5) return createResponse({code:'ERROR_ADDRESS_MAX'})

    const address=await addressRepository.createAddress({restaurant,customer,reference,location:{type:"Point",coordinates:location}})
    if(!address) return createResponse({})
    return createResponse({success:true,data:address})
}
exports.updateAddressService = async (_id,name,reference,lat,lon)=>{

    const address=await addressRepository.updateAddress({_id},{address:{name,reference,lat,lon}})
    return createResponse({success:true,data:address})
}
exports.getAllAddressService = async (customer)=>{
    const address = await addressRepository.getAllAddress({customer})
    if(!address) return createResponse({code:'ADDRESS_NOT_ME'})
    return createResponse({success:true,data:address})
}
exports.getAddressService = async (customer)=>{
    const address = await addressRepository.getAddress({customer})
    return createResponse({success:true,data:address})
}
exports.selectAddressService = async (customer,_id)=>{

    const addresses=await addressRepository.getAllAddress({customer})

    Promise.all(addresses.map((address)=>{
        if(String(address._id) === String(_id)) address.isDefault = true
        else address.isDefault = false
        return address.save()
    }))
    return createResponse({success:true})
}
exports.activeAddressService = async (_id)=>{

    const address=await addressRepository.activeAddress({_id})
    return createResponse({success:true,data:address})
}
exports.deleteAddressService = async (_id)=>{

    const address=await addressRepository.deleteAddress({_id})
    return createResponse({success:true,data:address})
}