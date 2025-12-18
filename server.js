require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const corsOption = require('./config/corsOptions.js');
const { logger } = require("./middleware/logEvents");
const errorHandler = require('./middleware/errorHandler');
const verifyJWT = require('./middleware/verifyJWT');
const credentials = require('./middleware/credentials.js')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const connectDB = require('./config/dbConn.js');
const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// custom middleware logger
app.use(logger);

// Handle options credentials check - before CORS!
// and fetch cookies credentials requirements
app.use(credentials);

// Cross Origin Resource Sharing
app.use(cors(corsOption));

// built-in middleware to handle urlencoded data form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// serve static files
app.use(express.static(path.join(__dirname, "/public")));

// routes
app.use('/' , require('./routes/root'));
app.use('/register' , require('./routes/register.js'));
app.use('/auth' , require('./routes/auth.js'));
app.use('/refresh', require('./routes/refresh.js'));
app.use('/logout', require('./routes/logout.js'));
app.use(verifyJWT);
app.use('/employees', require('./routes/api/employees.js'));


app.all(/.*/, (req, res) => {
  res.status(404);
  if(req.accepts('html')){
    res.sendFile(path.join(__dirname, "views", "404.html"));
  }
  else if(req.accepts('json')){
    res.json({ error: "404 Not Found! "})
  } else{
    res.type('txt').send("404 Not Found! ")
  }
});

app.use(errorHandler);

mongoose.connection.once('open', () =>{
  console.log('Connected to Mongo DB');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
