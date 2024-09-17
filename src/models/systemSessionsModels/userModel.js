const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {promisify } = require('util')
const {connection} = require('./connectDatabase')
const crypto = require('crypto');

const userSchema = new Schema({
  system :{
    type: Schema.Types.ObjectId, 
    required: [true,"ERROR_MOONGOSE_REQUIRED"], 
    ref:"system"
  },
  socketreset:{
    type: Schema.Types.ObjectId, 
    ref:"socketreset"
  },
  name: {
    type: String,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
  },
  email: {
    type: String,
    unique: true,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
    lowercase: true,
    validate: [validator.isEmail, "ERROR_MOONGOSE_VALIDATE_GMAIL"]
  },
  role: {
    type: String,
    enum: ['user', 'support', 'admin', 'god'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true,"ERROR_MOONGOSE_REQUIRED"],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'ERROR_USER_PASSWORD_CONFIRM'
    }
  },

  passwordChangedAt: Date,
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  active: {
    type: Boolean,
    default: false,
    select: true
  }},{ timestamps: true });

userSchema.pre('save', async function(next) {

  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});


userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});


userSchema.methods.generatePassword = function(){
  const result =  crypto.randomBytes(32).toString('hex')
  if(!result) next(new Error())
  this.password = result
  this.passwordConfirm = result
  return result
}



userSchema.methods.correctPassword = async function(currentPass,password){
  const result =  await promisify(bcrypt.compare)(currentPass,password)

  if(!result) result
  this.password = currentPass
  return result
}


userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
  .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};


userSchema.methods.changedPasswordAfter = function(date) {

  if(this.passwordChangedAt >= new Date(date * 1000)) return true
  return false;
};


userSchema.methods.getFields = function(){
  return ['system','name','socketOption','email','password','passwordConfirm','active']
}



module.exports = connection().model('user', userSchema);
