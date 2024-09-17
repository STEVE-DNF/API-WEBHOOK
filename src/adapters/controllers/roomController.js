const roomService = require('../../services/roomService')
const appError= require('../../utils/appError')
const requireField = require('../../utils/requireField')
const sessionService = require('../../services/sessionService')
const sessionManager = require('../sockets/sessionManager')



exports.getAllSessionRoom = async (socket,room)=>{
    socket.join(String(room))
    if (requireField(room)) {
        return 'MISSING_REQUIRED_FIELDS'
    }
    const sessionInstance = sessionManager()
    
    const sessions = await sessionService.getAllSessionService(room)

    const updateSessions = await sessionInstance.updateAllClients(sessions.data)
    
    socket.emit('sessionList',{status:"success",sessions:updateSessions})
}


exports.getAllRoom = async (socket)=>{
    if (requireField(socket.system)) {
        return 'MISSING_REQUIRED_FIELDS'
    }
    const rooms = await roomService.getAllRoomService(socket.system)
    
    socket.emit('roomList',{status:"success",rooms:rooms.data})
}