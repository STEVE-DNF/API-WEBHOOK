const mongoose = require('mongoose')
const {connection} = require('./connectDatabase')
const Schema = mongoose.Schema

const typePaymentSchema = new Schema({
    method: {
        type: Map,
        of: String,
        required: true,
        unique:true
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
},{ timestamps: true });

typePaymentSchema.methods.getFields = function(){
    return ['method','active']
}

module.exports = connection().model('typepayment',typePaymentSchema)