module.exports = (req,code,placeholders,lngOptional)=>{
    req.i18n.changeLanguage(lngOptional || req.system?.language || 'es')
    return req.t(code,placeholders)
}