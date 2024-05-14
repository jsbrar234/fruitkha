const {Schema, model, Collection} = require("mongoose");

const userSchema = new Schema({
    customerId : {
        type : String,
        required : function() {
            return this.role !== 'admin'; // Customer ID is required only if the role is not admin
        }
    },
    firstName : {
        type : String,
        required : true
    },
    lastName : {
        type : String, 
        required : true,
    },
    phone : {
        type : String,
        required : true
    }, 
    email : {
        type : String,
        required : true,  
    },
    password : {
        type : String,
        required : true
    },
    isVerify : {
        type: Boolean,
        default : false,
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    accessToken : {
        type: String,
    }
},
{ timestamps: true } 
)

// create a model or a collection

const Users = new model('users', userSchema);
module.exports = Users;