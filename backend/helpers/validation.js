const User = require("../models/User");

exports.validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2,12})?$/);
};

exports.validateLength = (text, min, max) => {
  if (text.length > max || text.length < min) {
    return false;
  }
  return true;
};

// What is happening here?
// first we check in the db if the username exists and if it does then we create a random single digit
// no and attach it to the username to create a unique username
exports.validateUsername = async (username) => {
  let a = false;

  do {
    const check = await User.findOne({ username });
    if (check) {
      //change name
      username += (+new Date() * Math.random()).toString().substring(0, 1);
      a = true;
    } else {
      a = false;
    }
  } while (a);
  return username;
};
