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
  login: (user: User) => void;
  logout: () => void;
  navigate: (page: Page) => void;
  refreshData: () => void;
  editingRecordId: string | null;
  setEditingRecordId: (id: string | null) => void;
}

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
    };
    load();
    return () => { mounted = false; };
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
  }, []);

  const value: AppContextType = {
    currentUser, page, records, users, auditLogs,
    login, logout, navigate, refreshData,
    editingRecordId, setEditingRecordId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
