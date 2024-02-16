const mongoose = require("mongoose");
require("dotenv").config();
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);


connect.then(()=>{
    console.log("User Database connected successfully");
}).catch((err)=>{
    console.log("Error connecting with user database"+err);
});

const userschema = new mongoose.Schema({
    firstname:{
        type: String,
    },
    secondname:{
        type: String,
   
    },
    email:{
        type: String,
        unique: true
    },
   
    password:{
        type: String,
      
    },
    address:[{
        houseno:{
            type:String
        },
        street:{
            type:String
        },
        city:{
            type:String
        },
        state:{
            type:String
        },
        pincode:{
            type:Number
        },
        type:{
            type:String
        }
    }],
    isBlocked:{
        type: String,
        default:"Not blocked"
    },
    coupons:[{
        name:{
            type:String
        },
        description:{
            type:String
        },
        expirydate:{
            type:Date
        },
        discount:{
            type:Number
        }
    }],
    wallet:{
        type:Number,
        default:0
    },
    referal:{
        type:String,
        default:"Not created"
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
});

const uscollec = new mongoose.model("Users",userschema);
module.exports = uscollec;