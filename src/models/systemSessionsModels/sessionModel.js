const moongose = require("mongoose")
const Schema = moongose.Schema
const {connection} = require('./connectDatabase')

const sessionSchema = new Schema({
    system :{
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
        ref:"system"
    },
    room: { 
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        ref:"room"
    },
    number: {
        code:{
            type: String,
            required: true,
            maxlength: [5,'ERROR_MOONGOSE_MAX']
        },
        phone:{
            type: String,
            required: true,
            maxlength: [15,'ERROR_MOONGOSE_MAX']
        }
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }},{ timestamps: true },
    {
            toJSON:{virtuals:true},
            toObject:{virtuals:true}
    });

sessionSchema.pre('save',function(next){
    if (this.isNew){
        createdAt = Date.now()
    }
    else{
        updatedAt = Date.now()
    }
    next()
})

sessionSchema.pre(/^find/,function(next){
    this.select('_id number room createdAt active')
    next()
})
sessionSchema.methods.getFields = function(){
    return ['system','room','number','active']
}

module.exports = connection().model("session",sessionSchema)

