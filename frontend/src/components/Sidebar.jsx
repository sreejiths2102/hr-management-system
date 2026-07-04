import React from 'react';

const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Home', roles: ['all'] },
  { id: 'employees', label: 'Employees', roles: ['hr'] },
  { id: 'attendance', label: 'Attendance', roles: ['all'] },
  { id: 'timeoff', label: 'Leave Requests', roles: ['all'] },
  { id: 'payroll', label: 'Payroll', roles: ['all'] },
  { id: 'reports', label: 'Reports', roles: ['hr'] },
  { id: 'settings', label: 'Company Settings', roles: ['hr'] },
];

export default function Sidebar({ currentTab, setCurrentTab, currentUser, onLogout }) {
  const isHrOrAdmin = currentUser?.role === 'hr' || currentUser?.is_company_admin;

  const menuItems = ALL_MENU_ITEMS.filter((item) => {
    if (item.roles.includes('all')) return true;
    if (isHrOrAdmin && item.roles.includes('hr')) return true;
    return false;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <aside className="sidebar glass">
      <div className="sidebar-header">
        <span className="sidebar-logo">Angeleena</span>
        {!isHrOrAdmin && (
          <div style={{
            marginTop: '6px',
            fontSize: '11px',
            fontWeight: '600',
            color: 'var(--primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: 0.8,
          }}>
            Employee Portal
          </div>
        )}
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(item.id)}
          >
            <span>{item.label}</span>
          </li>
        ))}

        {/* For employees: Profile quick link */}
        {!isHrOrAdmin && (
          <li
            className={`menu-item ${currentTab === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentTab('profile')}
          >
            <span>My Profile</span>
          </li>
        )}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar">{getInitials(currentUser?.name)}</div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name || 'User'}</div>
            <div className="user-role">
              {currentUser?.designation || (isHrOrAdmin ? 'HR Administrator' : 'Employee')}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-block"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
