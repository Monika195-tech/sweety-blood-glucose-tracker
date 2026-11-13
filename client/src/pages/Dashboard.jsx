
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const slots = [
  "Morning fasting",
  "After breakfast",
  "After lunch",
  "After dinner",
];

function getToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [readings, setReadings] = useState([]);
  const [formData, setFormData] = useState({
    reading_date: getToday(),
    slot: "Morning fasting",
    glucose_value: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReadings = async () => {
    try {
      const response = await api.get("/readings");
      setReadings(response.data.readings);
    } catch {
      setMessage("Unable to load readings. Please login again.");
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    loadReadings();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      reading_date: getToday(),
      slot: "Morning fasting",
      glucose_value: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const value = Number(formData.glucose_value);

    if (!Number.isInteger(value) || value < 40 || value > 600) {
      setMessage("Glucose value must be between 40 and 600.");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await api.put(`/readings/${editingId}`, formData);
        setMessage("Reading updated successfully!");
      } else {
        await api.post("/readings", formData);
        setMessage("Reading added successfully!");
      }

      resetForm();
      await loadReadings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reading) => {
    setEditingId(reading.id);
    setFormData({
      reading_date: reading.reading_date.slice(0, 10),
      slot: reading.slot,
      glucose_value: reading.glucose_value,
    });
    setMessage("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this reading?")) {
      return;
    }

    try {
      await api.delete(`/readings/${id}`);
      setMessage("Reading deleted successfully!");
      await loadReadings();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete reading.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const latestReading = readings.length
    ? readings[0].glucose_value
    : "—";

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <div>
          <div className="brand-name">♡ Sweety</div>
          <p className="welcome-text">
            Welcome back, {user.name || "User"}!
          </p>
          <p className="page-description">
            Here's your glucose overview.
          </p>
        </div>

        <div className="header-actions">
          <Link to="/reports" className="primary-btn-small">
            View Reports →
          </Link>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">♡ Latest Reading</p>
          <p className="stat-value">{latestReading}</p>
          <p className="stat-unit">mg/dL</p>
        </div>

        <div className="stat-card">
          <p className="stat-label">▦ Total Readings</p>
          <p className="stat-value">{readings.length}</p>
          <p className="stat-unit">Recorded readings</p>
        </div>
      </section>

      <section className="content-card">
        <h2>
          {editingId ? "✎ Edit Glucose Reading" : "+ Add Glucose Reading"}
        </h2>

        <p className="page-description">
          Keep track of your daily glucose levels.
        </p>

        <form className="reading-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>Date</label>
            <input
              type="date"
              name="reading_date"
              value={formData.reading_date}
              max={getToday()}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field-group">
            <label>Reading Slot</label>
            <select
              name="slot"
              value={formData.slot}
              onChange={handleChange}
              required
            >
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Glucose Value (mg/dL)</label>
            <input
              type="number"
              name="glucose_value"
              min="40"
              max="600"
              step="1"
              placeholder="Enter value"
              value={formData.glucose_value}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              className="form-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingId
                  ? "Update Reading"
                  : "+ Add Reading"}
            </button>

            {editingId && (
              <button
                className="cancel-btn"
                type="button"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {message && (
          <p className="status-message">{message}</p>
        )}
      </section>

      <section className="content-card">
        <h2>Your Glucose Readings</h2>
        <p className="page-description">
          Review and manage your recorded readings.
        </p>

        {readings.length === 0 ? (
          <div className="empty-state">
            <p>♡ No readings yet.</p>
            <p>Add your first glucose reading to get started!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reading Slot</th>
                  <th>Glucose Value</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {readings.map((reading) => (
                  <tr key={reading.id}>
                    <td>{reading.reading_date.slice(0, 10)}</td>
                    <td>{reading.slot}</td>
                    <td>
                      <strong>{reading.glucose_value}</strong> mg/dL
                    </td>
                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEdit(reading)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(reading.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer style={{
        textAlign: "center",
        padding: "20px",
        color: "#898398",
        fontSize: "12px"
      }}>
        Sweety · Your health journey, one reading at a time.
      </footer>
    </div>
  );
}

export default Dashboard;
