const express = require("express");
const app = express();
require("dotenv").config();
const path = require("path")
const session = require("express-session")
const userrouter = require("./router/user")
const uscollec = require("./models/userconfig")
const prcollec = require("./models/productconfig")
const cartcollec = require("./models/cartconfig");
const couponcollec = require("./models/couponconfig")
const admrouter = require("./router/admin")
const multer = require("multer");
const nocache = require("nocache");

app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use(nocache());
app.use(session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true
}));


// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));
app.use("/static", express.static('public'));
app.use("/js", express.static('js'));
app.use(userrouter);
app.use(admrouter);


app.set('view engine','ejs');

// Error handling middleware
app.use((err, req, res, next) => {
    // Log the error
    console.error(err.stack);
  
    // Render an error page
    res.status(500).render('err', { error: err });
  });
  
  // Define error page route
  app.get('/error', (req, res) => {
    // Render the error page
    res.status(500).render('err', { error: 'An unexpected error occurred.' });
  });

  app.get('*', (req, res) => {
    res.redirect('/error');
  });


app.listen(process.env.port)
console.log(`Server deployed at http://localhost:${process.env.port}/homepage`);