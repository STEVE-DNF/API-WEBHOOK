const userService = require('../services/userService');
const authService = require('../services/authService');
const catchAsync = require('../utils/catchAsync')
const appError = require('./../utils/appError')
const sendEmail = require('./../utils/sendEmail')
const resSend = require('../utils/resSend')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')
const resetUrl = require('../utils/resetUrl');
const { error } = require('qrcode-terminal');



exports.getMe = catchAsync(async(req,res,next)=>{
  req.params.id=req.user._id
  req.system_id=req.system._id
  next()
})

exports.register = catchAsync(async (req,res,next)=>{

  const _id=req.system._id
  const {email ,firtName,lastName} = req.body

  if(requireField(email,firtName,lastName,_id)){
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
  }
  const userObject = await userService.registerUserService(email ,firtName,lastName,_id);
 
  if(!userObject.success||requireField(userObject.data.user,userObject.data.token,userObject.data.password)){
    return next(new appError(translatorNext(req,userObject.code),400))
  }

  const user = userObject.data.user
  const token = userObject.data.token
  const password = userObject.data.password

  const message = "ignore"
  try {
    
    await sendEmail({
      email: user.email,
      subject: translatorNext(req,'RESET_TOKEN_EMAIL_SUBJECT'),
      message,
      url:resetUrl(req,`auth/verification/${token}`),
      req,
      passwordTemp:password,
      typeTemplate:2
    });

    let tokenVerify = userObject.data.token

    if(process.env.NODE_ENV !== 'development') tokenVerify = undefined

    return res.status(200).json({
      status: 'success',
      message: translatorNext(req,'TOKEN_SENT_SUCCESS'),
      tokenVerify
    });
  }catch (err) {
    
    console.log(err)
    await authService.sendResetPasswordErrorService(user)

    return next(
      new appError(translatorNext(req,'EMAIL_SEND_ERROR')),
      500
    );
  }
})

exports.getUser = catchAsync(async(req,res,next)=>{

  let _id = req.params.id

  const response=await userService.getUserService(_id)
  if(!response.success) return next(new appError(translatorNext(req,response.code), 400));
  resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.getAllUser = catchAsync(async (req,res,next)=>{

  let filter = {system:req.system_id,...req.body}

  if(!req.system_id) delete filter.system

  const response=await userService.getAllUserService(filter,req.query)
  resSend(res,{statusCode:201,status:"success",data:response.data})
  
})

exports.activeUser = catchAsync(async(req,res,next)=>{

  let _id = req.params.id

  if(!_id){
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
  }

  const response=await userService.activeUserService(_id)
  resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.deleteUser = catchAsync(async(req,res,next)=>{
  let _id = req.params.id
  if(!_id){
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
  }
  const response=await userService.deleteUserService(_id)
  resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.updatePasswordUser = catchAsync(async (req, res, next) => {

  let _id = req.params.id

  const { passwordCurrent,passwordNew,passwordNewConfirm } = req.body;

  if (requireField(_id,passwordCurrent,passwordNew,passwordNewConfirm)) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }
  const response = await userService.updatePasswordUserService(_id,passwordCurrent,passwordNew,passwordNewConfirm)

  if(!response.success) return next(new appError(translatorNext(req,response.code), 400));

  resSend(res,{statusCode:201,status:"success",data:response.data})
});

exports.updateNameUser = catchAsync(async(req,res,next)=>{
  let _id = req.params.id
  const {firtsName , lastName} = req.body

  console.log(firtsName , lastName)
  if(requireField(_id,firtsName,lastName)){
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
  }
  
  const response=await userService.updateNameUserService(_id,firtsName,lastName)

  resSend(res,{statusCode:201,status:"success",data:response.data})
})

exports.updateRoleUser = catchAsync(async(req,res,next)=>{
  let _id = req.params.id
  const {role} = req.body

  if(requireField(_id,role)){

    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
  }
  
  const response=await userService.updateRoleUserService(_id,role)

  if(!response.success) return next(new appError(translatorNext(req,response.code), 400));

  resSend(res,{statusCode:201,status:"success",data:response.data})
})


exports.registerInc = catchAsync(async (req,res,next)=>{

  const {firtName,lastName,password} = req.body

  if(requireField(firtName,lastName,password)){
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'),400))
  }

  const response = userService.createUser(firtName,lastName,password)
  resSend(res,{statusCode:201,status:"success",data:response.data})
})