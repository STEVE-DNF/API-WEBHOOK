const {systemSessionsModels:{passwordResetModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createPasswordReset= handleFactory.createOne(passwordResetModel)
exports.updatePasswordReset= handleFactory.updateOne(passwordResetModel)
exports.getInstance= handleFactory.getModel(passwordResetModel)