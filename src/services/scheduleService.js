const scheduleRepository = require('../repositories/orderManagementRepositories/scheduleRepository');
const dayRepository = require('../repositories/orderManagementRepositories/dayRepository');
const createResponse = require('./../utils/createResponse')
exports.updateScheduleService= async(_id,hourStart,minStart,hourEnd,minEnd)=>{

    const start_time = {hour:hourStart,minute:minStart}
    const end_time = {hour:hourEnd,minute:minEnd}

    const schedule =await scheduleRepository.updateSchedule({_id},{start_time,end_time})

    return createResponse({success:true,data:schedule})
}

exports.getAllScheduleService= async(restaurant)=>{

    const schedule = await scheduleRepository.getAllSchedule({restaurant},undefined,"day")
    if(!schedule) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:schedule})
}

exports.getScheduleService= async(restaurant,numDay)=>{

    const day = await dayRepository.getDay({numDay},undefined,'_id')

    const schedule = await scheduleRepository.getAllSchedule({restaurant,day},undefined,"day")

    return createResponse({success:true,data:schedule})
}


exports.activeScheduleService= async(_id)=>{

    const schedule = await scheduleRepository.activeSchedule({_id})
    return createResponse({success:true,data:schedule})
}
exports.deleteScheduleService = async ()=>{
    const schedule = await scheduleRepository.deleteSchedule({_id})
    return createResponse({success:true,data:schedule})
}
