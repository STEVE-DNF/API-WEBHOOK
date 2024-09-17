const translatorNextIO = require('./translatorNextIO');
const { List } = require('whatsapp-web.js');

module.exports = (fn) => {
    return async (client, message, options) => {
        try {
            const result = await fn(client, message, options);
            console.log('result', result.res);

            if (typeof result.res === 'string') {
                await client.sendMessage(options.from, translatorNextIO(result.res, undefined, result.lng));
            } else {
                for (const response of result.res) {
                    await handleResponse(client, response, options, result.lng);
                }
            }
        } catch (err) {
            console.log(err);
            await client.sendMessage(options.from, translatorNextIO(err.message || 'ERROR_MESSAGE', undefined, 'es'));
        }
    };
};

const handleResponse = async (client, response, options, lng) => {
    switch (response.type) {
        case 'string':
            await handleStringResponse(client, response, options, lng);
            break;
        case 'list':
            await handleListResponse(client, response, options, lng);
            break;
    }
};

const handleStringResponse = async (client, response, options, lng) => {
    switch (response.style) {
        case 'summary':
            await handleSummaryResponse(client, response, options, lng);
            break;
        default:
            await client.sendMessage(options.from, translatorNextIO(response.code, { placeholder: response.placeholder }, lng));
            break;
    }
};

const handleSummaryResponse = async (client, response, options, lng) => {
    const responseCodes = [
        "SUMMARY_ORDER_PRODUCT",
        "SUMMARY_ORDER_PAYMENT",
        "SUMMARY_ORDER_ADDRESS",
        "SUMMARY_ORDER_TOTAL"
    ];

    for (const code of responseCodes) {
        if (code === 'SUMMARY_ORDER_PRODUCT') {
            for (const [index, product] of response.value.products.entries()) {
                await client.sendMessage(options.from, translatorNextIO(code, {
                    index: index + 1,
                    name: product.name,
                    quantity: product.quantity,
                    total: product.total
                }, lng));
            }
        } else {
            await client.sendMessage(options.from, translatorNextIO(code, {
                address: response.value.address.reference,
                payment: response.value.paymethod.payment.typepayment.method.get(lng),
                total: response.value.total_amount
            }, lng));
        }
    }
};

const handleListResponse = async (client, response, options, lng) => {
    for (const [index, element] of response.listResponse.entries()) {
        switch (response.style) {
            case 'menu':
                await client.sendMessage(options.from, `🍽️${index + 1}.-${element.title}🍽️\n\n👉 Click : ${element.link}`);
                break;
            case 'address':
                await client.sendMessage(options.from, `${index + 1}.- ${element.reference}`);
                break;
            case 'product':
                await client.sendMessage(options.from, translatorNextIO(response.code, {
                    name: element.name,
                    price: element.price,
                    quantity: element.quantity,
                    total: element.total
                }, lng));
                if (element.quantity >= 5) {
                    await client.sendMessage(options.from, translatorNextIO('PRODUCT_WARNING_MAX', undefined, lng));
                }
                break;
            case 'payment':
                await client.sendMessage(options.from, `${index + 1}.-${element.typepayment.method.get(lng)}`);
                break;
            case 'order':
                if (element.type === 'string') {
                    await client.sendMessage(options.from, translatorNextIO(element.code, { placeholder: element.placeholder }, lng));
                } else {
                    await client.sendMessage(options.from, translatorNextIO(response.code, {
                        name: element.name,
                        quantity: element.quantity,
                        total: element.total
                    }, lng));
                }
                break;
        }
    }
};
