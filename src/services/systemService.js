
const systemRepository = require('../repositories/systemSessionsRepositories/systemRepository');
const userRepository = require('../repositories/systemSessionsRepositories/userRepository');
const createResponse = require('./../utils/createResponse')

exports.createSystemService =async(restaurant,name)=>{

    const system= await systemRepository.createSystem({restaurant,name})
    if(!system) return createResponse({})
    return createResponse({success:true,data:system})
}

exports.deleteSystemService = async (_id)=>{

    const system = await systemRepository.deleteSystem(_id)

    const users = await userRepository.getAllUser({system:system._id})

    const deleteUsers = Object.entries(users).map(([_,user])=>{
        return userRepository.ActiveUser(user._id)
    })

    await Promise.all(deleteUsers)
    return createResponse({success:true,data:system})
}
exports.ActivateSystemService = async (_id)=>{

    const system = await systemRepository.ActiveSystem(_id)


    const user = await userRepository.getAllUser({system:system._id,role:"admin"})

    await userRepository.ActiveUser(user._id)
    return createResponse({success:true,data:system})
}
exports.getSystemService = async (_id,selectOptions , popOptions)=>{

    const system = await systemRepository.getSystem({_id},selectOptions,popOptions)
    if(!system) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:system})
}
exports.getAllSystemService= async(query,popOptions)=>{
    const system = await systemRepository.getAllSystem({},query,popOptions)
    return createResponse({success:true,data:system})
}

exports.changeNameService= async(_id,name)=>{
    const system = await systemRepository.updateSystem({_id},{name})
    return createResponse({success:true,data:system})
}

exports.changeConfigSystemService= async(_id,color,language)=>{
    const system = await systemRepository.updateSystem({_id},{color,language})
    return createResponse({success:true,data:system})
}