const moongose = require('mongoose')
const Schema = moongose.Schema
const {connection} = require('./connectDatabase')

const socketResetSchema = new Schema({
    
    authToken: { type: String, default: null },
    authTokenExpiry: { type: Date, default: null }
},{ timestamps: true });
socketResetSchema.pre('save',function(){
    if(this.isModified('authToken')){
        this.authTokenExpiry = Date.now() + 10*60*1000
    }
})

socketResetSchema.methods.getFields = function(){
    return ['authToken','authTokenExpiry']
}


module.exports = connection().model('socketreset',socketResetSchema)

