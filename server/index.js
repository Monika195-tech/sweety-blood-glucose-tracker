
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const app = express();
const reportRoutes = require("./routes/reportRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/readings", readingRoutes);
app.get("/", (req, res) => {
  res.send("Sweety API is running!");
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");
    res.json({
      message: "Server and PostgreSQL connected successfully!"
    });
  } catch (error) {
    console.log("DATABASE ERROR:", error.message);
    res.status(500).json({
      message: "Database connection failed",
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sweety server running on port ${PORT}`);
});
