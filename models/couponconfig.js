const mongoose = require("mongoose");
require("dotenv").config();
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);

connect.then(()=>{
    console.log("Coupon Database connected successfully");
}).catch(()=>{
    console.log("Error connecting with coupon database");
});

const couponSchema = new mongoose.Schema({
    name:{
        type: String
    },
    threshold:{
        type: String
    },
    description:{
        type: String
    },
    expirydate:{
        type: Date
    },
    discount:{
        type: Number
    },

})

const couponcollec = new mongoose.model("Coupon",couponSchema);
module.exports = couponcollec;