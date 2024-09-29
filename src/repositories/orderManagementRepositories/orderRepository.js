const mongoose =require('mongoose')

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
exports.getOrderStatusTrendsDaily = async (restaurantId) => {
  const currentDate = new Date();

  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dayBeforeYesterday = new Date(yesterday);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 1);

  const possibleStatuses = [
    'processing', 
    'cancelled', 
    'pending', 
    'preparation', 
    'shipped'
  ];

  const result = await orderModel.aggregate([

    {
      $match: {
        createdAt: { $gte: yesterday, $lte: today },
        restaurant: new mongoose.Types.ObjectId(restaurantId)
      }
    },
    {
      $group: {
        _id: "$order_status", 
        totalCurrent: { $sum: 1 }, 
        revenueCurrent: { $sum: "$total_amount" }
      }
    },

    {
      $lookup: {
        from: "orders", 
        let: { orderStatus: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $and: [
                { $eq: ["$order_status", "$$orderStatus"] },
                { $eq: ["$restaurant", new mongoose.Types.ObjectId(restaurantId)] },
                { $gte: ["$createdAt", dayBeforeYesterday] },
                { $lte: ["$createdAt", yesterday] }
              ]}
            }
          },
          {
            $group: {
              _id: null,
              totalPrevious: { $sum: 1 },
              revenuePrevious: { $sum: "$total_amount" }
            }
          }
        ],
        as: "previousData"
      }
    },

    {
      $project: {
        _id: 0,
        order_status: "$_id", 
        totalCurrent: 1, 
        totalPrevious: { $ifNull: [{ $arrayElemAt: ["$previousData.totalPrevious", 0] }, 0] },
        revenueCurrent: 1,
        revenuePrevious: { $ifNull: [{ $arrayElemAt: ["$previousData.revenuePrevious", 0] }, 0] },
        isIncreasing: {
          $cond: {
            if: { $gt: ["$totalCurrent", { $ifNull: [{ $arrayElemAt: ["$previousData.totalPrevious", 0] }, 0] }] },
            then: true,
            else: false
          }
        },
        revenueDifference: {
          $ifNull: [
            {
              $cond: {
                if: { $gt: ["$revenueCurrent", { $ifNull: [{ $arrayElemAt: ["$previousData.revenuePrevious", 0] }, 0] }] },
                then: { $subtract: ["$revenueCurrent", { $ifNull: [{ $arrayElemAt: ["$previousData.revenuePrevious", 0] }, 0] }] },
                else: { $subtract: [{ $ifNull: [{ $arrayElemAt: ["$previousData.revenuePrevious", 0] }, 0] }, "$revenueCurrent"] }
              }
            },
            0
          ]
        }
      }
    }
  ]);

  const finalResult = possibleStatuses.map(status => {
    const found = result.find(r => r.order_status === status);
    return found || {
      order_status: status,
      totalCurrent: 0,
      revenueCurrent: 0,
      totalPrevious: 0,
      revenuePrevious: 0,
      isIncreasing: false,
      revenueDifference: 0
    };
  });

  return finalResult;
};
