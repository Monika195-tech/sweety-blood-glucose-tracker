
const pool = require("./config/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const email = "demo@sweety.com";
    const password = "SweetyDemo123!";
    const hashedPassword = await bcrypt.hash(password, 10);

    let userResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    let userId;

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;

      await client.query(
        "UPDATE users SET name = $1, password = $2 WHERE id = $3",
        ["Demo User", hashedPassword, userId]
      );
    } else {
      userResult = await client.query(
        `INSERT INTO users (name, email, password)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ["Demo User", email, hashedPassword]
      );

      userId = userResult.rows[0].id;
    }

    // Replace only the demo user's existing readings
    await client.query(
      "DELETE FROM glucose_readings WHERE user_id = $1",
      [userId]
    );

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const formatDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const readings = [
      [formatDate(today), "Morning fasting", 105],
      [formatDate(today), "After breakfast", 145],
      [formatDate(today), "After lunch", 132],
      [formatDate(today), "After dinner", 125],
      [formatDate(yesterday), "Morning fasting", 110],
      [formatDate(yesterday), "After breakfast", 150],
      [formatDate(yesterday), "After lunch", 135],
    ];

    for (const reading of readings) {
      await client.query(
        `INSERT INTO glucose_readings
         (user_id, reading_date, slot, glucose_value)
         VALUES ($1, $2, $3, $4)`,
        [userId, ...reading]
      );
    }

    await client.query("COMMIT");

    console.log("Demo data inserted successfully!");
    console.log("Email:", email);
    console.log("Password:", password);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase();
