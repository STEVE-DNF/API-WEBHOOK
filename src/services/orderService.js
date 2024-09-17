
const orderRepository = require('../repositories/orderManagementRepositories/orderRepository');
const supportService = require('../services/supportService');
const restaurantService = require('../services/restaurantService');
const { ObjectId } = require('mongodb');
const createResponse = require('./../utils/createResponse')

const handleResponse = (order, successCode, errorCode) => {
    if (order) return createResponse({ success: true, code: successCode });
    return createResponse({ code: errorCode });
};

exports.createOrderService = async (restaurant,customer)=>{

    const order=await orderRepository.createOrder({restaurant,customer},{validateBeforeSave :false})
    if(!order) return createResponse({})
    return createResponse({success:true,data:order})
}
exports.getOrderService = async (_id)=>{
    let filter = {_id}
    const order=await orderRepository.getOrder(filter,[{
        path: 'paymethod.payment',
        populate: {                 
          path: 'typepayment', 
          model: 'typepayment',
        }         
      },
      {
        path: 'address',
        model: 'address'
      }
    
    ],null,null)

    if(!order) return createResponse({code:'NOT_FOUND'})
    return createResponse({success:true,data:order})
}

exports.getOrderPendingService = async (customer)=>{
    let filter = {
        customer,
        is_cancelled: false,
        status: { $ne: 'order_confirmation' }
    };
    const order=await orderRepository.getOrder(filter)
    return createResponse({success:true,data:order})
}


exports.getAllOrderService = async (restaurant,query)=>{
    const order=await orderRepository.getAllOrder({restaurant},query)
    return createResponse({success:true,data:order})
}
exports.createAddressOrderService = async(order_id,address_id)=>{
    const order = await orderRepository.updateOrder({_id:order_id},{address:address_id})
    return handleResponse(order, 'ADDRESS_ADD_SUCCESS', 'ERROR_ADDRESS_ADD');

}

exports.createPaymentOrderService = async(order_id,payment_id,money)=>{
    const order = await orderRepository.updateOrder({_id:order_id},{paymethod:{payment:payment_id}})
    return handleResponse(order, 'PAYMENT_ADD_SUCCESS', 'ERROR_PAYMENT_ADD');
}

exports.createProductOrderService = async (order_id, restaurant_id, productInfo, increaseQuantity) => {
    
    const productCountInOrder = (await orderRepository.getCountArrayAggregate("_id", order_id, "products"))[0]?.count || 1;
    let productQuantityInOrder = await orderRepository.getProductQuantity(order_id, productInfo._id);
    productQuantityInOrder = (productQuantityInOrder[0]?.quantity || 0);

    if (increaseQuantity) {
        productQuantityInOrder += productInfo.quantity;
    } else {
        productQuantityInOrder -= productInfo.quantity;
    }
    const { min: minProductCount, max: maxProductCount } = await restaurantService.getProductMinMaxService(restaurant_id);

    let filter = { _id: order_id };
    let update = undefined;
    
    if (productQuantityInOrder <= 0) {
        update = {
            $pull: {
                products: { product: productInfo._id }
            }
        };
    } else if (productQuantityInOrder > productInfo.max_quantity) {
        update = {
            $set: {
                "products.$.quantity": productInfo.max_quantity,
                "products.$.total": (Math.round(productInfo.price * productInfo.max_quantity * 100) / 100).toFixed(2)
            }
        };
        productQuantityInOrder = productInfo.max_quantity;
    } else {
        update = {
            $set: {
                "products.$.quantity": productQuantityInOrder,
                "products.$.total": (Math.round(productInfo.price * productQuantityInOrder * 100) / 100).toFixed(2)
            }
        };
    }

    try {
        if (!(productCountInOrder >= minProductCount && productCountInOrder <= maxProductCount)) {
            return "ERROR_ORDER_MAX";
        }

        filter["products.product"] = productInfo._id;

        const result = await orderRepository.updateOrder(filter, update, undefined);
        return result;
    } catch (err) {
        if (productQuantityInOrder > 0) {
            update = {
                $push: {
                    products: {
                        total: (Math.round(productInfo.price * productQuantityInOrder * 100) / 100).toFixed(2),
                        quantity: productQuantityInOrder,
                        product: productInfo._id,
                        name: productInfo.name
                    }
                }
            };
        } else {
            return createResponse({code:'ERROR_INVALID_OPERATION'})
        }
        delete filter["products.product"];

        const result = await orderRepository.updateOrder(filter, update, undefined);
        return createResponse({success:true,data:result})
    }
};



exports.deleteProductOrderService = async (_id, product_id) => {
    const filter = { _id, "products._id": product_id };
    const update = {
        $pull: {
            products: { _id: product_id },
        },
    };
    const order = await orderRepository.updateOrder(filter, update);
    return handleResponse(order, 'PRODUCT_DELETE_ORDER', 'ERROR_PRODUCT_DELETE_ORDER');
};

exports.changeProductSelectionStatus = async (_id) => {
    const status = 'product_selection';
    const order = await updateOrderStatus(_id, status);
    return handleResponse(order, 'PRODUCT_SELECTION', 'ERROR_PRODUCT_SELECTION');
};

exports.changePaymentMethodSelectionStatus = async (_id) => {
    const status = 'payment_method_selection';
    const order = await updateOrderStatus(_id, status);
    return handleResponse(order, 'PAYMENT_METHOD_SELECTION', 'ERROR_PAYMENT_METHOD_SELECTION');
};

exports.changeAddressSelectionStatus = async (_id) => {
    const status = 'address_selection';
    const order = await updateOrderStatus(_id, status);
    return handleResponse(order, 'ADDRESS_SELECTION', 'ERROR_ADDRESS_SELECTION');
};

exports.changeOrderConfirmationSelectionStatus = async (_id) => {
    const status = 'order_confirmation_selection';
    const order = await updateOrderStatus(_id, status);
    return handleResponse(order, 'ORDER_CONFIRM', 'ERROR_ORDER_CONFIRMATION_SELECTION');
};

exports.changeOrderConfirmationStatus = async (_id) => {
    const status = 'order_confirmation';
    const order = await updateOrderStatus(_id, status);
    return handleResponse(order, 'PRODUCT_ORDER_CONFIRMATION', 'ERROR_ORDER_CONFIRMATION');
};

exports.changeCanceledReasonSelectionStatus = async (_id) => {
    const status = 'canceled_reason_selection';
    const order = await updateOrderStatus(_id, status, true);
    return handleResponse(order, 'CANCELED_REASON_SELECTION', 'ERROR_CANCELED_REASON_SELECTION');
};

exports.changeCanceledSupportAssistanceStatus = async (order_id,restaurant_id,customer_id,description) => {
    const status = 'canceled_support_assistance';

    //const support = await supportService.createSupportService(restaurant_id,customer_id,order_id,description)

    //if(!support) return 'ERROR_CANCELED_SUPPORT_SELECTION';

    const order = await updateOrderStatus(order_id, status, true);

    if(order) return createResponse({success:true,code:'CANCELED_SUPPORT_SELECTION'})
    return createResponse({code:'ERROR_CANCELED_SUPPORT_SELECTION'})
}

async function updateOrderStatus(_id, status, isCancelled = false) {
    let body = { status };
    if (isCancelled) body.is_cancelled=true
    const order = await orderRepository.updateOrder({ _id }, body);
    return order;
}
