const {orderManagementModels:{supportModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createSupport= handleFactory.createOne(supportModel)
exports.updateSupport= handleFactory.updateOne(supportModel)
exports.getSupport = handleFactory.getOne(supportModel)
exports.getAllSupport= handleFactory.getAll(supportModel)