import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

export default function EmployeePayrollView({ currentUser }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getMyPayroll();
      setRecords(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const latestRecord = useMemo(() => records[0] || null, [records]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {error && <div className="error-message">{error}</div>}

      <div className="glass" style={{ padding: '24px' }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Salary Card</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              {currentUser?.name || 'Employee'} • Latest pay cycle: {latestRecord?.month || '—'}
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={loadRecords}>🔄 Refresh</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>Loading salary details...</p>
        ) : !latestRecord ? (
          <p style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No payroll record found.</p>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Gross Salary</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{formatCurrency(latestRecord.monthly_salary)}</div>
              </div>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Basic Pay</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{formatCurrency(latestRecord.basic)}</div>
              </div>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>HRA</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{formatCurrency(latestRecord.hra)}</div>
              </div>
              <div className="glass" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.03)' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Net Salary</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '6px' }}>{formatCurrency(latestRecord.net_salary)}</div>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Gross</th>
                    <th>Basic</th>
                    <th>HRA</th>
                    <th>PF</th>
                    <th>Tax</th>
                    <th>Net</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.month}</td>
                      <td>{formatCurrency(record.monthly_salary)}</td>
                      <td>{formatCurrency(record.basic)}</td>
                      <td>{formatCurrency(record.hra)}</td>
                      <td>{formatCurrency(record.pf)}</td>
                      <td>{formatCurrency(record.professional_tax)}</td>
                      <td>{formatCurrency(record.net_salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
