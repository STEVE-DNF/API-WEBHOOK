module.exports = (res,{statusCode,...options})=>{
    res.status(statusCode).json(options)
}