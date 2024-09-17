const roomRepository = require('../repositories/systemSessionsRepositories/roomRepository')
const createResponse = require('./../utils/createResponse')


exports.createRoom = async (name,system)=>{
    const room = await roomRepository.createRoom({name,system})
    if(!room) return createResponse({})
    return createResponse({success:true,data:room})
}

exports.getRoomService = async (_id)=>{
    const room = await roomRepository.getRoom({_id})
    if(!room) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:room})
}

exports.getAllRoomService= async (system)=>{
    const room = await roomRepository.getRoom({system},undefined,'_id system name createdAt')
    return createResponse({success:true,data:room})
}

exports.activeRoom = async (_id)=>{
    
    const room = await roomRepository.activateRoom({_id})
    return createResponse({success:true,data:room})
}

exports.deleteRoom = async (_id)=>{
    
    const room = await roomRepository.deleteRoom({_id})
    return createResponse({success:true,data:room})
}