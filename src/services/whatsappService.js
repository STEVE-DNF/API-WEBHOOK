const scheduleService = require('./scheduleService') 
const customerService = require('./customerService') 
const orderService = require('./orderService') 
const AppError = require('../utils/appError')
const getDayOfWeek = require('../utils/getDayOfWeek')
const checkTimeValidity = require('../utils/checkTimeValidity')
const createResponse = require('./../utils/createResponse')

exports.checkScheduleState = async (restaurant,ready,active,lngOption) => {
    const dayOfWeek = getDayOfWeek();
    const timetable = await scheduleService.getScheduleService(restaurant, dayOfWeek);
    
    const {startHour,startMinute} = timetable[0].start_time
    const {endHour,endMinute} = timetable[0].end_time

    if (!timetable.active) throw new AppError('ERROR_TIMETABLE_DESACTIVATE',400)
    if (!ready || !active) throw new AppError('ERROR_READY_OR_ACTIVE',400)
    if(!checkTimeValidity(startHour,startMinute,endHour,endMinute)) throw new AppError('ERROR_TIMETABLE_CLOSE',400)
    
    return createResponse({success:true,data:true})
}

exports.createCustomer = async (restaurant,code,phone,lngOption) => {
  
  const customer = await customerService.createOrUpdateCustomerService(restaurant,code,phone)
  if (!customer) throw new AppError('ERROR_CREATE_CUSTOMER',400)
  return createResponse({success:true,data:customer.data})
}

exports.existOrder = async (customer,lngOption) => {
  
  const order = await orderService.getOrderPendingService(customer)
  return createResponse({success:true,data:order.data})
}

exports.createOrder = async(restaurant,customer)=>{

  const order = await orderService.createOrderService(restaurant,customer)
  return createResponse({success:true,data:order})
}