const usercollec = require("../models/userconfig");
const prcollec = require("../models/productconfig");
const odcollec = require("../models/orderconfig");
const session = require("express-session");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const cartcollec = require("../models/cartconfig")
require("dotenv").config();
const PDFDocument = require('pdfkit');
const easyinvoice = require("easyinvoice");
// const { Table } = require('pdfkit-table');
const fs = require("fs");
const bcrypt = require("bcrypt");
const uscollec = require("../models/userconfig");
const ordcollec = require("../models/orderconfig");
const saltRounds = 10;
const Razorpay = require('razorpay');
const router = require("../router/user");
const couponcollec = require("../models/couponconfig");
const razorpay = new Razorpay({
  apiVersion: 'v1',
  key_id: 'rzp_test_kCNHB9SD15lPWJ',
  key_secret: 'EWkYDVa7Rg320sZDHsE9WbTb',
});

// let nameext;


exports.downloadInvoice = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await ordcollec.findById(orderId);

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const items = [];

        for (const item of order.items) {
            const product = await prcollec.findById(item.productId);
            if (product) {
                items.push({
                    quantity: item.quantity,
                    description: product.modelname,
                    tax: 0,
                    price: order.totalPrice
                });
            }
        }

        const data = {
            documentTitle: 'Invoice',
            currency: 'INR',
            taxNotation: 'vat',
            marginTop: 25,
            marginBottom: 25,
            logo: '/static/assets/g-times-high-resolution-logo-transparent.png',
            sender: {
                company: 'G Times',
                address: 'Jayanagar, Bengaluru',
                zip: '560041',
                city: ' Karnataka',
                country: 'India'
            },
            invoiceNumber: order._id,
            invoiceDate: order.dateoforder.toISOString(),
            products: items
        };

        const result = await easyinvoice.createInvoice(data);

        fs.writeFileSync('./document.pdf', result.pdf, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        fs.createReadStream('./document.pdf').pipe(res);
    } catch (error) {
        console.error('Error generating or streaming PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.getinvoice =  async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const order = await ordcollec.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        // Generate the invoice PDF content (you need to implement this function)
        const invoiceContent = generateInvoice(order);

        // Set the content type to PDF
        res.contentType("application/pdf");

        // Set the content disposition to attachment to force download
        res.setHeader("Content-Disposition", `attachment; filename=invoice_${orderId}.pdf`);

        // Send the invoice as a downloadable file
        res.send(invoiceContent);
    } catch (err) {
        console.error('Error downloading invoice:', err);
        res.status(500).send('Internal Server Error');
    }
};

async function generateInvoice(order) {
    const doc = new PDFDocument();
    const filePath = `invoice_${order._id}.pdf`; // File path for saving the PDF

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream); // Pipe the PDF output to a file

    doc.text(`Invoice for Order ID: ${order._id}`);
    doc.text(`Date: ${order.dateoforder}`);
    doc.text(`Total Price: $${order.totalPrice}`);

    // Add a table-like structure for product details
    doc.moveDown().text('Product Details:');
    const productDetails = await getProductDetails(order.items);
    doc.moveDown().text('-------------------------------------------------');
    doc.moveDown().text('| Product Name               | Colour  | Price  |');
    doc.moveDown().text('-------------------------------------------------');
    productDetails.forEach((product) => {
        const line = `| ${product.modelname.padEnd(27)} | ${product.colour.padEnd(7)} | $${product.price.toString().padEnd(6)} |`;
        doc.moveDown().text(line);
    });
    doc.moveDown().text('-------------------------------------------------');

    doc.end(); // Finalize the PDF

    stream.on('finish', () => {
        console.log(`PDF created: ${filePath}`);
    });

    return filePath; // Return the file path for the downloaded PDF
}

async function getProductDetails(items) {
    const productDetails = [];
    for (const item of items) {
        const product = await ordcollec.findById(item.productId);
        if (product) {
            productDetails.push([product.modelname, product.colour, product.price]);
        }
    }
    return productDetails;
}

