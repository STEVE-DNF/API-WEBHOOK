const express = require('express');
const morgan = require('morgan');
//const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const i18next = require('./config/supportedLngs')
const i18nextMiddleware = require('i18next-express-middleware');

const globalErrorHandler = require('./controllers/errorController');
const routers = require('./routes');

//const limiter = rateLimit({
//	windowMs: 15 * 60 * 1000, 
//	limit: 100,
//	message: "ERROR_LIMIT"
//})

const app = express()

//app.set('trust proxy', true);

app.use(helmet())

//app.use('/api',limiter)

app.use(express.json({ limit: '10kb' }));

app.use(mongoSanitize())

app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}))

app.use(xss())

app.use(i18nextMiddleware.handle(i18next))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1', routers);

app.use(globalErrorHandler);

module.exports = {app};
