const mongoose = require("mongoose");
require("dotenv");
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);

connect.then(()=>{
    console.log("Order database connected successfully");
}).catch(()=>{
    console.log("Couldn't connect order database");
});
const orderitemSchema = new mongoose.Schema({
    productId:{
        type:mongoose.Schema.Types.ObjectId,
    },
    quantity:{
        type:Number,
    },
    prostatus:{
        type:String
    },
    price:{
        type:Number
    },
    rated:{
        type:Boolean,
        default:false
    }
})
const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId
    },
    items:[orderitemSchema],
    totalPrice:{
        type: Number
    },
    orderStatus:{
        type:String
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
    paymentMethod:{
        type:String
    },
    dateoforder:{
        type:Date
    },
    coupon:{
        type:String
    }
})

const ordcollec = new mongoose.model("Order",orderSchema);
module.exports = ordcollec;