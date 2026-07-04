import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Employees({ currentUser, onEmployeeClick, onAddUserClick }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const companyId = currentUser.company_id;
      const data = await api.listUsers(companyId, search, roleFilter, deptFilter);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, deptFilter]);

  const getInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Get list of unique departments from users list for dropdown filter
  const departments = [...new Set(users.map((u) => u.department).filter(Boolean))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass" style={{ padding: '24px' }}>
        {/* Filters and Search */}
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
              placeholder="Search by name, email, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select glass"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
            </select>

            <select
              className="filter-select glass"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button type="button" className="btn btn-primary" onClick={onAddUserClick}>
              ➕ Add User
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading employee directory...
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No employees found matching the criteria.
          </div>
        ) : (
          <div className="employee-grid">
            {users.map((user) => (
              <div
                key={user.id}
                className="employee-card glass"
                onClick={() => onEmployeeClick(user.id)}
              >
                <div className="card-avatar">{getInitials(user.name)}</div>
                <div className="card-name">{user.name}</div>
                <div className="card-dept">{user.department || 'General'}</div>
                <div className="card-designation" style={{ textTransform: 'capitalize', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {user.role === 'hr' ? 'HR Administrator' : 'Employee'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Click to view profile &rarr;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
