const { xContentTypeOptions } = require('helmet')
const {orderManagementModels:{orderModel}} = require('../../models')
const handleFactory = require('../handleFactory')

exports.createOrder= handleFactory.createOne(orderModel)
exports.updateOrder= handleFactory.updateOne(orderModel)
exports.getOrder = handleFactory.getOne(orderModel)
exports.deleteOrder = handleFactory.deleteOne(orderModel)
exports.getAllOrder= handleFactory.getAll(orderModel)
exports.getInstance= handleFactory.getModel(orderModel)
exports.getCountArrayAggregate= handleFactory.getCountArrayAgregate(orderModel)
exports.getProductQuantity = async (orderId, productId) => {
    const pipeline = [
        {
            $match: { _id: orderId }
        },
        {
            $unwind: "$products" 
        },
        {
            $match: { "products.product": productId }
        },
        {
            $project: {
                _id: 1,
                quantity: "$products.quantity"
            }
        }
    ];

    return orderModel.aggregate(pipeline);
};
