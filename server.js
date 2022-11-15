const express = require("express");
const dotenv = require("dotenv");

// Route files
const bootcamps = require('./routes/bootcamps')


// load env vars
dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 5000;

const app = express();

// Mount routers
app.use('/api/v1/bootcamps', bootcamps)

// create routes
app.get("/", (req, res) => {
  res.status(200).json({ success: true, data: { message: "Hello" } });
});



app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`)
);
