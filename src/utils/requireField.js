module.exports=(...fields)=>{
    return fields.some(field => !field)
}