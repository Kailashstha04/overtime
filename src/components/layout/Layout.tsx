import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useApp } from '../../contexts/AppContext';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Layout({ children, title, subtitle, action }: LayoutProps) {
  const { logout, currentUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      {/* Main */}
      <div className="lg:ml-60 min-h-screen flex flex-col pb-20 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100 shadow-sm px-4 lg:px-6 py-3.5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-slate-800">{title}</h1>
            {subtitle && <p className="text-xs text-slate-400 font-devanagari">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {action}
            <button
              onClick={logout}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="page-enter flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
