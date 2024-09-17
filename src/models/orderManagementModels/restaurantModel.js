const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')
const crypto = require('crypto');
const scheduleModel = require('./scheduleModel');
const paymentModel = require("./paymentModel");

const restaurantSchema = new Schema({
    name: {
        type: String,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        unique:true,
        maxlength: [50, 'ERROR_MOONGOSE_MAX'],
        minlength:[0,'ERROR_MOONGOSE_MIN']
    },
    menus: [
        {
            link: {
                type: String,
                maxlength: [250, 'ERROR_MOONGOSE_MAX'],
                minlength:[0,'ERROR_MOONGOSE_MIN']
            },
            title: {
                type: String,
                maxlength: [250, 'ERROR_MOONGOSE_MAX'],
                minlength:[0,'ERROR_MOONGOSE_MIN']
            }
        }
    ],
    address: {

        name: {
            type: String,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            maxlength: [150, 'ERROR_MOONGOSE_MAX'],
            minlength:[0,'ERROR_MOONGOSE_MIN']
        },
        reference: {
            type: String,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            maxlength: [150, 'ERROR_MOONGOSE_MAX'],
            minlength:[0,'ERROR_MOONGOSE_MIN']
        },
        lat:{
            type:Number,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
        },
        lon:{
            type:Number,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
        }
    },
    currency: {
        type: String,
        default: "S/",
        enum: ['S/']
    },
    language:{
        type:String,
        default:"es",
        enum:['es','en']
    },
    product_limits: {
        min: {
            type: Number,
            default: 1,
            validate: {
                validator: function(value) {
                    if(!this.min){
                        this.min = value
                        return true
                    }
                    return value < this.max;
                },
                message: 'ERROR_MOONGOSE_VALIDATE_LIMIT'
            }
        },
        max: {
            type: Number,
            default: 5,
            validate: {
                validator: function(value) {
                    if(!this.max){
                        this.max = value
                        return true
                    }
                    return value > this.min;
                },
                message: 'ERROR_MOONGOSE_VALIDATE_LIMIT'
            }
        },
    },
    active: {
        type: Boolean,
        default: false,
        select: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },  
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'review'
    }],
    restaurantVerifyToken: { type: String, default: null },
    restaurantVerifyExpires: { type: Date, default: null },
},{ timestamps: true });

restaurantSchema.pre('save',async function(next){

    if(!this.isNew) return next()
    
  
    const scheduleNews=(["65cff6c1e43c2a21d4864d2b","65cff6f4e43c2a21d4864d2c","65cff6fde43c2a21d4864d2d","65cff709e43c2a21d4864d2e","65cff70ee43c2a21d4864d2f","65cff716e43c2a21d4864d30","65cff71ee43c2a21d4864d31"]).map((value,_)=>{
        const scheduleSave = new scheduleModel({restaurant:this._id,day:new mongoose.Types.ObjectId(value)})

        scheduleSave.start_time = {hour:8,minute:40}
        scheduleSave.end_time = {hour:18,minute:40}

        return scheduleSave.save()

    })

    const paymentNews= ["65d18740f2dc243d220484aa","65d18776f2dc243d220484ab","65d18795f2dc243d220484ac"].map((value,index,_)=>{
        const paymetnSave = new paymentModel({restaurant:this._id,typepayment:new mongoose.Types.ObjectId(value)})
        return paymetnSave.save()
    })

    await Promise.all([...scheduleNews,...paymentNews])

    next()
})


restaurantSchema.methods.createToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
  
    this.restaurantVerifyToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.restaurantVerifyExpires = Date.now() + 10 * 60 * 1000;
  
    return resetToken;
};

restaurantSchema.methods.getFields = function(){
    return ['name','menus','address','currency','language','product_limits','active','timestamp','reviews']
}

module.exports = connection().model("restaurant",restaurantSchema)