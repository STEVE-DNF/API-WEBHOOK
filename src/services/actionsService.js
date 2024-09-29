const customerService = require('./customerService')
const restaurantService = require('./restaurantService')
const paymentService = require('./paymentService')
const addressService = require('./addressService')
const productService = require('./productService')
const supportService = require('./supportService')
const categoryService = require('./categoryService')
const orderService = require('./orderService')
const apiService = require('./apiService')
const appError= require('../utils/appError')
const translatorNextIO= require('../utils/translatorNextIO')

const handleHelp = async(restaurant,customer) => {

    const support = await supportService.createSupportService(restaurant,customer,'Generate - Chatbot')
    
    if(!support.success) return support.code

    return support.code
};

const filterEntities = (entities, entity) => {
    if (!Array.isArray(entities)) return [];

    return entities.filter((value) => {
        if (typeof entity === 'string') {
            return String(value.entity).toUpperCase() === String(entity).toUpperCase();
        }
        if (Array.isArray(entity)) {
            return entity.includes(String(value.entity).toUpperCase());
        }
        return false;
    });
};

const handleMeAddressList = async (customer) => {
    const address = await addressService.getAddressService(customer)
    if(!address.success) return address.code
    return [{code:'ADDRESS_ME',type:'string',placeholder:address.data.reference}]
};

const handleRestaurantAddress = async (restaurant) => {
    const address = await restaurantService.getAddressService(restaurant)
    if(!address.success) return address.code
    return [{code:address.code,placeholder:address.data.name,type:'string'}]
};

const handlePaymentConsult = async(restaurant_id) => {


    const payments = await paymentService.getAllPaymentService(restaurant_id,{fields:'typepayment',active:{
        ne:false
    }})
    if(!payments.success) return payments.code

    return [{code:'PAYMENT_LIST',type:'string'},{listResponse:payments.data,style:'payment',type:'list'}]
};

const handlePaymentTypeMethod = async(restaurant_id,recognizedEntity) => {

 
    const payments = await paymentService.getAllPaymentService(restaurant_id,{fields:'typepayment',active:{
        ne:false
    }})

    const regexPattern = new RegExp(recognizedEntity.value, 'i');
    const filteredPayments = payments.data.filter(payment =>{
        return regexPattern.test(payment.typepayment.method.get('es'))}
    );

    paymentPattern = filteredPayments[0]

    if(!paymentPattern) return 'PAYMENT_NOT'

    return [{code:'PAYMENT_EXIST',type:'string',style:'payment',placeholder : String(recognizedEntity.value),payment:paymentPattern}]
};


const handleMenu = async (restaurant_id) => {
    const menu = await restaurantService.getAllMenuRestaurantService(restaurant_id)
    if(!menu.success) return menu.code
    return [{code:menu.code,type:'string'},{listResponse:menu.data,style:'menu',type:'list'}]
};



const handleWelcomeOrFarewell = (typeGreeting) => {

    const hour = (new Date(Date.now())).getHours()
    if(hour >= 0 && hour < 12) return typeGreeting ?'WELCOME_D':'FAREWELL_D'
    else if(hour >= 12 && hour < 18) return typeGreeting ?'WELCOME_T':'FAREWELL_T'
    else if(hour >= 18 && hour <= 23) return typeGreeting ?'WELCOME_N':'FAREWELL_N'

};


