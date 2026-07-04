import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form states
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // Registration form states
  const [companyName, setCompanyName] = useState('');
  const [hrName, setHrName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Registration success credentials popup state
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Force password reset state — set when must_change_password = true
  const [pendingReset, setPendingReset] = useState(null); // { loginId, user }
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      const data = await api.login(loginId, password);

      if (data.must_change_password) {
        // Intercept — show forced password reset screen
        setPendingReset({ loginId, user: data.user });
      } else {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleForceResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }
    setResetting(true);
    try {
      await api.changePassword(pendingReset.loginId, password, newPassword);
      // Password changed — now log in with new credentials and proceed
      const data = await api.login(pendingReset.loginId, newPassword);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setCreatedCredentials(null);

    if (regPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await api.registerCompany(
        companyName,
        hrName,
        email,
        phone,
        regPassword,
        confirmPassword
      );
      setSuccessMsg('Company registered successfully!');
      setCreatedCredentials(data);
      // Clean form fields
      setCompanyName('');
      setHrName('');
      setEmail('');
      setPhone('');
      setRegPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // ── Force Password Reset Screen ──────────────────────────────────────────
  if (pendingReset) {
    return (
      <div className="auth-page">
        <div className="auth-container glass">
          <div className="auth-header">
            <div className="auth-logo">Angeleena</div>
            <div className="auth-subtitle">HR Management System</div>
          </div>

          {/* Warning Banner */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '10px',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '20px', flexShrink: 0, fontWeight: '700', color: 'var(--warning)' }}>!</span>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--warning)', marginBottom: '4px', fontSize: '14px' }}>
                Password Reset Required
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                You're logging in with a temporary password. For your security, please set a new personal password before continuing.
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '18px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(139,92,246,0.08)', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Logged in as <strong style={{ color: 'var(--primary)' }}>{pendingReset.loginId}</strong>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleForceResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                id="confirmNewPassword"
                type="password"
                required
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            {/* Password strength hint */}
            {newPassword.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                {['At least 6 characters', 'Passwords match'].map((hint, i) => {
                  const met = i === 0 ? newPassword.length >= 6 : newPassword === confirmNewPassword;
                  return (
                    <div key={hint} style={{ fontSize: '12px', color: met ? 'var(--success)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <span>{met ? '✅' : '○'}</span> {hint}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={resetting}
              style={{ marginTop: '8px' }}
            >
              {resetting ? 'Updating Password...' : 'Set New Password & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Normal Login / Register Screen ───────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-container glass">
        <div className="auth-header">
          <div className="auth-logo">Angeleena</div>
          <div className="auth-subtitle">HR Management System</div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="badge badge-present btn-block" style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', textAlign: 'center', display: 'block' }}>{successMsg}</div>}

        {createdCredentials && (
          <div className="credentials-box" style={{ marginBottom: '24px' }}>
            <h4 style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '12px' }}>HR Admin Created!</h4>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Please copy these details to log in as HR Administrator:
            </p>
            <div className="credential-item">
              <span className="cred-label">Company Code:</span>
              <span className="cred-value">{createdCredentials.company.company_code}</span>
            </div>
            <div className="credential-item">
              <span className="cred-label">Login ID:</span>
              <span className="cred-value">{createdCredentials.first_hr.login_id}</span>
            </div>
            <div className="credential-item">
              <span className="cred-label">Role:</span>
              <span className="cred-value">{createdCredentials.first_hr.role}</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: '14px', padding: '8px 16px', fontSize: '13px' }}
              onClick={() => {
                copyToClipboard(createdCredentials.first_hr.login_id);
                setLoginId(createdCredentials.first_hr.login_id);
                setIsRegistering(false);
                setCreatedCredentials(null);
              }}
            >
              Copy Login ID &amp; Go to Login
            </button>
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label htmlFor="loginId">Login ID</label>
              <input
                id="loginId"
                type="text"
                required
                placeholder=""
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Log In
            </button>

          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                id="companyName"
                type="text"
                required
                placeholder="e.g. Angeleena Tech"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="hrName">HR Admin Name</label>
              <input
                id="hrName"
                type="text"
                required
                placeholder="e.g. Jane Doe"
                value={hrName}
                onChange={(e) => setHrName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="hr@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  required
                  placeholder="+1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="regPassword">Password</label>
                <input
                  id="regPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm</label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Register Company
            </button>
            <div className="auth-toggle">
              Already have an account?{' '}
              <span className="auth-toggle-link" onClick={() => setIsRegistering(false)}>
                Log In
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
