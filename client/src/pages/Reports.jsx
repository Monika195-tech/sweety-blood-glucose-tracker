
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Reports() {
  const navigate = useNavigate();

  const getToday = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  };

  const [date, setDate] = useState(getToday());
  const [report, setReport] = useState(null);
  const [reportType, setReportType] = useState("daily");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadReport = async (type) => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setMessage("");
    setReport(null);
    setReportType(type);

    try {
      const response = await api.get(
        `/reports/${type}?date=${date}`
      );
      setReport(response.data);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to load report."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value) =>
    value === null || value === undefined ? "—" : value;

  const reportTitle =
    reportType === "daily"
      ? "Daily Report"
      : reportType === "month-to-date"
        ? "Month-to-Date Report"
        : "Previous Month Report";

  return (
    <div className="reports-page">
      <header className="page-header">
        <div>
          <div className="brand-name">♡ Sweety</div>
          <p className="welcome-text">Your Glucose Reports</p>
          <p className="page-description">
            Track your readings and review your progress.
          </p>
        </div>

        <div className="header-actions">
          <Link to="/dashboard" className="secondary-btn">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="content-card">
        <h2>▦ Glucose Report Overview</h2>
        <p className="page-description">
          Select a date and report type to view your glucose summaries.
        </p>

        <div className="report-controls">
          <div className="field-group report-date-group">
            <label>Select Date</label>
            <input
              className="report-date-input"
              type="date"
              value={date}
              max={getToday()}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="report-buttons">
            <button
              className={`report-btn ${reportType === "daily" ? "active" : ""}`}
              onClick={() => loadReport("daily")}
              disabled={loading}
            >
              Daily Report
            </button>

            <button
              className={`report-btn ${reportType === "month-to-date" ? "active" : ""}`}
              onClick={() => loadReport("month-to-date")}
              disabled={loading}
            >
              Month to Date
            </button>

            <button
              className={`report-btn ${reportType === "previous-month" ? "active" : ""}`}
              onClick={() => loadReport("previous-month")}
              disabled={loading}
            >
              Previous Month
            </button>
          </div>
        </div>

        {loading && (
          <p className="status-message">Loading your report...</p>
        )}

        {message && (
          <p className="status-message">{message}</p>
        )}
      </section>

      {report && (
        <>
          <section className="content-card">
            <h2>♡ {reportTitle}</h2>

            <p className="page-description">
              {report.date && `Date: ${report.date}`}
              {report.from && `From: ${report.from} `}
              {report.to && `To: ${report.to}`}
              {report.month && `Month: ${report.month}`}
            </p>

            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-label">Highest Reading</p>
                <p className="stat-value">
                  {formatValue(report.high)}
                </p>
                <p className="stat-unit">mg/dL</p>
              </div>

              <div className="stat-card">
                <p className="stat-label">Lowest Reading</p>
                <p className="stat-value">
                  {formatValue(report.low)}
                </p>
                <p className="stat-unit">mg/dL</p>
              </div>

              <div className="stat-card">
                <p className="stat-label">Average Reading</p>
                <p className="stat-value">
                  {formatValue(report.average)}
                </p>
                <p className="stat-unit">mg/dL</p>
              </div>

              <div className="stat-card">
                <p className="stat-label">Total Readings</p>
                <p className="stat-value">
                  {formatValue(report.count)}
                </p>
                <p className="stat-unit">Readings recorded</p>
              </div>
            </div>
          </section>

          {report.readings && (
            <section className="content-card">
              <h2>Your Daily Readings</h2>

              <p className="page-description">
                Reading details for the selected period.
              </p>

              {report.readings.length === 0 ? (
                <div className="empty-state">
                  <p>♡ No readings found.</p>
                  <p>There are no recorded readings for this period.</p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Reading Slot</th>
                        <th>Glucose Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.readings.map((reading) => (
                        <tr key={reading.id}>
                          <td>
                            {String(reading.reading_date).slice(0, 10)}
                          </td>
                          <td>{reading.slot}</td>
                          <td>
                            <strong>{reading.glucose_value}</strong> mg/dL
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}

      <footer
        style={{
          textAlign: "center",
          padding: "25px",
          color: "#898398",
          fontSize: "12px",
        }}
      >
        Sweety · Your health journey, one reading at a time.
      </footer>
    </div>
  );
}

export default Reports;