const handleOrderCreate = async (restaurant_id,customer_id,products) => {

    if(!(products.length > 0 && products.length < 6)) throw new appError(translatorNextIO('PRODUCT_NOT_ORDER'), 400)

    const results = await productService.checkProductAvailability(restaurant_id,products)

    for (const value of results.data) {
        if (value.code === 'ERROR_PRODUCT_INACTIVE') {
            return [value]
        }
    }
    const order =await orderService.createOrderService(restaurant_id,customer_id)

    if(!order.success) throw new appError(translatorNextIO(order.code), 400)

    const promises = results.data.map(async (product) => {
        if(product?.type === 'string') return product
        const existProduct = await orderService.createProductOrderService(order.data._id,restaurant_id,product,true)
        if(!existProduct.success) throw new appError(translatorNextIO(existProduct.code), 400)
        return existProduct.data;
    });
    const orderedPromise  = await Promise.all(promises);
    const flattenedOrders = orderedPromise.flat();

    let responseListOrder ={listResponse:flattenedOrders,style:'order',code:'PRODUCT_ADD_ORDER_INFO',type:'list'} 
    if((flattenedOrders).length < 0) return 'ORDER_START'
    else{
        for(let product of flattenedOrders){
            if(typeof product ==='string') return [responseListOrder]
        }
    }
    return [{code:'PRODUCT_SELECTION',type:'string'},responseListOrder]
};

const handleproductConsultation = async(restaurant_id,filter)=>{

    const results = await productService.checkProductAvailability(restaurant_id,filter)

    const response = results.data.map(value => ({
        code: value.code === 'ERROR_PRODUCT_INACTIVE' ? 'ERROR_PRODUCT_INACTIVE' : 'PRODUCT_CONSULT',
        type: 'string',
        style: 'order',
        placeholder: value.placeholder
    }));
    return response
}

const handleSupportCreateSupport = ()=>{
    //Implementar
}
const handleSupportCancelSupport = ()=>{
    //Implementar
}

const handleUpdateOrAppendMeAddress =async(customer_id)=>{
    const address = await addressService.getMainAddressService(customer_id)
    if(!address.success) {
        const customer=await customerService.setAddressAddContext(customer_id)
        //Agregar informacion al usuario en caso de que no funcione
        return [{code:'ADDRESS_ADD_ME',type:'string'}]
    }
    const customer=await customerService.setAddressUpdateContext(customer_id)
    return [{code:'ADDRESS_EXIST_UPDATE',type:'string',placeholder:address.data.reference},{code:'ADDRESS_UPDATE',type:'string'}]
}


const handleMainAddressToOrder = async (customer_id, order_id) => {
    const address = await addressService.getMainAddressService(customer_id);
    if (!address.success) throw new appError(translatorNextIO(address.code), 400)

    const result = await orderService.createAddressOrderService(order_id, address.data._id);
    if (!result.success) throw new appError(translatorNextIO(address.code), 400)

    return [{ code: result.code, type: 'string' }];
};

const handleCancelation = async(customer_id,order_id) => {

    const customer=await customerService.setNormalUpdateContext(customer_id);
    if(!customer.success) return customer.code

    const response = await orderService.changeCanceledReasonSelectionStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)

    return response.code
}

