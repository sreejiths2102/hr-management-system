import React, { useEffect, useState } from 'react';

const BACKEND_URL = 'http://127.0.0.1:8000';

const formatTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '-';
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
};

const Attendance = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(`${BACKEND_URL}/attendance`, { headers })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.text();
          throw new Error(body || 'Failed to load attendance');
        }
        return response.json();
      })
      .then((data) => {
        setAttendance(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Unable to load attendance data. Please make sure you are logged in and the backend is running.');
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="attendance-page">
      <div className="attendance-header glass-panel">
        <div>
          <h1>Attendance</h1>
          <p>Day-wise attendance for the ongoing month.</p>
        </div>
      </div>

      {loading && <div className="loading-panel glass-panel">Loading attendance...</div>}
      {error && <div className="error-panel glass-panel">{error}</div>}

      {attendance && (
        <>
          <div className="attendance-summary-grid glass-panel">
            <div className="summary-card">
              <p>Total Working Days</p>
              <strong>{attendance.total_working_days}</strong>
            </div>
            <div className="summary-card">
              <p>Present Days</p>
              <strong>{attendance.present_days}</strong>
            </div>
            <div className="summary-card">
              <p>Approved Leave</p>
              <strong>{attendance.approved_leave_days}</strong>
            </div>
            <div className="summary-card">
              <p>Unpaid Leave</p>
              <strong>{attendance.unpaid_leave_days}</strong>
            </div>
            <div className="summary-card">
              <p>Absent Days</p>
              <strong>{attendance.absent_days}</strong>
            </div>
            <div className="summary-card payable">
              <p>Payable Days</p>
              <strong>{attendance.payable_days}</strong>
            </div>
          </div>

          <div className="attendance-table-panel glass-panel">
            <div className="table-title">
              <h2>{`Attendance for ${new Date(attendance.year, attendance.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}`}</h2>
            </div>
            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Time</th>
                    <th>Break</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.attendance_days.map((row) => (
                    <tr key={row.date}>
                      <td>{formatDate(row.date)}</td>
                      <td>{formatTime(row.check_in)}</td>
                      <td>{formatTime(row.check_out)}</td>
                      <td>{row.working_minutes ? `${Math.floor(row.working_minutes / 60)}h ${row.working_minutes % 60}m` : '-'}</td>
                      <td>{row.break_minutes != null ? `${row.break_minutes}m` : '-'}</td>
                      <td>{row.status}</td>
                      <td>{row.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Attendance;
