const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/tokens");
const { sendVerificationMail, sendResetCode } = require("../helpers/mailer");
const Code = require("../models/Code");
const generateCode = require("../helpers/generateCode");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      username,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email address",
      });
    }

    if (!validateLength(first_name, 3, 30)) {
      res.status(400).json({
        message: "first name must be between 3 and 30 characters",
      });
    }

    if (!validateLength(last_name, 3, 30)) {
      res.status(400).json({
        message: "last name must be between 3 and 30 characters",
      });
    }

    if (!validateLength(password, 6, 20)) {
      res.status(400).json({
        message: "password must be between 6 and 20 characters",
      });
    }

    const cryptedPassword = await bcrypt.hash(password, 12);

    const tempName = first_name + last_name;
    const newUsername = await validateUsername(tempName);

    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message: "The email address already exists, try with a different email",
      });
    }

    const user = await new User({
      first_name,
      last_name,
      email,
      username: newUsername,
      password: cryptedPassword,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = generateToken(
      { id: user._id.toString() }, // the id is converted to a string
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`; // this url is the one that is hit when the user clicks on the confirm you account in the mail
    sendVerificationMail(user.email, user.first_name, url);

    // the token needs to be sent to the frontend so that the user is able to login
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.picture,
      token: token,
      verified: user.verified,
      message: "Register success! Please verify your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// This function activates the user account
exports.activateAccount = async (req, res) => {
  try {
    const validUserId = req.user.id;
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET); // verify the jwt
    const check = await User.findById(user.id); // find the user by id and then check whether he is verified or not
    // check if the current user is the same use for whom the active link was generated
    if (validUserId !== user.id) {
      res.status(400).json({
        message: "You don't have authorization to complete this operation",
      });
    }

    if (check.verified == true) {
      res.status(400).json({ message: "This email is already acitvated" });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      res
        .status(200)
        .json({ message: "Account has been activated successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "The email you entered is not connected to an account",
      });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid credentials. Please try again.",
      });
    }

    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      picture: user.picture,
      token: token,
      verified: user.verified,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res.status(400).json({
        message: "The account is already activated",
      });
    }
    const emailVerificationToken = generateToken(
      { id: user._id.toString() }, // the id is converted to a string
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`; // this url is the one that is hit when the user clicks on the confirm you account in the mail
    sendVerificationMail(user.email, user.first_name, url);
    return res.status(200).json({
      message: "Email verificaion mail is sent to your email",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "Account does not exists.",
      });
    }
    return res.status(200).json({
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password");
    await Code.findOneAndRemove({ user: user._id });
    const code = generateCode(5);
    const savedCode = await new Code({
      code,
      user: user._id,
    }).save();

    sendResetCode(user.email, user.first_name, code);
    return res.status(200).json({
      message: "Email reset code has been sent to your mail",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const Dbcode = await Code.findOne({ user: user._id });
    if (Dbcode.code !== code) {
      return res.status(400).json({
        message: "Verification code is wrong",
      });
    }
    return res.status(200).json({ message: "Ok" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { email, password } = req.body;

  const cryptedPassword = await bcrypt.hash(password, 12);
  await User.findOneAndUpdate({ email }, { password: cryptedPassword });
  return res.status(200).json({ message: "Ok" });
};
