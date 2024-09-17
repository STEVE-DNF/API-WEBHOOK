const sessionRepository = require('../repositories/systemSessionsRepositories/sessionRepository')
const ClientObserver = require('../adapters/sockets/clientObserver')
const sessionManager = require('../adapters/sockets/sessionManager')
const createResponse = require('./../utils/createResponse')

exports.createSessionService = async (restaurant,system,room)=>{

    const countSessions= await sessionRepository.countDocumentsSession({room})

    if(countSessions >=process.env.SESSION_LIMIT) return createResponse({code:'ERROR_MAX_SESSION'})

    const sessionInstance = sessionManager()

    const clientObserver =  new ClientObserver(sessionInstance,restaurant,room,system)

    const session = await clientObserver.initialize()

    if(!session) return createResponse({code:'ERROR_SESSION'})

    const checkClient = await sessionInstance.addObserver(clientObserver)
    
    if(!checkClient) return createResponse({code:'ERROR_CHECK_CLIENT'})

    return createResponse({success:true,data:true})
}

exports.reconnectSessionService = async (restaurant,system,room,session)=>{


    const sessionInstance = sessionManager()

    const existSessionManager =await sessionInstance.existSession(room,session._id)

    if(existSessionManager) return createResponse({code:'ERROR_EXIST_SESSION'})

    const clientObserver = await ClientObserver.reconnectsClient(sessionInstance,restaurant,system,room,session)

    if(!clientObserver) return createResponse({code:'ERROR_RECONNECT_CLIENT'})

    const checkClient = await sessionInstance.addObserver(clientObserver)

    if(!checkClient) return createResponse({code:'ERROR_CHECK_CLIENT'})

    return createResponse({success:true,data:session,code:"SESSION_RECONNECT"})
    
}

exports.createSessionNoSavedService  = async (system,room)=>{

    let countSessions = await sessionRepository.countDocumentsSession({room})

    countSessions = countSessions || 0

    if(countSessions >= 4) return undefined

    const session =sessionRepository.getModelConstructor({system,room,active:false})

    return createResponse({success:true,data:session})
}

exports.createAndPersistSessionService  = async (model,number)=>{
    model.number = number
    const session =await model.save()
    return createResponse({success:true,data:session})
}

exports.getSessionService = async (_id)=>{
    const session = await sessionRepository.getSession({_id})
    if(!session) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:session})
}

exports.getAllSessionService = async (room)=>{

    const session = await sessionRepository.getAllSession({room})
    return createResponse({success:true,data:session})
}

exports.activeSessionService  = async (_id)=>{
    
    const session = await sessionRepository.activeSession({_id})
    return createResponse({success:true,data:session})
}

exports.deleteSessionService  = async (_id)=>{
    
    const session = await sessionRepository.deleteSession({_id})
    return createResponse({success:true,data:session})
}


exports.logoutSessionService  = async (room_id,session_id)=>{

    const sessionInstance = sessionManager()
    
    const observedFound = await sessionInstance.removeObserver(room_id,session_id)

    if(!observedFound) return createResponse({code:'ERROR_SESSION_OBSERVED'})

    const destroyVerify = await observedFound.logoutSession()

    if(!destroyVerify) return createResponse({code:'ERROR_SESSION_DESTROY'})

    const session =await sessionRepository.clearSession(session_id)
    
    if(!session) return createResponse({code:'ERROR_SESSION_DESTROY'})

    return createResponse({success:true,data:session,code:"LOGOUT_SESSION"})
}