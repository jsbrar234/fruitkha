const { Schema, model, Collection } = require("mongoose");

const orderSchema = new Schema({
    userId: {
        type: Schema.ObjectId,
        required: true
    },
    products: [{
        productId: {
            type: Schema.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        }
    }],
    addressId: {
        type: Schema.ObjectId,
        required: true
    },
    paymentMethodId : {
        type : String, 
        required : true
    },
    deliveryCharge : {
        type : Number,
        default : 45
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed'],
        default: 'pending'
    },
},
    { timestamps: true }
)

// create a model or a collection

const Order = new model('orders', orderSchema);
module.exports = Order;