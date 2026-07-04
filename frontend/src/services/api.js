const API_BASE_URL = 'http://127.0.0.1:8000';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const api = {
  // Auth Operations
  login: async (login, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  registerCompany: async (companyName, hrName, email, phone, password, confirmPassword) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_name: companyName,
        hr_name: hrName,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
      }),
    });
    return handleResponse(res);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // HR Dashboard
  getHrDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/dashboard/hr`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // User / Employee Directory CRUD
  listUsers: async (companyId, search = '', role = '', department = '') => {
    let url = `${API_BASE_URL}/users?company_id=${companyId}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role) url += `&role=${encodeURIComponent(role)}`;
    if (department) url += `&department=${encodeURIComponent(department)}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getUserDetails: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  updateUser: async (userId, userData) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(res);
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Attendance
  getMyAttendance: async () => {
    const res = await fetch(`${API_BASE_URL}/attendance`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  checkInAttendance: async () => {
    const res = await fetch(`${API_BASE_URL}/attendance/check-in`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  checkOutAttendance: async (breakMinutes = 0) => {
    const url = new URL(`${API_BASE_URL}/attendance/check-out`);
    if (breakMinutes) url.searchParams.set('break_minutes', String(breakMinutes));
    const res = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getAllAttendance: async () => {
    const res = await fetch(`${API_BASE_URL}/attendance/all`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Leave / Time-Off
  listMyLeaveRequests: async () => {
    const res = await fetch(`${API_BASE_URL}/leave`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  applyLeave: async (payload) => {
    const res = await fetch(`${API_BASE_URL}/leave`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  listLeaveRequests: async () => {
    const res = await fetch(`${API_BASE_URL}/leave`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  approveLeave: async (leaveId, comment = '') => {
    let url = `${API_BASE_URL}/leave/${leaveId}/approve`;
    if (comment) url += `?admin_comment=${encodeURIComponent(comment)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  rejectLeave: async (leaveId, comment = '') => {
    let url = `${API_BASE_URL}/leave/${leaveId}/reject`;
    if (comment) url += `?admin_comment=${encodeURIComponent(comment)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Payroll
  getMyPayroll: async () => {
    const res = await fetch(`${API_BASE_URL}/payroll`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getPayroll: async () => {
    const res = await fetch(`${API_BASE_URL}/payroll`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  updatePayroll: async (salaryId, monthlySalary, month) => {
    const res = await fetch(
      `${API_BASE_URL}/payroll/${salaryId}?monthly_salary=${monthlySalary}&month=${encodeURIComponent(month)}`,
      {
        method: 'PUT',
        headers: getHeaders(),
      }
    );
    return handleResponse(res);
  },
};
