const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const { id, role } = jwt.verify(token, process.env.SECRET_KEY);
    req.user = { id, role };
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
