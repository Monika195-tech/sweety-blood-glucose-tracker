
const pool = require("../config/db");

const allowedSlots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner",
];

const validateReading = (reading_date, slot, glucose_value) => {
  if (!reading_date || !slot || glucose_value === undefined || glucose_value === "") {
    return "Please fill in all fields";
  }

  if (!allowedSlots.includes(slot)) {
    return "Invalid reading slot";
  }

  const value = Number(glucose_value);

  if (!Number.isInteger(value) || value < 40 || value > 600) {
    return "Glucose value must be an integer between 40 and 600";
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(reading_date)) {
    return "Invalid date";
  }

  const [year, month, day] = reading_date.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return "Invalid date";
  }

  const today = new Date();
  const todayString =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (reading_date > todayString) {
    return "Future dates are not allowed";
  }

  return null;
};

const addReading = async (req, res) => {
  try {
    const { reading_date, slot, glucose_value } = req.body;
    const error = validateReading(reading_date, slot, glucose_value);

    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      `INSERT INTO glucose_readings
       (user_id, reading_date, slot, glucose_value)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, reading_date, slot, Number(glucose_value)]
    );

    res.status(201).json({
      message: "Reading added successfully!",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading for this slot already exists on this date",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Failed to add reading" });
  }
};

const getReadings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         user_id,
         TO_CHAR(reading_date, 'YYYY-MM-DD') AS reading_date,
         slot,
         glucose_value,
         created_at
       FROM glucose_readings
       WHERE user_id = $1
       ORDER BY reading_date DESC, created_at DESC`,
      [req.user.id]
    );

    res.status(200).json({ readings: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch readings" });
  }
};

const updateReading = async (req, res) => {
  try {
    const { reading_date, slot, glucose_value } = req.body;
    const { id } = req.params;

    const error = validateReading(reading_date, slot, glucose_value);
    if (error) return res.status(400).json({ message: error });

    const result = await pool.query(
      `UPDATE glucose_readings
       SET reading_date = $1, slot = $2, glucose_value = $3
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [reading_date, slot, Number(glucose_value), id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reading not found" });
    }

    res.status(200).json({
      message: "Reading updated successfully!",
      reading: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        message: "A reading for this slot already exists on this date",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Failed to update reading" });
  }
};

const deleteReading = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM glucose_readings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Reading not found" });
    }

    res.status(200).json({
      message: "Reading deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete reading" });
  }
};

module.exports = {
  addReading,
  getReadings,
  updateReading,
  deleteReading,
};
