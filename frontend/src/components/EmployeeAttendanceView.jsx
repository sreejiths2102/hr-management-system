import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const formatDateLabel = (value) => {
  if (!value) return '-';
  try {
    return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
};

const formatTime = (value) => {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

const formatDuration = (minutes) => {
  if (minutes == null) return '-';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
};

export default function EmployeeAttendanceView({ currentUser }) {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [breakMinutes, setBreakMinutes] = useState(0);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const data = await api.getMyAttendance();
      setAttendance(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const todayRecord = useMemo(() => {
    if (!attendance?.attendance_days?.length) return null;
    const today = new Date().toISOString().slice(0, 10);
    return attendance.attendance_days.find((row) => row.date === today) || null;
  }, [attendance]);

  const todayStatus = todayRecord?.status || 'Absent';
  const canCheckIn = !todayRecord || (!todayRecord.check_in && todayStatus !== 'Leave');
  const canCheckOut = Boolean(todayRecord?.check_in && !todayRecord?.check_out && todayStatus !== 'Leave');

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setError('');
      await api.checkInAttendance();
      await loadAttendance();
      setMessage('Checked in successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setError('');
      await api.checkOutAttendance(Number(breakMinutes) || 0);
      await loadAttendance();
      setMessage('Checked out successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="glass" style={{ padding: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">My Attendance</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              {currentUser?.name || 'Employee'} • Today’s status: {todayStatus}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadAttendance}>
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading attendance...</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Working Days</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{attendance?.total_working_days || 0}</div>
              </div>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Present</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{attendance?.present_days || 0}</div>
              </div>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Approved Leave</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{attendance?.approved_leave_days || 0}</div>
              </div>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Absent</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{attendance?.absent_days || 0}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <button type="button" className="btn btn-primary" onClick={handleCheckIn} disabled={!canCheckIn || actionLoading}>
                {actionLoading ? 'Working...' : 'Check In'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleCheckOut} disabled={!canCheckOut || actionLoading}>
                {actionLoading ? 'Working...' : 'Check Out'}
              </button>
              <input
                type="number"
                min="0"
                placeholder="Break (min)"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                style={{ padding: '8px 12px', minWidth: '140px' }}
              />
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Work Time</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance?.attendance_days?.slice(0, 10).map((row) => (
                    <tr key={row.date}>
                      <td>{formatDateLabel(row.date)}</td>
                      <td>{formatTime(row.check_in)}</td>
                      <td>{formatTime(row.check_out)}</td>
                      <td>{formatDuration(row.working_minutes)}</td>
                      <td>
                        <span className={`badge badge-${row.status?.toLowerCase() === 'present' ? 'present' : row.status?.toLowerCase() === 'leave' ? 'leave' : 'absent'}`}>
                          {row.status || 'Absent'}
                        </span>
                      </td>
                      <td>{row.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
