const usercollec = require("../models/userconfig");
const prcollec = require("../models/productconfig");
const odcollec = require("../models/orderconfig");
const session = require("express-session");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const cartcollec = require("../models/cartconfig")
require("dotenv").config();

const bcrypt = require("bcrypt");
const uscollec = require("../models/userconfig");
const ordcollec = require("../models/orderconfig");
const saltRounds = 10;
const Razorpay = require('razorpay');
const router = require("../router/user");
const wishlistcollec = require("../models/wishlistconfig");
const couponcollec = require("../models/couponconfig");
const { restart } = require("nodemon");
const razorpay = new Razorpay({
  apiVersion: 'v1',
  key_id: 'rzp_test_kCNHB9SD15lPWJ',
  key_secret: 'EWkYDVa7Rg320sZDHsE9WbTb',
});

// let otpcode;
// let nameext;
// let signupdata;
// let logindata;

exports.getwishlistremoveprd = async (req, res) => {
    try {
        let productId = req.params.id;
        let user = await uscollec.findOne({ email: req.session.user });
        let userId = user._id; // Assuming req.user contains the user's ID
        await wishlistcollec.updateOne(
            { userId: userId },
            { $pull: { products: { productId: productId } } }
        );
        res.redirect("/viewwishlist/:id");
    } catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};


