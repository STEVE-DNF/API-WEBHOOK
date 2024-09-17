const {orderManagementModels:{customerModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createCustomer= handleFactory.createOne(customerModel)
exports.updateCustomer= handleFactory.updateOne(customerModel)
exports.getCustomer = handleFactory.getOne(customerModel)
exports.deleteCustomer = handleFactory.deleteOne(customerModel)
exports.getAllCustomer= handleFactory.getAll(customerModel)
exports.activeCustomer= handleFactory.ActiveOne(customerModel)