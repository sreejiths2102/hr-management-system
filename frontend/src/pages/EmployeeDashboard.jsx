import React, { useEffect, useState } from 'react';
import { User, CalendarCheck, Clock, DollarSign, Activity } from 'lucide-react';

const EmployeeDashboard = () => {
  const [data, setData] = useState({
    profile: { name: 'Employee', role: 'Developer' },
    attendance: { present: 18, total: 22 },
    leaveRequests: { pending: 1, approved: 2 },
    payroll: { lastPay: '₹ 50,000' }
  });

  useEffect(() => {
    // API GET /dashboard/employee
    // Simulating API call
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {data.profile.name}!</h1>
        <p>Here's what's happening with your account today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <User size={24} />
          </div>
          <div className="stat-content">
            <h3>Profile</h3>
            <p className="stat-value">{data.profile.role}</p>
            <p className="stat-label">Your current role</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper green">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-content">
            <h3>Attendance</h3>
            <p className="stat-value">{data.attendance.present} / {data.attendance.total}</p>
            <p className="stat-label">Days present this month</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper orange">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Leave Requests</h3>
            <p className="stat-value">{data.leaveRequests.pending} Pending</p>
            <p className="stat-label">{data.leaveRequests.approved} Approved</p>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper purple">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>Payroll</h3>
            <p className="stat-value">{data.payroll.lastPay}</p>
            <p className="stat-label">Last month's salary</p>
          </div>
        </div>
      </div>

      <div className="recent-activity glass-panel">
        <div className="section-header">
          <h2><Activity size={20} className="mr-2 inline-icon" /> Recent Activity</h2>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-dot green"></div>
            <div className="activity-details">
              <h4>Checked In</h4>
              <p>Today at 09:00 AM</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot blue"></div>
            <div className="activity-details">
              <h4>Leave Request Approved</h4>
              <p>Yesterday at 04:30 PM</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-dot purple"></div>
            <div className="activity-details">
              <h4>Salary Credited</h4>
              <p>Oct 31, 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
