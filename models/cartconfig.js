const mongoose = require("mongoose");
require("dotenv").config();
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);

connect.then(()=>{
    console.log("Cart Database connected successfully");
}).catch(()=>{
    console.log("Error connecting with cart database");
});


const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
       
    },
    quantity: {
        type: Number,
        
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        
    },
    items: [cartItemSchema],
    totalPrice:{
        type:Number
    },
    coupon:{
        type:String,
        default:"Not applied"
    },
    couponName:{
        type: String,
    }
  
});

const cartcollec = new mongoose.model("Cart",cartSchema);
module.exports = cartcollec;
