const {orderManagementModels:{dayModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.getDay = handleFactory.getOne(dayModel)
