const mongoose = require('mongoose')
const {connection} = require('./connectDatabase')
const Schema = mongoose.Schema

const paymentSchema = new Schema({
    restaurant: { type: Schema.Types.ObjectId, 
        ref: 'restaurant', 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
    },
    typepayment: {
        type: Schema.Types.ObjectId,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        ref: 'typepayment', 
    },
    active: {
        type: Boolean,
        default: false,
        select: true
    }
},{ timestamps: true });


paymentSchema.methods.getFields = function(){
    return ['restaurant','typepayment','active']
}

module.exports = connection().model('payment',paymentSchema)