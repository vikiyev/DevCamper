const crypto = require("crypto");
const path = require("path");
const Bootcamp = require("../models/Bootcamp");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc      register user
// @route     POST /api/v1/auth/register
// @access    public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc      login user
// @route     POST /api/v1/auth/login
// @access    public
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

  sendTokenResponse(user, 200, res);
});

// @desc      get current logged in user
// @route     POST /api/v1/auth/me
// @access    private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      update password
// @route     PUT /api/v1/auth/updatepassword
// @access    private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // check if current password is correct
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(`Password is incorrect`, 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    public
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

  // create reset URL
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

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    public
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

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
