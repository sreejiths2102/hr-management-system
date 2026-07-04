import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

const TABS = [
  { id: 'personal', label: 'Personal Details' },
  { id: 'job', label: 'Job Details' },
  { id: 'salary', label: 'Salary Structure' },
  { id: 'documents', label: 'Documents' },
];

const formatCurrency = (value) => {
  const num = Number(value || 0);
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const InfoRow = ({ label, value }) => (
  <div style={{
    display: 'flex', gap: '12px', padding: '12px 0',
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'flex-start',
  }}>
    <div style={{ width: '160px', flexShrink: 0, fontSize: '13px', color: 'var(--text-muted)', paddingTop: '1px' }}>{label}</div>
    <div style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
      {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not provided</span>}
    </div>
  </div>
);

export default function EmployeeProfileView({ currentUser, onProfileUpdate }) {
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state (only limited fields)
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editProfilePic, setEditProfilePic] = useState('');

  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getMyProfile();
      setProfile(data);
      setEditPhone(data.phone || '');
      setEditAddress(data.address || '');
      setEditProfilePic(data.profile_picture || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.updateMyProfile({
        phone: editPhone || undefined,
        address: editAddress || undefined,
        profile_picture: editProfilePic || undefined,
      });
      setSaveSuccess(true);
      setIsEditing(false);
      await fetchProfile();
      if (onProfileUpdate) onProfileUpdate();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditProfilePic(ev.target?.result);
    reader.readAsDataURL(file);
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
        <span>Loading profile…</span>
      </div>
    );
  }

  if (error && !profile) {
    return <div className="error-message" style={{ margin: '24px 0' }}>{error}</div>;
  }

  const s = profile?.latest_salary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Profile Header Card */}
      <div className="glass" style={{
        padding: '28px 32px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.06) 100%)',
        display: 'flex', alignItems: 'center', gap: '24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {profile?.profile_picture ? (
            <img
              src={profile.profile_picture}
              alt="Profile"
              style={{
                width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover',
                border: '3px solid rgba(139,92,246,0.4)',
                boxShadow: '0 4px 20px rgba(139,92,246,0.3)',
              }}
            />
          ) : (
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: '700', color: '#fff',
              boxShadow: '0 4px 20px rgba(139,92,246,0.4)',
            }}>
              {getInitials(profile?.name)}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)' }}>
            {profile?.name}
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {profile?.designation || 'Employee'}&nbsp;•&nbsp;{profile?.department || 'No Department'}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            {profile?.employee_id}
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          style={{ flexShrink: 0 }}
          onClick={() => { setIsEditing(true); setActiveTab('personal'); }}
        >
          Edit Profile
        </button>
      </div>

      {/* Success Banner */}
      {saveSuccess && (
        <div style={{
          padding: '12px 20px', borderRadius: '10px', background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', fontWeight: '500',
        }}>
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '2px solid var(--border-color)', paddingBottom: '0' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => { setActiveTab(tab.id); setIsEditing(false); }}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === tab.id ? '700' : '500',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'all 0.2s ease',
              borderRadius: '8px 8px 0 0',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass" style={{ padding: '28px 32px' }}>

        {/* ── PERSONAL DETAILS ── */}
        {activeTab === 'personal' && (
          isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '14px 18px', borderRadius: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', fontSize: '13px', color: 'var(--warning)' }}>
                Note: You can only edit your <strong>phone number</strong>, <strong>address</strong>, and <strong>profile picture</strong>. Contact HR to update other details.
              </div>

              {/* Profile Picture */}
              <div className="form-group">
                <label htmlFor="editProfilePic">Profile Picture</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                  {editProfilePic ? (
                    <img src={editProfilePic} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                  ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '20px' }}>
                      {getInitials(profile?.name)}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ fontSize: '13px', padding: '6px 14px' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      id="editProfilePic"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <input
                      type="text"
                      placeholder="Or paste an image URL"
                      value={editProfilePic}
                      onChange={(e) => setEditProfilePic(e.target.value)}
                      style={{ fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="editPhone">Phone Number</label>
                <input
                  id="editPhone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                />
              </div>

              <div className="form-group">
                <label htmlFor="editAddress">Residential Address</label>
                <textarea
                  id="editAddress"
                  rows="3"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Your full address"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <InfoRow label="Full Name" value={profile?.name} />
              <InfoRow label="Email" value={profile?.email} />
              <InfoRow label="Phone" value={profile?.phone} />
              <InfoRow label="Address" value={profile?.address} />
              {profile?.profile_picture && (
                <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div style={{ width: '160px', flexShrink: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Profile Picture</div>
                  <img src={profile.profile_picture} alt="Profile" style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
                </div>
              )}
            </div>
          )
        )}

        {/* ── JOB DETAILS ── */}
        {activeTab === 'job' && (
          <div>
            <InfoRow label="Employee ID" value={<span style={{ fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '600' }}>{profile?.employee_id}</span>} />
            <InfoRow label="Login ID" value={<span style={{ fontFamily: 'monospace' }}>{profile?.login_id}</span>} />
            <InfoRow label="Role" value={<span style={{ textTransform: 'uppercase', fontWeight: '600', fontSize: '12px', padding: '3px 10px', borderRadius: '50px', background: 'rgba(139,92,246,0.1)', color: 'var(--primary)' }}>{profile?.role}</span>} />
            <InfoRow label="Department" value={profile?.department} />
            <InfoRow label="Designation" value={profile?.designation} />
            <InfoRow label="Joining Date" value={profile?.joining_date} />
          </div>
        )}

        {/* ── SALARY STRUCTURE ── */}
        {activeTab === 'salary' && (
          <div>
            {!s ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <p>No payroll record found. Please contact HR.</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(139,92,246,0.07)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Latest pay cycle: <strong>{s.month}</strong> &nbsp;&bull;&nbsp; This data is <strong>read-only</strong>.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                  {[
                    { label: 'Gross Salary', value: s.monthly_salary, highlight: true },
                    { label: 'Net Salary', value: s.net_salary, highlight: true },
                    { label: 'Basic Pay', value: s.basic },
                    { label: 'HRA', value: s.hra },
                    { label: 'Allowance', value: s.allowance },
                    { label: 'PF Deduction', value: s.pf },
                    { label: 'Professional Tax', value: s.professional_tax },
                  ].map((item) => (
                    <div key={item.label} style={{
                      padding: '16px',
                      borderRadius: '12px',
                      background: item.highlight ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.03)',
                      border: `1px solid ${item.highlight ? 'rgba(139,92,246,0.25)' : 'var(--border-color)'}`,
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                      <div style={{ fontSize: item.highlight ? '22px' : '18px', fontWeight: '700', color: item.highlight ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {formatCurrency(item.value)}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── DOCUMENTS ── */}
        {activeTab === 'documents' && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Documents Coming Soon</h4>
            <p style={{ fontSize: '14px' }}>Document upload & management will be available in a future update.</p>
          </div>
        )}
      </div>
    </div>
  );
}
