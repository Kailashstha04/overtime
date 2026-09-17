import { AppProvider, AppContext, useApp } from './contexts/AppContext';
import { useContext } from 'react';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import StaffDashboard from './components/staff/StaffDashboard';
import MyOvertime from './components/staff/MyOvertime';
import AddOvertimeForm from './components/staff/AddOvertimeForm';
import StaffProfile from './components/staff/StaffProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import AllOvertime from './components/admin/AllOvertime';
import StaffManagement from './components/admin/StaffManagement';
import MonthlyReport from './components/admin/MonthlyReport';
import ExcelExport from './components/admin/ExcelExport';
import AuditLog from './components/admin/AuditLog';
import RateSettings from './components/admin/RateSettings';

function AppRouter() {
  // Use useContext directly with the imported AppContext to avoid any
  // module-identity mismatch that can occur with Vite HMR and useApp()
  const ctx = useContext(AppContext);
  if (!ctx) return null;
  const { currentUser, page } = ctx;

  if (!currentUser) {
    if (page === 'register') return <RegisterPage />;
    return <LoginPage />;
  }

  if (currentUser.role === 'ADMIN') {
    switch (page) {
      case 'all-overtime':   return <AllOvertime />;
      case 'staff-mgmt':     return <StaffManagement />;
      case 'monthly-report': return <MonthlyReport />;
      case 'excel-export':   return <ExcelExport />;
      case 'audit-log':      return <AuditLog />;
      case 'rate-settings':  return <RateSettings />;
      case 'add-overtime':   return <AddOvertimeForm />;
      default:               return <AdminDashboard />;
    }
  }

  switch (page) {
    case 'my-overtime':   return <MyOvertime />;
    case 'add-overtime':  return <AddOvertimeForm />;
    case 'staff-profile': return <StaffProfile />;
    default:              return <StaffDashboard />;
  }
}

function AppFeedback() {
  const { isLoading, toasts } = useApp();
  return (
    <>
      {isLoading && (
        <div className="refresh-overlay" role="status" aria-live="polite" aria-label="Refreshing data">
          <div className="refresh-scene">
            <div className="refresh-orbit refresh-orbit-one" />
            <div className="refresh-orbit refresh-orbit-two" />
            <div className="refresh-orbit refresh-orbit-three" />
            <div className="refresh-core">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="refresh-spark refresh-spark-one" />
            <span className="refresh-spark refresh-spark-two" />
            <span className="refresh-spark refresh-spark-three" />
            <span className="refresh-spark refresh-spark-four" />
          </div>
          <p className="refresh-title">Syncing overtime</p>
          <p className="refresh-subtitle">Updating your latest records...</p>
          <div className="refresh-progress"><span /></div>
        </div>
      )}
      <div className="toast-stack">{toasts.map(toast => <div key={toast.id} className={`toast toast-${toast.tone}`} role="status">{toast.message}</div>)}</div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppFeedback />
      <AppRouter />
    </AppProvider>
  );
}
