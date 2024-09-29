const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const customerSchema = new Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant',
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    number: {
        code:{
            type: String,
            required: true,
            maxlength: [5,'ERROR_MOONGOSE_MAX']
        },
        phone:{
            type: String,
            required: true,
            maxlength: [15,'ERROR_MOONGOSE_MAX']
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    attempts: { 
        type: Number, 
        default: 3 ,
        select:false,
    },
    lockTimestamp: { 
        type: Date 
    },
    context: { 
        type: String, 
        enum: ['order_context','address_add_context','address_update_context','normal_context'], 
        default: 'normal_context'
    }
},{ timestamps: true });


customerSchema.methods.getFields = function(){
    return ['restaurant','number','active','timestamp']
}

customerSchema.pre(/^find/,function(next){
    if(this.timestamp >= this.lockTimestamp){
        this.attempts = this.attempts + 1
    }
    next()
})  



module.exports = connection().model("customer",customerSchema)