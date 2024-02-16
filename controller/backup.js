exports.getcheckout = async(req,res) =>{
    let id = req.params.id;
    let quantity = req.query.quantity;
    let user = await uscollec.findOne(nameext)
    let pro = await prcollec.findById(id)
    let userId = nameext._id;
    console.log(userId);
    console.log(quantity);
    console.log("id"+id);
  
    let cart = await cartcollec.findOne({userId:userId})
    console.log(cart);

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


}
exports.getprodcart = async (req, res) => {
    if (req.session.user) {
        try {

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
};