const handleCancelationOther = async(restaurant,customer_id,order_id,descripcion="Ejemplo de problema") => {
    const customer=await customerService.setNormalUpdateContext(customer_id);
    if(!customer.success) return customer.code

    const response =  await orderService.changeCanceledSupportAssistanceStatus(order_id,restaurant,customer_id,descripcion)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const combineQuantityAndProduct = (entities, categories) => {
    const combinedEntities = [];
    let skipNext = false;
    let quantityPendingNumber = 0
    for (let i = 0; i < entities.length; i++) {
        if (skipNext) {
            skipNext = false;
            continue;
        }
        const currentEntity = entities[i];

        if (currentEntity.entity === 'quantity' &&
            !isNaN(currentEntity.value) &&
            i + 1 < entities.length) {
            if(categories.includes(String(entities[i + 1].entity).toUpperCase())){
                const combinedEntity = {
                    entity: entities[i + 1].entity,
                    value: entities[i + 1].value,
                    quantity: currentEntity.value,
                    start: currentEntity.start,
                    end: entities[i + 1].end,
                    confidence_entity: Math.min(currentEntity.confidence_entity, entities[i + 1].confidence_entity),
                    extractor: 'CombinedExtractor'
                }
                combinedEntities.push(combinedEntity);
            }
            else{
                quantityPendingNumber=currentEntity.value
            }    
            skipNext = true;
        } else if (categories.includes(String(currentEntity.entity).toUpperCase())) {
            const combinedEntity = {
                entity: currentEntity.entity,
                value: currentEntity.value,
                quantity: quantityPendingNumber,
                start: currentEntity.start,
                end: currentEntity.end,
                confidence_entity: currentEntity.confidence_entity,
                extractor: currentEntity.extractor
            };
            combinedEntities.push(combinedEntity);
        } else {
            combinedEntities.push(currentEntity);
        }
    }

    return combinedEntities;
};

const handleOrderUpdateProducts=async(restaurant_id,order_id,products,increaseQuantity = true)=>{

    if(!(products.length > 0)) return 'ERROR_PRODUCT_ADD_ORDER_INFO'

    const results = await productService.checkProductAvailability(restaurant_id,products)

    const responseCheckProduct=results.data.map((value)=>{

        if (typeof value !=='string') return null
        return {
            code: value,
            type:'string'
        }
    }).filter(Boolean)

    if(responseCheckProduct.length > 0) return responseCheckProduct

    const promises = results.data.map(async (product) => {

        const existProduct = await orderService.createProductOrderService(order_id,restaurant_id,product,increaseQuantity)
        if(!existProduct.success) return existProduct.code
        return existProduct.data;
    });

    const orderedProducts  = await Promise.all(promises);
    const flattenedProducts = orderedProducts.flat();

    if(typeof flattenedProducts === 'string') return 'ERROR_PRODUCT_ADD_ORDER_INFO'
    
    else if (Array.isArray(flattenedProducts) && flattenedProducts.length === 0) {
        return 'PRODUCT_REMOVE_ORDER_INFO';
    }

    const responseOrdered=flattenedProducts.map((value)=>{

        if (typeof value !=='string') return null
        return {
            code: value,
            type:'string'
        }
    }).filter(Boolean)


    if(responseOrdered.length > 0) return responseOrdered


    const normalizeString = (str) => {
        return String(str)
            .normalize('NFC')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');
    };

    const promisesInforProducts = flattenedProducts.map(async (valueProductOrder) => {
        const existsOrderUpdate = products.some((productFilter) => {
            const valueOrderNormalized = normalizeString(valueProductOrder.name);
            const productFilterNormalized = normalizeString(productFilter.value);

            return valueOrderNormalized === productFilterNormalized;
        });
        if (existsOrderUpdate) {
            const responseProduct = await productService.getProductService(valueProductOrder.product, "name")
            if(!responseProduct.success) return responseProduct.code

            return {quantity:valueProductOrder.quantity,name:valueProductOrder.name,total:valueProductOrder.total,...responseProduct.data};
        }
        return null;
    });
    
    const filteredProducts = await Promise.all(promisesInforProducts);
    const validProducts = filteredProducts.filter(product => product !== null);
    const responseValidProducts=validProducts.map((value)=>{
        if (typeof value !=='string') return null
        return {
            code: value,
            type:'string'
        }
    }).filter(Boolean)

    if(responseValidProducts.length > 0) return responseValidProducts

    return [{listResponse:validProducts,style:'order',code:increaseQuantity ? 'PRODUCT_ADD_ORDER_INFO':'PRODUCT_UPDATE_ORDER_INFO',type:'list'}]
}


const handleProductConfirmationSelection = async(order_id) => {
    const response = await orderService.changePaymentMethodSelectionStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const handlePaymentConfirmationSelection = async(order_id) => {
    const response =  await orderService.changeAddressSelectionStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const handleAddressConfirmationSelection = async(order_id) => {
    const response =  await orderService.changeOrderConfirmationSelectionStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const handleOrderConfirmationSelection = async(customer_id,order_id) => {

    const customer=await customerService.setNormalUpdateContext(customer_id)
    if(!customer.success) throw new appError(translatorNextIO(customer.code), 400)
    const response =  await orderService.changeOrderConfirmationStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const handleGetOrderSelection = async(order_id) => {
    const responseOrder = await orderService.getOrderService(order_id)
    if(!responseOrder.success) throw new appError(translatorNextIO(responseOrder.code), 400)
    return [{code:'SUMMARY',type:'string'},{value:responseOrder.data,style:'summary',type:'string'}]
}


const handleAddress = async (restaurant_id, customer_id, location, isUpdate = false,isOrder = false) => {
    if (!location) return 'NOT_ADDRESS_LOCATION';

    const { lat, lng } = location;

    let responseAddress;
    if (isUpdate) {
        responseAddress = await addressService.updateAddressService(restaurant_id,customer_id, [lat, lng]);
    } else {
        responseAddress = await addressService.createTempAddressService(restaurant_id, customer_id, [lat, lng]);
    }

    if (!responseAddress.success){
        let customer;
        if (isOrder) {
            if(isUpdate) customer = await customerService.setAddressUpdateContext(customer_id);
            else customer = await customerService.setAddressAddContext(customer_id);
        } else {
            customer = await customerService.setNormalUpdateContext(customer_id);
        }
        if (!customer.success) return customer.code;
        
        return [{ code: responseAddress.code, placeholder:responseAddress.placeholder,type: 'string' }];
    }
    return [{ code: responseAddress.code, placeholder:responseAddress.placeholder,type: 'string' },{code:"ADDRESS_CONTEXT_CONFIRM",type: 'string'}];
};

const handleAddressCreate = async (restaurant_id, customer_id, location,isOrder = false) => {
    return await handleAddress(restaurant_id, customer_id, location, false,isOrder);
};

const handleAddressUpdate = async (restaurant_id, customer_id, location,isOrder = false) => {
    return await handleAddress(restaurant_id, customer_id, location, true,isOrder);
};

const handleAddressTempUpdate = async (restaurant_id, customer_id,isConfirm) => {
    let addressTemp
    if(isConfirm){
        addressTemp = await addressService.updateAddressTempConfirmService(restaurant_id,customer_id)
    }
    else{
        addressTemp = await addressService.updateAddressTempCancelService(restaurant_id,customer_id)
    }

    const customer = await customerService.setNormalUpdateContext(customer_id);
    if (!customer.success) return customer.code;

    return [{ code: addressTemp.code, type: 'string', placeholder:addressTemp.placeholder}]
};


const handleAddressConfirmation =async(order_id)=>{
    const responseAddressConfirmation= await handleAddressConfirmationSelection(order_id)
    const responseOrderDetails = await handleGetOrderSelection(order_id)
    return [...responseOrderDetails,{code:responseAddressConfirmation,type:'string'}]
}

const responseMessageList = (response,responseAfter)=>{
    let responseAllMessage = []

    if(typeof response === 'string'){
        responseAllMessage.push({code:response,type:'string'})
    }
    else{
        responseAllMessage.push(...response)
    }

    if(responseAfter){
        responseAllMessage.push(responseAfter)
    }
    return responseAllMessage.reverse()
}

const actionHandlers = {
    'support_create_support': ()=>handleSupportCreateSupport(),
    'support_cancel_support': ()=>handleSupportCancelSupport(),
    'greeting_greet': ()=>handleWelcomeOrFarewell(true),
    'greeting_farewell': ()=>handleWelcomeOrFarewell(false),
    'menu_general': async(restaurant_id)=>await handleMenu(restaurant_id),
    'order_confirmations_confirm_order': async(restaurant_id,customer_id,_,order_id) => await handleOrderConfirmationSelection(customer_id,order_id),
    'order_confirmations_confirm_products': async(restaurant_id,customer_id,_,order_id) => await handleProductConfirmationSelection(order_id),
    'order_confirmations_confirm_payment': async(restaurant_id,customer_id,_,order_id) => {
        const response = await handlePaymentConfirmationSelection(order_id)

        return [{code:response,type:'string'},{code:'ADDRESS_SELECTION',type:'string'}]
    },
    'order_confirmations_confirm_address': async(restaurant_id,customer_id,_,order_id) => await handleAddressConfirmation(order_id),
    'order_cancelations_cancel_order': async(restaurant_id,customer_id,_,order_id) => await handleCancelation(customer_id,order_id),
    'order_cancelations_cancel_order_with_support': async(restaurant_id,customer_id,_,order_id) => await handleCancelationOther(restaurant_id,customer_id,order_id),
    'order_requests_create_order': async(restaurant_id,customer_id,entities)=>{

        let categories = await categoryService.getAllCategoryService(restaurant_id,{ active: true })

        categories = categories.data.map((value)=>String(value.name).toUpperCase())
        
        const formatEntities=combineQuantityAndProduct(entities,categories)

        const filter = filterEntities(formatEntities,categories)
        response = await handleOrderCreate(restaurant_id,customer_id,filter)
        return responseMessageList(response)
    },
    'order_requests_consult_amount': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsConsultAmount,// FALTA
    'order_requests_provide_delivery_time': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsProvideDeliveryTime,// FALTA
    'order_requests_consult_order': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsConsultOrder,// FALTA
    'order_requests_consult_modify_order': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsConsultModifyOrder,// FALTA
    'order_requests_update_products': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsUpdateProducts,// FALTA
    'order_requests_update_address': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsUpdateAddress,// FALTA
    'order_requests_consult_address': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsConsultAddress,// FALTA
    'order_requests_update_payment': (restaurant_id)=>handleMenu(restaurant_id),//handleOrderRequestsUpdatePayment,// FALTA
    'order_requests_add_product': async(restaurant_id,customer_id,entities,order_id)=>{

        let categories = await categoryService.getAllCategoryService(restaurant_id,{ active: true })

        categories = categories.data.map((value)=>String(value.name).toUpperCase())
        
        const formatEntities=combineQuantityAndProduct(entities,categories)

        const filter = filterEntities(formatEntities,categories)

        let response = ''

        if(order_id){
            response =  await handleOrderUpdateProducts(restaurant_id,order_id,filter,true)
        }
        else{
            response = await handleOrderCreate(restaurant_id,customer_id,filter)
        }
        return responseMessageList(response)

    },
    'order_requests_remove_product': async(restaurant_id,customer_id,entities,order_id)=>{

        let categories = await categoryService.getAllCategoryService(restaurant_id,{ active: true })

        categories = categories.data.map((value)=>String(value.name).toUpperCase())
        
        const formatEntities=combineQuantityAndProduct(entities,categories)

        const filter = filterEntities(formatEntities,categories)

        response =  await handleOrderUpdateProducts(restaurant_id,order_id,filter,false)

        return responseMessageList(response)

    },
    'order_requests_modify_product': async(restaurant_id,customer_id,entities,order_id)=>{

        let categories = await categoryService.getAllCategoryService(restaurant_id,{ active: true })

        categories = categories.data.map((value)=>String(value.name).toUpperCase())
        
        const formatEntities=combineQuantityAndProduct(entities,categories)

        const filter = filterEntities(formatEntities,categories)

        let response = ''

        if(order_id){
            response =  await handleOrderUpdateProducts(restaurant_id,order_id,filter)
        }
        else{
            response = await handleOrderCreate(restaurant_id,customer_id,filter)
        }

        return responseMessageList(response)
    },
    'order_payments_consult_payment': (restaurant_id)=>handlePaymentConsult(restaurant_id),
    'order_payments_consult_payment_name': async(restaurant_id,customer_id,entities,order_id)=>{

        entities = filterEntities(entities, 'payment');
  
        let response = await handlePaymentTypeMethod(restaurant_id, entities[0]);

        if (order_id) {

            const payment = response.length > 0 ? response[0]?.payment : undefined;
            if (!payment) return response;
            response = [];
            const responseAddPayment = await orderService.createPaymentOrderService(order_id, payment._id);

            if (!responseAddPayment.success) {
                return responseAddPayment.code
            }

            response.push({ code: responseAddPayment.code, type: 'string' });

            const responseAddressSelection = await orderService.changeAddressSelectionStatus(order_id);
            if (!responseAddressSelection.success) {
                return responseAddressSelection.code
            }

            const address = await addressService.getAddressService(customer_id)

            if(address.success){
                return [...response,{code:'ADDRESS_ORDER_EXIST',type:'string',placeholder:address.data.reference}]
            }

            response.push({ code: responseAddressSelection.code, type: 'string' });

            const customer = await customerService.setAddressAddContext(customer_id);

            return response;
        }
        return response;
    },
    'address_local_consult': async(restaurant_id)=>await handleRestaurantAddress(restaurant_id),
    'address_consult': async(_,customer_id)=>{
        response = await handleMeAddressList(customer_id)
        return response
    },
    'address_update': async(_,customer_id)=>await handleUpdateOrAppendMeAddress(customer_id),//handleAddressUpdate,// FALTA
    'address_create': async(_,customer_id)=>await handleUpdateOrAppendMeAddress(customer_id),
    'address_delete': (restaurant_id)=>handleMenu(restaurant_id),//handleAddressDelete,// FALTA
    'address_deleteAll': (restaurant_id)=>handleMenu(restaurant_id),//handleAddressDeleteAll,// FALTA
    'product_consultation': async(restaurant_id,_,entities)=>{

        let categories = await categoryService.getAllCategoryService(restaurant_id,{ active: true })

        categories = categories.data.map((value)=>String(value.name).toUpperCase())
        
        const formatEntities=combineQuantityAndProduct(entities,categories)

        const filter = filterEntities(formatEntities,categories)

        response = await handleproductConsultation(restaurant_id,filter)
        return response
    },
};

const restrictedIntentsWithOrder = [
    'order_requests_create_order',
    'order_requests_add_product',
    'order_requests_modify_product',
    'support_create_support',
    'support_cancel_support',
    'greeting_greet',
    'menu_general',
    'order_payments_consult_payment',
    'order_payments_consult_payment_name',
    'address_consult',
    'address_update',
    'address_create',
    'address_delete',
    'address_deleteAll',
    'product_consultation',
];


const allowedIntentsByOrderStatus = {
    product_selection: [
        'order_confirmations_confirm_products',
        'order_requests_modify_product',
        'order_requests_add_product',
        'order_requests_remove_product',
        'product_consultation',
        'order_cancelations_cancel_order',
        'order_cancelations_cancel_order_with_support',
    ],
    payment_method_selection: [
        'order_payments_consult_payment',
        'order_payments_consult_payment_name',
        'order_confirmations_confirm_payment',
        'order_requests_update_payment',
        'order_cancelations_cancel_order',
        'order_cancelations_cancel_order_with_support',
    ],
    address_selection: [
        'address_consult',
        'address_update',
        'address_create',
        'order_cancelations_cancel_order',
        'order_cancelations_cancel_order_with_support',

    ],
    address_confirmation: [
        'address_consult',
        'address_update',
        'address_create',
        'order_confirmations_confirm_address',
        'order_cancelations_cancel_order',
        'order_cancelations_cancel_order_with_support',

    ],
    order_confirmation_selection: [
        'order_confirmations_confirm_order',
        'order_cancelations_cancel_order',
        'order_cancelations_cancel_order_with_support',
        'order_requests_provide_delivery_time',
        'order_requests_consult_amount',
        'order_requests_consult_order',
        'order_requests_consult_modify_order',
        'order_requests_update_products',
        'order_requests_update_address',
        'order_requests_consult_address',
        'order_requests_update_payment',
    ],
    order_confirmation: [
        'order_confirmations_confirm_order',
        'order_cancelations_cancel_order',
        'order_cancelations_cancel_order_with_support',
        'order_requests_provide_delivery_time',
        'order_requests_consult_amount',
        'order_requests_consult_order',
        'order_requests_consult_modify_order',
        'order_requests_update_products',
        'order_requests_update_address',
        'order_requests_consult_address',
        'order_requests_update_payment',
    ]
};


async function handleOrderRelatedIntent(intent, entities, restaurant_id, customer, order) {


    console.log('order',order)
    console.log('allowedIntentsByOrderStatus',allowedIntentsByOrderStatus[order.status])
    console.log('intent',intent)
    if (allowedIntentsByOrderStatus[order.status].includes(intent)) {
        const response = await actionHandlers[intent](restaurant_id, customer._id, entities, order._id);
        return { res: response, lng: 'es' };
    }
    
    const isOrder = order?.status === 'address_selection';

    if(isOrder){
        switch(intent) {
            case "confirm_all":
                const respAddress = await handleMainAddressToOrder(customer._id,order._id)

                console.log("respAddress",respAddress)
                resp=await handleAddressConfirmation(order._id)
                return { res: [...resp,respAddress], lng: 'es' };

            case "cancel_all":
                const orderResponse = await customerService.setAddressAddContext(customer._id);
                if(!orderResponse.success) return { res: { code: orderResponse.code, type: 'string'}, lng: 'es' };
                return { res: [{ code: 'ADDRESS_SELECTION_CANCEL', type: 'string'}], lng: 'es' };
        }
    }
    const errorMessages = {
        product_selection: "ERROR_PRODUCT_SELECTION_DEFAULT",
        payment_method_selection: "ERROR_PAYMENT_METHOD_SELECTION_DEFAULT",
        address_selection: "ERROR_ADDRESS_SELECTION_DEFAULT",
        order_confirmation_selection: "ERROR_ORDER_CONFIRMATION_SELECTION_DEFAULT"
    };

    return { res: errorMessages[order.status] || 'DEFAULT', lng: 'es' };
}

exports.handleIntentAction = async (classify, restaurant_id, customer, location) => {
    const { intent, entities } = classify;

    if (customer.context === 'order_context') {

        const order = await orderService.getOrderPendingService(customer._id)
        return await handleOrderRelatedIntent(intent, entities, restaurant_id, customer, order?.data, location);
    }

    if (customer.context === 'normal_context' && restrictedIntentsWithOrder.includes(intent)) {
        const response = await actionHandlers[intent](restaurant_id, customer._id, entities);
        return { res: response, lng: 'es' };
    }

    if (['address_add_context', 'address_update_context'].includes(customer.context)) {
        const order = await orderService.getOrderPendingService(customer._id);
        const isOrder = order?.data?.status === 'address_selection';
        if (location) {
            if (customer.context === 'address_add_context') {
                const response = await handleAddressCreate(restaurant_id, customer._id, location, isOrder);
                return { res: response, lng: 'es' };
            } else if (customer.context === 'address_update_context') {
                const response = await handleAddressUpdate(restaurant_id, customer._id, location, isOrder);
                return { res: response, lng: 'es' };
            }
        } else {
            let resp;
            switch(intent) {
                case "confirm_all":
                    resp = await handleAddressTempUpdate(restaurant_id, customer._id, true);
                    
                    if (isOrder) {
                        const orderResponse = await customerService.setOrderContext(customer._id);

                        if(!orderResponse.success) return { res: { code: orderResponse.code, type: 'string'}, lng: 'es' };

                        return { res: [...resp, { code: 'ADDRESS_SELECTION_CONFIRM', type: 'string'}], lng: 'es' };
                    }
                    return { res: resp, lng: 'es' };

                case "cancel_all":
                    resp = await handleAddressTempUpdate(restaurant_id, customer._id, false);

                    if (isOrder) {
                        return { res: { code: 'ADDRESS_SELECTION_CANCEL', type: 'string'}, lng: 'es' };
                    }

                    return { res: resp, lng: 'es' };
            }
        }
    }
    if (!actionHandlers[intent]) {
        return { res: 'ERROR_DEFAULT_V1', lng: 'es' };
    }
    return { res: 'DEFAULT', lng: 'es' };
};