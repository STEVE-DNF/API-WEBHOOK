const sessionService = require('../services/sessionService');
const catchAsync = require('../utils/catchAsync')
const appError = require('./../utils/appError')
const requireField = require('./../utils/requireField')
const resSend = require('../utils/resSend')
const translatorNext = require('../utils/translatorNext')



exports.createSession = catchAsync(async (req,res,next)=>{

    const system = req.system._id
    const restaurant = req.restaurantId
    const {idRoom} = req.params

    if (requireField(system,idRoom,restaurant)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const session = await sessionService.createSessionService(restaurant,system,idRoom)
    
    if(!session.success){
        return next(new appError(translatorNext(req,session.code), 400));
    }
    resSend(res,{statusCode:201,status:"success",data:"create session"})
})



exports.reconnectSession = catchAsync(async (req,res,next)=>{
    const system = req.system._id
    const restaurant = req.restaurantId
    const {idRoom,idSession} = req.params

    if (requireField(restaurant,system,idRoom,idSession)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const existSession =await sessionService.getSessionService(idSession)
    if(!existSession.success) return next(new appError(translatorNext(req,'ERROR_NOT_EXIST_SESSION'), 400));

    const session = await sessionService.reconnectSessionService(restaurant,system,idRoom,existSession.data)
    if(!session.success){
        return next(new appError(translatorNext(req,session.code), 400));
    }
    resSend(res,{statusCode:201,status:"success",data:session.code})
})


exports.reconnectAllSession = catchAsync(async (req,res,next)=>{
    
    const system = req.system._id
    const {idRoom} = req.params
    const errorSessionPromise = []

    if (requireField(system,idRoom)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    
    const sessions = await sessionService.getAllSessionService(idRoom)

    const sessionsPromise = sessions.map(async (session, _, __) => {

        const idSession = session._id
        const {code,phone} = session.number
        let bandDeleteService = false

        try {
            const sessionResult = await sessionService.reconnectSessionService(system, idRoom, session);
            
            if(typeof sessionResult === 'string'){

                if(!(sessionResult === 'ERROR_EXIST_SESSION')) bandDeleteService = true

                errorSessionPromise.push({ success: false, message: translatorNext(req,sessionResult),code:400, session:idSession,number:`+${code} ${phone}` });

            }
        } catch (err) {

            bandDeleteService = true

            errorSessionPromise.push({ success: false, message: translatorNext(req,'ERROR_SESSION'),code:400, session:idSession,number:`+${code} ${phone}` });
        }

        if(bandDeleteService){
            await sessionService.deleteSessionService(idSession)
        }
        else{
            await sessionService.activeSessionService(idSession)
        }
    });

    await Promise.all(sessionsPromise);

   
    if(errorSessionPromise.length >0) return resSend(res,{statusCode:400,status:"fail",error:errorSessionPromise})

    return resSend(res,{statusCode:201,status:"success",message:translatorNext(req,'SUCCESS_SESSION')})
})


exports.getSession = catchAsync(async (req,res,next)=>{
    if (requireField(req.params.idSession)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const session = await sessionService.getSessionService(req.params.idSession)
    if(!session.success) return next(new appError(translatorNext(req,session.code), 400));
    resSend(res,{statusCode:201,status:"success",data:session.data})
})


exports.activeSession = catchAsync(async (req,res,next)=>{
    const {idSession} = req.params
    if (requireField(idSession)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const session = await sessionService.activeSessionService(idSession)
    
    resSend(res,{statusCode:201,status:"success",data:session.data})
})

exports.deleteSession = catchAsync(async (req,res,next)=>{
    
    const {idSession} = req.params
    if (requireField(idSession)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const session = await sessionService.deleteSessionService(idSession)
    
    resSend(res,{statusCode:201,status:"success",data:session.data})
})


exports.logoutSession = catchAsync(async (req,res,next)=>{

    const {idRoom,idSession} = req.params

    if (requireField(idRoom,idSession)) {
        return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
    }
    const session = await sessionService.logoutSessionService(idRoom,idSession)
    if(!session.success) return next(new appError(translatorNext(req,session.code), 400));
    
    resSend(res,{statusCode:201,status:"success",message:session.code})
})