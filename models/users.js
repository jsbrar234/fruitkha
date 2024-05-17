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
    },
    otp : {
        type : Number
    },
    dateOfBirth: {
        type: Date,
        
        // validate: {
        //     validator: function(value) {
        //         const today = new Date();
        //         const age = today.getFullYear() - value.getFullYear();
        //         return age >= 18;
        //     },
        //     message: 'You must be at least 18 years old.'
        // }
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required : true,
    },
    pincode: {
        type: String,
        required : true,
        trim: true
    },
    city: {
        type: String,
        required : true,
        trim: true
    },
    state: {
        type: String,
        required : true,
        trim: true
    }
},
{ timestamps: true } 
)



const Users = new model('users', userSchema);
module.exports = Users;