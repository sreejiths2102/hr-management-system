import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function PayrollManager({ currentUser }) {
  const [payroll, setPayroll] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingRecord, setEditingRecord] = useState(null);
  const [editSalary, setEditSalary] = useState('');
  const [editMonth, setEditMonth] = useState('');

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

      // Fetch payroll list
      const data = await api.getPayroll();
      setPayroll(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditClick = (record) => {
    setEditingRecord(record);
    setEditSalary(record.monthly_salary);
    setEditMonth(record.month);
  };

  const handleUpdatePayroll = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.updatePayroll(
        editingRecord.id,
        parseFloat(editSalary),
        editMonth
      );
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatCurrency = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div className="error-message">{error}</div>}

      <div className="glass" style={{ padding: '24px' }}>
        <div className="panel-header">
          <h3 className="panel-title">Payroll Management</h3>
          <button type="button" className="btn btn-secondary" onClick={fetchData}>
            Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Loading payroll accounts...
          </p>
        ) : payroll.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No payroll records generated yet.
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Employee</th>
                  <th>Gross Salary</th>
                  <th>Basic Pay</th>
                  <th>HRA (25%)</th>
                  <th>PF Deduction</th>
                  <th>Tax</th>
                  <th>Net Take-Home</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payroll.map((pay) => (
                  <tr key={pay.id}>
                    <td style={{ fontWeight: '600', color: 'var(--primary)' }}>{pay.month}</td>
                    <td style={{ fontWeight: '500' }}>{userMap[pay.user_id] || `ID: ${pay.user_id}`}</td>
                    <td>{formatCurrency(pay.monthly_salary)}</td>
                    <td>{formatCurrency(pay.basic)}</td>
                    <td>{formatCurrency(pay.hra)}</td>
                    <td style={{ color: 'var(--danger)' }}>-{formatCurrency(pay.pf)}</td>
                    <td style={{ color: 'var(--danger)' }}>-{formatCurrency(pay.professional_tax)}</td>
                    <td style={{ fontWeight: '700', color: 'var(--success)' }}>{formatCurrency(pay.net_salary)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '13px' }}
                        onClick={() => handleEditClick(pay)}
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Adjust Payroll Modal Overlay */}
      {editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '400px' }}>
            <button
              type="button"
              className="modal-close"
              onClick={() => setEditingRecord(null)}
            >
              &times;
            </button>
            <h3 className="modal-title">Adjust Salary Log</h3>
            <form onSubmit={handleUpdatePayroll}>
              <div className="form-group">
                <label>Employee</label>
                <input
                  type="text"
                  disabled
                  value={userMap[editingRecord.user_id] || `ID: ${editingRecord.user_id}`}
                  style={{ opacity: 0.7, background: 'rgba(0, 0, 0, 0.05)' }}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPaySalary">New Gross Monthly Salary ($)</label>
                <input
                  id="editPaySalary"
                  type="number"
                  step="0.01"
                  required
                  value={editSalary}
                  onChange={(e) => setEditSalary(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPayMonth">Pay Cycle Month (YYYY-MM)</label>
                <input
                  id="editPayMonth"
                  type="text"
                  required
                  placeholder="e.g. 2026-06"
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary">
                  Apply Updates
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingRecord(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
