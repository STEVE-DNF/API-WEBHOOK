const authService = require('../services/authService')
const catchAsync = require('../utils/catchAsync')
const jwt = require('jsonwebtoken')
const appError = require('./../utils/appError')
const sendEmail = require('./../utils/sendEmail')
const translatorNext = require('../utils/translatorNext')
const resetUrl = require('../utils/resetUrl')
const requireField = require('../utils/requireField')

// Genera un token JWT utilizando el ID del usuario y la clave secreta
// Parámetro: id - El identificador único del usuario.
const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Crea y envía un token al cliente, configurando la cookie de autenticación
// Parámetros:
// - user: El objeto de usuario que se ha autenticado.
// - statusCode: El código de estado HTTP a devolver.
// - res: El objeto de respuesta HTTP para enviar la cookie y la respuesta JSON.
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true
    };
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  
    //res.cookie('jwt', token, cookieOptions);

    user.password = undefined;
    

    //if (process.env.NODE_ENV === 'production') token = undefined;

    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user
      }
    });

};
// Maneja el proceso de login verificando las credenciales del usuario
// Parámetros:
// - req: El objeto de solicitud HTTP que contiene las credenciales del usuario (email y password).
// - res: El objeto de respuesta HTTP para enviar la respuesta al cliente.
// - next: La función para pasar al siguiente middleware en caso de error.
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (requireField(email,password)) {
    return next(new appError(translatorNext(req,'ERROR_LOGIN_PROVIDE_EMAIL_PASSWORD'), 400));
  }

  const user = await authService.loginService(email,password)

  if(!user.success){
    return next(new appError(translatorNext(req,user.code), 400));
  }
  createSendToken(user.data, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {


  const { email } = req.body;

  if (requireField(email)) {
    return next(new appError(translatorNext(req,'ERROR_LOGIN_PROVIDE_EMAIL_PASSWORD'), 400));
  }
  
  const authObject = await authService.forgotPasswordService(email)

  if(!authObject.success || requireField(authObject.data.user,authObject.data.token)){
    return next(new appError(translatorNext(req,authObject.code,{timeRemaining:authObject.placeholder}), 400));
  }
  const user = authObject.data.user

  const message = `Ignore`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: translatorNext(req,'RESET_TOKEN_EMAIL_SUBJECT'),
      message,
      url:resetUrl(req,`resetpassword/${authObject.data.token}`),
      req,
      typeTemplate:1
    });

    let tokenVerify = authObject.data.token

    if(process.env.NODE_ENV !== 'development') tokenVerify = undefined

    return res.status(200).json({
      status: 'success',
      message: translatorNext(req,'TOKEN_SENT_SUCCESS'),
      tokenVerify
    });

  } catch (err) {
    await authService.sendResetPasswordErrorService(user)

    return next(
      new appError(translatorNext(req,'EMAIL_SEND_ERROR')),
      500
    );
  }
});


exports.resetPassword = catchAsync(async (req, res, next) => {

  const {password,passwordConfirm} = req.body
  if(requireField(req.params.token)) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }
  const user = await authService.resetPasswordService(req.params.token,password,passwordConfirm)

  if(!user.success){
    return next(new appError(translatorNext(req,user.code), 400));
  }
  createSendToken(user.data, 200, res);
});


exports.validateEmailAddress = catchAsync(async (req, res, next) => {

  if(requireField(req.params.token)) {
    return next(new appError(translatorNext(req,'MISSING_REQUIRED_FIELDS'), 400));
  }
  const user = await authService.resetPasswordService(req.params.token,password,passwordConfirm)

  if(!user.success){
    return next(new appError(translatorNext(req,user.code), 400));
  }
  createSendToken(user.data, 200, res);
});
