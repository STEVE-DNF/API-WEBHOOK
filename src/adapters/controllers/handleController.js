const ClientObserver = require('../sockets/clientObserver')
const userRepository = require('../../repositories/systemSessionsRepositories/userRepository')
const systemService = require('../../services/systemService')
const util = require('util');
const promisify = util.promisify;
const jwt = require('jsonwebtoken')
const appError= require('../../utils/appError')
const translatorNextIO = require('../../utils/translatorNextIO')

exports.clientAuth= async (socket) => {
    const {token}=socket.handshake.query

    if (!token) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_NOT_TOKEN'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const currentUser = await userRepository.getUser({_id:decoded.id},'system');
    if (!currentUser) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_USER_NOT_EXIST'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_PASSWORD_CHANGE'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    if(currentUser.role !== "admin"){
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_DENIED_ACCESS'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    
    console.log(currentUser)

    const system = await systemService.getSystemService(currentUser.user.system)

    if(!system.active){
        socket.emit('clientError',translatorNextIO('ERROR_MAX_SESSION'))
        socket.disconnect()
    }

    socket.system = currentUser.system;
    socket.restaurant= currentUser.system.restaurant
}

exports.clientInitialize =async(socket,sessionManager)=>{
    

    const clientObserver =  new ClientObserver(sessionManager,socket)

    const session = await clientObserver.initialize()

    if(!session) throw new appError(translatorNextIO('ERROR_MAX_SESSION'),400)

    const checkClient = await sessionManager.addObserver(clientObserver)
    
    if(!checkClient) throw new appError(translatorNextIO('ERROR_CHECK_CLIENT'),400)

    return true
}
