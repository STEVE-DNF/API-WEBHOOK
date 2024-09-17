const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')


const promotionSchema = new Schema({
    restaurant: { 
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
    },
    name: {
        type: String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        maxlength: [50, 'ERROR_MOONGOSE_MAX'],
        minlength:[0,'ERROR_MOONGOSE_MIN']
    },
    description: {
        type: String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        maxlength: [200, 'ERROR_MOONGOSE_MAX'],
        minlength:[0,'ERROR_MOONGOSE_MIN']
    },
    discount: {
        type: Number,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        min: [0, 'ERROR_MOONGOSE_NUMBER_MIN'],
        max: [100, 'ERROR_MOONGOSE_NUMBER_MAX']
    },
    start_date: {
        type: Date,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    end_date: {
        type: Date,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        validate: {
            validator: function(value) {
                return this.start_date < value;
            },
            message: 'ERROR_MOONGOSE_VALIDATE_TIME'
        }
    }
},{ timestamps: true });

module.exports = connection().model("promotion", promotionSchema);
