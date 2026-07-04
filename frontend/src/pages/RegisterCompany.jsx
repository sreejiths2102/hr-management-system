import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Building2, User, Mail, Phone, Lock, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = 'http://127.0.0.1:8000';

const RegisterCompany = () => {
  const [formData, setFormData] = useState({
    companyName: '',
    logo: '',
    hrName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/company/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.company_exists) {
          navigate('/login');
        }
      })
      .catch(() => {
        // ignore; allow registration if status cannot be determined
      });
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/register-company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || 'Registration failed');
        setIsLoading(false);
        return;
      }

      setSuccess('Company registered successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 800);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card glass-panel register-card">
          <div className="auth-header">
            <h2>Register Company</h2>
            <p>Set up your company and HR account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="status-message">{success}</div>}

          <form className="auth-form two-columns" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Company Name</label>
              <div className="input-with-icon">
                <Building2 className="input-icon" size={20} />
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Logo URL</label>
              <div className="input-with-icon">
                <ImageIcon className="input-icon" size={20} />
                <input type="text" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://" />
              </div>
            </div>

            <div className="form-group">
              <label>HR Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={20} />
                <input type="text" name="hrName" value={formData.hrName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={20} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <div className="input-with-icon">
                <Phone className="input-icon" size={20} />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={20} />
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-actions full-width-col">
              <button type="submit" className="btn-primary full-width" disabled={isLoading}>
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterCompany;
