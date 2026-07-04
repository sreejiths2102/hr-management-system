import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, Calendar, FileText, DollarSign, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"></div>
        <h2>HR System</h2>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <User size={20} />
          <span>My Profile</span>
        </NavLink>
        <NavLink to="/attendance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <Calendar size={20} />
          <span>Attendance</span>
        </NavLink>
        <div className="nav-item disabled" title="Coming soon">
          <FileText size={20} />
          <span>Leave Requests</span>
        </div>
        <div className="nav-item disabled" title="Coming soon">
          <DollarSign size={20} />
          <span>Payroll</span>
        </div>
        <div className="nav-item disabled" title="Coming soon">
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
