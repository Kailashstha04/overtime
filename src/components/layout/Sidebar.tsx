import { useApp, Page } from '../../contexts/AppContext';

interface NavItem { label: string; labelNp: string; page: Page; icon: React.ReactNode; }

const StaffNav: NavItem[] = [
  { label: 'Dashboard', labelNp: 'ड्यासबोर्ड', page: 'staff-dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" /></svg> },
  { label: 'My Overtime', labelNp: 'ओभरटाइम', page: 'my-overtime', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Add Overtime', labelNp: 'थप्नुहोस्', page: 'add-overtime', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> },
  { label: 'Profile', labelNp: 'प्रोफाइल', page: 'staff-profile', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
];

const AdminNav: NavItem[] = [
  { label: 'Dashboard', labelNp: 'ड्यासबोर्ड', page: 'admin-dashboard', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
  { label: 'All Overtime', labelNp: 'सबै ओभरटाइम', page: 'all-overtime', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
  { label: 'Staff', labelNp: 'कर्मचारी', page: 'staff-mgmt', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
  { label: 'Monthly Report', labelNp: 'मासिक रिपोर्ट', page: 'monthly-report', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  { label: 'Export', labelNp: 'एक्सेल निर्यात', page: 'excel-export', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> },
  { label: 'Rate Settings', labelNp: 'दर सेटिङ', page: 'rate-settings', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg> },
  { label: 'Audit Logs', labelNp: 'अडिट लग', page: 'audit-log', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

export default function Sidebar() {
  const { currentUser, page, navigate, logout, sidebarCollapsed, toggleSidebar, theme, toggleTheme } = useApp();
  const navItems = currentUser?.role === 'ADMIN' ? AdminNav : StaffNav;
  const dept = (currentUser as any)?.department;

  return (
    <aside className={`hidden lg:flex flex-col ${sidebarCollapsed ? 'w-[4.5rem]' : 'w-60'} min-h-screen bg-white border-r border-slate-100 shadow-sm fixed left-0 top-0 transition-[width] duration-300 overflow-hidden z-40`}>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={sidebarCollapsed ? 'hidden' : ''}>
            <p className="text-sm font-bold text-slate-800 leading-tight">Smart Overtime</p>
            <p className="text-xs text-slate-400 leading-tight">OT Management</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 mx-3 mt-3 rounded-xl">
        <p className={`text-xs font-semibold text-slate-700 truncate ${sidebarCollapsed ? 'hidden' : ''}`}>{currentUser?.fullName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${currentUser?.role === 'ADMIN' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
            {currentUser?.role}
          </span>
          {dept && !sidebarCollapsed && (
            <span className="text-xs text-slate-400">{dept === 'OT Nursing' ? '🏥' : '🧹'} {dept}</span>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(item => {
          const active = page === item.page;
          return (
            <button key={item.page} onClick={() => navigate(item.page as any)}
              className={`sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left ${active ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'}`}>
              <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
              <div className={sidebarCollapsed ? 'hidden' : ''}>
                <p className="text-sm font-medium leading-none">{item.label}</p>
                <p className={`text-xs font-devanagari leading-none mt-0.5 ${active ? 'text-teal-100' : 'text-slate-400'}`}>{item.labelNp}</p>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <div className="flex gap-2 mb-2">
          <button onClick={toggleSidebar} className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition" title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} /></svg>
            {!sidebarCollapsed && <span className="text-xs">Collapse</span>}
          </button>
          <button onClick={toggleTheme} className="flex items-center justify-center px-2 py-2 rounded-lg text-slate-500 hover:bg-slate-100 transition" title="Toggle light/dark mode">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
