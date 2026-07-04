import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HrDashboard from '../components/HrDashboard';
import EmployeeDashboard from '../components/EmployeeDashboard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error('Failed to parse user data from localStorage', error);
      localStorage.clear();
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  if (loading) {
    return <div className="loading-fullscreen">Loading Dashboard...</div>;
  }

  if (user && (user.role === 'hr' || user.is_company_admin === true)) {
    return <HrDashboard currentUser={user} />;
  }

  return <EmployeeDashboard currentUser={user} />;
}