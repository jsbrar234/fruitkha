const {Schema, model, Collection} = require("mongoose");

const addressSchema = new Schema({
    userId : {
        type : Schema.ObjectId,
        required : true
    },
    fullName : {
        type : String,
        required : true
    },
    mobile : {
        type : String,
        required : true
    },
    pincode : {
        type : Number,
        required : true
    },
    houseNo : {
        type : String,
        required : true
    },
    area : {
        type : String,
        required : true
    },
    landmark : {
        type : String,
    },
    city : {
        type : String,
        required : true
    },
    state : {
        type : String,
        required : true
    },
    isDefault : {
        type : Boolean,
        deafult : false
    }
},
{ timestamps: true } 
)

// create a model or a collection

const Address = new model('address', addressSchema);
module.exports = Address;