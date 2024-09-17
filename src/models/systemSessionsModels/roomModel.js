const moongose = require("mongoose")
const Schema = moongose.Schema
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();
const {connection} = require('./connectDatabase')

const roomSchema = new Schema({
    system :{
        type: Schema.Types.ObjectId, 
        required: [true,"ERROR_MOONGOSE_REQUIRED"], 
        ref:"system"
    },
    name:{
        type:String,
        required:true,
        minlength:0,
        maxlength:50
    }},{ timestamps: true },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);

roomSchema.virtual('sessions', {
    ref: 'session', 
    foreignField: 'room',
    localField: '_id'
});


roomSchema.pre('save',function(next){
    if (this.isNew){
        createdAt = Date.now()
    }
    else{
        updatedAt = Date.now()
    }
    next()
})

roomSchema.methods.getFields = function(){
    return ['system','name']
}
module.exports = connection().model("room",roomSchema)

