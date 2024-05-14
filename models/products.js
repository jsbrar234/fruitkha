const {Schema, model, Collection} = require("mongoose");

const productSchema = new Schema({
    productName : {
        type : String,
        required : true
    },
    price : {
        type : Number, 
        required : true,
    },
    description : {
        type : String,
        required : true
    },
    image : {
        type : String, 
        required : true
    }
},
{ timestamps: true } 
)

// create a model or a collection

const Products = new model('products', productSchema);
module.exports = Products;