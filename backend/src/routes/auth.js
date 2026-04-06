const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const {
  loginValidation,
  registerValidation,
} = require("../middleware/validate");

router.post("/login", loginValidation, (req, res) => {
  const { email, password } = req.body;
  const user = getDb().prepare("SELECT * FROM users WHERE email=?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Invalid credentials" });
  if (user.status === "inactive")
    return res.status(403).json({ error: "Account inactive" });
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

router.post(
  "/register",
  authenticate,
  authorize("admin"),
  registerValidation,
  (req, res) => {
    const { name, email, password, role = "viewer" } = req.body;
    const db = getDb();
    if (db.prepare("SELECT id FROM users WHERE email=?").get(email))
      return res.status(409).json({ error: "Email already exists" });
    const r = db
      .prepare("INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)")
      .run(name, email, bcrypt.hashSync(password, 10), role);
    res.status(201).json({
      user: db
        .prepare("SELECT id,name,email,role,status FROM users WHERE id=?")
        .get(r.lastInsertRowid),
    });
  },
);

router.get("/me", authenticate, (req, res) => res.json({ user: req.user }));

module.exports = router;
