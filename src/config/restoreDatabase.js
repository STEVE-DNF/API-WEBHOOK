const fs = require('fs')
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const dayModel = require('./../models/orderManagementModels/dayModel')
const typePaymentModel = require('./../models/orderManagementModels/typePaymentModel')



const days = JSON.parse(fs.readFileSync(`${__dirname}/restore/days.json`,{encoding:"utf-8"}))
const typePayments = JSON.parse(fs.readFileSync(`${__dirname}/restore/typePayments.json`,{encoding:"utf-8"}))


const convertedDays = days.map(day => {
    day._id = new ObjectId(day._id["$oid"]);
    return day;
  });
  
  const convertedTypePayments = typePayments.map(typePayment => {
    typePayment._id = new ObjectId(typePayment._id["$oid"]);
    return typePayment;
  });

module.exports = async()=>{

    await dayModel.insertMany(convertedDays)
    await typePaymentModel.insertMany(convertedTypePayments)
}

