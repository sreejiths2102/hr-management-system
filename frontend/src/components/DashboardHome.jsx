import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function DashboardHome({
  onAddUserClick,
  onEmployeeClick,
  setCurrentTab,
}) {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardData = await api.getHrDashboard();
      setData(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div className="error-message">{error}</div>
        <button type="button" className="btn btn-secondary" onClick={fetchDashboardData}>Retry</button>
      </div>
    );
  }

  // Filter employees based on search input
  const filteredUsers = data?.users?.filter((user) => {
    const term = search.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.designation?.toLowerCase().includes(term) ||
      user.department?.toLowerCase().includes(term)
    );
  }) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat Cards Row */}
      <div className="dashboard-grid">
        <div className="stat-card glass">
          <div className="stat-icon purple">👥</div>
          <div className="stat-content">
            <span className="stat-value">{data?.total_users || 0}</span>
            <span className="stat-label">Total Employees</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon green">✅</div>
          <div className="stat-content">
            <span className="stat-value">{data?.present || 0}</span>
            <span className="stat-label">Present Today</span>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon orange">✈️</div>
          <div className="stat-content">
            <span className="stat-value">{data?.leave || 0}</span>
            <span className="stat-label">On Leave</span>
          </div>
        </div>

        <div className="stat-card glass" style={{ cursor: 'pointer' }} onClick={() => setCurrentTab('timeoff')}>
          <div className="stat-icon red">⏳</div>
          <div className="stat-content">
            <span className="stat-value">{data?.pending_leaves || 0}</span>
            <span className="stat-label">Pending Leaves</span>
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="glass" style={{ padding: '24px' }}>
        {/* Search / Add Actions */}
        <div className="filter-bar">
          <div className="search-input-wrapper">
            <svg
              className="search-icon-svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by name, role, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={onAddUserClick}>
            <span>➕</span> New User
          </button>
        </div>

        <h3 style={{ marginBottom: '16px', fontWeight: '600' }}>Today's Attendance Summary</h3>

        <div className="employee-grid">
          {filteredUsers.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No employees found matching "{search}"
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="employee-card glass"
                onClick={() => onEmployeeClick(user.id)}
              >
                <div className="card-avatar">{getInitials(user.name)}</div>
                <div className="card-name">{user.name}</div>
                <div className="card-designation">{user.designation || 'Staff'}</div>
                <div className="card-dept">{user.department || 'General'}</div>
                <div style={{ marginTop: 'auto' }}>
                  <span className={`badge badge-${user.status?.toLowerCase() === 'present' ? 'present' : user.status?.toLowerCase() === 'leave' ? 'leave' : 'absent'}`}>
                    {user.status || 'Absent'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
