import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, OvertimeRecord, AuditLog, apiGetUsers, apiGetRecords, apiGetAuditLogs } from '../lib/store';

export type Page =
  | 'login' | 'register'
  | 'staff-dashboard' | 'my-overtime' | 'add-overtime' | 'staff-profile'
  | 'admin-dashboard' | 'all-overtime' | 'staff-mgmt' | 'monthly-report'
  | 'audit-log' | 'excel-export' | 'rate-settings';

export interface AppContextType {
  currentUser: User | null;
  page: Page;
  records: OvertimeRecord[];
  users: User[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  showToast: (message: string, tone?: ToastTone) => void;
  toasts: ToastMessage[];
  login: (user: User) => void;
  logout: () => void;
  navigate: (page: Page) => void;
  refreshData: () => void;
  editingRecordId: string | null;
  setEditingRecordId: (id: string | null) => void;
}

export type ToastTone = 'success' | 'error' | 'info';
export interface ToastMessage { id: number; message: string; tone: ToastTone; }

export const AppContext = createContext<AppContextType | null>(null);

function safeParseUser(): User | null {
  try {
    const s = localStorage.getItem('so_current_user');
    return s ? JSON.parse(s) : null;
  } catch {
    localStorage.removeItem('so_current_user');
    return null;
  }
}

function initialPage(user: User | null): Page {
  if (!user) return 'login';
  return user.role === 'ADMIN' ? 'admin-dashboard' : 'staff-dashboard';
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(safeParseUser);
  const [page, setPage] = useState<Page>(() => initialPage(safeParseUser()));
  const [records, setRecords] = useState<OvertimeRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('so_theme') === 'dark' ? 'dark' : 'light');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem('so_sidebar_collapsed') === 'true');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const [loadedUsers, loadedRecords, loadedLogs] = await Promise.all([
        apiGetUsers(),
        apiGetRecords(),
        apiGetAuditLogs(),
      ]);
      if (!mounted) return;
      setUsers(loadedUsers);
      setRecords(loadedRecords);
      setAuditLogs(loadedLogs);
      setIsLoading(false);
    };
    load().catch(() => setIsLoading(false));
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('so_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(value => value === 'light' ? 'dark' : 'light'), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed(value => !value), []);

  useEffect(() => {
    localStorage.setItem('so_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const showToast = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 3600);
  }, []);

  const login = useCallback((user: User) => {
    setCurrentUser(user);
    localStorage.setItem('so_current_user', JSON.stringify(user));
    setPage(user.role === 'ADMIN' ? 'admin-dashboard' : 'staff-dashboard');
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('so_current_user');
    setPage('login');
  }, []);

  const navigate = useCallback((p: Page) => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loadedUsers, loadedRecords, loadedLogs] = await Promise.all([
        apiGetUsers(),
        apiGetRecords(),
        apiGetAuditLogs(),
      ]);
      setRecords(loadedRecords);
      setUsers(loadedUsers);
      setAuditLogs(loadedLogs);
      try {
        const s = localStorage.getItem('so_current_user');
        if (s) {
          const u = JSON.parse(s);
          const updated = loadedUsers.find((x: User) => x.id === u.id);
          if (updated) {
            setCurrentUser(updated);
            localStorage.setItem('so_current_user', JSON.stringify(updated));
          }
        }
      } catch {}
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AppContextType = {
    currentUser, page, records, users, auditLogs,
    login, logout, navigate, refreshData,
    editingRecordId, setEditingRecordId, isLoading, theme, toggleTheme, sidebarCollapsed, toggleSidebar, showToast, toasts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
