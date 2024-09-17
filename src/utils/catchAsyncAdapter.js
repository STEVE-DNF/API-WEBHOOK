const errorController = require("../adapters/controllers/errorController")

module.exports = async function(fn,isAsync,{socket,room}) {
    try{
        const fnBind=fn.bind(this)
        if(isAsync) return await fnBind(socket,room)
        return fnBind(socket,room)
    }
    catch(err){
        errorController(socket,err)
    }
};
