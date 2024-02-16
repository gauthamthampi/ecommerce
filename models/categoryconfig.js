const mongoose = require("mongoose");
require("dotenv").config();
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);

connect.then(()=>{
    console.log("Categoty Database connected successfully");
}).catch(()=>{
    console.log("Error connecting with category database");
});

const categorySchema = new mongoose.Schema({
    name:{
        type: String
    },
    isListed:{
        type: String,
        default:"true"
    },
    offer:{
        type: String,
        default:"Not applied"
    }
})

const categorycollec = new mongoose.model("Category",categorySchema);
module.exports = categorycollec;