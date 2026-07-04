import React, { useState, useEffect, useMemo } from 'react';
import { Camera, Edit2, Save, X } from 'lucide-react';

const MyProfile = () => {
  const [activeTab, setActiveTab] = useState('salary');
  const [profile, setProfile] = useState({
    name: 'Employee User',
    department: 'Engineering',
    designation: 'Software Engineer',
    email: 'employee@company.com',
    phone: '+91 9876543210',
    address: '123 Tech Park, Bangalore',
    joiningDate: '15 Jan 2024',
    photo: 'https://ui-avatars.com/api/?name=Employee+User&background=0D8ABC&color=fff&size=150',
    company: 'Tech Solutions Inc',
    manager: 'John Doe',
    location: 'Bangalore Office',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [salaryConfig, setSalaryConfig] = useState({
    monthlySalary: 50000,
    basicPercent: 50,
    hraPercent: 50,
    standardAllowancePercent: 8.33,
    performanceBonusPercent: 8.33,
    leaveTravelAllowancePercent: 8.33,
    fixedAllowance: 0,
    pfAmount: 3000,
    professionalTax: 200,
  });
  const [salarySaved, setSalarySaved] = useState(false);

  useEffect(() => {
    // TODO: Replace with real API call using /users/me and /payroll endpoints
  }, []);

  const handleEditClick = () => {
    setEditForm({
      phone: profile.phone,
      address: profile.address,
      photo: profile.photo,
    });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // TODO: PUT /users/me to persist profile changes
    setProfile({ ...profile, ...editForm });
    setIsEditing(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSalarySaved(false);
  };

  const handleSalaryConfigChange = (e) => {
    const { name, value } = e.target;
    const numericValue = name === 'fixedAllowance' || name === 'pfAmount' || name === 'professionalTax'
      ? Number(value)
      : Number(value);

    setSalaryConfig((prev) => ({
      ...prev,
      [name]: Number.isNaN(numericValue) ? 0 : numericValue,
    }));
    setSalarySaved(false);
  };

  const salaryDetails = useMemo(() => {
    const gross = Number(salaryConfig.monthlySalary) || 0;
    const basic = (gross * (salaryConfig.basicPercent / 100)) || 0;
    const hra = (basic * (salaryConfig.hraPercent / 100)) || 0;
    const standardAllowance = (gross * (salaryConfig.standardAllowancePercent / 100)) || 0;
    const performanceBonus = (gross * (salaryConfig.performanceBonusPercent / 100)) || 0;
    const leaveTravelAllowance = (gross * (salaryConfig.leaveTravelAllowancePercent / 100)) || 0;
    const fixedAllowance = Number(salaryConfig.fixedAllowance) || 0;
    const totalComponents = basic + hra + standardAllowance + performanceBonus + leaveTravelAllowance + fixedAllowance;
    const totalDeductions = Number(salaryConfig.pfAmount) + Number(salaryConfig.professionalTax);
    const netSalary = gross - totalDeductions;
    const remaining = gross - totalComponents;

    return {
      monthlySalary: gross,
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      leaveTravelAllowance,
      fixedAllowance,
      totalComponents,
      totalDeductions,
      netSalary,
      remaining,
    };
  }, [salaryConfig]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(value);
  };

  const handleSaveSalary = () => {
    setSalarySaved(true);
  };

  return (
    <div className="profile-container">
      <div className="profile-header glass-panel">
        <div className="profile-photo-section">
          <div className="photo-wrapper">
            <img src={profile.photo} alt="Profile" className="profile-photo" />
            {isEditing && (
              <button className="photo-edit-btn">
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="profile-title">
            <h2>{profile.name}</h2>
            <p className="designation">{profile.designation}</p>
          </div>
        </div>

        <div className="profile-actions">
          {!isEditing ? (
            <button className="btn-outline" onClick={handleEditClick}>
              <Edit2 size={16} className="inline-icon" /> Edit Profile
            </button>
          ) : (
            <div className="action-group">
              <button className="btn-outline danger" onClick={handleCancel}>
                <X size={16} className="inline-icon" /> Cancel
              </button>
              <button className="btn-primary" onClick={handleSave}>
                <Save size={16} className="inline-icon" /> Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-tabs glass-panel">
        {['resume', 'private', 'salary', 'security'].map((tabKey) => {
          const label = tabKey === 'resume'
            ? 'Resume'
            : tabKey === 'private'
            ? 'Private Info'
            : tabKey === 'salary'
            ? 'Salary Info'
            : 'Security';
          return (
            <button
              key={tabKey}
              type="button"
              className={`tab-item ${activeTab === tabKey ? 'active' : ''}`}
              onClick={() => handleTabChange(tabKey)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {activeTab === 'salary' ? (
        <div className="salary-panel glass-panel">
          <div className="salary-grid">
            <div className="salary-card">
              <h3>Salary Structure</h3>
              <div className="salary-form-grid">
                <div className="form-group">
                  <label>Monthly Wage</label>
                  <input
                    type="number"
                    name="monthlySalary"
                    value={salaryConfig.monthlySalary}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Basic % of Wage</label>
                  <input
                    type="number"
                    name="basicPercent"
                    value={salaryConfig.basicPercent}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>HRA % of Basic</label>
                  <input
                    type="number"
                    name="hraPercent"
                    value={salaryConfig.hraPercent}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                    max="200"
                  />
                </div>
                <div className="form-group">
                  <label>Standard Allowance %</label>
                  <input
                    type="number"
                    name="standardAllowancePercent"
                    value={salaryConfig.standardAllowancePercent}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Performance Bonus %</label>
                  <input
                    type="number"
                    name="performanceBonusPercent"
                    value={salaryConfig.performanceBonusPercent}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Leave Travel %</label>
                  <input
                    type="number"
                    name="leaveTravelAllowancePercent"
                    value={salaryConfig.leaveTravelAllowancePercent}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Fixed Allowance</label>
                  <input
                    type="number"
                    name="fixedAllowance"
                    value={salaryConfig.fixedAllowance}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>PF Amount</label>
                  <input
                    type="number"
                    name="pfAmount"
                    value={salaryConfig.pfAmount}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Professional Tax</label>
                  <input
                    type="number"
                    name="professionalTax"
                    value={salaryConfig.professionalTax}
                    onChange={handleSalaryConfigChange}
                    className="edit-input"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="salary-summary-card">
              <h3>Salary Breakdown</h3>
              <div className="summary-list">
                <div className="summary-item">
                  <span>Gross Wage</span>
                  <strong>{formatCurrency(salaryDetails.monthlySalary)}</strong>
                </div>
                <div className="summary-item">
                  <span>Basic Salary</span>
                  <strong>{formatCurrency(salaryDetails.basic)}</strong>
                </div>
                <div className="summary-item">
                  <span>HRA</span>
                  <strong>{formatCurrency(salaryDetails.hra)}</strong>
                </div>
                <div className="summary-item">
                  <span>Standard Allowance</span>
                  <strong>{formatCurrency(salaryDetails.standardAllowance)}</strong>
                </div>
                <div className="summary-item">
                  <span>Performance Bonus</span>
                  <strong>{formatCurrency(salaryDetails.performanceBonus)}</strong>
                </div>
                <div className="summary-item">
                  <span>Leave Travel Allowance</span>
                  <strong>{formatCurrency(salaryDetails.leaveTravelAllowance)}</strong>
                </div>
                <div className="summary-item">
                  <span>Fixed Allowance</span>
                  <strong>{formatCurrency(salaryDetails.fixedAllowance)}</strong>
                </div>
                <div className="summary-divider" />
                <div className="summary-item">
                  <span>Total Components</span>
                  <strong>{formatCurrency(salaryDetails.totalComponents)}</strong>
                </div>
                <div className="status-message">
                  {salaryDetails.remaining < 0 ? (
                    <span className="status-warning">Total components exceed monthly wage by {formatCurrency(Math.abs(salaryDetails.remaining))}</span>
                  ) : (
                    <span className="status-info">Remaining wage available {formatCurrency(salaryDetails.remaining)}</span>
                  )}
                </div>
                <div className="summary-item">
                  <span>Total Deductions</span>
                  <strong>{formatCurrency(salaryDetails.totalDeductions)}</strong>
                </div>
                <div className="summary-item net-salary">
                  <span>Net Salary</span>
                  <strong>{formatCurrency(salaryDetails.netSalary)}</strong>
                </div>
              </div>
              <button className="btn-primary full-width" onClick={handleSaveSalary}>
                <Save size={16} className="inline-icon" /> Save Salary Info
              </button>
              {salarySaved && <p className="save-confirmation">Salary structure saved locally.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="profile-details-grid">
          <div className="details-card glass-panel">
            <h3>{activeTab === 'resume' ? 'Resume' : activeTab === 'private' ? 'Private Information' : 'Security Settings'}</h3>
            <div className="info-grid single-col">
              {activeTab === 'resume' && (
                <>
                  <div className="info-group">
                    <label>Employee ID</label>
                    <p>EMP-00123</p>
                  </div>
                  <div className="info-group">
                    <label>Job Level</label>
                    <p>Mid-Level</p>
                  </div>
                  <div className="info-group">
                    <label>Experience</label>
                    <p>3+ years</p>
                  </div>
                </>
              )}
              {activeTab === 'private' && (
                <>
                  <div className="info-group">
                    <label>Personal Email</label>
                    <p>employee.personal@example.com</p>
                  </div>
                  <div className="info-group">
                    <label>Emergency Contact</label>
                    <p>+91 98765 43210</p>
                  </div>
                  <div className="info-group">
                    <label>Nationality</label>
                    <p>Indian</p>
                  </div>
                </>
              )}
              {activeTab === 'security' && (
                <>
                  <div className="info-group">
                    <label>Password</label>
                    <p>************</p>
                  </div>
                  <div className="info-group">
                    <label>Two-Factor Authentication</label>
                    <p>Disabled</p>
                  </div>
                  <div className="info-group">
                    <label>Last Login</label>
                    <p>Today, 09:05 AM</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
