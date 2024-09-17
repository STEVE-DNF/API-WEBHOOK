const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')


const addressSchema = new Schema({
    restaurant: { 
        type: Schema.Types.ObjectId, 
        ref: 'restaurant', 
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        select:false,
    },
    customer: { 
        type: Schema.Types.ObjectId, 
        ref: "customer" ,
        select:false
    },
    reference:{
        type:String,
        minLength: 1,
        maxLength: 250,
        required:true
    },
    location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: function (value) {
              return value.length === 2;
            },
            message: 'Coordinates must have exactly two elements: [longitude, latitude]'
          }
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: true
    },
    isDefault:{
        type: Boolean,
        default: false,
        select: true
    },
    isUpdating: { 
        type: Boolean,
        default: false, 
        select: true
    }
},{ timestamps: true });


addressSchema.methods.getFields = function(){
    return ['restaurant','customer','address','isDefault','active']
}

module.exports = connection().model("address",addressSchema)