import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function EmployeeDetailsModal({ userId, onClose, onUpdateSuccess }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Edit form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [address, setAddress] = useState('');

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getUserDetails(userId);
      setUser(data);
      // Initialize edit form values
      setName(data.name || '');
      setPhone(data.phone || '');
      setDepartment(data.department || '');
      setDesignation(data.designation || '');
      setSalary(data.salary || '');
      setAddress(data.address || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.updateUser(userId, {
        name,
        phone,
        department,
        designation,
        salary: salary ? parseFloat(salary) : null,
        address,
      });
      setIsEditing(false);
      fetchUserDetails();
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to deactivate this employee? This will set them as inactive.')) {
      return;
    }
    setError('');
    try {
      await api.deleteUser(userId);
      alert('User deactivated successfully.');
      onClose();
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'E';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <button type="button" className="modal-close" onClick={onClose}>
          &times;
        </button>

        <h3 className="modal-title">{isEditing ? 'Edit Profile' : 'Employee Details'}</h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading employee profile details...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : user ? (
          <div className="details-grid">
            <div className="details-left">
              <div className="details-avatar">{getInitials(user.name)}</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {user.designation || 'Staff'}
              </div>
              <span className={`badge ${user.is_active ? 'badge-present' : 'badge-absent'}`}>
                {user.is_active ? 'Active' : 'Deactivated'}
              </span>
            </div>

            <div className="details-right">
              {!isEditing ? (
                <>
                  <div className="info-row">
                    <div className="info-label">Employee ID</div>
                    <div className="info-val" style={{ fontWeight: '600', color: 'var(--primary)' }}>{user.employee_id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Login ID</div>
                    <div className="info-val" style={{ fontFamily: 'monospace' }}>{user.login_id}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Role</div>
                    <div className="info-val" style={{ textTransform: 'uppercase', fontSize: '13px', fontWeight: '600' }}>
                      {user.role}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Department</div>
                    <div className="info-val">{user.department || 'Not Assigned'}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Joining Date</div>
                    <div className="info-val">{user.joining_date || 'N/A'}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Email</div>
                    <div className="info-val">{user.email}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Phone</div>
                    <div className="info-val">{user.phone || 'N/A'}</div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Salary</div>
                    <div className="info-val" style={{ fontWeight: '600' }}>
                      {user.salary ? `$${user.salary.toLocaleString()}/mo` : 'N/A'}
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-label">Address</div>
                    <div className="info-val">{user.address || 'N/A'}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={handleDelete}>
                      Deactivate
                    </button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdate}>
                  <div className="form-group">
                    <label htmlFor="editName">Full Name</label>
                    <input
                      id="editName"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editPhone">Phone</label>
                    <input
                      id="editPhone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="editDept">Department</label>
                      <input
                        id="editDept"
                        type="text"
                        placeholder="e.g. Engineering"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="editDesig">Designation</label>
                      <input
                        id="editDesig"
                        type="text"
                        placeholder="e.g. Developer"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="editSalary">Monthly Salary</label>
                    <input
                      id="editSalary"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5000.00"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="editAddress">Address</label>
                    <textarea
                      id="editAddress"
                      rows="2"
                      placeholder="Residential address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No user details found.</p>
        )}
      </div>
    </div>
  );
}
