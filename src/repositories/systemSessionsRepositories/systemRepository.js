const {systemSessionsModels:{systemModel}} = require('../../models')
const handleFactory = require('../handleFactory')


exports.createSystem= handleFactory.createOne(systemModel)
exports.updateSystem= handleFactory.updateOne(systemModel)
exports.getSystem= handleFactory.getOne(systemModel)
exports.deleteSystem = handleFactory.deleteOne(systemModel)
exports.ActiveSystem = handleFactory.ActiveOne(systemModel)
exports.getAllSystem= handleFactory.getAll(systemModel)
exports.getInstance= handleFactory.getModel(systemModel)