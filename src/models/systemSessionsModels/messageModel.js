const moongose = require('mongoose')
const Schema = moongose.Schema
const {connection} = require('./connectDatabase')


const messageSchema = new Schema({
    system :{
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
        ref:"system"
    },
    conversation:{
        type:Schema.Types.ObjectId,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        ref: 'conversation',

    }
    ,
    autor:{
        type: Schema.Types.ObjectId,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    content:{
        type:String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    type:{
        type:String,
        enum: ['text'],
        default:"text"
    }
},{ timestamps: true });
messageSchema.index({createdAt:1})
messageSchema.methods.getFields = function(){
    return ['system','conversation','autor','content','type']
}

module.exports = connection().model('message',messageSchema)