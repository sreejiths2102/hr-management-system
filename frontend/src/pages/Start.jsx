import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const BACKEND_URL = 'http://127.0.0.1:8000';

const Start = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/company/status`)
      .then((res) => res.json())
      .then((data) => {
        if (data.company_exists) {
          navigate('/login');
        } else {
          navigate('/register');
        }
      })
      .catch(() => {
        setError('Unable to determine application status. Please make sure the backend is running.');
      });
  }, [navigate]);

  return (
    <div className="auth-page">
      <Navbar />
      <div className="auth-container">
        <div className="auth-card glass-panel">
          <div className="auth-header">
            <h2>Starting...</h2>
            <p>{error || 'Checking application status'}</p>
          </div>
          {error && <div className="auth-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Start;
