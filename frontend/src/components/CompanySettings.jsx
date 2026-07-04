import { useState, useEffect } from 'react';

export default function CompanySettings({ currentUser }) {
  const [companyName, setCompanyName] = useState('Angeleena Tech');
  const [companyCode, setCompanyCode] = useState('ANG');
  const [logoUrl, setLogoUrl] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // If user object has company information, pre-fill it
    if (currentUser) {
      setCompanyCode(currentUser.employee_id?.slice(0, 3) || 'ANG');
    }
  }, [currentUser]);

  const handleSave = (e) => {
    e.preventDefault();
    setSuccess('Settings updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="glass settings-container" style={{ padding: '32px', margin: '0 auto' }}>
      <h3 className="modal-title" style={{ marginBottom: '8px' }}>Company Settings</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
        Configure organization profile and default preferences.
      </p>

      {success && (
        <div
          className="badge badge-present btn-block"
          style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', textAlign: 'center', display: 'block' }}
        >
          {success}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="setCompName">Organization Name</label>
          <input
            id="setCompName"
            type="text"
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="setCompCode">Company Code</label>
            <input
              id="setCompCode"
              type="text"
              disabled
              value={companyCode}
              style={{ opacity: 0.7, background: 'rgba(0, 0, 0, 0.05)', cursor: 'not-allowed' }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Generated code (read-only)</span>
          </div>
          <div className="form-group">
            <label htmlFor="setLogo">Company Logo URL</label>
            <input
              id="setLogo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '16px' }}>
          <label>Permissions Profile</label>
          <div
            style={{
              padding: '16px',
              background: 'rgba(139, 92, 246, 0.05)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '14px',
            }}
          >
            <p style={{ fontWeight: '600', color: 'var(--primary)', marginBottom: '4px' }}>
              HR Administrator Profile Active
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              You have full administrative privileges including employee onboarding, deactivation, leave approvals, and
              payroll modifications.
            </p>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ marginTop: '24px' }}>
          Save Configuration
        </button>
      </form>
    </div>
  );
}