exports.getwishlistremoveprd = async (req, res) => {
    try{
        let productId = req.params.id;
        let user = await uscollec.findOne({email:req.session.user})
        let userId = user._id; // Assuming req.user contains the user's ID
        await wishlistcollec.updateOne(
            { userId: userId },
            { $pull: { products: { productId: productId } } }
        );
        res.redirect("/viewwishlist/:id");
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};

exports.getviewishlist= async(req,res)=>{
    try{
        if(req.session.user){
            let user = await uscollec.findOne({email:req.session.user})
            let userId = user._id;
            let wishlist = await wishlistcollec.findOne({ userId });
            if(wishlist){
                let productIds = wishlist.products.map(product => product.productId);
                let products = await prcollec.find({ _id: { $in: productIds } });
                res.render("user/wishlist", {
                    wishlist: wishlist,
                    products: products
                });
            }else{
                res.render("user/wishlist",
                {wishlist:undefined});
            }
        }else{
            res.redirect("/login")
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getwishlist = async (req, res) => {
    try{
        if (req.session.user) {
            let user = await uscollec.findOne({email:req.session.user})
            let userId = user._id;
            let productId = req.params.id;
            let wishlist = await wishlistcollec.findOne({ userId });
            // console.log("wishlist"+wishlist.products);
    
    
            if (!wishlist) {
                wishlist = await wishlistcollec.create({
                    userId: userId,
                    products: [{ productId: productId }]
                });
                console.log("New wishlist created with product");
            } else {
                let checkProduct = await wishlistcollec.findOne({'products.productId':productId})
                // console.log(checkProduct);
                if (!checkProduct) {
                    wishlist.products.push({ productId: productId });
                    await wishlist.save();
                    console.log("Product added to wishlist");
                } else {
                    console.log("Product already exists");
                }
           }
    
            // Fetch product details for the products in the wishlist
            let productIds = wishlist.products.map(product => product.productId);
            let products = await prcollec.find({ _id: { $in: productIds } });
    
            res.render("user/wishlist", {
                wishlist: wishlist,
                products: products
            });
        } else {
            return res.redirect("/login");
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};

exports.getdeleteaddress =  async(req,res)=>{
    try{
        let user = await uscollec.findOne({email:req.session.user})
        let userId = user._id;
        let addressId = req.params.id;
    
        req.session.message = "Address deleted successfully"
    
        const result = await usercollec.updateOne(
            { _id: userId },
            { $pull: { address: { _id: addressId } } }
          );
         
          res.redirect("/userprof")
           
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.posteditaddress = async (req, res) => {
    try{
        let user = await uscollec.findOne({email:req.session.user})
    let id = user._id;
    const editaddress = {
        type: req.body.type,
        houseno: req.body.houseno,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode
    }

    // Find the user by id and update the specific address using the positional operator $
    await uscollec.findByIdAndUpdate(id, {
        $set: {
            'address.$.houseno': editaddress.houseno,
            'address.$.street': editaddress.street,
            'address.$.city': editaddress.city,
            'address.$.state': editaddress.state,
            'address.$.pincode': editaddress.pincode
        }
    })
    .then(() => {
        console.log("Address updated successfully");
        const updated = uscollec.findById(id);
        nameext = updated;
        res.redirect("/userprof");
    })
    .catch(err => {
        console.error(err);
        res.status(500).send("Error updating address");
    });
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    } 
}

exports.postaddaddress = async(req,res)=>{
    try{
        let user = await uscollec.findOne({email:req.session.user})
        let id = user._id;
        const addaddress = {
            type:req.body.type,
            houseno:req.body.houseno,
            street:req.body.street,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode
        }
        // 
        await uscollec.findByIdAndUpdate(id,{
          $push:{
            'address':addaddress
          }
        })
        // console.log(addaddress);
        const updated = await uscollec.findById(id)
        nameext = updated;
        res.redirect("/userprof")

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.postuseredit = async(req,res)=>{
    try{
        let user = await uscollec.findOne({email:req.session.user})
        let id = user._id;
        const newdata = {
            firstname:req.body.firstname,
            secondname:req.body.secondname,
            email:req.body.email
        }
        
        await uscollec.findByIdAndUpdate(id,{
            firstname:newdata.firstname,
            secondname:newdata.secondname,
            email:newdata.email
        })
       
        const updated = await uscollec.findById(id)
        nameext = updated;
        // console.log(updated);
        res.redirect("/userprof");
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }  
    }
exports.getmywallet = async(req,res)=>{
    try{
        if(req.session.user){
        let user = await uscollec.findOne({email:req.session.user})
        console.log("user"+user);
        res.render("user/mywallet",{user});
        }else{
            res.redirect("/login")
        } 
    }catch(err){
        console.log(err);
        res.redirect("/error");
    }
}

exports.getuserprof = async(req,res) => {
    try{
        if(req.session.user){
            let user = await uscollec.findOne({email:req.session.user}) 
            const id = user._id;
            const message = req.session.message;
            delete req.session.message;
            // Clear the message from the session
           
          
            const userData = await uscollec.findById(id)
            res.render("user/userprof",{
            user:`${user.firstname} ${user.secondname}`,
            userfst:user.firstname,
            email:user.email,
            usersec:user.secondname,
            userData:userData,
            message:message
        })
       
       }else{
        res.redirect("/login")
       }    
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getHomepage = async (req, res) => {
    try{
        let user = await uscollec.findOne({email:req.session.user})
        if(req.session.user){
            res.render("landingpage",{
                user:user
            })
    }else{
        res.render("landingpage")
    }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getLogin = (req, res) => {
    try{
        if(!req.session.user){
            let message = req.query.message;
            res.render("login.ejs",{message});
          }else{
              res.redirect("/homepage")
          }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
  
}

//post
exports.postLogin = async (req, res) => {
    try{
        const userdata = {
            email:req.body.email,
            password:req.body.password
        }
        
        const checkmail = await usercollec.findOne({email:userdata.email});
        if(checkmail){
            const userblock = await usercollec.findOne({email:userdata.email,isBlocked :"Blocked"});
           if(userblock){
            res.render("login",{
                incorrect:"Ops!! Entry restricted"
            })
           }else{
            const passwordMatch = await bcrypt.compare(userdata.password, checkmail.password);
            if(passwordMatch){
                nameext = await usercollec.findOne({email:userdata.email})
                let user = await usercollec.findOne({email:userdata.email})
                req.session.user = req.body.email;
               res.render("landingpage",{
                   user:user
               });
            }else{
                res.render("login",{
                    incorrectpass:"Incorrect password"
                })
            }
          }
        }else{
            res.render("login",{
                incorrectmail:"Invalid mail id!"
            })
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getforgotpass = (req,res)=>{
    try{
        res.render("user/forgotpassmail")
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}
// let emailforgotpass;
exports.postforgotpass = async(req,res)=>{
    try{
        const mail = {
            email:req.body.email
        }
         req.session.mail = mail.email;
        //  let emailforgotpass = mail.email;
    
        const user = await usercollec.findOne({email:mail.email});
        // console.log(user);
        if(user){
            res.redirect("/forgotpassotp")
           
        }else{
            res.send("Email not registered")
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getOtpVerificationforgotpass = (req, res) => {
    try{
        function generateOTP() {
            let digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            return OTP;
         }
         
         otp = generateOTP();
         req.session.otp = otp;
        const expiry = new Date(Date.now() + 5 * 60 * 1000);
       
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });
        let emailforgotpass = req.session.mail;
        const mailOptions = {
          from:process.env.EMAIL,
          to: emailforgotpass,
          subject: 'OTP for setting new password',
          text: `Your OTP for recovering  is ${otp}. "We care the security"-Gtimes`,
        };
        let otpcode = otp;
        transporter.sendMail(mailOptions, (error, info, expiry) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        console.log(otp);
        res.render("user/otpforgotpass")

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    
}

exports.postOtpVerificationforgotpass = (req, res) => {
    try{
        const otpchar = {
            otp1:req.body.otp1,
            otp2:req.body.otp2,
            otp3:req.body.otp3,
            otp4:req.body.otp4,
            otp5:req.body.otp5,
            otp6:req.body.otp6,
        }
        const otp = `${otpchar.otp1}${otpchar.otp2}${otpchar.otp3}${otpchar.otp4}${otpchar.otp5}${otpchar.otp6}`
        let otpcode = req.session.otp;
        if(otpcode===otp){       
            res.redirect("/changepassword")
        }else{
            res.render("user/otpforgotpass",{
                incorrect:"Invalid OTP"
            })
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    }

exports.getchangepassword = (req,res)=>{
    try{
        res.render("user/forgotpasspass")
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    
}

exports.postchangepassword = async(req,res)=>{
    try{
        const newpass = {
            pass:req.body.password,
            conpass:req.body.confirmpass
        }
    
        const hashedPassword = await bcrypt.hash(newpass.pass, saltRounds); 
        const newpassword ={
            password: hashedPassword
        };
        let emailforgotpass = req.session.mail;
        if(newpass.pass===newpass.conpass){
    
            await uscollec.updateOne(
                {email:emailforgotpass},
                {$set:{password:newpassword.password}}).exec()
                .then(()=>{
                    console.log("Password changed successfull"+emailforgotpass);
                    res.render("login",{
                    incorrect:"Password changed successfully"
                    })
                }).catch(err=>{
                    console.log(err);
                })
                
                }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    }

exports.getSignup = (req, res) => {
    try{
        if(!req.session.user){
            res.render("signup.ejs");
          }else{
            res.redirect("/homepage")
          }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

const credential = {
    username:"admin@gmail.com",
    password:"admin"
} 

//post
exports.postSignup = async (req, res) => {
    try{
        if(req.body.password!=req.body.cnfpassword){
            res.render("signup",{
                incorrect:"Password mismatch!!"
            })
        }else{
            const userData = {
                firstname:req.body.firstname,
                secondname:req.body.secondname,
                email:req.body.email,
                password:req.body.password
            }
        
            
            
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds); 
                const user ={
                    firstname: userData.firstname,
                    secondname: userData.secondname,
                    email: userData.email,
                    password: hashedPassword,
                    wallethistory: []
                };
                req.session.signupdata = user;
                if(req.body.referalcode){
                    const referal = req.body.referalcode;
                    const refuser = await uscollec.findOne({referal:referal})
                    if(refuser){
                        refuser.wallet += 100;
                        await refuser.save();
                        const currentDate = new Date();
                        const referrerHistory = {
                            amount: 100,
                            date: currentDate,
                            status: "Credited"
                        };
                        refuser.wallethistory.push(referrerHistory);
                        user.wallet += 50;
        
                        const newUserHistory = {
                            amount: 50,
                            date: currentDate,
                            status: "Credited"
                        };
                        user.wallethistory.push(newUserHistory);
                    } else {
                        console.log("Invalid referral code");
                    }
                }
                //  let signupdata = req.session.signupdata;
            const checkmail = await usercollec.findOne({email:userData.email});
            //const checknum = usercollec.findOne({})
            if(checkmail){
                //const checknum = usercollec.findOne({phone:userData.phone});
               res.render("signup",{
                incorrectmail:"User already exists"
               })
            }else{
                res.redirect("/otpverif")
            }  
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    
}

exports.getOtpVerification = (req, res) => {
    try{
        function generateOTP() {
            let digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            return OTP;
         }
         
         otp = generateOTP();
         req.session.otp = otp;
        const expiry = new Date(Date.now() + 5 * 60 * 1000);
       
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });
        let signupdata = req.session.signupdata;
        const mailOptions = {
          from:process.env.EMAIL,
          to: signupdata.email,
          subject: 'OTP for registration',
          text: `Your OTP for registration is ${otp}`,
        };
        let otpcode = req.session.otp;
        otpcode = otp;
        transporter.sendMail(mailOptions, (error, info, expiry) => {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        console.log(otp);
        res.render("user/otp")
        const otpdata = {
            email : signupdata.email,
            otp: otp,
            expiry: expiry
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    
}

exports.postOtpVerification = (req, res) => {
    try{
        const otpchar = {
            otp1:req.body.otp1,
            otp2:req.body.otp2,
            otp3:req.body.otp3,
            otp4:req.body.otp4,
            otp5:req.body.otp5,
            otp6:req.body.otp6,
        }
        const otp = `${otpchar.otp1}${otpchar.otp2}${otpchar.otp3}${otpchar.otp4}${otpchar.otp5}${otpchar.otp6}`
        let otpcode = req.session.otp;
        let signupdata = req.session.signupdata;
        if(otpcode===otp){
            if(signupdata.email===credential.username){
            signupdata.isAdmin = true;
            }
            usercollec.insertMany(signupdata)
            .then(()=>{
                // console.log(signupdata);
                res.render("login",{
                    incorrect:"OTP Veified. Log in to continue.."
                })
            }).catch(err=>{
                console.log(err);
            })
        }else{
            res.render("user/otp",{
                incorrect:"Invalid OTP"
            })
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    } }

    exports.resendgetOtpVerification = (req, res) => {
        try{
            function generateOTP() {
                let digits = '0123456789';
                let OTP = '';
                for (let i = 0; i < 6; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }
                return OTP;
             }
             
             otp = generateOTP();
             req.session.otp = otp;
            const expiry = new Date(Date.now() + 5 * 60 * 1000);
           
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
              },
            });
            let signupdata = req.session.signupdata;
            const mailOptions = {
              from:process.env.EMAIL,
              to: signupdata.email,
              subject: 'OTP for registration',
              text: `Your OTP for registration is ${otp}`,
            };
            let otpcode = req.session.otp;
            otpcode = otp;
            transporter.sendMail(mailOptions, (error, info, expiry) => {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
            console.log(otp);
            res.render("user/resendotp")
            const otpdata = {
                email : signupdata.email,
                otp: otp,
                expiry: expiry
            }

        }catch (err) {
            console.error(err);
            res.redirect("/error");
        }
        
    }

    exports.resendpostOtpVerification = (req, res) => {
        try{
            const otpchar = {
                otp1:req.body.otp1,
                otp2:req.body.otp2,
                otp3:req.body.otp3,
                otp4:req.body.otp4,
                otp5:req.body.otp5,
                otp6:req.body.otp6,
            }
            const otp = `${otpchar.otp1}${otpchar.otp2}${otpchar.otp3}${otpchar.otp4}${otpchar.otp5}${otpchar.otp6}`
            let otpcode = req.session.otp;
            let signupdata = req.session.signupdata;
            if(otpcode===otp){
                usercollec.insertMany(signupdata)
                .then(()=>{
                    // console.log(signupdata);
                    res.render("login",{
                        incorrect:"OTP Veified. Log in to continue.."
                    })
                }).catch(err=>{
                    console.log(err);
                })
            }else{
                res.render("user/resendotp",{
                    incorrect:"Invalid OTP"
                })
            }    

        }catch (err) {
            console.error(err);
            res.redirect("/error");
        }
        
        }
    
exports.getMens = async (req, res) => {
        const perPage = 9;
        const page = parseInt(req.query.page) || 1;
    
        try {
            let query = { category: "Men", isListed: "true" };
    
            // Apply color filter
            if (req.query.colour) {
                query.colour = req.query.colour;
            }
    
            // Apply dial shape filter
            if (req.query.dialshape) {
                query.dialshape = req.query.dialshape;
            }
    
            // Apply price range filter
            if (req.query.minPrice && req.query.maxPrice) {
                query.price = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) };
            } else if (req.query.minPrice) {
                query.price = { $gte: parseInt(req.query.minPrice) };
            } else if (req.query.maxPrice) {
                query.price = { $lte: parseInt(req.query.maxPrice) };
            }
    
            // Apply strap material filter
            if (req.query.strapmaterial) {
                query.strapmaterial = req.query.strapmaterial;
            }
    
            // Apply search query
            if (req.query.search) {
                const searchRegex = new RegExp(req.query.search, 'i');
                query.$or = [
                    { modelname: searchRegex },
                    { colour: searchRegex },
                    // Add more fields to search as needed
                ];
            }

    
            const totalProducts = await prcollec.countDocuments(query);
            const totalPages = Math.ceil(totalProducts / perPage);
            const skip = (page - 1) * perPage;
    
            const products = await prcollec.find(query).skip(skip).limit(perPage);
    
            res.render('user/mens', {
                product: products,
                currentPage: page,
                totalPages: totalPages,
            });
        } catch (err) {
            console.error(err);
            res.redirect("/error");
        }
    };


exports.getMensPreview = (req, res) => {
    try{
        let id = req.params.id;
        prcollec.findById(id)
        .then(product=>{
            res.render("user/productpage",{
                product:product
                
            });
        })

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getWomens= async(req, res) => {
    const perPage = 9;
    const page = parseInt(req.query.page) || 1;

    try {
        let query = { category: "Women", isListed: "true" };
    
        // Apply color filter
        if (req.query.colour) {
            query.colour = req.query.colour;
        }

        // Apply dial shape filter
        if (req.query.dialshape) {
            query.dialshape = req.query.dialshape;
        }

        // Apply price range filter
        if (req.query.minPrice && req.query.maxPrice) {
            query.price = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) };
        } else if (req.query.minPrice) {
            query.price = { $gte: parseInt(req.query.minPrice) };
        } else if (req.query.maxPrice) {
            query.price = { $lte: parseInt(req.query.maxPrice) };
        }

        // Apply strap material filter
        if (req.query.strapmaterial) {
            query.strapmaterial = req.query.strapmaterial;

        //search
         if (req.query.search) {
                const searchRegex = new RegExp(req.query.search, 'i');
                query.$or = [
                    { modelname: searchRegex },
                    { colour: searchRegex },
                    // Add more fields to search as needed
                ];
            }
    
        }

        const totalProducts = await prcollec.countDocuments({category:"Women",isListed:"true"});
        const totalPages = Math.ceil(totalProducts / perPage);
        const skip = (page - 1) * perPage;

        const products = await prcollec.find({category:"Women",isListed:"true"}).skip(skip).limit(perPage);

        res.render('user/womens', {
            product: products,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


exports.getSmart= async(req, res) => {
    const perPage = 9;
    const page = parseInt(req.query.page) || 1;

    try {
        let query = { category: "Smart", isListed: "true" };
    
        // Apply color filter
        if (req.query.colour) {
            query.colour = req.query.colour;
        }

        // Apply dial shape filter
        if (req.query.dialshape) {
            query.dialshape = req.query.dialshape;
        }

        // Apply price range filter
        if (req.query.minPrice && req.query.maxPrice) {
            query.price = { $gte: parseInt(req.query.minPrice), $lte: parseInt(req.query.maxPrice) };
        } else if (req.query.minPrice) {
            query.price = { $gte: parseInt(req.query.minPrice) };
        } else if (req.query.maxPrice) {
            query.price = { $lte: parseInt(req.query.maxPrice) };
        }

        // Apply strap material filter
        if (req.query.strapmaterial) {
            query.strapmaterial = req.query.strapmaterial;
        }

        //search
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query.$or = [
                { modelname: searchRegex },
                { colour: searchRegex },
                
                // Add more fields to search as needed
            ];
        }


        const totalProducts = await prcollec.countDocuments({category:"Smart",isListed:"true"});
        const totalPages = Math.ceil(totalProducts / perPage);
        const skip = (page - 1) * perPage;

        const products = await prcollec.find({category:"Smart",isListed:"true"}).skip(skip).limit(perPage);

        res.render('user/smart', {
            product: products,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};


exports.userlogout = (req,res)=>{
    try{
        if(req.session.user){
            req.session.user = false;
            res.redirect("/homepage")
        
        }else{
            res.redirect("/login")
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    
}

 


