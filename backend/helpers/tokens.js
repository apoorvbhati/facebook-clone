const jwt = require("jsonwebtoken");

// this function takes in the user id that was created and gives back a token
// which will then be sent to the email with a link to verify the user
exports.generateToken = (payload, expired) => {
  return jwt.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: expired,
  });
};
