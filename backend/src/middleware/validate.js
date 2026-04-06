const { body, query, validationResult } = require("express-validator");
const ok = (req, res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty())
    return res
      .status(400)
      .json({ error: "Validation failed", details: e.array() });
  next();
};
module.exports = {
  loginValidation: [
    body("email").isEmail().normalizeEmail(),
    body("password").notEmpty(),
    ok,
  ],
  registerValidation: [
    body("name").trim().notEmpty(),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["admin", "analyst", "viewer"]),
    ok,
  ],
  recordValidation: [
    body("amount").isFloat({ gt: 0 }),
    body("type").isIn(["income", "expense"]),
    body("category").trim().notEmpty(),
    body("date").isISO8601(),
    ok,
  ],
  recordFilterValidation: [
    query("type").optional().isIn(["income", "expense"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    ok,
  ],
};
