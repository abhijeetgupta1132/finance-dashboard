const router = require("express").Router();
const { getDb } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");
const {
  recordValidation,
  recordFilterValidation,
} = require("../middleware/validate");

router.get("/", authenticate, recordFilterValidation, (req, res) => {
  const {
    type,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 15,
  } = req.query;
  const db = getDb();
  const where = ["r.is_deleted=0"];
  const p = [];
  if (type) {
    where.push("r.type=?");
    p.push(type);
  }
  if (category) {
    where.push("r.category LIKE ?");
    p.push(`%${category}%`);
  }
  if (startDate) {
    where.push("r.date>=?");
    p.push(startDate);
  }
  if (endDate) {
    where.push("r.date<=?");
    p.push(endDate);
  }
  const W = `WHERE ${where.join(" AND ")}`;
  const total = db
    .prepare(`SELECT COUNT(*) as c FROM financial_records r ${W}`)
    .get(...p).c;
  const records = db
    .prepare(
      `SELECT r.*,u.name as created_by_name FROM financial_records r LEFT JOIN users u ON r.created_by=u.id ${W} ORDER BY r.date DESC LIMIT ? OFFSET ?`,
    )
    .all(...p, +limit, (+page - 1) * +limit);
  res.json({
    records,
    pagination: {
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / +limit),
    },
  });
});

router.get("/:id", authenticate, (req, res) => {
  const rec = getDb()
    .prepare(
      "SELECT r.*,u.name as created_by_name FROM financial_records r LEFT JOIN users u ON r.created_by=u.id WHERE r.id=? AND r.is_deleted=0",
    )
    .get(req.params.id);
  if (!rec) return res.status(404).json({ error: "Not found" });
  res.json({ record: rec });
});

router.post(
  "/",
  authenticate,
  authorize("admin", "analyst"),
  recordValidation,
  (req, res) => {
    const { amount, type, category, date, notes } = req.body;
    const db = getDb();
    const r = db
      .prepare(
        "INSERT INTO financial_records (amount,type,category,date,notes,created_by) VALUES (?,?,?,?,?,?)",
      )
      .run(amount, type, category, date, notes || null, req.user.id);
    res.status(201).json({
      record: db
        .prepare("SELECT * FROM financial_records WHERE id=?")
        .get(r.lastInsertRowid),
    });
  },
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "analyst"),
  recordValidation,
  (req, res) => {
    const db = getDb();
    const ex = db
      .prepare("SELECT * FROM financial_records WHERE id=? AND is_deleted=0")
      .get(req.params.id);
    if (!ex) return res.status(404).json({ error: "Not found" });
    if (req.user.role === "analyst" && ex.created_by !== req.user.id)
      return res.status(403).json({ error: "Can only edit own records" });
    const { amount, type, category, date, notes } = req.body;
    db.prepare(
      "UPDATE financial_records SET amount=?,type=?,category=?,date=?,notes=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    ).run(amount, type, category, date, notes || null, req.params.id);
    res.json({
      record: db
        .prepare("SELECT * FROM financial_records WHERE id=?")
        .get(req.params.id),
    });
  },
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "analyst"),
  (req, res) => {
    const db = getDb();
    const ex = db
      .prepare("SELECT * FROM financial_records WHERE id=? AND is_deleted=0")
      .get(req.params.id);
    if (!ex) return res.status(404).json({ error: "Not found" });
    if (req.user.role === "analyst" && ex.created_by !== req.user.id)
      return res.status(403).json({ error: "Can only delete own records" });
    db.prepare("UPDATE financial_records SET is_deleted=1 WHERE id=?").run(
      req.params.id,
    );
    res.json({ message: "Deleted" });
  },
);

module.exports = router;
