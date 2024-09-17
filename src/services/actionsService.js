const whatsappService = require('./whatsappService')
const restaurantService = require('./restaurantService')
const paymentService = require('./paymentService')
const addressService = require('./addressService')
const productService = require('./productService')
const supportService = require('./supportService')
const categoryService = require('./categoryService')
const orderService = require('./orderService')
const apiService = require('./apiService')


const handleHelp = async(restaurant,customer) => {

    const support = await supportService.createSupportService(restaurant,customer,'Generate - Chatbot')
    
    if(!support.success) return 'CREATE_NOT_SUPPORT'

    return 'CREATE_SUPPORT'
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
    const address = await addressService.getAllAddressService(customer)
    if(!address.success) return 'ADDRESS_NOT_ME'
    return [{code:'ADDRESS_ME',type:'list',listResponse:address.data ,style: 'address'}]
};

const handleRestaurantAddress = async (restaurant) => {
    const address = await restaurantService.getAddressService(restaurant)
    if(address.data.length <= 0) return 'ADDRESS_NOT_RESTAURANT'

    return [{code:'ADDRESS_RESTAURANT',placeholder:address.data.name,type:'string'}]
};

const handlePaymentConsult = async(restaurant_id) => {


    const payments = await paymentService.getAllPaymentService(restaurant_id,{fields:'typepayment',active:{
        ne:false
    }})
    if(!payments.data) return 'PAYMENT_NOT_LIST'

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
    const menus = await restaurantService.getAllMenuRestaurantService(restaurant_id)
    if(menus.data.length <= 0) return 'MENU_NOT_BIGLATTER'
    return [{code:'MENU_BIGLATTER',type:'string'},{listResponse:menus,style:'menu',type:'list'}]
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
        return existProduct;
    });
    const orderedPromise  = await Promise.all(promises);
    const orderredProducts = orderedPromise[0].products

    let responseListOrder ={listResponse:orderredProducts,style:'order',code:'PRODUCT_ADD_ORDER_INFO',type:'list'} 

    if((orderredProducts).length < 0) return 'ORDER_START'
    else{
        for(let product of orderredProducts){
            if(typeof product ==='string') return [responseListOrder]
        }
    }
    return [{code:'PRODUCT_SELECTION',type:'string'},responseListOrder]
};

const handleproductConsultation = async(restaurant_id,filter)=>{

    const results = await productService.checkProductAvailability(restaurant_id,filter)

    if(results.data[0]){
        return [{code:'PRODUCT_CONSULT',type:'string',style:'order',placeholder : results.data[0].name}]
    }
    return [{code:'PRODUCT_CONSULT_ERROR',type:'string',style:'order',placeholder : results.data[0].name}]
}

const handleSupportCreateSupport = ()=>{
    //Implementar
}
const handleSupportCancelSupport = ()=>{
    //Implementar
}

