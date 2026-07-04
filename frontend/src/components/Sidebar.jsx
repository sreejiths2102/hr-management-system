import React from 'react';

export default function Sidebar({ currentTab, setCurrentTab, currentUser, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: '📊' },
    { id: 'employees', label: 'Employees', icon: '👥' },
    { id: 'attendance', label: 'Attendance', icon: '📅' },
    { id: 'timeoff', label: 'Time Off', icon: '✈️' },
    { id: 'payroll', label: 'Payroll', icon: '💰' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Company Settings', icon: '⚙️' },
  ];

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
        <span style={{ fontSize: '28px' }}>💜</span>
        <span className="sidebar-logo">Angeleena</span>
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={`menu-item ${currentTab === item.id ? 'active' : ''}`}
            onClick={() => setCurrentTab(item.id)}
          >
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="user-profile-summary">
          <div className="user-avatar">{getInitials(currentUser?.name)}</div>
          <div className="user-info">
            <div className="user-name">{currentUser?.name || 'HR Admin'}</div>
            <div className="user-role">{currentUser?.designation || 'HR Administrator'}</div>
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
