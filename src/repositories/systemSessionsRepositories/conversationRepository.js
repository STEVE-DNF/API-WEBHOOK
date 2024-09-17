const {systemSessionsModels:{conversationModel}} = require('../../models')
const handleFactory = require('../handleFactory')



exports.createConversation= handleFactory.createOne(conversationModel)
exports.getConversation = handleFactory.getOne(conversationModel)
exports.deleteConversation = handleFactory.deleteOne(conversationModel)
exports.getInstance= handleFactory.getModel(conversationModel)