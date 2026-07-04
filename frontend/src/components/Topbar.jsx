import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut } from 'lucide-react';

const Topbar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Employee');

  useEffect(() => {
    // Basic extraction from token or user info could happen here
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.name) setUserName(parsed.name);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="search-bar">
        <Search size={20} className="search-icon" />
        <input type="text" placeholder="Search..." />
      </div>
      
      <div className="topbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <div className="user-profile">
          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`} alt="User" className="avatar" />
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">Employee</span>
          </div>
        </div>
        <button className="icon-btn logout-btn" onClick={handleLogout} title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
