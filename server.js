var express = require("./node_modules/express");
var path = require("path");
var mongoose = require("mongoose");
var config = require("./config/database");
var bodyParser = require("./node_modules/body-parser");
var fileUpload = require("./node_modules/express-fileupload");
var session = require("./node_modules/express-session");
var expressValidator = require("./node_modules/express-validator");
var passport = require("./node_modules/passport");
var helmet = require("./node_modules/helmet");
var compression = require("./node_modules/compression");

// Connect to db
mongoose.connect(config.database, {useNewUrlParser: true});
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('Connected to database')
});

// Initial
var app = express();

// Production
app.use(helmet());
app.use(compression());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

// Setup Global errors variable
app.locals.errors = null;

// Get Page Model
var Page = require("./models/page");

//Get all pages to pass to header.js
Page.find({})
.sort({ osrting: 1 })
.exec(function (err,pages) {
  if (err) {
    console.log(err);
  } else {
    app.locals.pages = pages;
  }
});

//Get Category Model
var Category = require("./models/category");

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});



// Express fileUpload middleware
app.use(fileUpload());


// Setup body parser middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Setup express session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  //cookie: { secure: true }
}))

app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();
        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case "":
            return ".jpg";
          default:
            return false;
        }
      }
    }
  })
);


// Setup express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('./node_modules/express-messages')(req, res);
  next();
});

//Passport Config
require("./config/passport")(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//vid 41 app get star
app.get("*", function (req, res, next){
  res.locals.cart = req.session.cart;
  res.locals.user = req.user || null;
  next();
});




// set routes
var pages = require("./routes/pages.js");
var products = require("./routes/products.js");
var cart = require("./routes/cart.js");
var users = require("./routes/users.js");
var adminPages = require("./routes/admin_pages.js");
var adminCategories = require("./routes/admin_categories.js");
var adminProducts = require("./routes/admin_products.js");

// setup links
app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/products", products);
app.use("/cart", cart);
app.use("/users", users);
app.use("/", pages);




// Admin Products



// Setup server
// var port = 3000;
// app.listen(port, function(){
//   console.log("Server running on port " + port)
// });

//PORT
var port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server Running on POrt ${port}.`));