exports.generateReferalcode = async(req,res)=>{
    try{
        function generateRandomString(length) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }
        
    
        const randomString = generateRandomString(6); // Generates a random string of length 6
        console.log("Generated Random String:", randomString);
         let nameext = await uscollec.findOne({email:req.session.user})
        const user = await uscollec.findById(nameext._id);
        user.referal = randomString;
        await user.save();
        res.redirect("/userprof")
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    } 
}

exports.removecoupon = async (req, res) => {
    try {
        let cartId = req.params.id;
        let cart = await cartcollec.findById(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        let user = await usercollec.findById(cart.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let totalPrice = cart.totalPrice;
        // console.log("totalPr" + totalPrice);
        let couponname = cart.couponName;
        let coupon = await couponcollec.findOne({name:couponname})
        let discount = coupon.discount
        

       
        cart.coupon = "Not applied";
        cart.totalPrice = totalPrice + discount;
        await cart.save();

        res.redirect("/user/user_cart");
    } catch (error) {
        console.error("Error removing coupon:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

exports.selectcoupon = async (req, res) => {
    try {
        const couponName = req.body.flexRadioDefault;
        const cartId = req.params.id;
        
        // Retrieve the user cart from the database
        const userCart = await cartcollec.findById(cartId);
        
        if (!userCart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Retrieve the coupon details from the database based on the coupon name
        const coupon = await couponcollec.findOne({ name: couponName });

        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // Assuming coupon.discount holds the discount value
        const discount = coupon.discount;

        // Now, you can subtract the discount from the total price in the cart
        const totalPrice = userCart.totalPrice; // Get total price from user cart
        const discountedPrice = totalPrice - discount;

        // Update the user cart with the discounted price
        userCart.totalPrice = discountedPrice;
        userCart.coupon = "Applied"
        userCart.couponName = couponName;
        await userCart.save();

        // Respond with success message
        // return res.status(200).json({ message: 'Coupon applied successfully', discount: discount });
    } catch (error) {
        console.error('Error applying coupon:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.postvieworder = async (req, res) => {
    try {
        let nameext = await uscollec.findOne({email:req.session.user});
        const orderId = req.params.id;
        const user = await uscollec.findById(nameext._id);
        // console.log("user"+user)
        // Find the canceled order
        const order = await ordcollec.findById(orderId);
        order.items.forEach(item => {
            item.prostatus = 'Cancelled';
        });

        await order.save();
        // console.log("order"+order);
        if(order.paymentMethod==="Online Payment" || order.paymentMethod==="Wallet"){
          user.wallet += order.totalPrice;
          const currentDate = new Date();
          const walletHistory = {
            amount: order.totalPrice,
            date: currentDate,
            status: "Credited"
        };
        user.wallethistory.push(walletHistory);
        await user.save();
        }

        // Update order status to 'Cancelled'
        const updateOrder = { orderStatus: 'Cancelled' };
        const optionsOrder = { new: true };
        const updatedOrder = await ordcollec.findByIdAndUpdate(orderId, updateOrder, optionsOrder);

        // Loop through the items in the canceled order and update product stock
        for (const item of updatedOrder.items) {
            const productId = item.productId;
            const quantity = item.quantity;

            // Find the product and update its stock
            const product = await prcollec.findById(productId);
            if (product) {
                // Update stock by adding the canceled quantity
                product.stock += quantity;

                // Save the updated product
                await product.save();
            }
        }



        res.redirect("/user/vieworder");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

exports.cancelsinglepro = async (req, res) => {
    try {
        let productId = req.params.productId;
        let orderId = req.params.orderId; // Assuming you have orderId in your request parameters
        

        const product = await prcollec.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Calculate the price of the canceled product
        const canceledProductPrice = product.price;
        
        // Use $pull to remove the item with the given productId from the items array and update the prostatus
        const result = await ordcollec.updateOne(
            { 
                _id: orderId, 
                'items.productId': productId // Adding productId within items array for filtering
            },
            { 
                $set: { 'items.$.prostatus': 'Cancelled' }, // Update prostatus for the canceled product
                $inc: { totalPrice: -canceledProductPrice } // Subtract canceled product's price from total price
            });
            // If nModified is greater than 0, it means an item was removed
            // res.status(200).json({ message: 'Product cancelled successfully' });
            res.redirect("/user/vieworder")
      
            // If nModified is 0, it means the product with the given ID was not found
           
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




exports.renderOrderConfirmationPage = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await ordcollec.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }
      // Generate the download URL for the invoice
      const invoiceDownloadUrl = `/download/invoice/${orderId}`;

      // Render the order confirmation page with the order details and invoice download URL
      res.render('user/orderconfirm', { order, invoiceDownloadUrl });
    } catch (err) {
        console.error('Error rendering order confirmation page:', err);
        res.status(500).send('Internal Server Error');
    }
};

exports.getorderconfirm = async(req, res) => {
    try {
        let nameext = await uscollec.findOne({email:req.session.user})
        let cartId = req.params.id;
        let index = req.query.selectedIndex;
        let userId = nameext._id;
        let user = await uscollec.findById(userId);
       
        // console.log(index);

        const cart = await cartcollec.findById(cartId);
        let couponName = cart.couponName;

       
        if (!cart) {
            return res.status(404).send('Cart not found');
        }

        const couponIndex = user.coupons.findIndex(coupon => coupon.name === couponName);

        if (couponIndex !== -1) {
            // If the coupon is found, remove it from the coupons array
            user.coupons.splice(couponIndex, 1);
        } else {
            console.log('Coupon not found in user coupons array');
        }

        // Save the updated user document
        await user.save();

        const selectedAddress = user.address[index];
        const paymentMethod = req.body.paymentMethod; // Retrieve payment method from request body

        const currentDate = new Date();

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const day = currentDate.getDate();

        // Format the date as a string (you can customize the format as needed)
        const formattedDate = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
       
        const updatedItems = cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            prostatus: "Confirmed" // Set prostatus to "Confirmed"
        })); 
        
        if (paymentMethod === 'Wallet') {
            // Calculate the remaining wallet balance after deducting the total price
            const remainingBalance = user.wallet - cart.totalPrice;
            
            if (remainingBalance >= 0) {
                // Update the user's wallet balance
                user.wallet = remainingBalance;
        
                // Push the transaction details to the wallet history array
                const walletTransaction = {
                    amount: -cart.totalPrice, // Negative value for deduction
                    date: currentDate,
                    status: 'Debited'
                };
                user.wallethistory.push(walletTransaction);
        
                // Save the updated user document
                await user.save();
            } else {
                return res.status(400).json({ message: 'Insufficient wallet balance' });
            }
        }

        const orderData = {
            userId: cart.userId,
            items: updatedItems,
            totalPrice: cart.totalPrice,
            orderStatus: 'Confirmed',
            address: [selectedAddress],
            paymentMethod: paymentMethod,
            dateoforder: formattedDate
        };
        if(cart.coupon==="Applied"){
            orderData.coupon = couponName;
        }
        const order = await ordcollec.create(orderData);

        // Update product stock based on items in the order
        for (const orderItem of order.items) {
            const productId = orderItem.productId;
            const quantity = orderItem.quantity;
           
            // Find the product and update its stock
            await prcollec.findByIdAndUpdate(productId, { $inc: { stock: -quantity } });
        }

        await cartcollec.findByIdAndDelete(cartId);

        const coupons = await couponcollec.find();

        let couponToAdd = null;

        // Iterate through thresholds to find the appropriate coupon
      
        for (const coupon of coupons) {
            if (cart.totalPrice > coupon.threshold) {
                couponToAdd = {
                    name:coupon.name, // Generate coupon name dynamically
                    description: coupon.description,
                    expirydate: new Date('2024-12-31'), // Set expiry date as needed
                    discount: coupon.discount
                };
            }
        }
    

        if (couponToAdd) {
            // Add the coupon to the user's coupons array
            await uscollec.findByIdAndUpdate(userId, {
                $push: { coupons: couponToAdd }
            });
        }
        // Render the order confirmation page or redirect to order details page
        res.json({ orderId: order._id });

    } catch (err) {
        console.error('Error confirming order:', err);
        res.status(500).send('Internal Server Error');
    }
};


 exports.createrazorpayorder = async(req, res) => {
    try{
        const { selectedAddressIndex, totalAmount } = req.body;
        let nameext = await uscollec.findOne({email:req.session.user})
      
        // You should retrieve the user's details and order information here
        // Replace the placeholders with actual data
        const userDetails = {
          name: nameext.firstname,
          email: nameext.email,
        };
      
        // Create a Razorpay order
        const options = {
          amount: totalAmount * 100, // Amount in paise
          currency: 'INR',
          receipt: 'order_' + Date.now(),
          payment_capture: 1,
        };
      
        razorpay.orders.create(options, (err, order) => {
          if (err) {
            console.error('Error creating Razorpay order:', err);
            return res.status(500).json({ error: 'Error creating Razorpay order' });
          }
      
          res.json({
            id: order.id,
            amount: order.amount / 100, // Amount in rupees
            userDetails: userDetails,
          });
        });
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
  };

exports.postcartcheckout = async(req,res)=>{
    try{
        let address = req.body.address;
        // console.log(address);
        res.send("Order loading......")
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.postaddaddresscart = async(req,res)=>{
    try{
        let nameext = await uscollec.findOne({email:req.session.user})
        let id = nameext._id;
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
        let user = await uscollec.findById(nameext._id)
        let cartId = req.params.id;
        let cart = await cartcollec.findById(cartId);
        // console.log(cart);
        res.redirect(`/user/cartcheckout/${cartId}`)

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}


exports.cartquandityupd = async (req, res) => {
    try {
      let nameext = await uscollec.findOne({email:req.session.user})
      const quantity = req.body.quantity;
      let userId = nameext._id;
      let productId = req.params.id;
      const pro = await prcollec.findById(productId);
    //   req.session.message = 'Stock unavailable';

      
      if (!pro) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const stock = pro.stock;

    //   if (quantity > stock) {
    //       req.session.message = 'Stock unavailable';
    //       return res.redirect('/user/user_cart/ada');
    //     };
      
  
      const cart = await cartcollec.findOne({ userId: userId });
  
      // Find the item in the cart with the specified productId
      const cartItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (!cartItem) {
        return res.status(404).json({ message: 'Product not found in the cart' });
      }
  
      // Calculate the change in quantity and total price
      const quantityChange = quantity - cartItem.quantity;
      const totalPriceChange = quantityChange * pro.price;
  
      // Update the quantity and totalPrice in the user's cart
      const result = await cartcollec.updateOne(
        { userId: userId, 'items.productId': productId },
        {
          $set: {
            'items.$.quantity': quantity,
          },
          $inc: {
            totalPrice: totalPriceChange,
          },
        }
      );
       res.redirect('/user/user_cart');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

    

exports.cartcheckout = async(req,res)=>{
    try{
        let nameext = await uscollec.findOne({email:req.session.user})
        let user = await uscollec.findById(nameext._id)
        let cartId = req.params.id;
        let cart = await cartcollec.findById(cartId);
        // console.log(cart); 
        res.render("user/checkout",{
            userData:user,
            cartData:cart,
            user:`${nameext.firstname} ${nameext.secondname}`
        })

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.removepdcart = async(req,res)=>{
    try{
        if(req.session.user){
            let nameext = await uscollec.findOne({email:req.session.user})
            let productId = req.params.id;
            let product = await prcollec.findById(productId);
            let userId = nameext._id;
    
            const cart = await cartcollec.findOne({userId:userId});
    
            const itemIndex = cart.items.findIndex(item => item.productId == productId);
    
            if (itemIndex === -1) {
                return res.status(404).json({ message: `Product with productId ${productId} not found in the cart` });
              }
    
    
         // Calculate the reduction in total price based on the quantity being removed
        const removedItem = cart.items[itemIndex];
        const reduction = removedItem.quantity * product.price;
    
        // Update the cart by pulling the item and reducing the total price
        const result = await cartcollec.updateOne(
          { userId: userId },
          {
            $pull: { items: { productId: productId } },
            $inc: { totalPrice: -reduction }
          }
        );
        
        const updatedCart = await cartcollec.findOne({ userId: userId });
            if (!updatedCart || updatedCart.items.length === 0) {
                // Delete the cart document
                await cartcollec.deleteOne({ userId: userId });
            }
    
            res.redirect("/user/user_cart");
    
        }else{
            res.redirect("/login")
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.addtocart = async(req,res)=>{
    try{
        if(req.session.user){
           let nameext = await uscollec.findOne({email:req.session.user})
           let productId = req.params.productId;
           let pro = await prcollec.findById(productId);
           const userId = nameext._id;
            const items = {
                 productId: productId,
                 quantity: 1 
                };
                let price;
            if(pro.offerprice>0){
                price = pro.offerprice;
            }else{
                price = pro.price;
            }
            
            const check = await cartcollec.findOne({userId:userId});
            if(check){
                const prodcheck = await cartcollec.findOne({'items.productId':productId});
                if(prodcheck){
        
                    const encodedMessage = encodeURIComponent("Product already exists in the cart");
                    req.session.message = "Product already exists in the cart";
                    res.redirect("/user/user_cart");
        
                }else{
                    check.items.push(items);
                    check.totalPrice += price;
                    await check.save();
                    console.log("New items added to cart. The item is " + JSON.stringify(items));
                    res.redirect("/user/user_cart");
        
                }
        
            }else{
                const newcart = new cartcollec({
                    userId: userId,
                    items: [items],
                    totalPrice: price
                });
                await newcart.save();
                console.log("New cart created!!");
                res.redirect("/user/user_cart");
            }
        
           }else{
            res.redirect("/login")
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getusercart = async (req, res) => {
    try{
        if (req.session.user) {
            let nameext = await uscollec.findOne({email:req.session.user})
            let userId = nameext._id;
            let proId = req.params.id;
            let user = await uscollec.findById(userId);
    
            const userCart = await cartcollec.findOne({ userId: userId });
            const userCartPro = await cartcollec.findOne({ userId: userId, 'items.productId': proId });
            if (userCart) {
                if(!userCartPro){
                    // Extract product IDs from the cart items
                const productIds = userCart.items.map(item => item.productId);
    
                // Fetch product details based on the IDs
                const productsInCart = await prcollec.find({ _id: { $in: productIds } });
    
                // Combine product details with quantity from the cart
                const itemsWithDetails = userCart.items.map(cartItem => {
                    const productDetails = productsInCart.find(product => product._id.equals(cartItem.productId));
                    return {
                        quantity: cartItem.quantity,
                        productDetails: productDetails || {}, // Empty object if product not found
                    };
                });
    
                let coupons = user.coupons;
                // console.log("coupons"+coupons);
    
                // Render the cart page with the items and additional details
                res.render('user/usercart', { itemsWithDetails, userCart, coupons});
                }
                else{
                    
    
                }
            } else{
                res.render("user/cartempty")
            }
        } else {
            res.redirect("/login");
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
   
};



exports.updateQuantity = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const productId = req.params.id;
        const newQuantity = parseInt(req.body.quantity, 10);

        // Find the user's cart
        const cart = await cartcollec.findOne({ userId: userId });

        // Find the cart item with the specified product ID
        const cartItem = cart.items.find(item => item.productId.equals(productId));

        if (cartItem) {
            // Update the quantity of the found cart item
            cartItem.quantity = newQuantity;
            await cart.save();

            // Send a response with updated information
            res.json({ success: true, updatedQuantity: newQuantity, updatedPrice: cart.totalPrice });
        } else {
            res.status(404).json({ success: false, message: 'Product not found in the cart.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.getcheckout = async(req,res) =>{
    try{
        let nameext = await uscollec.findOne({email:req.session.user})
        let id = req.params.id;
        let quantity = req.query.quantity;
        let user = await uscollec.findOne(nameext)
        let pro = await prcollec.findById(id)
        let userId = nameext._id;
      
        let cart = await cartcollec.findOne({userId:userId})
        // console.log(cart);
    
        const productIdToUpdate = id; // Replace with the actual product ID you want to update
        const newQuantity = quantity; // Replace with the new quantity
    
        // Find the index of the cart item with the specified product ID
        const cartItemIndex = cart.items.findIndex(item => item.productId.equals(productIdToUpdate));
    
        if (cartItemIndex !== -1) {
            // Update the quantity field of the found cart item
            cart.items[cartItemIndex].quantity = newQuantity;
            cart.totalPrice += newQuantity*pro.price;
    
            // Save the updated cart
            await cart.save();
    
            console.log(`Quantity updated successfully for product ID: ${productIdToUpdate}`);
        } else {
            console.log('Product not found in the cart.');
        }
        // await cartcollec.updateOne({'items.quantity':quantity})
        res.render("user/checkout.ejs",{
            product:pro,
            user:nameext.firstname,
            userData:user
        })
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
}

exports.getprodcart = async (req, res) => {
    try{
        if (req.session.user) {
            try {
                let nameext = await uscollec.findOne({email:req.session.user})
                let id = req.params.id;
                const pro = await prcollec.findById(id);
                const userId = nameext._id; // Assuming the user ID is stored in the session
                const items = {
                    productId: pro._id,
                    quantity: 1 
                };
                const price = pro.price;
                const check = await cartcollec.findOne({ userId: userId });
                
    
                const newQuantity = parseInt(req.body.quantity, 10);
                const updatedTotalPrice = price * newQuantity;
    
                if (check) {
                    const procheck = await cartcollec.findOne({'items.productId':id})
                    if(procheck){
                        
                   
                    res.render("user/cart.ejs", {
                        product: pro,
                        message:"Product already exists in the cart"
                    });
                    }else{
                        check.items.push(items);
                      
                        await check.save();
                        console.log("New items added to cart. The item is " + JSON.stringify(items));
                    }              
                } else {
                    const newcart = new cartcollec({
                        userId: userId,
                        items: [items],
                        totalPrice: price 
                    });
                    await newcart.save();
                    console.log("New cart created!!");
                }
    
                res.render("user/cart.ejs", {
                    product: pro
                });
            } catch (error) {
                console.error(error);
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.redirect("/login");
        }
    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
};

exports.postprodcart = async(req,res)=>{
    try{
        const quantity = req.body.quantity;

        await cartcollec.updateOne({'items.quantity':quantity})

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
   
}

exports.getvieworder = async (req, res) => {
    try{
        if (req.session.user) {
            let nameext = await uscollec.findOne({email:req.session.user})
            let userId = nameext._id;
            let users = await uscollec.findById(userId)
            let orders = await ordcollec.find({ userId });
        
           orders = orders.sort((a, b) => b.dateoforder - a.dateoforder);
           
            // Create an array to store detailed order information
            const detailedOrders = [];
        
            // Loop through each order and fetch product details
            for (const order of orders) {
                const detailedOrder = {
                    id:order._id,
                    totalPrice: order.totalPrice,
                    orderStatus: order.orderStatus,
                    paymentMethod: order.paymentMethod,
                    dateoforder: order.dateoforder.toDateString(),
                    items: [], // Array to store detailed product information in the order
                    coupon: order.coupon
                };
        
                // Loop through each item in the order and fetch product details
                for (const item of order.items) {
                    const product = await prcollec.findById(item.productId);
                    if (product) {
                        // Add relevant product details to the detailed order
                        detailedOrder.items.push({
                            productId:product._id,
                            productName: product.modelname,
                            image: product.image[0], // Assuming image is an array, you might need to adjust this based on your schema
                            colour: product.colour,
                            quantity: item.quantity,
                            price: product.price,
                            prostatus: item.prostatus,
                            rated:item.rated
                            // Add more details as needed
                        });
                    }
                }
        
                // Fetch address details for the order
                detailedOrder.address = []; // Initialize an array to store address details
        
                // Loop through the address array and push individual address details
                for (const address of order.address) {
                    detailedOrder.address.push({
                        houseno: address.houseno,
                        street: address.street,
                        city: address.city,
                        state: address.state,
                        pincode: address.pincode,
                        type: address.type
                    });
                }
        
                // Add the detailed order to the array
                detailedOrders.push(detailedOrder);
            }
        
            // Pass the detailed orders to the EJS file
            res.render("user/vieworder", { detailedOrders });
        } else {
            res.redirect("/login")
        }

    }catch (err) {
        console.error(err);
        res.redirect("/error");
    }
    }


