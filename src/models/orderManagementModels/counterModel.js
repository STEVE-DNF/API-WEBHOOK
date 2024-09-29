const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')

const counterSchema = new Schema({
    seq: {
      type: Number,
      default: 0
    }
});

counterSchema.methods.getFields = function(){
    return ['seq']
}

module.exports = connection().model("counter",counterSchema)
  