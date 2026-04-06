require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

// FIXED CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-vercel-app.vercel.app", // 🔥 replace with your actual Vercel URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json());

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use("/api/auth", require("./src/routes/auth"));
app.use("/api/users", require("./src/routes/users"));
app.use("/api/records", require("./src/routes/records"));
app.use("/api/dashboard", require("./src/routes/dashboard"));

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`\n Backend: http://localhost:${PORT}`);
  console.log("admin@finance.com     / admin123");
  console.log("analyst@finance.com   / analyst123");
  console.log("viewer@finance.com    / viewer123\n");
});
