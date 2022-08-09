const User = require("../models/User");
const bcrypt = require("bcrypt");
const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const { generateToken } = require("../helpers/tokens");

const home = async (req, res) => {
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
    console.log(newUsername);

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
    console.log(emailVerificationToken);

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = home;