const handleCancelation = async(order_id) => {
    const response = await orderService.changeCanceledReasonSelectionStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const handleCancelationOther = async(restaurant,customer,order,descripcion="Ejemplo de problema") => {
    const response =  await orderService.changeCanceledSupportAssistanceStatus(order,restaurant,customer,descripcion)
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

    if (results.data.some(value => value.code === 'ERROR_PRODUCT_INACTIVE')) {
        throw new appError(translatorNextIO('ERROR_PRODUCT_INACTIVE'), 400);
    }
    const promises = results.data.map(async (product) => {
        if(!product.success) return product
        const existProduct = await orderService.createProductOrderService(order_id,restaurant_id,product,increaseQuantity)
        if(!existProduct.success) throw new appError(translatorNextIO(existProduct.code), 400)
        return existProduct.data;
    });

    const orderedProducts  = await Promise.all(promises);

    if(typeof orderedProducts === 'string') return 'ERROR_PRODUCT_ADD_ORDER_INFO'
    else if (orderedProducts[0].products.length === 0){
        return 'PRODUCT_REMOVE_ORDER_INFO'
    }
    else{
        for(let product of orderedProducts[0].products){
            if(typeof product ==='string') return [responseListOrder]
        }
    }


    const normalizeString = (str) => {
        return String(str)
            .normalize('NFC')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');
    };
    
    const promisesInforProducts = (orderedProducts[0].products).map(async (valueProductOrder) => {
        const existsOrderUpdate = products.some((productFilter) => {
            const valueOrderNormalized = normalizeString(valueProductOrder.name);
            const productFilterNormalized = normalizeString(productFilter.value);
            return valueOrderNormalized === productFilterNormalized;
        });
        if (existsOrderUpdate) {

            responseProduct = await productService.getProductService(valueProductOrder.product, "name")

            if(!responseProduct.success) return null

            return {quantity:valueProductOrder.quantity,name:valueProductOrder.name,total:valueProductOrder.total,...responseProduct};
        }
        return null;
    });
    
    const filteredProducts = await Promise.all(promisesInforProducts);
    const validProducts = filteredProducts.filter(product => product !== null);

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

const handleOrderConfirmationSelection = async(order_id) => {
    const response =  await orderService.changeOrderConfirmationStatus(order_id)
    if(!response.success) throw new appError(translatorNextIO(response.code), 400)
    return response.code
}

const handleGetOrderSelection = async(order_id) => {
    const responseOrder = await orderService.getOrderService(order_id)
    if(!responseOrder.success) throw new appError(translatorNextIO(responseOrder.code), 400)
    return [{code:'SUMMARY',type:'string'},{value:responseOrder.data,style:'summary',type:'string'}]
}


const handleAddressCreate = async(restaurant_id,customer_id,order_id,location) => {

    if(!location) return 'NOT_ADDRESS_LOCATION'

    const {lat,lng} = location

    const addressInfo=await apiService.getStreetMap(lat,lng)
    
    if(!addressInfo.success) throw new appError(translatorNextIO(addressInfo.code), 400)

    const responseAddress= await addressService.createAddressService(restaurant_id,customer_id,addressInfo.data.display_name,[lat,lng])

    if(!responseAddress.success) throw new appError(translatorNextIO(responseAddress.code), 400)
    
    const responseOrder = await orderService.createAddressOrderService(order_id,responseAddress.data._id)

    if(!responseOrder.success) throw new appError(translatorNextIO(responseOrder.code), 400)

    return [{code:responseOrder.code,type:'string'},{code:'ADDRESS_SELECTION_CONFIRM',type:'string'}]
}

const handleAddressConfirmation =async(order_id)=>{
    const responseAddressConfirmation= await handleAddressConfirmationSelection(order_id)
    
    if(!responseAddressConfirmation.success) throw new appError(translatorNextIO(responseAddressConfirmation.code), 400)
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
    'order_confirmations_confirm_order': async(restaurant_id,customer_id,_,order_id) => await handleOrderConfirmationSelection(order_id),
    'order_confirmations_confirm_products': async(restaurant_id,customer_id,_,order_id) => await handleProductConfirmationSelection(order_id),
    'order_confirmations_confirm_payment': async(restaurant_id,customer_id,_,order_id) => {
        response = await handlePaymentConfirmationSelection(order_id)
        return [{code:response,type:'string'},{code:'ADDRESS_SELECTION',type:'string'}]
    },
    'order_confirmations_confirm_address': async(restaurant_id,customer_id,_,order_id) => await handleAddressConfirmation(order_id),
    'order_cancelations_cancel_order': async(restaurant_id,customer_id,_,order_id) => await handleCancelation(order_id),
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

        console.log('formatEntities',formatEntities)

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
    'order_payments_consult_payment_name': async(restaurant_id,_,entities,order_id)=>{

        entities = filterEntities(entities, 'payment');
  
        let response = await handlePaymentTypeMethod(restaurant_id, entities[0]);

        if (order_id) {

            const payment = response.length > 0 ? response[0]?.payment : undefined;
            if (!payment) return response;
            response = [];
            const responseAddPayment = await orderService.createPaymentOrderService(order_id, payment._id);

            if (!responseAddPayment.success) {
                throw new appError(translatorNextIO(responseAddPayment.code), 400);
            }

            response.push({ code: responseAddPayment.code, type: 'string' });

            const responseAddressSelection = await orderService.changeAddressSelectionStatus(order_id);
            if (!responseAddressSelection.success) {
                throw new appError(translatorNextIO(responseAddressSelection.code), 400);
            }
            response.push({ code: responseAddressSelection.code, type: 'string' });

            return response;
        }
        return response;
    },
    'address_local_consult': async(restaurant_id)=>await handleRestaurantAddress(restaurant_id),
    'address_consult': async(_,customer_id)=>{
        response = await handleMeAddressList(customer_id)
        return response
    },
    'address_update': (restaurant_id)=>handleMenu(restaurant_id),//handleAddressUpdate,// FALTA
    'address_create': (restaurant_id)=>handleMenu(restaurant_id),//handleAddressCreate,// FALTA
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

exports.handleIntentAction = async (classify, restaurant_id, customer_id,order,location) => {

    const { intent, entities } = classify;
    
    const actionHandler = actionHandlers[intent];
    console.log("intent",intent)
    let response = 'DEFAULT'

    if (!actionHandler) {
        response = 'ERROR_DEFAULT_V1'
    }
    if (order) {   
        if(!order?.address && 'address_selection' === order.status){
            response = await handleAddressCreate(restaurant_id,customer_id,order._id,location);
        }
        else if (allowedIntentsByOrderStatus[order.status].includes(intent)){
            response = await actionHandler(restaurant_id,customer_id,entities,order._id);
        }
        else{
            const messageRespons = {
                product_selection:"ERROR_PRODUCT_SELECTION_DEFAULT",
                payment_method_selection:"ERROR_PAYMENT_METHOD_SELECTION_DEFAULT",
                address_selection:"ERROR_ADDRESS_SELECTION_DEFAULT",
                order_confirmation_selection:"ERROR_ORDER_CONFIRMATION_SELECTION_DEFAULT"
            }
            response = messageRespons[order.status]
        }
    }
    if (!order && restrictedIntentsWithOrder.includes(intent)) {
        response = await actionHandler(restaurant_id,customer_id,entities);
    }
    
    return  {res:response,lng:'es'}
}