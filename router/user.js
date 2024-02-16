

const express = require("express");
const router = express.Router();
const userController = require("../controller/usercontroller");
const uscollec = require("../models/userconfig");
const orderController = require("../controller/ordercontroller")
const checkUserBlocked = require("../middleware/userauth");





router.get("/homepage", checkUserBlocked, userController.getHomepage);
router.get("/homepage", userController.getHomepage);
router.get("/login", userController.getLogin);
router.post("/login", userController.postLogin);
router.get("/signup", userController.getSignup);
router.post("/signup", userController.postSignup);
router.get("/otpverif", userController.getOtpVerification);
router.get("/resendotpverif", userController.resendgetOtpVerification);
router.post("/otpverif", userController.postOtpVerification);
router.post("/resendotpverif", userController.resendpostOtpVerification);
router.get("/forgot", userController.getforgotpass)
router.post("/forgot",userController.postforgotpass);
router.get("/forgotpassotp",userController.getOtpVerificationforgotpass);
router.post("/forgotpassotp",userController.postOtpVerificationforgotpass);
router.get("/changepassword",userController.getchangepassword);
router.post("/changepassword",userController.postchangepassword);
router.get("/mens", userController.getMens);
router.get("/mens_prview/:id", userController.getMensPreview);
router.get("/womens", userController.getWomens);
router.get("/smart", userController.getSmart);
router.get("/logout",userController.userlogout)
router.get("/userprof",checkUserBlocked, userController.getuserprof)
router.get("/generate-referalcode",checkUserBlocked, orderController.generateReferalcode)
router.post("/useredit",checkUserBlocked,userController.postuseredit)
router.post("/addaddress",checkUserBlocked,userController.postaddaddress)
router.post("/editaddress",checkUserBlocked,userController.posteditaddress)
router.get("/deleteaddress/:id",checkUserBlocked,userController.getdeleteaddress);
router.get("/viewwishlist/:id", checkUserBlocked,userController.getviewishlist)
router.get("/addtowishlist/:id",checkUserBlocked,userController.getwishlist)
router.get("/wishlist/removeproduct/:id",checkUserBlocked,userController.getwishlistremoveprd)
router.get("/mens/prod_cart/:id",checkUserBlocked,orderController.getprodcart)
router.get("/mens/checkout/:id",checkUserBlocked,orderController.getcheckout)
router.post("/mens/prod_cart/:id",checkUserBlocked,orderController.updateQuantity)
router.get("/user/user_cart",checkUserBlocked,orderController.getusercart)
router.get("/user/addtocart/:productId",checkUserBlocked,orderController.addtocart);
router.get("/user/user_cart/removepd/:id",checkUserBlocked,orderController.removepdcart);
router.post("/user/user_cart/quantityupdated/:id",checkUserBlocked,orderController.cartquandityupd);
router.get("/user/cartcheckout/:id",checkUserBlocked,orderController.cartcheckout);
router.post("/create-razorpay-order",checkUserBlocked,orderController.createrazorpayorder)
router.post("/user/cartcheckout/:id",checkUserBlocked,orderController.postcartcheckout)
router.post("/addaddresscart/:id",checkUserBlocked,orderController.postaddaddresscart);
router.post("/user/orderconfirmation/:id",checkUserBlocked,orderController.getorderconfirm);
router.get('/user/orderconfirm/:id', checkUserBlocked,orderController.renderOrderConfirmationPage);
router.get('/download/invoice/:orderId', checkUserBlocked,orderController.downloadInvoice);
router.get("/user/vieworder",checkUserBlocked,orderController.getvieworder)
router.post("/user/vieworder/:id",checkUserBlocked,orderController.postvieworder)
router.post('/user/orders/cancel-singleproduct/:productId/:orderId', checkUserBlocked,orderController.cancelsinglepro);
router.post("/cart/selectcoupon/:id", checkUserBlocked,orderController.selectcoupon)
router.get("/removecoupon/:id",checkUserBlocked,orderController.removecoupon);



// router.get("/prodcart",userController.)
// router.get("/prodvu", userController.getProductView);
// router.get("/testprod", userController.getTestProduct);


// router.get("/homepage",async(req,res)=>{
       
//         res.render("landingpage")
         
// })
// router.get("/homepage",(req,res)=>{
//     res.render("landingpage.ejs")
// })


// router.get("/login",(req,res)=>{
//     res.render("login.ejs")
// });

// router.post("/login",async(req,res)=>{
//     const userdata = {
//         email:req.body.email,
//         password:req.body.password
//     }
    
//     const checkmail = await usercollec.findOne({email:userdata.email});
//     if(checkmail){
//         const userblock = await usercollec.findOne({email:userdata.email,isBlocked:"Blocked"});
//        if(userblock){
//         res.render("login",{
//             incorrect:"Ops!! Entry restricted"
//         })
//        }else{
//         const passwordMatch = await bcrypt.compare(userdata.password, checkmail.password);
//         if(passwordMatch){
//             nameext = await usercollec.findOne({email:userdata.email})
//             req.session.user = req.body.email;
//            res.render("landingpage",{
//                user:nameext.firstname
//            });
//         }else{
//             res.render("login",{
//                 incorrect:"Incorrect password"
//             })
//         }
//       }
//     }else{
//         res.render("login",{
//             incorrect:"Invalid details"
//         })
//     }
// })
    
    
    
    
    
