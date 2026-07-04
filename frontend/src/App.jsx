import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardHome from './components/DashboardHome';
import Employees from './components/Employees';
import AttendanceManager from './components/AttendanceManager';
import LeaveManager from './components/LeaveManager';
import PayrollManager from './components/PayrollManager';
import CompanySettings from './components/CompanySettings';
import Reports from './components/Reports';
import AddUserModal from './components/AddUserModal';
import EmployeeDetailsModal from './components/EmployeeDetailsModal';
import EmployeeAttendanceView from './components/EmployeeAttendanceView';
import EmployeeLeaveView from './components/EmployeeLeaveView';
import EmployeePayrollView from './components/EmployeePayrollView';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeProfileView from './components/EmployeeProfileView';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [employeeSubTab, setEmployeeSubTab] = useState('attendance');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  
  // Re-fetch trigger states to communicate refreshes between components
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is already logged in
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const isHrOrAdmin = currentUser?.role === 'hr' || currentUser?.is_company_admin;

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Page title helper
  const getPageTitle = () => {
    if (currentTab === 'dashboard') return isHrOrAdmin ? 'Dashboard Summary' : 'My Dashboard';
    if (currentTab === 'timeoff') return 'Leave Requests';
    if (currentTab === 'profile') return 'My Profile';
    return `${currentTab} Management`;
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <header className="content-header">
          <div className="page-title">
            <h1 style={{ textTransform: 'capitalize' }}>{getPageTitle()}</h1>
            <p>Welcome back, {currentUser.name}</p>
          </div>
        </header>

        {/* Tab Router Content */}
        <div key={refreshTrigger} style={{ flexGrow: 1 }}>
          {currentTab === 'dashboard' && (
            isHrOrAdmin ? (
              <DashboardHome
                setCurrentTab={setCurrentTab}
                onAddUserClick={() => setIsAddModalOpen(true)}
                onEmployeeClick={(id) => setSelectedEmployeeId(id)}
              />
            ) : (
              <EmployeeDashboard
                currentUser={currentUser}
                setCurrentTab={setCurrentTab}
                onLogout={handleLogout}
              />
            )
          )}

          {currentTab === 'employees' && (
            <Employees
              currentUser={currentUser}
              onAddUserClick={() => setIsAddModalOpen(true)}
              onEmployeeClick={(id) => setSelectedEmployeeId(id)}
            />
          )}

          {currentTab === 'attendance' && (
            isHrOrAdmin ? (
              <AttendanceManager currentUser={currentUser} />
            ) : (
              <EmployeeAttendanceView currentUser={currentUser} />
            )
          )}

          {currentTab === 'timeoff' && (
            isHrOrAdmin ? (
              <LeaveManager currentUser={currentUser} />
            ) : (
              <EmployeeLeaveView currentUser={currentUser} />
            )
          )}

          {currentTab === 'payroll' && (
            isHrOrAdmin ? (
              <PayrollManager currentUser={currentUser} />
            ) : (
              <EmployeePayrollView currentUser={currentUser} />
            )
          )}

          {currentTab === 'profile' && !isHrOrAdmin && (
            <EmployeeProfileView
              currentUser={currentUser}
              onProfileUpdate={triggerRefresh}
            />
          )}

          {currentTab === 'reports' && (
            <Reports currentUser={currentUser} />
          )}

          {currentTab === 'settings' && (
            <CompanySettings currentUser={currentUser} />
          )}
        </div>
      </main>

      {/* Modals and Overlays */}
      {isAddModalOpen && (
        <AddUserModal
          currentUser={currentUser}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={triggerRefresh}
        />
      )}

      {selectedEmployeeId && (
        <EmployeeDetailsModal
          userId={selectedEmployeeId}
          onClose={() => setSelectedEmployeeId(null)}
          onUpdateSuccess={triggerRefresh}
        />
      )}
    </div>
  );
}
