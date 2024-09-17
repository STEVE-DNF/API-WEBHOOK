const userRepository = require('../repositories/systemSessionsRepositories/userRepository')
const appError = require('./../utils/appError')
const catchAsync = require('./../utils/catchAsync')
const translatorNext = require('../utils/translatorNext')
const util = require('util');
const promisify = util.promisify;
const jwt = require('jsonwebtoken')


exports.authMiddleware = catchAsync(async (req, res, next) => {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
  
    if (!token) {
      return next(
        new appError(translatorNext(req,'ERROR_NOT_TOKEN'), 401)
      );
    }
  
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await userRepository.getUser({_id:decoded.id},'system');
    if (!currentUser) {
      return next(
        new appError(translatorNext(req,'ERROR_USER_NOT_EXIST'),401
        )
      );
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(new appError(translatorNext(req,'ERROR_PASSWORD_CHANGE'), 401));
    }

    req.user = currentUser;
    req.system = currentUser.system
    req.restaurantId= currentUser.system.restaurant

    next();
})