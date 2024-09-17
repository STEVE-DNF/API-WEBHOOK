const i18next = require('../config/supportedLngs');

module.exports = (code,placeholders,lngOptional)=>{
    i18next.changeLanguage(lngOptional ||'es')
    return i18next.t(code,placeholders)
}