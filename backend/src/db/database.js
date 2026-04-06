const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

let db;

function getDb() {
  if (!db) {
    const dir = path.join(__dirname, "../../data");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, "finance.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema();
    seedData();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','analyst','viewer')) DEFAULT 'viewer',
      status TEXT NOT NULL CHECK(status IN ('active','inactive')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS financial_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK(amount > 0),
      type TEXT NOT NULL CHECK(type IN ('income','expense')),
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER NOT NULL,
      is_deleted INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_date ON financial_records(date);
    CREATE INDEX IF NOT EXISTS idx_type ON financial_records(type);
    CREATE INDEX IF NOT EXISTS idx_del  ON financial_records(is_deleted);
  `);
}

function seedData() {
  const bcrypt = require("bcryptjs");
  if (db.prepare("SELECT COUNT(*) as c FROM users").get().c > 0) return;

  const h = (p) => bcrypt.hashSync(p, 10);
  const u = db.prepare(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
  );
  u.run("Admin User", "admin@finance.com", h("admin123"), "admin");
  u.run("Alice Analyst", "analyst@finance.com", h("analyst123"), "analyst");
  u.run("Victor Viewer", "viewer@finance.com", h("viewer123"), "viewer");

  const incCats = ["Salary", "Freelance", "Investment", "Rental", "Bonus"];
  const expCats = [
    "Rent",
    "Food",
    "Transport",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Education",
  ];
  const r = db.prepare(
    "INSERT INTO financial_records (amount,type,category,date,notes,created_by) VALUES (?,?,?,?,?,?)",
  );
  const now = new Date();

  for (let m = 5; m >= 0; m--) {
    const mo = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const days = new Date(mo.getFullYear(), mo.getMonth() + 1, 0).getDate();
    const d = (n) =>
      `${mo.getFullYear()}-${String(mo.getMonth() + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
    for (let i = 0; i < 8; i++) {
      const c = incCats[Math.floor(Math.random() * incCats.length)];
      r.run(
        +(Math.random() * 8000 + 2000).toFixed(2),
        "income",
        c,
        d(Math.floor(Math.random() * days) + 1),
        c,
        1,
      );
    }
    for (let i = 0; i < 15; i++) {
      const c = expCats[Math.floor(Math.random() * expCats.length)];
      r.run(
        +(Math.random() * 2000 + 100).toFixed(2),
        "expense",
        c,
        d(Math.floor(Math.random() * days) + 1),
        c,
        1,
      );
    }
  }
}

module.exports = { getDb };
