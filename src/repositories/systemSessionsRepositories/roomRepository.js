const {systemSessionsModels:{roomModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.getRoom= handleFactory.getOne(roomModel)
exports.createRoom= handleFactory.createOne(roomModel)
exports.getAllRoom= handleFactory.getAll(roomModel)
exports.getInstance= handleFactory.getModel(roomModel)
exports.activateRoom= handleFactory.ActiveOne(roomModel)
exports.deleteRoom= handleFactory.deleteOne(roomModel)