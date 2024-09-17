const restaurantRepository = require('../repositories/orderManagementRepositories/restaurantRepository');
const createResponse = require('./../utils/createResponse')

exports.getRestaurantService = async (_id)=>{

    const restaurant = await restaurantRepository.getRestaurant({_id})
    if(!restaurant) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:restaurant})
}

exports.getAllRestaurantService = async (filter)=>{
    const restaurant = await restaurantRepository.getAllRestaurant(filter)
    return createResponse({success:true,data:restaurant})
}

exports.updateRestaurantService = async (_id,name,currency,language,address)=>{
    const restaurant = await restaurantRepository.updateRestaurant({_id},{name,currency,language,address})
    return createResponse({success:true,data:restaurant})
}

exports.deleteRestaurantService = async (_id)=>{

    const restaurant = await restaurantRepository.deleteRestaurant(_id)
    return createResponse({success:true,data:restaurant})
}
exports.ActiveRestaurantService = async (_id)=>{
    const restaurant = await restaurantRepository.ActiveRestaurant(_id)
    return createResponse({success:true,data:restaurant})
}

exports.getAllMenuRestaurantService = async (_id)=>{

    const restaurant = await restaurantRepository.getRestaurant({_id},"","menus -active -_id")
    return createResponse({success:true,data:restaurant.menus})
}

exports.updateMenuRestaurantService = async (_id,menu_id,link,title)=>{

    const newMenu =  {
        'menus.$.link': link,
        'menus.$.title': title
      }
    const restaurant = await restaurantRepository.updateRestaurant({_id,'menus._id':menu_id},{$set:newMenu},"menus")
    return createResponse({success:true,data:restaurant.menus})
}

exports.deleteMenuRestaurantService = async (_id,menu_id)=>{

    const countMenus = (await restaurantRepository.getCountArray("_id",_id,"menus"))[0].count

    if(countMenus <= 1){
        return createResponse({code:'ERROR_COUNT_MIN_MENU'})
    }
    const restaurant = await restaurantRepository.updateRestaurant({_id},{$pull:{menus:{_id:menu_id}}},"menus")
    
    return restaurant.menus
}

exports.createMenuRestaurantService = async (_id,link,title)=>{

    let countMenus = (await restaurantRepository.getCountArray(_id,"menus"))[0]?.count

    if(!countMenus) countMenus = 0

    if(countMenus >= 6){
        return createResponse({code:'ERROR_COUNT_MAX_MENU'})
    }

    const newMenu =  {link,title}

    const restaurant = await restaurantRepository.updateRestaurant({_id},{$push:{menus:newMenu}},"menus")
    return createResponse({success:true,data:restaurant.menus})
}


exports.createOrUpdateAddressService = async (_id,name,reference,lat,lon)=>{

    const restaurant = await restaurantRepository.updateRestaurant({_id},{address:{name,reference,lat,lon}},"address")
    if(!restaurant) return createResponse({})
    return createResponse({success:true,data:restaurant.address})
}

exports.updateNameService = async (_id,name)=>{

    const restaurant = await restaurantRepository.updateRestaurant({_id},{name},"name")
    return createResponse({success:true,data:restaurant})
}
exports.getAddressService = async (_id)=>{

    const restaurant = await restaurantRepository.getRestaurant({_id},undefined,"address")
    if(!restaurant) createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:restaurant})
}

exports.getProductMinMaxService = async (_id)=>{

    const restaurant = await restaurantRepository.getRestaurant({_id},undefined)
    return createResponse({success:true,data:restaurant.product_limits})
}







