# DevCamper

A REST API built from scratch using Nodejs, Express and MongoDB integration. This API features middlewares for routing and authentication. This project is from Brad Traversy's course [Node.js API Masterclass With Express & MongoDB](https://www.udemy.com/course/nodejs-api-masterclass/).

The API gives the user the ability to search, create, update or delete bootcamp/courses, read reviews and ratings. Authentication is done using JWT and cookies. Password encryption and preventing NoSQL injections and XSS are also considered. The documentation is created via Postman and docgen.

- [DevCamper](#devcamper)
- [Functionalities](#functionalities)
    - [Bootcamps](#bootcamps)
    - [Courses](#courses)
    - [Reviews](#reviews)
    - [Users & Authentication](#users--authentication)
    - [Security](#security)
    - [Documentation](#documentation)
    - [Deployment (Digital Ocean)](#deployment-digital-ocean)
    - [Code Related Suggestions](#code-related-suggestions)
  - [Setting up Express Server](#setting-up-express-server)
  - [Middlewares](#middlewares)
  - [MongoDB](#mongodb)
  - [Models](#models)
    - [Create Bootcamp](#create-bootcamp)
  - [Custom Error Handling Middleware](#custom-error-handling-middleware)
  - [Mongoose Error Handling](#mongoose-error-handling)
  - [Async Await Middleware](#async-await-middleware)
  - [Mongoose Middlewares / Hooks](#mongoose-middlewares--hooks)

# Functionalities

### Bootcamps

- List all bootcamps in the database
  - Pagination
  - Select specific fields in result
  - Limit number of results
  - Filter by fields
- Search bootcamps by radius from zipcode
  - Use a geocoder to get exact location and coords from a single address field
- Get single bootcamp
- Create new bootcamp
  - Authenticated users only
  - Must have the role "publisher" or "admin"
  - Only one bootcamp per publisher (admins can create more)
  - Field validation via Mongoose
- Upload a photo for bootcamp
  - Owner only
  - Photo will be uploaded to local filesystem
- Update bootcamps
  - Owner only
  - Validation on update
- Delete Bootcamp
  - Owner only
- Calculate the average cost of all courses for a bootcamp
- Calculate the average rating from the reviews for a bootcamp

### Courses

- List all courses for bootcamp
- List all courses in general
  - Pagination, filtering, etc
- Get single course
- Create new course
  - Authenticated users only
  - Must have the role "publisher" or "admin"
  - Only the owner or an admin can create a course for a bootcamp
  - Publishers can create multiple courses
- Update course
  - Owner only
- Delete course
  - Owner only

### Reviews

- List all reviews for a bootcamp
- List all reviews in general
  - Pagination, filtering, etc
- Get a single review
- Create a review
  - Authenticated users only
  - Must have the role "user" or "admin" (no publishers)
- Update review
  - Owner only
- Delete review
  - Owner only

### Users & Authentication

- Authentication will be ton using JWT/cookies
  - JWT and cookie should expire in 30 days
- User registration
  - Register as a "user" or "publisher"
  - Once registered, a token will be sent along with a cookie (token = xxx)
  - Passwords must be hashed
- User login
  - User can login with email and password
  - Plain text password will compare with stored hashed password
  - Once logged in, a token will be sent along with a cookie (token = xxx)
- User logout
  - Cookie will be sent to set token = none
- Get user
  - Route to get the currently logged in user (via token)
- Password reset (lost password)
  - User can request to reset password
  - A hashed token will be emailed to the users registered email address
  - A put request can be made to the generated url to reset password
  - The token will expire after 10 minutes
- Update user info
  - Authenticated user only
  - Separate route to update password
- User CRUD
  - Admin only
- Users can only be made admin by updating the database field manually

### Security

- Encrypt passwords and reset tokens
- Prevent cross site scripting - XSS
- Prevent NoSQL injections
- Add a rate limit for requests of 100 requests per 10 minutes
- Protect against http param polution
- Add headers for security (helmet)
- Use cors to make API public (for now)

### Documentation

- Use Postman to create documentation
- Use docgen to create HTML files from Postman
- Add html files as the / route for the api

### Deployment (Digital Ocean)

- Push to Github
- Create a droplet - https://m.do.co/c/5424d440c63a
- Clone repo on to server
- Use PM2 process manager
- Enable firewall (ufw) and open needed ports
- Create an NGINX reverse proxy for port 80
- Connect a domain name
- Install an SSL using Let's Encrypt

### Code Related Suggestions

- NPM scripts for dev and production env
- Config file for important constants
- Use controller methods with documented descriptions/routes
- Error handling middleware
- Authentication middleware for protecting routes and setting user roles
- Validation using Mongoose and no external libraries
- Use async/await (create middleware to clean up controller methods)
- Create a database seeder to import and destroy data

## Setting up Express Server

We can send a response and status code easily using Express.

```javascript
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

// create routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { message: "Hello" } });
});

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
```

Using the Express router, we can put related routes into their own files. We can also go ahead and create controller methods for each route.

```javascript
// controllers/bootcamps.js

// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    public
exports.getBootcamps = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Show all bootcamps" });
};

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    public
exports.getBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Show bootcamp ${req.params.id}` });
};

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    private
exports.createBootcamp = (req, res, next) => {
  res.status(200).json({ success: true, msg: "Create new bootcamp" });
};

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    private
exports.updateBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Update bootcamp ${req.params.id}` });
};

// @desc      Delte bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    private
exports.deleteBootcamp = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: `Delete bootcamp ${req.params.id}` });
};
```

```javascript
// routes/bootcamps.js

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
} = require("../controllers/bootcamps");

const router = express.Router();

router.route("/").get(getBootcamps).post(createBootcamp);
router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

module.exports = router;
```

## Middlewares

Middlewares are functions that have access to the request and response cycle that runs during that cycle. These can be used for authentication, error handling, etc.

```javascript
const logger = (req, res, next) => {
  req.hello = "Hello from logger";
  console.log(
    `${req.method} ${req.protocol}://${req.get("host")}${req.originalUrl}`
  );
  next();
};

app.use(logger);
app.use("/api/v1/bootcamps", bootcamps);
```

We will now be able to access the **hello** property on the request object on our bootcamps controller.

```javascript
exports.getBootcamps = (req, res, next) => {
  res
    .status(200)
    .json({ success: true, msg: "Show all bootcamps", hello: req.hello });
};
```

For this project, we use **morgan** as the logging middleware.

```javascript
const morgan = require("morgan");

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
```

## MongoDB

To connect to mongoDB atlas, we use the connection string provided. Using **mongoose** library, we don't have to write SQL.

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {});
  console.log(`Connected to MongoDB: ${conn.connection.host}`);
};

module.exports = connectDB;
```

```javascript
const connectDB = require("./config/db");

// connect to mongodb
connectDB();
```

## Models

We need to create a model for our collections wherein we create a mongoose schema. For the location property, we use mongoose GeoJSON.

```javascript
const mongoose = require("mongoose");

const BootcampSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  slug: String,
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  location: {
    // GeoJSON Point
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    street: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  careers: {
    // Array of strings
    type: [String],
    required: true,
    enum: [
      "Web Development",
      "Mobile Development",
      "UI/UX",
      "Data Science",
      "Business",
      "Other",
    ],
  },
  averageRating: {
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [10, "Rating must can not be more than 10"],
  },
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
```

### Create Bootcamp

To access the request body, we need to use the **json()** middleware from express.

```javascript
const app = express();

// body parser
app.use(express.json());
```

We then use the Bootcamp model and run the create method.

```javascript
const Bootcamp = require("../models/Bootcamp");

exports.createBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};
```

## Custom Error Handling Middleware

For errors returned from async functions invoked by route handlers and middleware, we need to pass the error to the next() function for Express to catch.

```javascript
exports.getBootcamp = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};
```

We can also write our own error handling middleware with custom error responses.

```javascript
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;

const errorHandler = (err, req, res, next) => {
  // log to console for dev
  console.log(err.stack.red);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server Error",
  });
};

module.exports = errorHandler;
```

To use the custom ErrorResponse class, we need to instantiate an instance of the class.

```javascript
catch (err) {
    // res.status(400).json({ success: false });
    next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
```

## Mongoose Error Handling

We can catch specific errors in our errorHandler middleware, rather than catching from the controller method itself.

```javascript
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = {
    ...err,
  };
  error.message = err.message;

  // log to console for dev
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validators
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
```

```javascript
catch (err) {
    next(err);
  }
```

## Async Await Middleware

We can also create a handler function to handle async calls, instead of repeating async/await on each controller method.

```javascript
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
```

```javascript
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
```

## Mongoose Middlewares / Hooks

We can use mongoose middlewares for generating a slug upon creating a bootcamp. Document middleware is supported for the following document functions: validate save remove updateOne deleteOne. In Mongoose, a document is an instance of a Model class. In document middleware functions, **this** refers to the document. The **pre()** middleware runs before the record is saved.

```javascript
BootcampSchema.pre("save", function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});
```

For the geocode feature, MapQuest and node-geocoder is used.

```javascript
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: process.env.GEOCODER_PROVIDER,
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
```

```javascript
// Geocode & create location field
BootcampSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.address);

  // generate geoJSON
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save the address in DB
  this.address = undefined;

  next();
});
```
