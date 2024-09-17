const {systemSessionsModels:{messageModel}} = require('../../models')
const handleFactory = require('../handleFactory')




exports.createMessage= handleFactory.createOne(messageModel)
exports.getInstance= handleFactory.getModel(messageModel)