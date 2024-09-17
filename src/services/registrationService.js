const restaurantRepository = require('../repositories/orderManagementRepositories/restaurantRepository');
const systemRepository = require('../repositories/systemSessionsRepositories/systemRepository');
const userRepository = require('../repositories/systemSessionsRepositories/userRepository');
const crypto = require('crypto')
const getTimeMinutes = require('./../utils/getTimeMinutes')
const createResponse = require('./../utils/createResponse')
exports.signupClientService = async (restaurantName, userFirtName, userLastName, userGmail) => {


  const existingRestaurant = await restaurantRepository.getRestaurant({ name: restaurantName });
  const existingUser = await userRepository.getUser({ email: userGmail });
  if (existingUser) {
    return createResponse({code:'USER_EXISTS'})
  }
  else if(existingRestaurant){
    return createResponse({code:'RESTAURANT_EXISTS'})
  }
  const restaurant = restaurantRepository.getInstance;
  const user = userRepository.getInstance;

  restaurant.name = restaurantName;
  user.email = userGmail;

  const token = restaurant.createToken();
  const password = user.generatePassword();

  const savedRestaurant = await restaurant.save({ validateBeforeSave: false });

  const system = await systemRepository.createSystem({
    restaurant: savedRestaurant._id,
    name: restaurantName,
  });

  user.system = system._id;
  user.name = `${userFirtName} ${userLastName}`;
  user.role = 'admin';

  const userUpdate = await user.save();
  
  return createResponse({success:true,data:{user:userUpdate,restaurant:savedRestaurant,token,password}})
  
}


exports.resetTokenService = async (userGmail) => {

  const existingUser = await userRepository.getUser({ email: userGmail },"system","email system role");

  if(!existingUser){
    return createResponse({code:'ERROR_USER_NOT_EXIST'})
  }
  else if(existingUser.role === 'user'){
    return createResponse({code:'NO_ACCESS'})
  }
  const existingRestaurant=await restaurantRepository.getRestaurant({_id:existingUser.system.restaurant})

  if(!existingRestaurant){
    return createResponse({code:'RESTAURANT_NOT_FOUND'})
  }
  else if(existingRestaurant.active){
    return createResponse({code:'RESTAURANT_ACTIVE'})
  }
  else if(existingRestaurant?.restaurantVerifyExpires && Date.now() <= existingRestaurant?.restaurantVerifyExpires.getTime()){
    return createResponse({code:'TOKEN_TIME',placeholder:getTimeMinutes(existingRestaurant.restaurantVerifyExpires)})
  }

  const token = existingRestaurant.createToken();
  const password = existingUser.generatePassword();

  await existingRestaurant.save({ validateBeforeSave: false });
  await existingUser.save();

  return createResponse({success:true,data:{user:existingUser,restaurant:existingRestaurant,token,password}})
}


exports.activateRestaurantByVerificationTokenService = async (token) => {

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const restaurant = await restaurantRepository.getRestaurant({
    restaurantVerifyToken: hashedToken,
    restaurantVerifyExpires: { $gt: Date.now() }
  });

  if (!restaurant) {
    return createResponse({code:'RESTAURANT_NOT_FOUND'})
  }

  restaurant.active = true
  restaurant.restaurantVerifyToken=undefined
  restaurant.restaurantVerifyExpires=undefined

  await restaurant.save({ validateBeforeSave: false })

  const system = await systemRepository.updateSystem({restaurant:restaurant._id},{active:true})
  const userUpdate = await userRepository.updateUser({system:system._id},{active:true})

  if(!userUpdate){
    return createResponse({})
  }
  return createResponse({success:true,code:'TOKEN_VERIFIED',data:userUpdate})
}

exports.sendResetTokenErrorService = async(restaurant)=>{
    restaurant.restaurantVerifyToken = undefined;
    restaurant.restaurantVerifyExpires = undefined;
    await restaurant.save({ validateBeforeSave: false });
}