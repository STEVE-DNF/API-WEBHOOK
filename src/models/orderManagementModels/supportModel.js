const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const supportRequestSchema = new Schema({
  restaurant: { type: Schema.Types.ObjectId, ref: 'restaurant', required: [true,"ERROR_MOONGOSE_REQUIRED"], },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'customer',
    required: [true,"ERROR_MOONGOSE_REQUIRED"]
  },
  order: { type: Schema.Types.ObjectId, ref: 'order'},
  support: {
    type: Schema.Types.ObjectId,
    select:false,
  },
  description: {
    type: String,
    required: [true,"ERROR_MOONGOSE_REQUIRED"]
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Resolved', 'In Progress'],
    message: 'ERROR_MOONGOSE_VALIDATE_ENUM'
  }
},{ timestamps: true });

supportRequestSchema.methods.getFields = function(){
  return ['restaurant','customer','order','support','description','status']
}


module.exports = connection().model('supportrequest', supportRequestSchema);
