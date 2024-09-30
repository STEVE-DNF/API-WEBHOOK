const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const counterSchema = require('./counterModel')
const customerSchema  = require('./customerModel')
const {connection} = require('./connectDatabase')

const orderSchema = new Schema({
    order_counter: { type: String},
    session: { type: Schema.Types.ObjectId, required: [true,"ERROR_MOONGOSE_REQUIRED"], },
    restaurant: { type: Schema.Types.ObjectId, ref: 'restaurant', required: [true,"ERROR_MOONGOSE_REQUIRED"], },
    customer: { type: Schema.Types.ObjectId, ref: "customer" , required: [true,"ERROR_MOONGOSE_REQUIRED"],},
    address:{ type: Schema.Types.ObjectId, ref: 'address'},
    products: [
        {
            product: { type: Schema.Types.ObjectId, ref: 'product' ,required: [true,"ERROR_MOONGOSE_REQUIRED"]},
            name: { 
                type: String
            },
            quantity: { 
                type: Number, 
                min: [1, 'ERROR_ORDER_MIN_LENGTH']
            },
            total: { 
                type: Number, 
                min: [1, 'ERROR_ORDER_MIN_LENGTH'], 
            }
        }
    ],
    paymethod: {
        payment:{ type: Schema.Types.ObjectId, ref: 'payment' },
        /*
        amount_paid :{
            type: Number, 
            min:[1, 'ERROR_MOONGOSE_NUMBER_MIN']
        }
        */
    },
    total_amount: { 
        type: Number, 
        min:[0, 'ERROR_MOONGOSE_NUMBER_MIN'] ,
        default:0
    },
    status: { 
        type: String,
        default: "product_selection",
        enum: ['product_selection', 'payment_method_selection','address_selection', 'order_confirmation_selection','order_confirmation', 'canceled_reason_selection','canceled_support_assistance'],
        message: 'ERROR_MOONGOSE_VALIDATE_ENUM'
    },
    order_status: {
        type: String,
        enum: ['processing','cancelled', 'pending', 'preparation', 'shipped'],
        default: 'processing',
        required: true
    },
    is_cancelled: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }  
},{ timestamps: true });



orderSchema.pre('save', async function (next) {

    if (this.isNew) {
        const customer = await customerSchema.findById(this.customer);

        if (!customer) {
            return next(new Error('Customer not found'));
        }

        if (customer.context !== 'order_context') {
            customer.context = 'order_context';
            await customer.save();
        }
    }

    next();
});

orderSchema.pre('validate', async function (next) {
    function generateOrderNumber(seq) {
        return seq.toString().padStart(8, '0');
    }
    if (!this.order_counter) {
        const counter = await counterSchema.findByIdAndUpdate(
            { _id: this.restaurant },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        )
        this.order_counter = generateOrderNumber(counter.seq);
        this.updatedAt = Date.now();
    }
    next();
});


orderSchema.post(/^findOneAndUpdate/, async function (doc, next) {
    if (!doc) {
        return next(new Error('Order not found'));
    }
    const order = await this.model.findOne(this.getQuery()._id);
    
    let totalProductsAmount = order.products.reduce((acc, product) => acc + parseFloat(product.total || 0), 0);
    
    totalProductsAmount = parseFloat(totalProductsAmount.toFixed(2));

    order.total_amount = totalProductsAmount;

    await order.save();
    next();
});

orderSchema.methods.getFields = function(){
    return ['restaurant','customer','address','products','paymethod','total_amount','status','is_cancelled']
}


module.exports = connection().model("order",orderSchema)