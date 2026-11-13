
const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");

const {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport
} = require("../controllers/reportController");

router.get("/daily", authenticateToken, getDailyReport);
router.get("/month-to-date", authenticateToken, getMonthToDateReport);
router.get("/previous-month", authenticateToken, getPreviousMonthReport);

module.exports = router;
