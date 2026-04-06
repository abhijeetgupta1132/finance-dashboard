const router = require("express").Router();
const { getDb } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");

router.get("/", authenticate, authorize("admin"), (req, res) =>
  res.json({
    users: getDb()
      .prepare(
        "SELECT id,name,email,role,status,created_at FROM users ORDER BY created_at DESC",
      )
      .all(),
  }),
);

router.patch("/:id/role", authenticate, authorize("admin"), (req, res) => {
  const { role } = req.body;
  if (!["admin", "analyst", "viewer"].includes(role))
    return res.status(400).json({ error: "Invalid role" });
  getDb()
    .prepare("UPDATE users SET role=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
    .run(role, req.params.id);
  res.json({ message: "Role updated" });
});

router.patch("/:id/status", authenticate, authorize("admin"), (req, res) => {
  const { status } = req.body;
  if (!["active", "inactive"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  if (+req.params.id === req.user.id)
    return res.status(400).json({ error: "Cannot change own status" });
  getDb()
    .prepare(
      "UPDATE users SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
    )
    .run(status, req.params.id);
  res.json({ message: "Status updated" });
});

router.delete("/:id", authenticate, authorize("admin"), (req, res) => {
  if (+req.params.id === req.user.id)
    return res.status(400).json({ error: "Cannot delete yourself" });
  getDb().prepare("DELETE FROM users WHERE id=?").run(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
