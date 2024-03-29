const uscollec = require("../models/userconfig");
const prcollec = require("../models/productconfig");
const upload = require("../middleware/multer");
const ordcollec = require("../models/orderconfig")
require("dotenv").config();
const fs = require("fs");
const path = require("path")
const sizeOf = require("image-size")
const PDFDocument = require('pdfkit-table');
const ExcelJS = require('exceljs');
const couponcollec = require("../models/couponconfig");
const categorycollec = require("../models/categoryconfig");
const session = require("express-session");


const credential = {
    username: "admin@gmail.com",
    password: "admin"
};

exports.deletecoupon = async(req,res)=>{
    try{
        let couponid = req.params.id;
        await couponcollec.findByIdAndDelete(couponid)
        .then(()=>{
        console.log("Coupon deleted successfully,id:"+couponid);
        })
        .catch((err)=>{
        console.log("error deleting coupon"+err);
        })
        res.redirect("/admincoupons")

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.addnewcoupon = async(req,res)=>{
    try{
        let expiryDate = new Date(req.body.expirydate);
    console.log(expiryDate);
    let year = expiryDate.getFullYear();
    let month = String(expiryDate.getMonth() + 1).padStart(2, '0');
    let day = String(expiryDate.getDate()).padStart(2, '0');

    let formattedExpiryDate = `${year}-${month}-${day}`;
    console.log(formattedExpiryDate); 
    let couponname = req.body.couponname.toUpperCase();
    let check = await couponcollec.findOne({name:couponname})
    if(check){
        let coupon = await couponcollec.find({})
        res.render("admin/admcouponmanagement",{ 
            coupon,
            message:"Coupon already exists.Retry!"
    
        }
        ) 
    }else{
        let newcoupon = {
            name:couponname,
            threshold:req.body.threshold,
            description:req.body.description,
            expirydate:formattedExpiryDate,
            discount:req.body.discount
        }
        await couponcollec.create(newcoupon);
        res.redirect("/admincoupons")
    }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    } 
}

exports.getadmincouponmanagement = async(req,res)=>{
    try{
        let coupon = await couponcollec.find({})
        res.render("admin/admcouponmanagement",{
            coupon
    })
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};

exports.getadmindashboard = async (req, res) => {
    try {
        const totalProducts = await prcollec.countDocuments({});

        const totalGrossResult = await ordcollec.aggregate([
            {
                $group: {
                    _id: null,
                    totalGross: { $sum: "$totalPrice" },
                },
            },
        ]);
        const totalGross = totalGrossResult.length > 0 ? totalGrossResult[0].totalGross : 0;

        const totalOrders = await ordcollec.countDocuments({});

        const monthlySales = await ordcollec.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo",
                },
            },
            {
                $unwind: "$productInfo",
            },
            {
                $project: {
                    month: { $month: "$dateoforder" },
                    year: { $year: "$dateoforder" },
                    totalPrice: 1,
                    category: "$productInfo.category",
                    productName: "$productInfo.name",
                },
            },
        ]);

        const menSales = Array(12).fill(0);
        const womenSales = Array(12).fill(0);
        const smartSales = Array(12).fill(0);

        monthlySales.forEach((sale) => {
            const monthIndex = sale.month - 1;
            switch (sale.category) {
                case "Men":
                    menSales[monthIndex] += sale.totalPrice;
                    break;
                case "Women":
                    womenSales[monthIndex] += sale.totalPrice;
                    break;
                case "Smart":
                    smartSales[monthIndex] += sale.totalPrice;
                    break;
                default:
                    break;
            }
        });

        const topMenProducts = await ordcollec.aggregate([
            {
                $unwind: "$items"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                $unwind: "$productInfo"
            },
            {
                $match: {
                    "productInfo.category": "Men"
                }
            },
            {
                $group: {
                    _id: "$items.productId",
                    totalQuantity: { $sum: "$items.quantity" },
                    productName: { $first: "$productInfo.modelname" }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ]);
        topMenProducts.forEach(product => {
            console.log(product);
        });
        const topWomenProducts = await ordcollec.aggregate([
            {
                $unwind: "$items"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                $unwind: "$productInfo"
            },
            {
                $match: {
                    "productInfo.category": "Women"
                }
            },
            {
                $group: {
                    _id: "$items.productId",
                    totalQuantity: { $sum: "$items.quantity" },
                    productName: { $first: "$productInfo.modelname" }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ]);

        const topSmartProducts = await ordcollec.aggregate([
            {
                $unwind: "$items"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {
                $unwind: "$productInfo"
            },
            {
                $match: {
                    "productInfo.category": "Smart"
                }
            },
            {
                $group: {
                    _id: "$items.productId",
                    totalQuantity: { $sum: "$items.quantity" },
                    productName: { $first: "$productInfo.modelname" }
                }
            },
            {
                $sort: { totalQuantity: -1 }
            },
            {
                $limit: 5
            },
            {
                $project: {
                    _id: 0,
                    productName: 1,
                    totalQuantity: 1
                }
            }
        ]);
        
        res.render("admin/admindashboard", {
            totalProducts: totalProducts,
            totalGross: totalGross,
            totalOrders: totalOrders,
            menSales: menSales,
            womenSales: womenSales,
            smartSales: smartSales,
            topMenProducts: topMenProducts,
            topWomenProducts: topWomenProducts,
            topSmartProducts: topSmartProducts,
        });
    } catch (error) {
        console.log("Error fetching dashboard data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



exports.getmonthlysales = async (req,res) =>{
  try {
    const monthlySales = await ordcollec.aggregate([
        {
            $project: {
                month: { $month: '$dateoforder' },
                year: { $year: '$dateoforder' },
                totalPrice: 1,
            },
        },
        {
            $group: {
                _id: { month: '$month', year: '$year' },
                totalSales: { $sum: '$totalPrice' },
            },
        },
        {
            $sort: { '_id.year': 1, '_id.month': 1 },
        },
    ]);
      console.log(monthlySales);
    res.json(monthlySales);
   
} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
}};

exports.getsalespdf = async (req, res) => {
  try {
    const { interval } = req.params;
  
      console.log(interval);
      const salesReport = await getSalesReport(interval);

      // Create a new PDF document
      const pdfDoc = new PDFDocument();
      const buffers = []; // Buffer to store PDF content

      // Add event listener for errors during PDF generation
      pdfDoc.on('error', (error) => {
          console.error('Error generating PDF:', error);
          res.status(500).send('Internal Server Error');
      });

      // Add content to the PDF
      pdfDoc.fontSize(12); // Set the font size

      pdfDoc.text('Sales Report', { align: 'center' }); // Heading
      salesReport.forEach((report, index) => {
          pdfDoc.moveDown(); // Move down before each line
          pdfDoc.text(`${index + 1}. Product ID: ${report.productId}`, { indent: 20 });
          pdfDoc.text(`   Product Name: ${report.productName}`, { indent: 20 });
          pdfDoc.text(`   Date: ${report.date}`, { indent: 20 });
          pdfDoc.text(`   Quantity: ${report.totalQuantity}`, { indent: 20 });
          pdfDoc.text(`   Price: ${report.totalPrice}`, { indent: 20 });
      });

      // Pipe the PDF content to the buffer
      pdfDoc.on('data', (buffer) => {
          buffers.push(buffer);
      });

      // When the PDF is finished, concatenate the buffers and stream to the response
      pdfDoc.on('end', () => {
          try {
              const pdfBuffer = Buffer.concat(buffers);
              res.setHeader('Content-Type', 'application/pdf');
              res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
              res.setHeader('Content-Length', pdfBuffer.length);
              res.end(pdfBuffer);

              // No need to unlink the temporary file as it's now streamed from memory
          } catch (error) {
              console.error('Error sending PDF to the response:', error);
              res.status(500).send('Internal Server Error');
          }
      });

      // End and finalize the PDF
      pdfDoc.end();
  } catch (error) {
      console.error('Error generating or streaming PDF:', error);
      res.status(500).send('Internal Server Error');
  }
};

exports.getSalesExcel = async(req,res)=>{
    try {
        const { interval } = req.params;
  
        const salesReport = await getSalesReport(interval);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');
    
        worksheet.columns = [
          { header: 'Product ID', key: 'productId', width: 15 },
          { header: 'Product Name', key: 'productName', width: 30 },
          { header: 'Date', key: 'date', width: 20 },
          { header: 'Quantity', key: 'totalQuantity', width: 15 },
          { header: 'Price', key: 'totalPrice', width: 15 },
        ];
    
        salesReport.forEach(report => {
          worksheet.addRow({
            productId: report.productId,
            productName: report.productName,
            date: report.date,
            totalQuantity: report.totalQuantity,
            totalPrice: report.totalPrice,
          });
        });
    
        const excelBuffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');
        res.setHeader('Content-Length', excelBuffer.length);
        res.end(excelBuffer);
      } catch (error) {
        console.error('Error generating Excel:', error);
        res.status(500).send('Internal Server Error');
      }
    }



async function getSalesReport(interval) {
    let pipeline = [];
  
    switch (interval) {
      case 'day':
        pipeline = [
          {
            $match: {
              dateoforder: {
                $gte: new Date(new Date() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          },
        ];
        break;
      case 'week':
        pipeline = [
          {
            $match: {
              dateoforder: {
                $gte: new Date(new Date() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              },
            },
          },
        ];
        break;
      case 'month':
        pipeline = [
          {
            $match: {
              dateoforder: {
                $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Last 30 days
              },
            },
          },
        ];
        break;
      default:
        // Handle invalid interval
        throw new Error('Invalid interval');
    }
  
    pipeline.push(
  {
    $unwind: '$items',
  },
  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'productDetails',
    },
  },
  {
    $unwind: {
      path: '$productDetails',
      preserveNullAndEmptyArrays: true,
    },
  },
  {
    $group: {
      _id: {
        productId: '$items.productId',
        productName: '$productDetails.modelname',
        date: { $dateToString: { format: '%Y-%m-%d', date: '$dateoforder' } },
      },
      totalQuantity: { $sum: '$items.quantity' },
      totalPrice: { $sum: '$totalPrice' },
    },
  },
  {
    $project: {
      _id: 0,
      productId: '$_id.productId',
      productName: '$_id.productName',
      date: '$_id.date',
      totalQuantity: 1,
      totalPrice: 1,
    },
  }
);
    
    const salesReport = await ordcollec.aggregate(pipeline).exec();
    return salesReport;
  } 
  


  exports.getSalesReport = async (req, res) => {
    try{
      const { interval } = req.params;
    try {
      const salesReport = await getSalesReport(interval);
      res.render('admin/adminsales', { salesReport, selectedInterval: req.params.interval || 'day' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
    }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    
  };

exports.postupdateOrderStatus = async(req,res)=>{
    try{
        let orderId = req.params.id;
        const newStatus = req.body.newStatus;
    
         const order = await ordcollec.findById(orderId);
    
         order.orderStatus = newStatus;
         order.items.forEach(item => {
            item.prostatus = newStatus;
        });
         
    
         await order.save();
    
        
         res.redirect('/adminorders?message=Order status updated successfully'); // Change this to your actual route

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getadminorders = async(req,res)=>{
    try{
        const orders = await ordcollec.find();

        const { message, error } = req.query;
    
            
            const ordersWithProductDetails = [];
    
            
            for (const order of orders) {
                
                const productDetails = [];
    
                
                for (const item of order.items) {
                    
                    const product = await prcollec.findById(item.productId);
    
                    // If product is found, add its details to the array
                    if (product) {
                        productDetails.push({
                            productName: product.modelname,
                            colour: product.colour,
                            category: product.category,
                            // Add more properties as needed
                        });
                    }
                }
    
                // Add the order with product details to the array
                ordersWithProductDetails.push({
                    order: order,
                    productDetails: productDetails,
                });
            }
    
            // Render the template with the orders and product details
            res.render('admin/adminorders', { ordersWithProductDetails ,message,error });    

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getadminLog = (req, res) => {
    try{
        if(!req.session.admin){
            res.render("admin/admlogin");
            }else{
                res.redirect("/adminhome")
            }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};

exports.postadminlog = (req,res)=>{
    try{
        if(req.body.email===credential.username && req.body.password===credential.password){
            req.session.admin = req.body.email;
            req.session.admin = true
            uscollec.find({}).exec()
                .then(users =>{
                    res.redirect("/admindashboard")
                        
                    })
               
                .catch(err=>{
                    res.send(err)
                })
                
            }else{
                res.send("Invalid details")
            }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    } 
}


exports.adminProducts = (req, res) => {
    try{
        if(req.session.admin){
            prcollec.find({}).exec()
                .then(product => {
                    res.render("admin/adminproducts", {
                        product: product
                    });
                })
                .catch(err => {
                    res.send(err);
                });
            }else{
                res.redirect("/adminlog")
            }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};

exports.getaddProducts = async(req, res) => {
    try{
        if(req.session.admin){
            const category = await categorycollec.distinct("name");
            res.render("admin/addproducts",{
                category
            })
          }else{
            res.redirect("/adminlogin")
          }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.postaddproducts = async (req, res) => {
    try {
        let imageArray = [];

        // Extract form data from req.body
        const { modelname, brand, description, rating, category, colour, dialshape, strapmaterial, price, stock } = req.body;

        // Filter out the removed images from req.files
        const validFiles = req.files.filter(file => file.size > 0);

        // Map over the valid files array to extract the file names
        imageArray = validFiles.map(file => file.filename);

        // Create a new product
        const product = new prcollec({
            modelname,
            brand,
            description,
            rating,
            category,
            colour,
            dialshape,
            strapmaterial,
            image: imageArray, // Store the file names instead of the file objects
            price,
            stock
        });

        // Save the product
        await product.save();

        // Fetch all products for rendering
        const products = await prcollec.find({}).exec();

        // Render the admin products page with success message
        res.render("admin/adminproducts", {
            product: products,
            success: "Product added successfully"
        });
    } catch (err) {
        // Handle errors and send an error response or render an error page
        res.status(500).send(err.message);
        console.error(err);
    }
};


exports.geteditproduct = (req,res) =>{
    try{
        if(req.session.admin){
            let id = req.params.id;
            prcollec.findById(id).exec()
            .then(product=>{
                res.render("admin/editproducts",{
                product:product
                })
            })
            .catch(err => {
                console.log(err);
            })
        
        }else{
            res.render("admin/adminlog")
        
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}


exports.posteditproduct = (req, res) => {
    try{
        let id = req.params.id;
    const newImageArray = [];

    // Fetch existing images from the database
    prcollec.findById(id).exec()
        .then(existingProduct => {
            const existingImageArray = existingProduct.image || [];

            // Add existing images to the new array
            newImageArray.push(...existingImageArray);

            // Add new images to the new array
            for (const file of req.files) {
                newImageArray.push(file.filename);
            }

            // Update the document with the combined array
            return prcollec.findByIdAndUpdate(id, {
                modelname: req.body.modelname,
                brand: req.body.brand,
                description: req.body.description,
                rating: req.body.rating,
                category: req.body.category,
                colour: req.body.colour,
                dialshape: req.body.dialshape,
                strapmaterial: req.body.strapmaterial,
                image: newImageArray,
                isListed: req.body.isListed,
                price: req.body.price,
                stock: req.body.stock,
                offerprice:req.body.offerprice,
            }, { new: true }).exec();
        })
        .then(updatedProduct => {
            // Fetch all products for rendering
            return prcollec.find({}).exec();
        })
        .then(products => {
            // Render the admin products page with success message
            res.render("admin/adminproducts", {
                product: products,
                success: "Product edited successfully!!"
            });
        })
        .catch(err => {
            // Handle errors
            res.send(err);
            console.log(err);
        });

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};


exports.postdeleteimage = async (req, res) => {
    try {
        const productId = req.params.id;
        const { imageUrl } = req.body;

        // Update the database to remove the image
        const product = await prcollec.findByIdAndUpdate(
            productId,
            { $pull: { image: imageUrl } },
            { new: true }
        );

        // You can also delete the image file from your server if needed

        res.json({ success: true, message: 'Image deleted successfully' });
        // res.redirect(`/editproduct/${productId}`);
    } catch (error) {
        console.error('Error deleting image:', error.message);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getdeleteProducts= (req,res) =>{
    try{
        if(req.session.admin){
            let id = req.params.id;
            prcollec.findByIdAndDelete(id).exec()
            .then(product=>{
                prcollec.find({}).exec()
                .then(product=>{
                    res.render("admin/adminproducts",{
                    product:product,
                    success:"Product deleted sucessfully!!"
                })
            })
                }).catch((err)=>{
                    console.log(err);
                })
        }else{
            res.redirect("/adminlog")
        
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    } 
}


exports.getadminusers = (req,res)=>{
    try{
        uscollec.find({}).exec()
    .then(users=>{
        res.render("admin/adminusers",{
            users:users
        });
    })
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.postadduser = async(req,res)=>{
    try{
        const userData = {
            firstname:req.body.firstname,
            secondname:req.body.secondname,
            email:req.body.email,
            password:req.body.password
        }
    
        const checkmail = await uscollec.findOne({email:userData.email});
        //const checknum = usercollec.findOne({})
        if(checkmail){
            //const checknum = usercollec.findOne({phone:userData.phone});
           res.send("User already exists")
        }else{
           const newdata = await uscollec.insertMany(userData);
           console.log(userData);
           res.render("login");
        }  
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}


exports.getedituser =(req,res)=>{
    try{
        let id = req.params.id;
  uscollec.findById(id).exec()
    .then(users=>{
        res.render("admin/edituser",{
            users:users,
        })
    })
    .catch(err => {
        console.log(err);
    })
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }    
}


exports.postedituser =async(req,res)=>{
    try{
        let id = req.params.id;
    console.log(id);
    try {
       let isBlocked = req.body.isBlocked;
        await uscollec.findByIdAndUpdate(id, {
            firstname: req.body.firstname,
            secondname: req.body.secondname,
            email: req.body.email,
            isBlocked: req.body.isBlocked
        }, { new: true }).exec();
        const users = await uscollec.find({});
        res.render("admin/adminusers", { users: users });
    } catch(err) {
        console.log(err);
    }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getdeleteuser =(req,res)=>{
    try{
        let id = req.params.id;
    uscollec.findByIdAndDelete(id).exec()
    .then(users=>{
        uscollec.find({}).exec()
        .then(users=>{
            res.render("admin/adminusers",{
                users:users,
                success:"User deleted sucessfully!!"
        })
        })
    })
    .catch(err=>{
        console.log(err);
    })

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.admcategory = async(req,res)=>{
    try{
        const category = await categorycollec.find({});
      res.render("admin/admcategory",{
        category

      })
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.postcategorylisting = async (req, res) => {
    try {
        let listing = req.body.listing;
        let category = req.params.category;

       

        // Update all products with the specified category
        await prcollec.updateMany({ category: category }, { $set: { isListed: listing } });
        await categorycollec.updateOne({ name: category }, { $set: { isListed: listing } });
        res.redirect("/admcategory");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.postcategoryoffers = async(req,res)=>{
    try{
        const category = req.params.category;
        const offerPercentage = parseInt(req.body.categoryoffers);
    
        try {
            // Find products in the specified category
            const products = await prcollec.find({ category: category });
            const categorydb = await categorycollec.findOne({name:category})
           
    
            // Update offerprice for each product
            for (const product of products) {
                // Calculate the offer price based on the selected percentage
                const totalPrice = product.price;
                let offerPrice;
                if(offerPercentage!=0){
                 offerPrice = totalPrice - (totalPrice * (offerPercentage / 100));
                 offerPrice = Math.round(offerPrice);
                 categorydb.offer = "Applied"
               }else{
                offerPrice = 0;
                categorydb.offer = "Not applied";
               }
               
                
                // Update the offerprice in the product document
                product.offerprice = offerPrice;
                
    
                // Save the changes to the database
                await product.save();
               
            }
           // Update offer status for the category itself
           if (offerPercentage != 0) {
            categorydb.offer = "Applied";
        } else {
            categorydb.offer = "Not applied";
        }
    
        // Save the changes to the database for the category
        await categorydb.save();
            res.redirect("/admcategory");
        } catch (error) {
            console.error(error);
            res.status(500).send('Error applying offer');
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.postnewcategory = async (req,res)=>{
    try{
         // Check if the category exists in the category collection
         const existingCategory = await categorycollec.findOne({ name: req.body.categoryname });
         if (existingCategory) {
             console.log("Category already exists");
             const category = await categorycollec.find({});
             res.render("admin/admcategory",{
             category,
             success:"Category name already exists. Please enter another one!"

      })
             
         }
        const categoryname = {
            name:req.body.categoryname
        }
        categorycollec.create(categoryname)
        // prcollec.insertMany(category)
        .then(()=>{
            console.log(category+"is added into database");
            res.redirect("/admcategory")
        }).catch((err)=>{
            console.log(err);
        })
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.adminlogout = (req,res)=>{
    try{
        req.session.admin = false;
        res.render("admin/admlogin")
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

