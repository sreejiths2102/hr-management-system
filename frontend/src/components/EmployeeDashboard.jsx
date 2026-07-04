import { useState, useEffect } from 'react';
import { api } from '../services/api';

const QUICK_CARDS = [
  {
    id: 'profile',
    label: 'My Profile',
    description: 'View & edit your personal details',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  },
  {
    id: 'attendance',
    label: 'Attendance',
    description: 'Check-in, check-out & history',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  },
  {
    id: 'timeoff',
    label: 'Leave Requests',
    description: 'Apply & track your leave',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  {
    id: 'logout',
    label: 'Logout',
    description: 'Sign out of your account',
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
];

export default function EmployeeDashboard({ currentUser, setCurrentTab, onLogout }) {
  const [todayStatus, setTodayStatus] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setStatusLoading(true);
        const dashboardData = await api.getEmployeeDashboard();
        setTodayStatus(dashboardData.today_status);
        setCheckedIn(dashboardData.checked_in);
      } catch {
        setTodayStatus('Unknown');
      } finally {
        setStatusLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleCardClick = (cardId) => {
    if (cardId === 'logout') {
      onLogout();
    } else {
      setCurrentTab(cardId);
    }
  };

  const statusColor = (status) => {
    if (!status) return 'var(--text-muted)';
    const s = status.toLowerCase();
    if (s === 'present') return 'var(--success)';
    if (s === 'leave') return 'var(--warning)';
    return 'var(--danger)';
  };

  const statusBg = (status) => {
    if (!status) return 'rgba(156,163,175,0.15)';
    const s = status.toLowerCase();
    if (s === 'present') return 'rgba(16,185,129,0.15)';
    if (s === 'leave') return 'rgba(245,158,11,0.15)';
    return 'rgba(239,68,68,0.15)';
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '8px 0' }}>
      {/* Welcome Banner */}
      <div
        className="glass"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(236,72,153,0.08) 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative ring */}
        <div style={{
          position: 'absolute', right: '-40px', top: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(139,92,246,0.08)', pointerEvents: 'none',
        }} />
        {/* Avatar */}
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '24px', fontWeight: '700', color: '#fff', flexShrink: 0,
          boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
        }}>
          {getInitials(currentUser?.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            Welcome back, {currentUser?.name?.split(' ')[0]}!
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {currentUser?.designation || 'Employee'} &nbsp;&bull;&nbsp; Here is your dashboard overview.
          </p>
        </div>
        {/* Today's status badge */}
        <div style={{
          padding: '10px 20px', borderRadius: '50px',
          background: statusBg(todayStatus),
          color: statusColor(todayStatus),
          fontWeight: '600', fontSize: '14px', flexShrink: 0,
          border: `1px solid ${statusColor(todayStatus)}30`,
        }}>
          {statusLoading ? 'Loading...' : `Today: ${todayStatus || 'Unknown'}`}
        </div>
      </div>

      {/* Quick-Access Cards */}
      <div>
        <h3 style={{
          marginBottom: '16px', fontSize: '13px', fontWeight: '600',
          color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Quick Access
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          {QUICK_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card.id)}
              style={{
                background: 'var(--card-bg)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '24px 20px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.25s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                color: 'var(--text-primary)',
                boxShadow: 'var(--glass-shadow)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 12px 36px ${card.color}30`;
                e.currentTarget.style.borderColor = `${card.color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              {/* Accent top strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: card.gradient, borderRadius: '16px 16px 0 0',
              }} />
              {/* Color accent bar left */}
              <div style={{
                width: '40px', height: '4px', borderRadius: '2px',
                background: card.gradient,
              }} />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{card.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Status Mini-Bar */}
      {!statusLoading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px' }}>
          {[
            { label: "Today's Status", value: todayStatus || 'Unknown', color: statusColor(todayStatus) },
            { label: 'Checked In', value: checkedIn ? 'Yes' : 'No', color: checkedIn ? 'var(--success)' : 'var(--danger)' },
          ].map((stat) => (
            <div key={stat.label} className="glass" style={{ padding: '16px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}