const userRepository = require('../repositories/systemSessionsRepositories/userRepository')
const crypto = require('crypto')
const createResponse = require('./../utils/createResponse')
const translatorNext = require('../utils/translatorNext')
const getTimeMinutes = require('./../utils/getTimeMinutes')


exports.loginService = async (email,password) => {

  const user = await userRepository.getUser({ email },"system","+password");


  if (!user || !(await user.correctPassword(password, user.password))) {
    return createResponse({code:'ERROR_LOGIN_INCORRECT'})
  }
  else if(!user?.system?.active){
    return createResponse({code:'ERROR_ACCESS_SYSTEM'})
  }
  else if(!user.active){
    return createResponse({code:'ERROR_ACCESS_USER'})
  }
  return createResponse({success: true,data: user})
};

exports.forgotPasswordService = async (email) => {

  const user = await userRepository.getUser({email});

  if (!user) {
    return createResponse({code:'ERROR_USER_NOT_EXIST'})
  }
  else if(!user.active){
    return createResponse({code:'ERROR_LOGIN_DESACTIVATED'})
  }
  else if(user?.passwordResetExpires && Date.now() <= user?.passwordResetExpires.getTime()){
    return createResponse({code:'TOKEN_TIME',placeholder:getTimeMinutes(user.passwordResetExpires)})
  }

  const token=user.createPasswordResetToken()
  
  await user.save({validateBeforeSave :false})
  return createResponse({success: true,data: {user,token}})
};


exports.resetPasswordService = async (token,password,passwordConfirm) => {

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await userRepository.getUser({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return createResponse({code:'TOKEN_INVALID_OR_EXPIRED'})
  }
  else if(!user.active){
    return createResponse({code:'ERROR_LOGIN_DESACTIVATED'})
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken=undefined
  user.passwordResetExpires=undefined
  
  const userUpdate=await user.save();

  return createResponse({success: true,data: userUpdate})
};


exports.validateEmailAddressService = async (token) => {



  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const user = await userRepository.getUser({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return createResponse({code:'TOKEN_INVALID_OR_EXPIRED'})
  }

  await userRepository.updateUser({_id:user._id},{
    active:true,
    passwordResetToken:undefined,
    passwordResetExpires:undefined,
  })
  return createResponse({success: true,data: user})
};


exports.sendResetPasswordErrorService = async(user)=>{
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });
}
