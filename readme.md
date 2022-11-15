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

We need to create a model for our collections.
