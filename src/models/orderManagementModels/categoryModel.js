const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const categorySchema = new Schema({
    restaurant: { type: Schema.Types.ObjectId, 
        ref: 'restaurant', 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], },
    name: {
        type: String,
        unique:true,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        maxlength: [50, 'ERROR_MOONGOSE_MAX'],
        minlength:[0, 'ERROR_MOONGOSE_MIN']
    },
    description: {
        type: String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        maxlength: [50, 'ERROR_MOONGOSE_MAX'],
        minlength:[0, 'ERROR_MOONGOSE_MIN']
    },
    active: {
        type: Boolean,
        default: true
    }
},{ timestamps: true });



categorySchema.methods.getFields = function(){
    return ['restaurant','name','description','active']
}

module.exports = connection().model("category",categorySchema)