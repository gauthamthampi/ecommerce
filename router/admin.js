const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = require("../middleware/multer");
const adminController = require("../controller/admincontroller");
const prcollec = require("../models/productconfig");
const isAdminAuthenticated = require('../middleware/authmiddleware');

const credential = {
    username:"admin@gmail.com",
    password:"admin"
} 

router.get("/adminlog", isAdminAuthenticated, adminController.getadminLog);
router.post("/adminlog", isAdminAuthenticated, adminController.postadminlog);
router.get("/adminproducts", isAdminAuthenticated, adminController.adminProducts);
router.get("/addproducts",  isAdminAuthenticated, adminController.getaddProducts);
router.post("/addproducts", upload,  isAdminAuthenticated, adminController.postaddproducts);
router.get("/editproduct/:id",  isAdminAuthenticated,adminController.geteditproduct);
router.post("/editproduct/:id", upload, isAdminAuthenticated, adminController.posteditproduct);
router.post("/deleteImage/:id", isAdminAuthenticated,adminController.postdeleteimage)
router.get("/deleteproduct/:id", isAdminAuthenticated,adminController.getdeleteProducts);
router.get("/adminusers",  isAdminAuthenticated,adminController.getadminusers);
router.post("/adduser",  isAdminAuthenticated,adminController.postadduser);
router.get("/edituser/:id",  isAdminAuthenticated,adminController.getedituser);
router.post("/edituser/:id", isAdminAuthenticated, adminController.postedituser);
router.get("/deleteuser/:id",  isAdminAuthenticated,adminController.getdeleteuser);
router.get("/admlogout", isAdminAuthenticated,adminController.adminlogout)
router.get("/admindashboard", isAdminAuthenticated, adminController.getadmindashboard)
router.get("/monthly-sales", isAdminAuthenticated,adminController.getmonthlysales)
router.get("/admcategory",  isAdminAuthenticated,adminController.admcategory);
router.post("/categorylisting/:category",  isAdminAuthenticated,adminController.postcategorylisting)
router.post("/newcategory", isAdminAuthenticated,adminController.postnewcategory);
router.get("/adminsalesreport/:interval", isAdminAuthenticated,adminController.getSalesReport)
router.get("/salesdownload-pdf/:interval", isAdminAuthenticated,adminController.getsalespdf)
router.get("/salesdownload-excel/:interval", isAdminAuthenticated,adminController.getSalesExcel);
router.get("/adminorders", isAdminAuthenticated,adminController.getadminorders)
router.post("/admin/updateOrderStatus/:id", isAdminAuthenticated,adminController.postupdateOrderStatus)
router.get("/admincoupons",  isAdminAuthenticated,adminController.getadmincouponmanagement);
router.post("/addnewcoupon", isAdminAuthenticated,adminController.addnewcoupon);
router.get("/coupondelete/:id",  isAdminAuthenticated,adminController.deletecoupon);
router.post("/categoryoffer/:category", isAdminAuthenticated,adminController.postcategoryoffers)



module.exports = router;