const {orderManagementModels:{paymentModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createPayment= handleFactory.createOne(paymentModel)
exports.updatePayment= handleFactory.updateOne(paymentModel)
exports.getPayment = handleFactory.getOne(paymentModel)
exports.deletePayment = handleFactory.deleteOne(paymentModel)
exports.activePayment = handleFactory.ActiveOne(paymentModel)
exports.getAllPayment= handleFactory.getAll(paymentModel)
exports.getModelPayment = paymentModel