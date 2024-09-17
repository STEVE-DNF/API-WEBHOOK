const {orderManagementModels:{reviewModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createReview= handleFactory.createOne(reviewModel)
exports.updateReview= handleFactory.updateOne(reviewModel)
exports.getReview = handleFactory.getOne(reviewModel)
exports.deleteReview = handleFactory.deleteOne(reviewModel)
exports.getAllReview= handleFactory.getAll(reviewModel)