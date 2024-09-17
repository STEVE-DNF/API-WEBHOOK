const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')


const daySchema = new Schema({
    numDay:{
        type:Number,
        unique:true,
        minlength:0,
        maxlength:7
    },
    day: {
        type: Map,
        of: String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        unique:true
    },
},{ timestamps: true });

module.exports = connection().model("day",daySchema)