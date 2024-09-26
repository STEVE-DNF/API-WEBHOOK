const whatsappService = require('../../services/whatsappService')
const actionsService = require('../../services/actionsService')
const apiService = require('../../services/apiService')
const catchAsyncWhatsapp = require('../../utils/catchAsyncWhatsapp')
const appError= require('../../utils/appError')

const typeMessage = async(client , message)=>{

    let [code,...phone] = String(await client.getFormattedNumber(message.from))
    .replace('+','')
    .split(' ')

    phone = phone.join('')

    let body = {formattedNumber:{code,phone},from:message.from,type:message.type}

    switch(message.type){
        case 'chat':
            body.message = message.body
            break;
        case 'location':
            body.location = {lat:message._data.lat,lng:message._data.lng,name:message._data.loc,description:message._data.location?.description}
            break;
        default :
            body = undefined
            break;
    }
    return body
}

const checkTypeMessage = (value)=>['chat','location'].includes(value)

exports.receivedMessage = catchAsyncWhatsapp(async (client, message, options) => {
    // Verifica si el mensaje es válido
    if (!message) return;

    const { restaurant: restaurant_id, ready, active } = options;
    
    const formattedMessage = await typeMessage(client, message);

    const customer = await whatsappService.createCustomer(
        restaurant_id,
        formattedMessage.formattedNumber.code,
        formattedMessage.formattedNumber.phone
    );
    console.log('customer',customer)
    const existOrder = await whatsappService.existOrder(customer.data._id);
    console.log('existOrder',existOrder)
    let responseParse = { data : {intent: [], entities: []}};
    console.log('responseParse',responseParse)
    if (checkTypeMessage(formattedMessage.type)) {
        if (formattedMessage.type !== 'location') {
            responseParse = await apiService.parseMessage(restaurant_id, formattedMessage.message);
        }
        console.log(responseParse)
        return await actionsService.handleIntentAction(
            responseParse.data,
            restaurant_id,
            customer.data.data._id,
            existOrder.data.data,
            formattedMessage.location
        );
    }
    return { res: 'NOT_FOUND_TYPE_MESSAGE', lng: 'es' };
});
