const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const static = express.static(__dirname + '/public');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const configRoutes = require('./routes');
const { handlebarsInstance } = require('./helpers/handlebar');

//set storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  //cb means call back
  //this randomly generates a name for the image everytime its uplopaded
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

//init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single('myImage');

//check file type
function checkFileType(file, cb) {
  //allowed extension
  const filetypes = /jpeg|jpg|png|gif/;
  //check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  //check mime type
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

require('dotenv').config({ path: 'variables.env' });

//waiting for the posted image to filter
app.post('/donations/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('donations/upload', { msg: err });
    } else {
      if (req.file == undefined) {
        res.render('donations/upload', { msg: 'Error: No file selected' });
      } else {
        res.render('donations/upload', {
          msg: 'File Uploaded!',
          file: `/${req.file.path}`,
          mul: 'No file Selected',
        });
        //`uploads/${req.file.filename}`
      }

      // console.log(req.file)
      // res.send("test")
    }
  });
});

app.use('/public', static);
app.use(express.static('public/images'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// populates req.cookies with any cookies that came along with the request
app.use(cookieParser('secret'));

app.use(
  session({
    name: 'HelpingHands',
    secret: process.env.SECRET,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

app.use(flash());

app.use(function (req, res, next) {
  // if there's a flash message in the session request, make it available in the response, then delete it
  res.locals.sessionFlash = req.session.sessionFlash;
  delete req.session.sessionFlash;
  next();
});

// Logging Middleware
app.use(async (req, res, next) => {
  let authType = req.session.user ? 'Authenticated' : 'Non-Authenticated';
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${
      req.originalUrl
    } (${authType} User)`
  );
  next();
});

// Setup loggedInUser local to use  middleware for storing user
app.use((req, res, next) => {
  let user = req.session.user;
  if (user) {
    res.locals.loggedInUser = user;
    res.locals.userRole = user.role_name;
  }
  next();
});

app.use('/donations/:id/update', (req, res, next) => {
  if (req.body.method == 'patch') {
    req.method = 'PATCH';
  }
  next();
});

app.use('/donations/:id/approve', (req, res, next) => {
  req.method = 'PATCH';
  next();
});

app.use('/donations/:id/reject', (req, res, next) => {
  req.method = 'PATCH';
  next();
});

app.use('/donations/:id/delete', (req, res, next) => {
  req.method = 'DELETE';
  next();
});

app.engine('handlebars', handlebarsInstance.engine);

app.set('view engine', 'handlebars');

configRoutes(app);

// done! we export it so we can start the site in start.js
module.exports = app;
