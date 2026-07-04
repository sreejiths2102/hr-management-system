import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function LeaveManager({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [comments, setComments] = useState({}); // state to hold comments for each leave request ID
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch users to resolve names
      const usersData = await api.listUsers(currentUser.company_id);
      const mapping = {};
      usersData.forEach((u) => {
        mapping[u.id] = u.name;
      });
      setUserMap(mapping);

      // Fetch leave requests
      const data = await api.listLeaveRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (leaveId, action) => {
    try {
      setError('');
      const commentText = comments[leaveId] || '';
      if (action === 'approve') {
        await api.approveLeave(leaveId, commentText);
      } else {
        await api.rejectLeave(leaveId, commentText);
      }
      // Reset comment for this request
      setComments((prev) => ({ ...prev, [leaveId]: '' }));
      // Refresh list
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const processedRequests = requests.filter((r) => r.status !== 'Pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div className="error-message">{error}</div>}

      {/* Pending Requests Panel */}
      <div className="glass" style={{ padding: '24px' }}>
        <div className="panel-header">
          <h3 className="panel-title">Pending Leave Requests</h3>
          <button type="button" className="btn btn-secondary" onClick={fetchData}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
            Loading leave applications...
          </p>
        ) : pendingRequests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No pending leave requests at the moment.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Admin Comment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: '600' }}>{userMap[req.user_id] || `ID: ${req.user_id}`}</td>
                    <td>
                      <span className="badge badge-pending">{req.leave_type}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>
                        {req.start_date} to {req.end_date}
                      </div>
                    </td>
                    <td style={{ maxWidth: '200px', wordBreak: 'break-word', fontSize: '13px' }}>
                      {req.reason || '-'}
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Add comment..."
                        value={comments[req.id] || ''}
                        onChange={(e) =>
                          setComments((prev) => ({ ...prev, [req.id]: e.target.value }))
                        }
                        style={{ padding: '6px 10px', fontSize: '13px', minWidth: '150px' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--success)' }}
                          onClick={() => handleAction(req.id, 'approve')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={() => handleAction(req.id, 'reject')}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Requests Panel */}
      <div className="glass" style={{ padding: '24px' }}>
        <h3 className="panel-title" style={{ marginBottom: '16px' }}>Leave Request History</h3>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading history...</p>
        ) : processedRequests.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            No past leave logs recorded.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Admin Comment</th>
                </tr>
              </thead>
              <tbody>
                {processedRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: '600' }}>{userMap[req.user_id] || `ID: ${req.user_id}`}</td>
                    <td>{req.leave_type}</td>
                    <td>
                      {req.start_date} to {req.end_date}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{req.reason || '-'}</td>
                    <td>
                      <span
                        className={`badge badge-${req.status?.toLowerCase() === 'approved' ? 'approved' : req.status?.toLowerCase() === 'cancelled' ? 'pending' : 'rejected'}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', fontStyle: 'italic' }}>{req.admin_comment || '-'}</td>
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
