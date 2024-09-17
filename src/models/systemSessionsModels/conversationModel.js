const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const conversationSchema = new Schema({
    system :{
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
        ref:"system"
    },
    name : {
        type:String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        maxlength:[120,'ERROR_MOONGOSE_MAX'],
        minlength:[15,'ERROR_MOONGOSE_MIN']
    },
    participants:[
        {
            type: mongoose.Schema.Types.ObjectId,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            ref:'user'
        },
        {
            type: mongoose.Schema.Types.ObjectId,
            required: [true,"ERROR_MOONGOSE_REQUIRED"]
        }
    ],
    active: {
        type: Boolean,
        default: true,
        select: false
    }
},{ timestamps: true });




conversationSchema.virtual('messages', {
    ref: 'message',
    localField: '_id',
    foreignField: 'conversation',
    justOne: false,
});

conversationSchema.methods.getFields = function(){
    return ['system','name','participants','active']
}

module.exports = connection().model("conversation",conversationSchema)