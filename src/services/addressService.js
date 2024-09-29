const addressRepository = require('../repositories/orderManagementRepositories/addressRepository');
const createResponse = require('./../utils/createResponse')
const apiService = require('./apiService')


exports.createAddressService = async (restaurant,customer,reference,location)=>{

    //Funcion para permitir agregar mas direcciones
    //Aplicar funcion cuando la libreria whatsapp js permita iteraccion con bototnes
    //const addressCount = await addressRepository.countDocuments({customer})
    //if(addressCount >process.env.ADDRESS_MAX) return createResponse({code:'ERROR_ADDRESS_MAX'})
    const addressExist = await addressRepository.getAddress({customer})
    if(addressExist) return createResponse({code:'ADDRESS_EXIST'})
    const address=await addressRepository.createAddress({restaurant,customer,reference,location:{type:"Point",coordinates:location}})
    if(!address) return createResponse({})
    return createResponse({success:true,data:address})
}

const haversineDistance=(lat1, lon1, lat2, lon2)=>{
    console.log(lat1, lon1, lat2, lon2)
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 6371000;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

const checkExistingAddress = async (restaurant_id, customer_id, location) => {
    let inactiveAddress = await addressRepository.getAllAddress({
        restaurant: restaurant_id,
        customer: customer_id,
        active: false
    });
    for(let address of inactiveAddress){
        if (address) {
            const distance = haversineDistance(...location, ...(address.location.coordinates));
            if (distance <= process.env.ADDRESS_DISTANCE) {
    
                await addressRepository.updateAddress(
                    { restaurant:restaurant_id, customer:customer_id, isTemp: true },
                    { isTemp: false, active: false },
                    null,
                    { new: true }
                );
   
                const activeAddress = await addressRepository.getAddress({ restaurant:restaurant_id, customer:customer_id, active: true,isTemp:false,isPending:false });
    
                if (activeAddress) {
                    await addressRepository.updateAddress(
                        { _id: activeAddress._id },
                        { isTemp: true,active: true},
                        null,
                        { new: true }
                    );
                }
                const updatedAddress = await addressRepository.updateAddress(
                    { _id: address._id},
                    { active: true ,isPending:false}
                );
                return createResponse({
                    code: 'ADDRESS_ACTIVATED',
                    placeholder: updatedAddress.reference,
                    success: true
                });
            }
        }
    }
    let activeAddress = await addressRepository.getAllAddress({
        restaurant: restaurant_id,
        customer: customer_id,
        active: true
    });

    let addressFocus;

    for (let address of activeAddress) {
        const distance = haversineDistance(...location, ...(address.location.coordinates));
        if (distance <= process.env.ADDRESS_DISTANCE) {
            
            if(!address.isTemp) return createResponse({
                code: 'ADDRESS_COORDINATE_EXIST',
                placeholder: address.reference
            });

            addressFocus =await addressRepository.updateAddress(
                { _id: address._id },
                { active: true, isTemp: false, isPending: false },
                null,
                { new: true }
            );
            continue; 
        }
        else{
            await addressRepository.updateAddress(
                { _id: address._id }, 
                { isTemp: !address.isTemp},
                null,
                { new: true }
            );
            continue; 
        }
    }
    if (addressFocus) {
        return createResponse({
            success: true,
            data: addressFocus,
            code: 'ADDRESS_ACTIVATED',
            placeholder: addressFocus.reference
        });
    }
    return createResponse({
        code: 'ADDRESS_NOT_FOUND'
    });
};

exports.handleAddressCreation = async (restaurant, customer, location) => {
    await addressRepository.updateAddress(
        { restaurant, customer, active:true,isTemp: false ,isPending: false },
        { active: false},
        null,
        { new: true }
    );
    const addressInfo = await apiService.getStreetMap(...location);
    if (!addressInfo.success) {
        return createResponse({});
    }

    const newAddress = await addressRepository.createAddress({
        restaurant,
        customer,
        reference: addressInfo.data.display_name,
        active: true,
        isPending:true,
        isTemp:false,
        location: { type: "Point", coordinates: location }
    });

    if (!newAddress) {
        return createResponse({});
    }
    return createResponse({ success: true, data: newAddress, code: 'ADDRESS_ADD_SUCCESS' });
};
exports.createTempAddressService = async (restaurant_id, customer_id, location) => {
    const addressCheck = await checkExistingAddress(restaurant_id, customer_id, location);

    if (!addressCheck.success && addressCheck.code !== 'ADDRESS_NOT_FOUND') {
        return createResponse({ success: false, code: addressCheck.code, placeholder: addressCheck.placeholder });
    }

    const addressTemp = await exports.handleAddressCreation(restaurant_id, customer_id, location);

    if (!addressTemp.success) return createResponse({});

    return createResponse({
        success: true,
        data: addressTemp.data,
        code: addressTemp.code,
        placeholder: addressTemp.data.reference
    });
};

exports.updateAddressService = async (restaurant_id, customer_id, location) => {
    const addressCheck = await checkExistingAddress(restaurant_id, customer_id, location);

    if (!addressCheck.success && addressCheck.code === 'ADDRESS_COORDINATE_EXIST') {
        return createResponse({ success: false, code: addressCheck.code, placeholder: addressCheck.placeholder });
    }
    else if(addressCheck.success && addressCheck.code === 'ADDRESS_ACTIVATED'){
        return createResponse({ success: false, code: addressCheck.code, placeholder: addressCheck.placeholder });
    }

    const addressTemp = await exports.handleAddressCreation(restaurant_id, customer_id, location);

    if (!addressTemp.success) return createResponse({});

    return createResponse({
        success: true,
        data: addressTemp.data,
        code: addressTemp.code,
        placeholder: addressTemp.data.reference
    });
};


exports.updateAddressTempConfirmService = async (restaurant_id,customer_id)=>{

    let address=await addressRepository.updateAddress({restaurant:restaurant_id,customer:customer_id,active:true,isPending:true},{isPending:false},null,{new: true})

    if(!address) return createResponse({code:'ADDRESS_NOT_FOUND'})

    return createResponse({success:true,data:address,code:'ADDRESS_ADD_SUCCESS',placeholder:address.reference})
}

exports.updateAddressTempCancelService = async (restaurant_id, customer_id) => {
    

    const addressPending = await addressRepository.updateAddress(
        { restaurant: restaurant_id, customer: customer_id, active: true, isPending: true },
        { isTemp: true, active: true,isPending: false },
        null,{new: true}
    );

    if (!addressPending) return createResponse({ code: 'ADDRESS_CANCEL_SUCCESS' });
    const updatedAddress = await addressRepository.updateAddress(
        { restaurant: restaurant_id, customer: customer_id, active: true, isTemp: true },
        { active: true,isPending: false ,isTemp:false},
        null,{new: true}
    );

    if (!updatedAddress) return createResponse({ code: 'ADDRESS_CANCEL_SUCCESS' });

    return createResponse({
        success: true,
        data: updatedAddress,
        code: 'ADDRESS_CANCEL_SUCCESS',
    });
};

exports.getAllAddressService = async (customer)=>{
    const address = await addressRepository.getAllAddress({customer})
    if(!address) return createResponse({code:'ADDRESS_NOT_ME'})
    return createResponse({success:true,data:address})
}
exports.getAddressService = async (customer)=>{
    const address = await addressRepository.getAddress({customer,active:true})

    if(!address) return createResponse({code:'ADDRESS_NOT_ME'})

    return createResponse({success:true,data:address})
}

exports.getMainAddressService = async (customer)=>{
    const address = await addressRepository.getAddress({customer,active:true,isTemp:false})

    if(!address) return createResponse({code:'ADDRESS_NOT_ME'})

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