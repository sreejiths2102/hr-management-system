import { useEffect, useState } from 'react';
import { api } from '../services/api';

const formatDate = (value) => {
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

export default function EmployeeLeaveView({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.listMyLeaveRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');
      await api.applyLeave(form);
      setForm({ leave_type: 'Casual Leave', start_date: '', end_date: '', reason: '' });
      await loadRequests();
      setSuccess('Leave request submitted.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="glass" style={{ padding: '24px' }}>
        <h3 className="panel-title">Apply Leave</h3>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
          <div className="form-group">
            <label>Leave Type</label>
            <select value={form.leave_type} onChange={(e) => setForm({ ...form, leave_type: e.target.value })}>
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Annual Leave</option>
              <option>Unpaid Leave</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" required value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" required value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows="3" />
          </div>
          <button type="submit" className="btn btn-primary">Submit Leave Request</button>
        </form>
      </div>

      <div className="glass" style={{ padding: '24px' }}>
        <div className="panel-header">
          <h3 className="panel-title">My Leave History</h3>
          <button type="button" className="btn btn-secondary" onClick={loadRequests}>🔄 Refresh</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading leave history...</p>
        ) : requests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No leave requests yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td>{req.leave_type}</td>
                    <td>{formatDate(req.start_date)} to {formatDate(req.end_date)}</td>
                    <td>{req.reason || '-'}</td>
                    <td>
                      <span className={`badge badge-${req.status?.toLowerCase() === 'approved' ? 'approved' : req.status?.toLowerCase() === 'rejected' ? 'rejected' : req.status?.toLowerCase() === 'cancelled' ? 'pending' : 'pending'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.admin_comment || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
