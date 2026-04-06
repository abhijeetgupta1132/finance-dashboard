const router = require("express").Router();
const { getDb } = require("../db/database");
const { authenticate, authorize } = require("../middleware/auth");

router.get(
  "/summary",
  authenticate,
  authorize("admin", "analyst"),
  (req, res) => {
    const db = getDb();
    const t = db
      .prepare(
        `SELECT SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as total_income, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as total_expenses, COUNT(*) as total_records, COUNT(CASE WHEN type='income' THEN 1 END) as income_count, COUNT(CASE WHEN type='expense' THEN 1 END) as expense_count FROM financial_records WHERE is_deleted=0`,
      )
      .get();
    const category_breakdown = db
      .prepare(
        `SELECT category,type,SUM(amount) as total,COUNT(*) as count FROM financial_records WHERE is_deleted=0 GROUP BY category,type ORDER BY total DESC`,
      )
      .all();
    const recent_activity = db
      .prepare(
        `SELECT r.*,u.name as created_by_name FROM financial_records r LEFT JOIN users u ON r.created_by=u.id WHERE r.is_deleted=0 ORDER BY r.created_at DESC LIMIT 10`,
      )
      .all();
    res.json({
      summary: {
        total_income: t.total_income || 0,
        total_expenses: t.total_expenses || 0,
        net_balance: (t.total_income || 0) - (t.total_expenses || 0),
        total_records: t.total_records || 0,
        income_count: t.income_count || 0,
        expense_count: t.expense_count || 0,
      },
      category_breakdown,
      recent_activity,
    });
  },
);

router.get(
  "/trends",
  authenticate,
  authorize("admin", "analyst"),
  (req, res) => {
    const db = getDb();
    const monthly_trends = db
      .prepare(
        `SELECT strftime('%Y-%m',date) as period, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses FROM financial_records WHERE is_deleted=0 AND date>=date('now','-6 months') GROUP BY period ORDER BY period`,
      )
      .all();
    const weekly_trends = db
      .prepare(
        `SELECT strftime('%Y-W%W',date) as week, SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income, SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expenses FROM financial_records WHERE is_deleted=0 AND date>=date('now','-8 weeks') GROUP BY week ORDER BY week`,
      )
      .all();
    res.json({ monthly_trends, weekly_trends });
  },
);

router.get(
  "/category-analytics",
  authenticate,
  authorize("admin", "analyst"),
  (req, res) => {
    const db = getDb();
    res.json({
      expense_by_category: db
        .prepare(
          `SELECT category,SUM(amount) as total,COUNT(*) as count,AVG(amount) as average,MAX(amount) as max_amount FROM financial_records WHERE is_deleted=0 AND type='expense' GROUP BY category ORDER BY total DESC`,
        )
        .all(),
      income_by_category: db
        .prepare(
          `SELECT category,SUM(amount) as total,COUNT(*) as count,AVG(amount) as average FROM financial_records WHERE is_deleted=0 AND type='income' GROUP BY category ORDER BY total DESC`,
        )
        .all(),
    });
  },
);

module.exports = router;
