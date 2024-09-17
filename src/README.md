
ruta adapters/controllers

archivo customerController.js

const customerService = require('../../services/customerService')


exports.createOrUpdateCustomer = async (restaurant,phone_number)=>{
    const customer=await customerService.createCustomer({restaurant,phone_number})
    return customer
}
exports.getAllCustomer = async (restaurant)=>{
    const customer=await customerService.getAllCustomer({restaurant})
    return customer
}

exports.activeCustomer =async (_id)=>{
    const customer=await customerService.activeCustomer({_id})
    return customer
}

exports.deleteCustomer =async (_id)=>{
    const customer=await customerService.deleteCustomer({_id})
    return customer
}


archivo errorController.js



const emitError = (socket,dataError)=>{
  socket.emit("clientError",dataError)
}
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (socket,err) => {
  emitError(socket,{
    status: err.status,
    message: err.message,
    stack:err.stack
  })
};

const sendErrorProd = (socket,err) => {
  if (err.isOperatsocketnal) {
    emitError(socket,{
      status: err.status,
      message: err.message
    })
  } else {
    console.error('ERROR', err);
    emitError(socket,{
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
};

module.exports = (socket,err) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(socket,err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(socket,err);
  }
};


archivo handleController.js

const ClientObserver = require('../sockets/clientObserver')
const userService = require('../../services/userService')
const roomService = require('../../services/roomService')
const systemService = require('../../services/systemService')
const util = require('util');
const promisify = util.promisify;
const jwt = require('jsonwebtoken')
const appError= require('../../utils/appError')
const translatorNextIO = require('../../utils/translatorNextIO')

exports.clientAuth= async (socket) => {
    const {token}=socket.handshake.query

    if (!token) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_NOT_TOKEN'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    const currentUser = await userService.getUserService(decoded.id);
    if (!currentUser) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_USER_NOT_EXIST'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_PASSWORD_CHANGE'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    if(currentUser.role !== "admin"){
        socket.emit('clientError',{ 
            status:400,
            message:translatorNextIO('ERROR_DENIED_ACCESS'),
            timestamp: new Date().toISOString()
          })
        socket.disconnect()
    }
    
    const system = await systemService.getSystemService(currentUser.system)

    if(!system.active){
        socket.emit('clientError',translatorNextIO('ERROR_MAX_SESSION'))
        socket.disconnect()
    }

    socket.system= currentUser.system
    socket.restaurant= system.restaurant

    console.log(`Client Connect ${currentUser.name}`)
}

exports.clientInitialize =async(socket,sessionManager)=>{
    

    const clientObserver =  new ClientObserver(sessionManager,socket)

    const session = await clientObserver.initialize()

    if(!session) throw new appError(translatorNextIO('ERROR_MAX_SESSION'),400)

    const checkClient = await sessionManager.addObserver(clientObserver)
    
    if(!checkClient) throw new appError(translatorNextIO('ERROR_CHECK_CLIENT'),400)

    return true
}


archivo orderController.js

const orderService = require('../../services/orderService');
const appError= require('../../utils/appError')
const requireField = require('../../utils/requireField')




exports.getAllOrder = async (socket)=>{

    if(requireField(socket.restaurant)){
        return 'MISSING_REQUIRED_FIELDS'
    } 

    const data=await orderService.getAllOrderService(socket.restaurant)
    
    socket.emit('orderList',{status:"success",data})
}





archivo roomController.js

const roomService = require('../../services/roomService')
const appError= require('../../utils/appError')
const requireField = require('../../utils/requireField')
const sessionService = require('../../services/sessionService')
const sessionManager = require('../sockets/sessionManager')



exports.getAllSessionRoom = async (socket,room)=>{
    socket.join(String(room))
    if (requireField(room)) {
        return 'MISSING_REQUIRED_FIELDS'
    }
    const sessionInstance = sessionManager()
    
    const sessions = await sessionService.getAllSessionService(room)

    const updateSessions = await sessionInstance.updateAllClients(sessions)
    
    socket.emit('sessionList',{status:"success",sessions:updateSessions})
}


exports.getAllRoom = async (socket)=>{
    if (requireField(socket.system)) {
        return 'MISSING_REQUIRED_FIELDS'
    }
    const rooms = await roomService.getAllRoomService(socket.system)
    
    socket.emit('roomList',{status:"success",rooms})
}

archivo whatsappController.js

const whatsappService = require('../../services/whatsappService')
const restaurantService = require('../../services/restaurantService')
const paymentService = require('../../services/paymentService')
const addressService = require('../../services/addressService')
const productService = require('../../services/productService')
const supportService = require('../../services/supportService')
const orderService = require('../../services/orderService')
const apiService = require('../../services/apiService')
const catchAsyncWhatsapp = require('../../utils/catchAsyncWhatsapp')





const typeMessage = async(client , message)=>{

    let [code,...phone] = String(await client.getFormattedNumber(message.from))
    .replace('+','')
    .split(' ')

    phone = phone.join('')

    let body = {formattedNumber:{code,phone},from:message.from}
    
    switch(message.type){
        case 'chat':
            body.message = message.body
            break;
        case 'location':
            body.location = {lat:message.lat,lng:message.lng}
            break;
        default :
            body = undefined
            break;
    }
    return body
}

const getStatusMessage = (status) => {
    let errorCode = '';
    switch (status) {
        case 'product_selection':
            errorCode = 'ERROR_PRODUCT_SELECTION_DEFAULT';
            break;
        case 'payment_method_selection':
            errorCode = 'ERROR_PAYMENT_METHOD_SELECTION_DEFAULT';
            break;
        case 'address_selection':
            errorCode = 'ERROR_ADDRESS_SELECTION_DEFAULT';
            break;
        case 'order_confirmation_selection':
            errorCode = 'ERROR_ORDER_CONFIRMATION_SELECTION_DEFAULT';
            break;
        default:
            errorCode = 'ERROR_DEFAULT';
            break;
    }

    return errorCode;
};


const handleExistingOrder = async (formattedMessage, restaurant, order, customer) => {
    const { message } = formattedMessage;
    const classifyText = await apiService.classifyText(message);

    let [lng, label_01, label_02, label_03, label_04] = String(classifyText.data).split('-');
    let response = undefined;
    console.log('message',message)
    console.log(lng, label_01, label_02, label_03, label_04)

    response = await handleOrderCancellation(label_02, label_03,restaurant,customer,order._id)
    if(!response){
        switch (order.status) {
            case "product_selection":
                response = await handleProductSelection(message,label_02, label_03,restaurant,customer,order);
                break
            case "payment_method_selection":
                response = await handlePaymentMethodSelection(label_03,label_04,restaurant,order)
                break;
            case "address_selection":
                if(`${label_01}`==='address') response = await handleAddressSelection(order, label_02);
                break;
            case "order_confirmation_selection":
                response = handleOrderConfirmationSelection(order, classifyText);
                break;
            case "canceled_reason_selection":
                response = handleOrderConfirmationSelection(order, classifyText);
                break;
            case "canceled_support_assistance":
                response = handleOrderConfirmationSelection(order, classifyText);
                break;
        }
    }
    if(!response) response = getStatusMessage(order.status)

    return { res: response, lng };
}

const handleCancelation = async(order) => {
    return await orderService.changeCanceledReasonSelectionStatus(order)
}

const handleCancelationOther = async(restaurant,customer,order) => {
    return await orderService.changeCanceledSupportAssistanceStatus(order,restaurant,customer)
}

const handleConfirmation = async(order) => {
    return await orderService.changePaymentMethodSelectionStatus(order)
}

const handleCancelationOrder = async (subLabel1,restaurant,customer,order) => {
    switch (subLabel1) {
        case "cancelation":
            return await handleCancelation(order);
        case "cancelationother":
            return await handleCancelationOther(restaurant,customer,order);
    }
}

const handleOrderCancellation = async(subLabel1, subLabel2,restaurant,customer,order)=>{
    switch(subLabel1){
        case "cancelations":
            return await handleCancelationOrder(subLabel2,restaurant,customer,order);
        default:
            return undefined
    }
}

const handleProductSelection =async (message,subLabel1, subLabel2,restaurant,customer,order) => {
    switch (subLabel1) {
        case "confirmations":
            if (subLabel2 === "confirmation") return await handleConfirmation(order._id)
            break;
        default:
            const classifyToken = await apiService.classifyToken(message);
            return await addProductToOrder(restaurant,order,classifyToken);
    }
}
    
const addProductToOrder=async(restaurant,order,products)=>{
        
    if(!(products.length > 0)) return 'ERROR_PRODUCT_ADD_ORDER_INFO'

    const results = await productService.checkProductAvailability(restaurant,products)

    const promises = results.map(async (product) => {
        if(product.type === 'string') return product
        const existProduct = await orderService.createProductOrderService(order._id,restaurant,product)
        return existProduct;
    });

    const orderedProducts  = await Promise.all(promises);

    if(orderedProducts.length < 0) return 'ERROR_PRODUCT_ADD_ORDER_INFO'

    return [{listResponse:orderedProducts,style:'order',code:'PRODUCT_ADD_ORDER_INFO',type:'list'}]

}


const handlePaymentMethodSelection = async(subLabel1,subLabel2,restaurant,order) => {
    const response =  await handleOrderPayments(subLabel1,subLabel2,restaurant);
    const payment = response.length > 0 ? response[0]?.payment : undefined;
    if(!payment) return response
    const responseAddPayment = await orderService.createPaymentOrderService(order._id,payment._id)
    response.push({code:responseAddPayment,type:'string'})
    if(responseAddPayment !== 'PAYMENT_ADD_SUCCESS') return response
    const responseAddressSelection=await orderService.changeAddressSelectionStatus(order._id)
    response.push({code:responseAddressSelection,type:'string'})
    
    return response
}

const handleAddressSelection = async(customer,subLabel1) => {
    switch(subLabel1){
        case 'cancelation':
            break
        case 'confirmation':
            break
        default:
            
            const response = await handleMeAddressList(customer)
            const address = response.length > 0 ? response[0]?.address : undefined;
            if(!address) return response

            break
    }
    

    
}

const handleOrderConfirmationSelection = (order, classifyText) => {
    // Implementa la lógica para manejar la confirmación del pedido aquí
    // Utiliza classifyText para determinar cómo clasificar el mensaje y qué acciones tomar
    // Devuelve la respuesta adecuada
}


const handleNotExistingOrder = async (formattedMessage,restaurant,customer) => {

    const {message}=formattedMessage
    const classifyText = await apiService.classifyText(message)
    const classifyToken = await apiService.classifyToken(message);

    let [lng,label_01, label_02, label_03,label_04] = String(classifyText.data).split('-');
    let response = undefined

    if(classifyToken.length > 0 && `${label_01}.${label_02}` !=='order.requests')  label_01 = 'product'

    switch (label_01) {
        case "greeting":
            response = handleGreeting(label_02);
            break;
        case "menu":
            response = await handleMenu(label_02,restaurant);
            break;
        case "address":
            //Falta agregar al modelo la clasificacion de direcciones del restaurante
            response = await handleAddress(label_02,restaurant,customer);
            break;
        case "order":
            response = await handleOrder(label_02, label_03,label_04,restaurant,customer,classifyToken);
            break;
        case "product":
            //Se utiliza la linea 59 y 54 , caso de que se agregue al 
            //modelo de clasificacion para identifcar 
            //preguntas sobre los productos borrar

            response = await handleProduct(restaurant,classifyToken);
            break;
        case "support":
            response = handleSupport(label_02);
            break;
        default : 
            response = "ERROR_DEFAULT_V1"
            break;
    }
    return  {res:response,lng}
};

const handleGreeting = (subLabel) => {
    switch (subLabel) {
        case "welcome": return handleWelcome();
        case "farewell": return handleFarewell();
    }
};

const handleMenu = async (subLabel,restaurant) => {
    if (subLabel === "bigletter") {
        return await handleBigLetterMenu(restaurant);
    }
};

const handleAddress = async (subLabel,restaurant,customer) => {
    switch (subLabel) {
        case "list": return await handleMeAddressList(customer);
        case "restaurant":return await handleRestaurantAddress(restaurant);
    }
};

const handleOrder = async (subLabel1, subLabel2,subLabel3,restaurant,customer,products) => {
    switch (subLabel1) {
        case "requests":
            if(subLabel2 === 'consult'){
                return await handleOrderConsult(restaurant,customer,products);
            }
        case "payments":
            return await handleOrderPayments(subLabel2,subLabel3,restaurant);
    }
};

const handleOrderConsult = async (restaurant,customer,products) => {


    const order =await orderService.createOrderService(restaurant,customer)

    if(!(products.length > 0 && products.length < 6)) return 'ORDER_START'

    const results = await productService.checkProductAvailability(restaurant,products)

    const promises = results.map(async (product) => {
        if(product?.type === 'string') return product
        const existProduct = await orderService.createProductOrderService(order._id,restaurant,product)
        return existProduct;
    });
    const orderedProducts  = await Promise.all(promises);

    if(orderedProducts.length < 0) return 'ORDER_START'

    return [{code:'ORDER_START',type:'string'},{listResponse:orderedProducts,style:'order',code:'PRODUCT_ADD_ORDER_INFO',type:'list'}]
};

const handleProduct = async (restaurant,products) => {

    const results = await productService.checkProductAvailability(restaurant,products)

    if(results.length <= 0) return 'PRODUCT_NOT'

    let code = 'PRODUCT_EXIST_V1'

    if(results.some((element)=> element.quantity>0)) code ='PRODUCT_EXIST_V2'


    return [{listResponse:results,code,style:'product',type:'list'}]
};

const handleOrderPayments = async(subLabel,subLabel2,restaurant) => {
    switch (subLabel) {
        case "typemethod":
            return await handlePaymentTypeMethod(restaurant);
        case "confirmationtypemethod":
            return await handlePaymentConfirmation(subLabel2,restaurant);
    }
};

const handleSupport = (client, subLabel) => {
    if (subLabel === "help") {
        handleHelp(client);
    }
};

const handleWelcome = () => {

    const hour = (new Date(Date.now())).getHours()

    if(hour >= 0 && hour < 12) return 'WELCOME_D'
    else if(hour >= 12 && hour < 18) return 'WELCOME_T'
    else if(hour >= 18 && hour <= 23) return 'WELCOME_N'

};

const handleFarewell = () => {

    const hour = (new Date(Date.now())).getHours()

    if(hour >= 0 && hour < 12) return 'FAREWELL_D'
    else if(hour >= 12 && hour < 18) return 'FAREWELL_T'
    else if(hour >= 18 && hour <= 23) return 'FAREWELL_N'
};

const handleBigLetterMenu = async (restaurant) => {

    const menus = await restaurantService.getAllMenuRestaurantService(restaurant)

    if(menus.length <= 0) return 'MENU_NOT_BIGLATTER'

    return [{code:'MENU_BIGLATTER',type:'string'},{listResponse:menus,style:'menu',type:'list'}]
};

const handleMeAddressList = async (customer) => {
    const address = await addressService.getAddressService(customer)
    if(!address) return 'ADDRESS_NOT_ME'
    return [{code:'ADDRESS_ME',type:'string',address:address}]
};

const handleRestaurantAddress = async (restaurant) => {
    const address = await restaurantService.getAddressService(restaurant)

    if(address.length <= 0) return 'ADDRESS_NOT_RESTAURANT'

    return [{code:'ADDRESS_RESTAURANT',placeholder:address,type:'string'}]
};

const handleHelp = async(restaurant,customer) => {

    const support = await supportService.createSupportService(restaurant,customer,'Generate - Chatbot')
    
    if(!support) return 'CREATE_NOT_SUPPORT'

    return 'CREATE_SUPPORT'
};

const handlePaymentTypeMethod = async(restaurant) => {


    const query = {fields:'typepayment',active:{
        ne:false
    }}
    const payments = await paymentService.getAllPaymentService(restaurant,query)

    if(!payments) return 'PAYMENT_NOT_LIST'

    return [{code:'PAYMENT_LIST',type:'string'},{listResponse:payments,style:'payment',type:'list'}]
};

const handlePaymentConfirmation = async(payment,restaurant) => {
    //////////////////////////////
    const capitalize = payment.split('.')[1]
    //////////////////////////////////////////
    let paymentEqual= capitalize.charAt(0).toUpperCase() + capitalize.slice(1)
    const payments = await paymentService.getAllPaymentService(restaurant,{fields:'typepayment',active:{
        ne:false
    }})
    //some
    const paymentSome = payments.find((payment)=>String(payment.typepayment.method.get('en')) === String(paymentEqual))

    if(!paymentSome) return 'PAYMENT_NOT'

    return [{code:'PAYMENT_EXIST',type:'string',style:'payment',placeholder : paymentEqual,payment:paymentSome}]
};

/*
 * Esta función maneja la recepción y procesamiento de mensajes en un sistema de pedidos mediante WhatsApp. 
 * La función se encarga de formatear el número de teléfono del cliente, clasificar el mensaje según su tipo,
 * y delegar el manejo de la orden actual o una nueva orden a funciones específicas dependiendo del contexto del mensaje.
 * Además, gestiona las diferentes etapas del proceso de pedido, desde la selección de productos hasta la confirmación y pago,
 * utilizando servicios de clasificación y manejo de datos. Esto asegura que cada interacción del cliente sea procesada correctamente
 * y se responda adecuadamente según el estado actual del pedido.
 */

exports.receivedMessage = catchAsyncWhatsapp(async(client,message,options)=>{

    

    if(!message) return 

    const {restaurant,ready,active} = options
    const formattedMessage = await typeMessage(client,message)

    await whatsappService.checkScheduleState(restaurant,ready,active)

    const customer =await whatsappService.createCustomer(restaurant,formattedMessage.formattedNumber.code , formattedMessage.formattedNumber.phone)
    const existOrder =await whatsappService.existOrder(customer._id)
    
    if(!existOrder) return await handleNotExistingOrder(formattedMessage,restaurant,customer._id)
    
    return await handleExistingOrder(formattedMessage,restaurant,existOrder,customer._id)


})
