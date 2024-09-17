module.exports=(req,point)=>{
    return `${req.protocol}://${req.get('host')}/api/v1/${point}`
}
