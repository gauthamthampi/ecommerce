const mongoose = require("mongoose");
require("dotenv").config();
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);

connect.then(()=>{
    console.log("Wishlist Database connected successfully");
}).catch(()=>{
    console.log("Error connecting with wishlist database");
});

const wishlistSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId
        }
    }]
})

const wishlistcollec = new mongoose.model("Wishlist",wishlistSchema);
module.exports = wishlistcollec;