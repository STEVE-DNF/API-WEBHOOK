const userRepository = require('../repositories/systemSessionsRepositories/userRepository');
const createResponse = require('./../utils/createResponse')

exports.registerUserService = async (email ,firtName,lastName , system_id)=>{

  const existUser = await userRepository.getUser({ email: email });
 
  if (existUser) {
    return createResponse({code:'USER_EXISTS'})
  }
  const user = userRepository.getInstance
  
  user.system =system_id,
  user.name = `${firtName} ${lastName}`,
  user.email = email
  
  const password=user.generatePassword()
  const token = user.createPasswordResetToken()

  const userUpdate=await user.save()

  return createResponse({success:true,data:{user:userUpdate , password , token}})
}

exports.updateNameUserService  = async(_id,firtName,lastName)=>{

  const user=await userRepository.updateUser({_id},{name:`${firtName} ${lastName}`})
  return createResponse({success:true,data:user})
}

exports.updateRoleUserService  = async(_id,role)=>{

    if(!(["user","support"].includes(role))){
      return createResponse({code:'ERROR_ROLE'})
    }
    const user=await userRepository.updateUser({_id},{role})
    return createResponse({success:true,data:user})
  }

exports.updatePasswordUserService = async (_id,passwordCurrent,passwordNew,passwordNewConfirm) => {

    const user = await userRepository.getUser({_id},"","+password")
  
    if (!(await user.correctPassword(passwordCurrent, user.password))) {
      return createResponse({code:'CURRENT_PASSWORD_WRONG'})
    }
    user.password = passwordNew;
    user.passwordConfirm = passwordNewConfirm;
    await user.save();
    return createResponse({success:true,data:user})
};


exports.getUserService = async(_id)=>{

  const user=await userRepository.getUser({_id})
  if(!user) return createResponse({})
  return createResponse({success:true,data:user})
}


exports.getAllUserService = async (body,query,popOptions)=>{
  let filter= undefined
  if(body) filter = {...body}
  
  const user=await userRepository.getAllUser(filter,query,popOptions)
  return createResponse({success:true,data:user})
  
}

exports.activeUserService = async(_id)=>{

  const user=await userRepository.ActiveUser({_id})
  return createResponse({success:true,data:user})
}

exports.deleteUserService = async(_id)=>{

  const user=await userRepository.deleteUser({_id})
  return createResponse({success:true,data:user})
}

exports.createUser = async (firtName,lastName,password)=>{

  const user = userRepository.getInstanceConstructor({name:`${firtName} ${lastName}`,email:"admin@gmail.com",password,role:"good"})
  
  await user.save({validateBeforeSave: false })
  return createResponse({success:true,data:user})
}