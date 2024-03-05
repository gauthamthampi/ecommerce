const express = require("express");
const router = express.Router();
const userController = require("../controller/usercontroller");
const uscollec = require("../models/userconfig");
const orderController = require("../controller/ordercontroller")
const checkUserBlocked = require("../middleware/userauth");

router.get("/", userController.getHomepage)
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
router.get("/mywallet", checkUserBlocked, userController.getmywallet)
router.get("/generate-referalcode",checkUserBlocked, orderController.generateReferalcode)
router.post("/useredit",checkUserBlocked,userController.postuseredit)
router.post("/addaddress",checkUserBlocked,userController.postaddaddress)
router.post("/editaddress",checkUserBlocked,userController.posteditaddress)
router.get("/deleteaddress/:id",checkUserBlocked,userController.getdeleteaddress);
router.get("/viewwishlist", checkUserBlocked,userController.getviewishlist)
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
router.post('/products/:productId/ratings',checkUserBlocked,userController.submitrating)
router.post('/user/orders/cancel-singleproduct/:productId/:orderId', checkUserBlocked,orderController.cancelsinglepro);
router.post("/cart/selectcoupon/:id", checkUserBlocked,orderController.selectcoupon)
router.get("/removecoupon/:id",checkUserBlocked,orderController.removecoupon);



module.exports = router;