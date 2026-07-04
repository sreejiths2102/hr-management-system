import { useState } from 'react';
import { api } from '../services/api';

export default function AddUserModal({ currentUser, onClose, onSuccess }) {
  const [error, setError] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('employee');
  const [address, setAddress] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreatedCredentials(null);

    const payload = {
      company_id: currentUser.company_id,
      name,
      email,
      phone,
      department: department || null,
      designation: designation || null,
      joining_date: joiningDate || null,
      salary: salary ? parseFloat(salary) : null,
      role,
      address: address || null,
      profile_picture: null,
    };

    try {
      const data = await api.createUser(payload);
      setCreatedCredentials(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <button type="button" className="modal-close" onClick={onClose}>
          &times;
        </button>

        <h3 className="modal-title">Create New Employee Account</h3>

        {error && <div className="error-message">{error}</div>}

        {createdCredentials ? (
          <div className="credentials-box" style={{ padding: '24px' }}>
            <h4 style={{ color: 'var(--success)', fontWeight: '600', marginBottom: '12px' }}>
              Employee Created Successfully!
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              A new employee profile has been added. Give the credentials below to the employee:
            </p>

            <div className="credential-item">
              <span className="cred-label">Employee ID:</span>
              <span className="cred-value">{createdCredentials.employee_id}</span>
            </div>
            <div className="credential-item">
              <span className="cred-label">Login ID:</span>
              <span className="cred-value">{createdCredentials.login_id}</span>
            </div>
            <div className="credential-item">
              <span className="cred-label">Temporary Password:</span>
              <span className="cred-value">{createdCredentials.temporary_password}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  copyToClipboard(
                    `Employee ID: ${createdCredentials.employee_id}\nLogin ID: ${createdCredentials.login_id}\nTemp Password: ${createdCredentials.temporary_password}`
                  )
                }
              >
                Copy All Credentials
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="addName">Full Name</label>
              <input
                id="addName"
                type="text"
                required
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="addEmail">Email Address</label>
                <input
                  id="addEmail"
                  type="email"
                  required
                  placeholder="john.doe@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="addPhone">Phone Number</label>
                <input
                  id="addPhone"
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
                <label htmlFor="addDept">Department</label>
                <input
                  id="addDept"
                  type="text"
                  placeholder="e.g. Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="addDesig">Designation</label>
                <input
                  id="addDesig"
                  type="text"
                  placeholder="e.g. Frontend Dev"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="addJoinDate">Joining Date</label>
                <input
                  id="addJoinDate"
                  type="date"
                  required
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="addSalary">Monthly Salary</label>
                <input
                  id="addSalary"
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 5000.00"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="addRole">System Role</label>
              <select id="addRole" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="employee">Employee (General Staff)</option>
                <option value="hr">HR (Human Resources Admin)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="addAddress">Residential Address</label>
              <textarea
                id="addAddress"
                rows="2"
                placeholder="Residential Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary">
                Add User Account
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
