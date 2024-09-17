

module.exports = function replaceMessage(htmlContent,options){
 
    htmlContent = htmlContent.replace(/{%TITTLE%}/g,options.tittle)
    htmlContent = htmlContent.replace(/{%MESSAGE01%}/g,options.message01)
    htmlContent = htmlContent.replace(/{%PASSWORD%}/g,options.password?options.password:"")
    htmlContent = htmlContent.replace(/{%MESSAGE02%}/g,options.message02)
    htmlContent = htmlContent.replace(/{%URLNAME%}/g,options.urlName)
    htmlContent = htmlContent.replace(/{%URL%}/g,options.url)
    htmlContent = htmlContent.replace(/{%MESSAGENOT%}/g,options.messagenot)
    
    return htmlContent
}