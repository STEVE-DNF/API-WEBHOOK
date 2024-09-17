const registrationService = require('../services/registrationService');
const catchAsync = require('../utils/catchAsync')
const appError= require('../utils/appError')
const sendEmail = require('../utils/sendEmail');
const getTimeMinutes = require('./../utils/getTimeMinutes')
const translatorNext = require('../utils/translatorNext')
const requireField = require('../utils/requireField')
const resetUrl = require('../utils/resetUrl')


exports.signupClient = catchAsync(async (req, res, next) => {
  const { restaurantName, userFirtName, userLastName, userGmail } = req.body;

  if (requireField(restaurantName, userFirtName, userLastName, userGmail)) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }
  
  const registrationObject = await registrationService.signupClientService(restaurantName, userFirtName, userLastName, userGmail)

  if(!registrationObject.success || requireField(registrationObject.data.user,registrationObject.data.restaurant,registrationObject.data.token,registrationObject.data.password)){
    return next(new appError(translatorNext(req,registrationObject.code), 400));
  }
  
  const user = registrationObject.data.user
  const restaurant = registrationObject.data.restaurant
  const message = `Ignore`;
  console.log(user,restaurant)
  try {
    await sendEmail({
      email: user.email,
      subject: translatorNext(req,'RESET_TOKEN_EMAIL_SUBJECT'),
      message,
      url:resetUrl(req,`registration/verification/${registrationObject.data.token}`),
      req,
      passwordTemp:registrationObject.data.password,
      typeTemplate:2
    });

    let tokenVerify = undefined
    if(process.env.NODE_ENV === 'development'){
      tokenVerify = registrationObject.data.token
    }
    return res.status(200).json({
      status: 'success',
      message: translatorNext(req,'TOKEN_SENT_SUCCESS'),
      tokenVerify
    });
  }
 catch (err) {
    await registrationService.sendResetTokenErrorService(restaurant)
    return next(
      new appError(translatorNext(req,'EMAIL_SEND_ERROR')),
      500
    );
  }
});


exports.resetToken = catchAsync(async (req, res, next) => {

  const { userGmail } = req.body;

  if (!userGmail) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }

  const registrationObject = await registrationService.resetTokenService(userGmail)
  
  if(!registrationObject.success ||requireField( registrationObject.data.user,registrationObject.data.restaurant,registrationObject.data.token,registrationObject.data.password)){
    return next(new appError(translatorNext(req,registrationObject.code,{timeRemaining:registrationObject.placeholder}), 400));
  }
  const message = `Ignore`;
  
  const user = registrationObject.data.user
  const restaurant = registrationObject.data.restaurant
  const token = registrationObject.data.token
  const password = registrationObject.data.password
  try {
    await sendEmail({
      email: user.email,
      subject: translatorNext(req,'RESET_TOKEN_EMAIL_SUBJECT'),
      message,
      url:resetUrl(req,`registration/verification/${token}`),
      req,
      passwordTemp:password,
      typeTemplate:2
    });

    return res.status(200).json({
      status: 'success',
      message: translatorNext(req,'TOKEN_SENT_SUCCESS')
    });
  } catch (err) {

    await registrationService.sendResetTokenErrorService(restaurant)
    return next(
      new appError(translatorNext(req,'EMAIL_SEND_ERROR')),
      500
    );
  }
});


exports.activateRestaurantByVerificationToken = catchAsync(async (req, res, next) => {

  if (!req.params.token) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }
  const response = await registrationService.activateRestaurantByVerificationTokenService(req.params.token)

  if(!response.success) return next(new appError(translatorNext(req,response.code),400))
  
  return res.status(200).json({
    status: 'success',
    message: translatorNext(req,'TOKEN_VERIFIED')
  });
});