//     }else {
//         const passwordMatch = await bcrypt.compare(userdata.password, user.password);

//         //  const checkpass = await usercollec.findOne({password:userdata.password});
//         if(passwordMatch){
//          nameext = await usercollec.findOne({email:userdata.email})
//         req.session.user = req.body.email;
//         res.render("landingpage",{
//             user:nameext.firstname
//         });
//         console.log(`${nameext.firstname} logged in!!`);
//     }else{
//         res.render("login",{
//             incorrect:"Incorrect password"
//         })
//     }
//     }else{
//         res.render("login",{
//             incorrect:"Invalid details"
//         })
//     }}
        
// })

// router.get("/signup",(req,res)=>{
//     res.render("signup.ejs")
// });

// router.post("/signup",async(req,res)=>{
//     const userData = {
//         firstname:req.body.firstname,
//         secondname:req.body.secondname,
//         email:req.body.email,
//         password:req.body.password
//     }

    
//     const hashedPassword = await bcrypt.hash(userData.password, saltRounds); // 10 is the number of salt rounds

//         // Create a user document with hashed password
//         const user ={
//             firstname: userData.firstname,
//             secondname: userData.secondname,
//             email: userData.email,
//             password: hashedPassword
//         };
//         signupdata = user;
//     const checkmail = await usercollec.findOne({email:userData.email});
//     //const checknum = usercollec.findOne({})
//     if(checkmail){
//         //const checknum = usercollec.findOne({phone:userData.phone});
//        res.render("signup",{
//         incorrect:"User already exists"
//        })
//     }else{
//         res.redirect("/otpverif")
//     }  
// })

// router.get("/otpverif",(req,res)=>{


//     const otp = otpGenerator.generate(6, {  upperCase: false, specialChars: false });
//     const expiry = new Date(Date.now() + 5 * 60 * 1000);
   
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: "devdragon88@gmail.com",
//         pass: "wlsi yihf ermo mjle",
//       },
//     });
 
//     const mailOptions = {
//       from:"devdragon88@gmail.com",
//       to: signupdata.email,
//       subject: 'OTP for registration',
//       text: `Your OTP for registration is ${otp}`,
//     };
//     otpcode = otp;
//     transporter.sendMail(mailOptions, (error, info, expiry) => {
//       if (error) {
//         console.log(error);
//       } else {
//         console.log('Email sent: ' + info.response);
//       }
//     });
//     console.log(otp);
//     res.render("user/otp")
//     const otpdata = {
//         email : signupdata.email,
//         otp: otp,
//         expiry: expiry
//     }
//     const check = otpcoll.find({email:otpdata.email}).exec();
//     if(check){
//         otpcoll.findByEmailAndUpdate(otpdata.email,{
//             otp:otp,
//             expiry:expiry
//         })
//     }else{
//     otpcoll.insertMany(otpdata)
//     .then(()=>{
//         console.log(otpdata);
//         res.render("user/otp")
//     }).catch(err=>{
//         console.log(err);
//     })
//     }
// })

// router.post("/otpverif",(req,res)=>{
//     const otpchar = {
//         otp1:req.body.otp1,
//         otp2:req.body.otp2,
//         otp3:req.body.otp3,
//         otp4:req.body.otp4,
//         otp5:req.body.otp5,
//         otp6:req.body.otp6,
//     }
//     const otp = `${otpchar.otp1}${otpchar.otp2}${otpchar.otp3}${otpchar.otp4}${otpchar.otp5}${otpchar.otp6}`
//     if(otpcode===otp){
//         usercollec.insertMany(signupdata)
//         .then(()=>{
//             console.log(signupdata);
//             res.render("login",{
//                 incorrect:"OTP Veified. Log in to continue.."
//             })
//         }).catch(err=>{
//             console.log(err);
//         })
//     }
    
//     }
// )







router.get("/mens",(req,res)=>{
    
        prcollec.find({isListed:'true',category:'Men'}).exec()
        .then(product=>{
            res.render("user/mens",{
                product:product
            })

        })
     
})

// router.get("/mens_prview/:id",(req,res)=>{
//     res.render("user/productpage")
// })
    
router.get("/womens",(req,res)=>{
    prcollec.find({category:"Women",isListed:"true"}).exec()
    .then(product=>{
        res.render("user/womens",{
            product:product
        })
    }).catch(err=>{
        console.log(err);
    })
    
})

// router.get("/prodvu",(req,res)=>{
//         prcollec.findOne({price:17495})
//         .then(dataproduct=>{
//              res.render("user/prodvu",{
//                 dataproduct:dataproduct
//              })
//         })
//     })
    
// router.get("/testprod",(req,res)=>{
//     res.render("user/desctest")
// })
module.exports = router;