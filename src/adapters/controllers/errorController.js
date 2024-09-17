

const emitError = (socket,dataError)=>{
  socket.emit("clientError",dataError)
}
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (socket,err) => {
  emitError(socket,{
    status: err.status,
    message: err.message,
    stack:err.stack
  })
};

const sendErrorProd = (socket,err) => {
  if (err.isOperatsocketnal) {
    emitError(socket,{
      status: err.status,
      message: err.message
    })
  } else {
    console.error('ERROR', err);
    emitError(socket,{
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
};

module.exports = (socket,err) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(socket,err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(socket,err);
  }
};
