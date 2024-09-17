const {systemSessionsModels:{userModel}} = require('../../models')
const handleFactory = require('../handleFactory')


exports.createUser= handleFactory.createOne(userModel)
exports.updateUser= handleFactory.updateOne(userModel)
exports.getUser = handleFactory.getOne(userModel)
exports.deleteUser = handleFactory.deleteOne(userModel)
exports.ActiveUser= handleFactory.ActiveOne(userModel)
exports.getAllUser= handleFactory.getAll(userModel)
exports.getInstance= handleFactory.getModel(userModel)
exports.getInstanceConstructor= handleFactory.getModelConstructor(userModel)