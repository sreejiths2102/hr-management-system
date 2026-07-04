import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function AttendanceManager({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch users to build a mapping of id -> name and dept
      const usersData = await api.listUsers(currentUser.company_id);
      const mapping = {};
      usersData.forEach((u) => {
        mapping[u.id] = { name: u.name, department: u.department };
      });
      setUserMap(mapping);

      // Fetch attendance logs
      const attendanceData = await api.getAllAttendance();
      setLogs(attendanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    const dateObj = new Date(isoString);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="glass" style={{ padding: '24px' }}>
      <div className="panel-header">
        <h3 className="panel-title">Employee Attendance Log</h3>
        <button type="button" className="btn btn-secondary" onClick={fetchData}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading attendance records...
        </p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : logs.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No attendance logs recorded yet.
        </p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Working Time</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => {
                const userObj = userMap[log.user_id] || { name: `ID: ${log.user_id}`, department: '-' };
                return (
                  <tr key={index}>
                    <td>{log.date}</td>
                    <td style={{ fontWeight: '600' }}>{userObj.name}</td>
                    <td>{userObj.department || '-'}</td>
                    <td>{formatTime(log.check_in)}</td>
                    <td>{formatTime(log.check_out)}</td>
                    <td>{formatDuration(log.working_minutes)}</td>
                    <td>
                      <span className={`badge badge-${log.status?.toLowerCase() === 'present' ? 'present' : log.status?.toLowerCase() === 'leave' ? 'leave' : 'absent'}`}>
                        {log.status || 'Present'}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{log.remarks || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
