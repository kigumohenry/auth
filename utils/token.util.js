const jwt = require("jsonwebtoken");

exports.generateToken = ({ id, role, type }) => {
  return jwt.sign({ id, role }, process.env.SECRET_KEY, {
    expiresIn: type === "refresh" ? "7d" : "1h",
  });
};
