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
  - [Retrieve Bootcamps within Radius](#retrieve-bootcamps-within-radius)
  - [Filtering](#filtering)
  - [Selecting Certain Fields and Sorting](#selecting-certain-fields-and-sorting)
  - [Pagination](#pagination)
  - [Relationship between documents](#relationship-between-documents)
    - [Populate](#populate)
    - [Reverse Populate](#reverse-populate)
    - [Cascade Delete](#cascade-delete)
  - [Aggregation](#aggregation)
  - [Photo Upload](#photo-upload)
  - [Advanced Results Middleware](#advanced-results-middleware)
  - [User Registration and Password Encryption](#user-registration-and-password-encryption)
  - [JSON Web Token](#json-web-token)
  - [Logging in](#logging-in)
  - [Sending JWT Cookies](#sending-jwt-cookies)
  - [Auth Protect Middleware](#auth-protect-middleware)
  - [Role Authorization](#role-authorization)
  - [Ownership](#ownership)
  - [Forgot Password Token](#forgot-password-token)
  - [Sending Email](#sending-email)
  - [Resetting Password](#resetting-password)
  - [Clearing Token Cookie on Logout](#clearing-token-cookie-on-logout)
  - [Injection and Sanitizing Data](#injection-and-sanitizing-data)
  - [Security Headers](#security-headers)
  - [XSS Protection](#xss-protection)
  - [Rate Limit and HTTP Param Pollution](#rate-limit-and-http-param-pollution)
  - [CORS](#cors)

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

## Retrieve Bootcamps within Radius

Since we are using GeoJSON, we can compute for the radius of a location. The mongoDB **centerSphere** returns documents within bounds of a given radius.

https://www.mongodb.com/docs/manual/reference/operator/query/centerSphere/

```javascript
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // get the lat long from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const long = loc[0].longitude;

  // calculate radius using radians
  // divide distance by radius of the earth (3963mi 6378km)
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[long, lat], radius] },
    },
  });

  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
```

## Filtering

Express allows us to easily access the request params using **req.query**. Using [mongo operators](https://www.mongodb.com/docs/manual/reference/operator/query/) such as `$lte`, we can filter out the response. For example, the query parameters `?averageCost[lte]=10000` will search for bootcamps with average cost less than 10000. `?careers[in]=Business` will search for bootcamps where the careers array contains Business.

```javascript
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;
  let queryStr = JSON.stringify(req.query);

  // gt -> $gt
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  console.log(queryStr);

  query = Bootcamp.find(JSON.parse(queryStr));
  const bootcamps = await query;
  res
    .status(200)
    .json({ success: true, count: bootcamps.length, data: bootcamps });
});
```

## Selecting Certain Fields and Sorting

When we use the query parameters `?select=name,description&sort=-name`, only the name and description fields should be returned. Mongoose allows us to select only the required fields by chaining **select()** method on the query. Wecan instantiate the removeFields array, which contains parameters that we need to exclude. We loop through this array and delete them from the query object.

The results will be sorted according to name, in descending order due to the **-**

```javascript
// copy the request query
const reqQuery = { ...req.query };

// fields to exclude from the query
const removeFields = ["select", "sort"];

// loop over removeFields and delete them from the request query
removeFields.forEach((param) => delete reqQuery[param]);

// find resource
query = Bootcamp.find(JSON.parse(queryStr));

// select only relevant fields if the request param has the select option
if (req.query.select) {
  // split fields into an array then join into a string separated by spaces
  const fields = req.query.select.split(",").join(" ");
  query = query.select(fields);
}

// sort
if (req.query.sort) {
  const sortBy = req.query.sort.split(",").join(" ");
  query = query.sort(sortBy);
} else {
  // default sort by date
  query = query.sort("-createdAt");
}

// execute query
const bootcamps = await query;
```

Since the select fields will be comma separated, we can use the split method to turn it to an array, and then join it into a string.

## Pagination

For pagination, we can exclude the parameters page and limit. Using mongoose **skip**, we can skip a number of documents, while **limit** will only return the specified number of documents.

We can then create a new property called pagination and attach it to our response object.

```javascript
// pagination
const page = parseInt(req.query.page, 10) || 1;
const limit = parseInt(req.query.limit, 10) || 1;
const startIndex = (page - 1) * limit;
const endIndex = page * limit;
const total = await Bootcamp.countDocuments();

query = query.skip(startIndex).limit(limit);

// execute query
const bootcamps = await query;

// pagination result
const pagination = {};
if (endIndex < total) {
  pagination.next = {
    page: page + 1,
    limit: limit,
  };
}

if (startIndex > 0) {
  pagination.prev = {
    page: page - 1,
    limit: limit,
  };
}

res.status(200).json({
  success: true,
  count: bootcamps.length,
  pagination,
  data: bootcamps,
});
```

## Relationship between documents

To add a bootcamp that a course is related to, we use the special type **ObjectID** on the schema.

```javascript
const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: "Bootcamp",
    required: true,
  },
});

module.exports = mongoose.model("Course", CourseSchema);
```

In the router file for bootcamps, we can re-route the router for `/bootcamps/:bootcampId/courses`

```javascript
// /routes/bootcamps.js

// Include other resource routers
const courseRouter = require("./courses");

const router = express.Router();

// reroute into other resource routers
router.use("/:bootcampId/courses", courseRouter);
```

```javascript
// /routes/courses.js
const router = express.Router({ mergeParams: true });

router.route("/").get(getCourses);
```

### Populate

Populate is used to populate the bootcamp field returned by the courses query with data.

```javascript
query = Course.find().populate({
  path: "bootcamp",
  select: "name description",
});
```

### Reverse Populate

We also want to show an array of courses related to a bootcamp. We can use mongoose [virtuals](https://mongoosejs.com/docs/guide.html#virtuals) for this. We need to add the following to the bootcamp model:

```javascript
const BootcampSchema = new mongoose.Schema(
  {},
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// reverse populate with virtuals
BootcampSchema.virtual("courses", {
  ref: "Course",
  localField: "_id",
  foreignField: "bootcamp",
  justOne: false,
});
```

```javascript
query = Bootcamp.find(JSON.parse(queryStr)).populate("courses");
```

### Cascade Delete

We need to delete all related courses as well when we delete a bootcamp. We can use the mongoose **pre** middleware.

```javascript
// cascade delete related courses when a bootcamp is deleted
BootcampSchema.pre("remove", async function (next) {
  await this.model("Course").deleteMany({ bootcamp: this._id });
  next();
});
```

## Aggregation

We create a middleware for calculating the average of the tuition of courses in a bootcamp. Statics in mongoose are called on the model itself while methods are called on the instance of a model. We use mongoose **aggregate** method to build pipelines. We match the bootcamp according to the bootcamp id passed.

```javascript
// static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
  console.log("calculating average cost...".blue);

  // returns an object with the id of the bootcamp and average of the course tuitions
  const obj = await this.aggregate([
    {
      $match: { bootcamp: bootcampId },
    },
    {
      $group: {
        _id: "$bootcamp",
        averageCost: { $avg: "$tuition" },
      },
    },
  ]);

  // console.log(obj);
  try {
    await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
      averageCost: Math.ceil(obj[0].averageCost / 10) * 10,
    });
  } catch (error) {
    console.error(error);
  }
};

// call getAverageCost after save
CourseSchema.post("save", function () {
  this.constructor.getAverageCost(this.bootcamp);
});

// call getAverageCost before remove
CourseSchema.pre("remove", function () {
  this.constructor.getAverageCost(this.bootcamp);
});
```

## Photo Upload

For file uploading, we use the express-fileupload middleware. We can expose out the public folder using **express.static()**

```javascript
// file uploading
app.use(fileupload());

// set static folder
app.use(express.static(path.join(__dirname, "public")));
```

```javascript
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  const file = req.files.file;
  // make sure that the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse("Please upload an image", 400));
  }

  // limit file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Maximum file size of ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  // upload the file
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Error with file upload`, 500));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({ success: true, data: file.name });
  });
});
```

## Advanced Results Middleware

We can offload the functionality of filtering, select, sorting, and pagination into a middleware instead of directly defining them in the controller methods.

```javascript
const advancedResults = (model, populate) => async (req, res, next) => {
  ...
  if (populate) {
    query = query.populate(populate);
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination: pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
```

```javascript
const Bootcamp = require("../models/Bootcamp");

// advancedResults middleware
const advancedResults = require("../middleware/advancedResults");

router.route("/").get(advancedResults(Bootcamp, "courses"), getBootcamps);
```

```javascript
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  // console.log(req.query)
  res.status(200).json(res.advancedResults);
});
```

## User Registration and Password Encryption

We can create a middelware using mongoose **pre** middleware. We use the bcryptjs library to both generate a salt and hash the password.

```javascript
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
```

## JSON Web Token

We can create a mongoose method for generating JWT using jsonwebtoken. **this** pertains to the actual user object itself.

```javascript
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
```

```javascript
// create token
const token = user.getSignedJwtToken();

res.status(200).json({
  success: true,
  token: token,
});
```

## Logging in

We can create a model method for comparing the plain text password to the one hashed password from the database.

```javascript
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(new ErrorResponse(`Please provide email and password`, 400));
  }

  // check for the user
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorResponse(`Invalid credentials`, 401));
  }

  // check if passwords match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token: token,
  });
});
```

```javascript
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
```

## Sending JWT Cookies

To store cookies, we use cookike-parser middleware.

```javascript
app.use(cookieParser());
```

```javascript
// get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
```

## Auth Protect Middleware

The token will be need to sent in the headers under the authorization bearer. We create a new middleware for verifying the token.

```javascript
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});
```

We can use the middleware by passing it as a parameter to our routes.

```javascript
router.route("/:id").put(protect, updateCourse).delete(protect, deleteCourse);
```

We can now retrieve the current user by creating an endpoint for a GET request at `/auth/me`

```javascript
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
```

## Role Authorization

We also need a middleware for authorization based on roles

```javascript
exports.authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is unauthorized to access this route`,
          403
        )
      );
    }
    next();
  };
```

```javascript
router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize("publisher", "admin"), updateBootcamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootcamp);
```

## Ownership

We need to associate a user to the bootcamp model and link the user to the bootcamp.

```javascript
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
```

```javascript
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // add user to request body from the middleware
  req.body.user = req.user.id;

  // limit to one bootcamp per publisher, if admin, can add multiple bootcamps
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `The user with id ${req.user.id} has already published a bootcmap`,
        400
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
```

In the controller methods, we can add a conditional for checking if the user is the owner of a resource, or if they are an admin.

```javascript
if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
  return next(
    new ErrorResponse(
      `User ${req.params.id} is not authorized to update this resource`,
      401
    )
  );
}
```

## Forgot Password Token

We can have a user send an email to a route and generate a token. We can create a model method for generating a reset token using node **crypto**.

```javascript
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  // hash the token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // set expiry in 10 mins
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
```

We then add our controller method.

```javascript
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(
      new ErrorResponse(`User with email ${req.body.email} not found`, 404)
    );
  }

  // get the reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: user,
  });
});
```

## Sending Email

We use the nodemailer package and mailtrap to send an email with the token. We first create a utility function using the [sample](https://nodemailer.com/about/) from nodemailer for sending an email.

```javascript
const sendEmail = async (options) => {
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // send mail with defined transport object
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email, // list of receivers
    subject: options.subject, // Subject line
    text: options.message, // plain text body
  };

  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
};

module.exports = sendEmail;
```

We can now update the controller method for generating a reset token to include the email functionality.

```javascript
const resetUrl = `${req.protocol}://${req.get(
  "host"
)}/api/v1/auth/resetpassword/${resetToken}`;

const message = `You are receiving this email because you requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;

try {
  await sendEmail({
    email: user.email,
    subject: "Password reset token",
    message,
  });

  res.status(200).json({ success: true, data: "Email sent" });
} catch (error) {
  console.error(error);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({ validateBeforeSave: false });

  return next(new ErrorResponse(`Email could not be sent`, 500));
}
```

## Resetting Password

We need to create a route and controller wherein the user can send a PUT request with the new password for resetting the old password.

```javascript
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // set the new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);

  res.status(200).json({
    success: true,
    data: user,
  });
});
```

## Clearing Token Cookie on Logout

We use the following code on our auth protect middleware, which checks the headers then the cookies for the token.

```javascript
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // check headers for token. if none, check the cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
```

We can access the res.cookie property thanks to the cookie-parser middleware.

```javascript
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});
```

## Injection and Sanitizing Data

express-mongo-sanitize middleware can be used to sanitize data.

```javascript
const mongoSanitize = require("express-mongo-sanitize");
// sanitize
app.use(mongoSanitize());
```

## Security Headers

The helmet middleware adds a bunch of header values that can help make our API more secure.

## XSS Protection

XSS is when we embed malicious code such as script tags on the database values. xss-clean sanitizes input and prevents cross site scripting.

```json
"data": {
        "name": "TEST2<script>alert(1)</script>",
}
```

```javascript
const xss = require("xss-clean");
app.use(xss());
```

## Rate Limit and HTTP Param Pollution

Using express-rate-limit, we can limit requests within a certain amount of time.

hpp library can be used to protect against HTTP parameter pollution attacks.

```javascript
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

app.use(hpp());

// rate limiter
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 1, // max requests
});

app.use(limiter);
```

## CORS

If we were to make a request from another domain, it would be rejected. The cors package can be used to enable cross origin resource sharing.

```javascript
const cors = require("cors");
app.use(cors());
```
