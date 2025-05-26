const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: "http://localhost:8000"
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Rate Limiter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each IP to 1000 requests per hour
  message: "Too many requests from this IP, please try again in an hour"
});
app.use("/", limiter);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/public/Images', express.static(path.join(__dirname, 'public/Images')));
app.use('/public/blog', express.static(path.join(__dirname, 'public/blog')));
app.use('/public/gallery', express.static(path.join(__dirname, 'public/gallery')));
app.use('/public/service', express.static(path.join(__dirname, 'public/service')));
app.use('/public/defult', express.static(path.join(__dirname, 'public/defult')));

// MongoDB connection d
mongoose.Promise = global.Promise;

const connectDB = require('./config/dbconfig');
connectDB();


// Default Route
app.get('/', (req, res) => {
  res.json({ message: "Hello, Server Started" });
});

// Import & Use Routes
app.use('/users', require('./app/routes/user'));

app.use('/blog', require('./app/routes/blogRouter'));
app.use('/services', require('./app/routes/serviceRoutes'));
app.use('/gallery', require('./app/routes/galleryRoutes'));

app.use('/enquiries', require('./app/routes/enquiry'));
app.use('/followUp', require('./app/routes/followUp'));


app.use('/countries', require('./app/routes/countryRoutes'));
app.use('/courses', require('./app/routes/courseRoutes'));
app.use('/college', require('./app/routes/collegeRouter'));



app.use('/userProfile', require('./app/routes/userProfile'));
app.use('/userroles', require('./app/routes/userRole'));
app.use('/orgType', require('./app/routes/orgType'));
app.use('/orgCategory', require('./app/routes/orgCategory'));
app.use('/productService', require('./app/routes/productServices'));
app.use('/supportType', require('./app/routes/supportType'));
app.use('/orgProfile', require('./app/routes/orgProfile'));


// Uncomment if you plan to use these routes later
// app.use("/support", require('./app/routes/enquirySupport'));
// app.use("/enquirySource", require('./app/routes/enquirySource'));
// app.use("/enquirymode", require('./app/routes/enquiryMode'));
// app.use("/enquiryType", require('./app/routes/enquiryType'));

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
