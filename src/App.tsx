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

export default function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
