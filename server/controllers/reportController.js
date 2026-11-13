
const pool = require("../config/db");

// Validate date format
const isValidDate = (date) => {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
};

// DAILY REPORT
const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format"
      });
    }

    const result = await pool.query(
      `SELECT
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         slot,
         glucose_value
       FROM glucose_readings
       WHERE user_id = $1 AND reading_date = $2
       ORDER BY
         CASE slot
           WHEN 'Morning fasting' THEN 1
           WHEN 'After breakfast' THEN 2
           WHEN 'After lunch' THEN 3
           WHEN 'After dinner' THEN 4
         END`,
      [req.user.id, date]
    );

    const readings = result.rows;
    const values = readings.map(r => Number(r.glucose_value));

    res.json({
      report: "Daily Report",
      date,
      high: values.length ? Math.max(...values) : null,
      low: values.length ? Math.min(...values) : null,
      average: values.length
        ? Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1))
        : null,
      count: values.length,
      readings
    });

  } catch (error) {
    console.error("Daily report error:", error.message);
    res.status(500).json({
      message: "Failed to generate daily report"
    });
  }
};


// MONTH-TO-DATE REPORT
const getMonthToDateReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format"
      });
    }

    const result = await pool.query(
      `SELECT
         MAX(glucose_value) AS high,
         MIN(glucose_value) AS low,
         ROUND(AVG(glucose_value), 1) AS average,
         COUNT(*) AS count
       FROM glucose_readings
       WHERE user_id = $1
         AND reading_date >= DATE_TRUNC('month', $2::date)::date
         AND reading_date <= $2::date`,
      [req.user.id, date]
    );

    const report = result.rows[0];

    res.json({
      report: "Month-to-Date Report",
      from: date.slice(0, 7) + "-01",
      to: date,
      high: report.high === null ? null : Number(report.high),
      low: report.low === null ? null : Number(report.low),
      average: report.average === null ? null : Number(report.average),
      count: Number(report.count)
    });

  } catch (error) {
    console.error("Month-to-date report error:", error.message);
    res.status(500).json({
      message: "Failed to generate month-to-date report"
    });
  }
};


// PREVIOUS FULL MONTH REPORT
const getPreviousMonthReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!isValidDate(date)) {
      return res.status(400).json({
        message: "Please provide a valid date in YYYY-MM-DD format"
      });
    }

    const result = await pool.query(
      `SELECT
         MAX(glucose_value) AS high,
         MIN(glucose_value) AS low,
         ROUND(AVG(glucose_value), 1) AS average,
         COUNT(*) AS count
       FROM glucose_readings
       WHERE user_id = $1
         AND reading_date >=
             (DATE_TRUNC('month', $2::date) - INTERVAL '1 month')::date
         AND reading_date <
             DATE_TRUNC('month', $2::date)::date`,
      [req.user.id, date]
    );

    const report = result.rows[0];

    const monthResult = await pool.query(
      `SELECT
         TO_CHAR(
           DATE_TRUNC('month', $1::date) - INTERVAL '1 month',
           'YYYY-MM'
         ) AS month`,
      [date]
    );

    res.json({
      report: "Previous Full Month Report",
      month: monthResult.rows[0].month,
      high: report.high === null ? null : Number(report.high),
      low: report.low === null ? null : Number(report.low),
      average: report.average === null ? null : Number(report.average),
      count: Number(report.count)
    });

  } catch (error) {
    console.error("Previous month report error:", error.message);
    res.status(500).json({
      message: "Failed to generate previous month report"
    });
  }
};


module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getPreviousMonthReport
};
