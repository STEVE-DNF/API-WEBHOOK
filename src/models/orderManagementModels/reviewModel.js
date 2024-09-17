const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')


const reviewSchema = new Schema({
    customer: {
        type: Schema.Types.ObjectId,
        ref: "customer",
        required: [true,"ERROR_MOONGOSE_REQUIRED"]
    },
    rating: {
        type: Number,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        min: [1, 'ERROR_MOONGOSE_NUMBER_MIN'],
        max: [5, 'ERROR_MOONGOSE_NUMBER_MAX']
    },
    comment: {
        type: String,
        maxlength: [500, 'ERROR_MOONGOSE_MAX'],
        minlength:[0,'ERROR_MOONGOSE_MIN']
    }
},{ timestamps: true });

reviewSchema.methods.getFields = function(){
    return ['customer','rating','comment']
}

module.exports = connection().model("review", reviewSchema);
