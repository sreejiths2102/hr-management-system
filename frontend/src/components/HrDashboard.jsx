import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardHome from './DashboardHome';
import Employees from './Employees';
import AttendanceManager from './AttendanceManager';
import LeaveManager from './LeaveManager';
import PayrollManager from './PayrollManager';
import AddUserModal from './AddUserModal';
import EmployeeDetailsModal from './EmployeeDetailsModal';

export default function HrDashboard({ currentUser }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const forceRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardHome
            key={refreshKey}
            onAddUserClick={() => setAddUserModalOpen(true)}
            onEmployeeClick={(userId) => setSelectedUserId(userId)}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'employees':
        return (
          <Employees
            key={refreshKey}
            currentUser={currentUser}
            onAddUserClick={() => setAddUserModalOpen(true)}
            onEmployeeClick={(userId) => setSelectedUserId(userId)}
          />
        );
      case 'attendance':
        return <AttendanceManager key={refreshKey} currentUser={currentUser} />;
      case 'timeoff':
        return <LeaveManager key={refreshKey} currentUser={currentUser} />;
      case 'payroll':
        return <PayrollManager key={refreshKey} currentUser={currentUser} />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser} // Pass the user to the sidebar
        onLogout={handleLogout}
      />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>HR Dashboard</h1>
          <p>Manage all aspects of your company's human resources.</p>
        </header>
        {renderContent()}
      </main>

      {isAddUserModalOpen && (
        <AddUserModal
          currentUser={currentUser}
          onClose={() => setAddUserModalOpen(false)}
          onSuccess={() => {
            setAddUserModalOpen(false);
            forceRefresh();
          }}
        />
      )}

      {selectedUserId && (
        <EmployeeDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onUpdateSuccess={() => {
            forceRefresh();
          }}
        />
      )}
    </div>
  );
}