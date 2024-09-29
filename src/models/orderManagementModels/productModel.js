const mongoose = require("mongoose");
const slugify = require('slugify')
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')


const productSchema = new Schema({
    restaurant: { 
        type: Schema.Types.ObjectId, 
        ref: 'restaurant', 
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    category: { 
        type: Schema.Types.ObjectId, 
        ref: "category" , 
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
    },
    slug:{
        type:String
    },
    name: {
        type: String,
        unique:true,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        maxlength: [50, 'ERROR_MOONGOSE_MAX'],
        minlength:[0, 'ERROR_MOONGOSE_MIN']
    },
    description: {
        type: String,
        maxlength: [50, 'ERROR_MOONGOSE_MAX'],
        minlength:[0, 'ERROR_MOONGOSE_MIN']
    },
    price: { 
        type: Number, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        min:[0, 'ERROR_MOONGOSE_NUMBER_MIN']
    },
    max_quantity: { 
        type: Number, 
        default : 5,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        min:[0, 'ERROR_MOONGOSE_NUMBER_MIN'],
        max:[15, 'ERROR_MOONGOSE_NUMBER_MAX']
    },
    isOfStock: {
        type: Boolean,
        default: true, 
    },
    active: {
        type: Boolean,
        default: true
    }
},{ timestamps: true });

productSchema.methods.getFields = function(){
    return ['restaurant','category','slug','name','description','price','active']
}

productSchema.pre("save",function(next){
    this.slug = slugify(this.name)
    next()
})


module.exports = connection().model("product",productSchema)