const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {connection} = require('./connectDatabase')
const appError = require('../../utils/appError')
const translatorNext = require('../../utils/translatorNext')

const scheduleSchema = new Schema({
    restaurant: {
        type: Schema.Types.ObjectId,
        ref: 'restaurant',
        required: [true,"ERROR_MOONGOSE_REQUIRED"]
    },
    day: {
        type: Schema.Types.ObjectId,
        required: [true,"ERROR_MOONGOSE_REQUIRED"],
        ref:"day"
    },
    start_time: {
        hour:{
            type: Number,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            min:[0,"ERROR_MOONGOSE_MIN"],
            max:[24,"ERROR_MOONGOSE_MAX"],
        },
        minute:{
            type: Number,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            min:[0,"ERROR_MOONGOSE_MIN"],
            max:[59,"ERROR_MOONGOSE_MAX"],
        }
    },
    end_time: {
        hour:{
            type: Number,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            min:[0,"ERROR_MOONGOSE_MIN"],
            max:[24,"ERROR_MOONGOSE_MAX"],
        },
        minute:{
            type: Number,
            required: [true,"ERROR_MOONGOSE_REQUIRED"],
            min:[0,"ERROR_MOONGOSE_MIN"],
            max:[59,"ERROR_MOONGOSE_MAX"]
        },
    },
    active: {
        type: Boolean,
        default: false,
        select: true
    }
},{ timestamps: true });

scheduleSchema.pre(/^find/,async function(next){
    this.populate("day")
    next()
})

scheduleSchema.pre('findOneAndUpdate',async function(next){


    const objectTime = {...this.getUpdate()}

    if(!objectTime.start_time || !objectTime.end_time) next()

    const hourStart = objectTime.start_time.hour
    const minStart = objectTime.start_time.minute
    const hourEnd = objectTime.end_time.hour
    const minEnd  = objectTime.end_time.minute

    const diffHour = hourEnd -hourStart
    const diffMin = minEnd - minStart

    if( diffHour <= 0 || diffMin <=40){
        return next(new appError('Differencie Hours'));
    }
    next()
})

scheduleSchema.methods.getFields = function(){
    return ['restaurant','day','start_time','end_time']
}

module.exports = connection().model("schedule",scheduleSchema)