const mongoose = require('mongoose')
const Schema = mongoose.Schema
const {connection} = require('./connectDatabase')
const roomModel = require('./roomModel')
const systemSchema = new Schema({
    restaurant :{
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
    },
    name: {
        type:String,
        required:[true,""],
    }, 
    color:{
        type:String,
        default:"auto",
        enum:['light','dark','auto']
    },
    language:{
        type:String,
        default:"es",
        enum:['es','en']
    },
    searchMetods: {
        type: String,
        required: false,
    },    
    active: {
        type: Boolean,
        default: false,
        select: true
    }},{ timestamps: true });
systemSchema.pre('save',async function(next){

    if(!this.isNew) return next()

    const room=new roomModel({name:`${this.name}Room`,system:this._id})
    await room.save()
    
    next()
})


systemSchema.methods.getFields = function(){
    return ['restaurant','name','color','language','active']
}

module.exports = connection().model('system', systemSchema);
