const {Schema, model, Collection} = require("mongoose");

const cartSchema = new Schema({
    productId : {
        type : Schema.ObjectId,
        required : true
    },
    userId : {
        type : Schema.ObjectId,
        required : true
    },
    quantity : {
        type : Number,
        required : true
    },
},
{ timestamps: true } 
)

// create a model or a collection

const Cart = new model('carts', cartSchema);
module.exports = Cart;