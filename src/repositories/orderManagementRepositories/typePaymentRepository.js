const {orderManagementModels:{typePaymentModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createTypePayment= handleFactory.createOne(typePaymentModel)
exports.updateTypePayment= handleFactory.updateOne(typePaymentModel)
exports.getTypePayment = handleFactory.getOne(typePaymentModel)
exports.deleteTypePayment = handleFactory.deleteOne(typePaymentModel)
exports.activeTypePayment = handleFactory.ActiveOne(typePaymentModel)
exports.getAllTypePayment= handleFactory.getAll(typePaymentModel)