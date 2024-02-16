const mongoose = require("mongoose");
require("dotenv").config();
const connect = mongoose.connect(`mongodb://localhost:${process.env.DBport}/Ecommerce`);

connect.then(()=>{
    console.log("Product Database connected successfully");
}).catch(()=>{
    console.log("Error connecting with product database");
});



const productschema = new mongoose.Schema({
    modelname:{
        type: String,
        required: false
    },
    description:{
        type: String,
        required:  false
    },
    brand:{
        type: String,
        required: false
    },
    colour:{
        type: String,
        required: false
    },
    image:[{
        type: String,
        required:false
    }],
    category:{
        type: String,
        required: false

    },
    rating:{
        type: Number,
        required:false
    },
    isListed:{
        type: String,
        default:"true"
    },
    dialshape:{
        type: String,
        required:false 
    },
    strapmaterial:{
        type: String,
        required:false
    },
    price:{
        type:Number,
        required:false
    },
    stock:{
        type:Number,
        required:false
    },
    offerprice:{
        type:Number,
        default:0
    }

});

const prcollec = new mongoose.model("Products",productschema);
module.exports = prcollec;