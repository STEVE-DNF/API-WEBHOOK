const orderService = require('../../services/orderService');
const appError= require('../../utils/appError')
const requireField = require('../../utils/requireField')




exports.getAllOrder = async (socket)=>{

    if(requireField(socket.restaurant)){
        return 'MISSING_REQUIRED_FIELDS'
    } 

    const response=await orderService.getAllOrderService(socket.restaurant)
    
    socket.emit('orderList',{status:"success",data:response.data})
}



