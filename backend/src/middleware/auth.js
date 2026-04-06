const jwt = require("jsonwebtoken");
const { getDb } = require("../db/database");

const authenticate = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer "))
    return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    const user = getDb()
      .prepare("SELECT id,name,email,role,status FROM users WHERE id=?")
      .get(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.status === "inactive")
      return res.status(403).json({ error: "Account inactive" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};

const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ error: "Access denied" });

module.exports = { authenticate, authorize };
