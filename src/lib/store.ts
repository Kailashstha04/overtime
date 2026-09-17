import { adToBS, formatBS, formatAD, calcMinutes, parseADString } from './nepaliDate';

export type UserRole = 'ADMIN' | 'STAFF';
export type OTStatus = 'PENDING' | 'VERIFIED';
export type OTType = 'Major' | 'Intermediate' | 'Minor';
export type ShiftDuty = '7-3' | '8-4' | '9-5' | '10-6' | '11-7' | 'OFF' | 'ONCALL';
export type Department = 'OT Nursing' | 'Cleaning';

export interface RateSettings {
  otNursing: { Major: number; Intermediate: number; Minor: number };
  cleaning: { Major: number; Intermediate: number; Minor: number };
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  department: Department;
  isActive: boolean;
  createdAt: string;
}

export interface OvertimeRecord {
  id: string;
  staffId: string;
  staffName: string;
  department: Department;
  dateAD: string;
  dateBS: string;
  patientName: string;
  procedure: string;
  type: OTType;
  shiftDuty: ShiftDuty;
  startTime: string;
  endTime: string;
  totalMinutes: number;
  amount: number;
  remarks: string;
  status: OTStatus;
  createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  recordId?: string;
  details: string;
  createdAt: string;
}

const DEFAULT_RATES: RateSettings = {
  otNursing: { Major: 1000, Intermediate: 800, Minor: 500 },
  cleaning: { Major: 300, Intermediate: 300, Minor: 300 },
};

// Legacy export for backward compatibility
export const RATES: Record<OTType, number> = { Major: 1000, Intermediate: 800, Minor: 500 };

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 8000);
  let response: Response;
  try {
    response = await fetch(path, {
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
      ...options,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    const text = await response.text();
    const error = new Error(text || 'Request failed') as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  return data as T;
}

function isBackendUnavailable(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  const status = (error as { status?: number })?.status;
  return status === 404 || status === 405;
}

export async function apiGetRateSettings(): Promise<RateSettings> {
  try {
    return await apiRequest<RateSettings>('/api/admin/settings');
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return getRateSettings();
  }
}

export async function apiSaveRateSettings(rates: RateSettings): Promise<void> {
  await apiRequest('/api/admin/settings', {
    method: 'PUT',
    body: JSON.stringify(rates),
  });
}

export function getRateSettings(): RateSettings {
  const stored = localStorage.getItem('so_rates');
  if (!stored) return DEFAULT_RATES;
  return { ...DEFAULT_RATES, ...JSON.parse(stored) };
}

export function saveRateSettings(rates: RateSettings) {
  localStorage.setItem('so_rates', JSON.stringify(rates));
}

export function getAmountForRecord(type: OTType, department: Department): number {
  const rates = getRateSettings();
  if (department === 'Cleaning') return rates.cleaning[type];
  return rates.otNursing[type];
}

const ADMIN_USER: User = {
  id: 'admin-001',
  fullName: 'System Administrator',
  username: '54278899',
  email: 'admin@smartovertime.np',
  password: '5427885427',
  role: 'ADMIN',
  department: 'OT Nursing',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function initStore() {
  if (localStorage.getItem('so_initialized_v3')) return;

  const seededStaffIds = new Set(['staff-001', 'staff-002', 'staff-003']);
  const seededRecordIds = new Set(Array.from({ length: 12 }, (_, index) => `ot-${String(index + 1).padStart(3, '0')}`));
  const seededAuditIds = new Set(['audit-001', 'audit-002', 'audit-003']);

  const users = JSON.parse(localStorage.getItem('so_users') || '[]') as User[];
  const records = JSON.parse(localStorage.getItem('so_records') || '[]') as OvertimeRecord[];
  const auditLogs = JSON.parse(localStorage.getItem('so_audit') || '[]') as AuditLog[];
  localStorage.setItem('so_users', JSON.stringify(users.filter(user => !seededStaffIds.has(user.id))));
  localStorage.setItem('so_records', JSON.stringify(records.filter(record => !seededRecordIds.has(record.id))));
  localStorage.setItem('so_audit', JSON.stringify(auditLogs.filter(log => !seededAuditIds.has(log.id))));
  localStorage.setItem('so_initialized_v3', 'true');
}

export async function apiGetUsers(): Promise<User[]> {
  try {
    return await apiRequest<User[]>('/api/admin/staff');
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return getUsers();
  }
}

export async function apiUpdateUser(updates: Partial<User> & { id: string }): Promise<User> {
  try {
    return await apiRequest<User>('/api/admin/staff', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const users = getUsers();
    const index = users.findIndex(user => user.id === updates.id);
    if (index === -1) throw new Error('User not found.');
    users[index] = { ...users[index], ...updates };
    saveUsers(users);
    return users[index];
  }
}

export async function apiGetRecords(): Promise<OvertimeRecord[]> {
  try {
    return await apiRequest<OvertimeRecord[]>('/api/overtime');
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return getRecords();
  }
}

export async function apiGetAuditLogs(): Promise<AuditLog[]> {
  try {
    return await apiRequest<AuditLog[]>('/api/admin/audit');
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return getAuditLogs();
  }
}

export async function apiAddAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    await apiRequest('/api/admin/audit', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const logs = getAuditLogs();
    logs.unshift({ ...log, id: `audit-${Date.now()}`, createdAt: new Date().toISOString() });
    localStorage.setItem('so_audit', JSON.stringify(logs));
  }
}

export function getUsers(): User[] {
  initStore();
  return JSON.parse(localStorage.getItem('so_users') || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem('so_users', JSON.stringify(users));
}

export function getRecords(): OvertimeRecord[] {
  initStore();
  return JSON.parse(localStorage.getItem('so_records') || '[]');
}

export function saveRecords(records: OvertimeRecord[]) {
  localStorage.setItem('so_records', JSON.stringify(records));
}

export function getAuditLogs(): AuditLog[] {
  initStore();
  return JSON.parse(localStorage.getItem('so_audit') || '[]');
}

export function addAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>) {
  const logs = getAuditLogs();
  logs.unshift({ ...log, id: `audit-${Date.now()}`, createdAt: new Date().toISOString() });
  localStorage.setItem('so_audit', JSON.stringify(logs));
}

export async function apiFindUser(username: string, password: string): Promise<User | null> {
  try {
    const user = await apiRequest<User | null>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return user;
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return findUser(username, password);
  }
}

export function findUser(username: string, password: string): User | null {
  if (username === ADMIN_USER.username && password === ADMIN_USER.password) return ADMIN_USER;
  const users = getUsers();
  return users.find(u => (u.username === username || u.email === username) && u.password === password && u.isActive) ?? null;
}

export async function apiRegisterUser(data: { fullName: string; username: string; email: string; password: string; department: Department }): Promise<{ success: boolean; error?: string }> {
  try {
    return await apiRequest<{ success: boolean; error?: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    const result = registerUser(data);
    return result;
  }
}

export function registerUser(data: { fullName: string; username: string; email: string; password: string; department: Department }): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.find(u => u.username === data.username)) return { success: false, error: 'Username already exists.' };
  if (users.find(u => u.email === data.email)) return { success: false, error: 'Email already exists.' };
  const newUser: User = {
    id: `staff-${Date.now()}`,
    fullName: data.fullName,
    username: data.username,
    email: data.email,
    password: data.password,
    role: 'STAFF',
    department: data.department,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true };
}

export async function apiAddRecord(record: Omit<OvertimeRecord, 'id' | 'createdAt' | 'dateBS' | 'amount' | 'totalMinutes' | 'status'>): Promise<OvertimeRecord> {
  try {
    return await apiRequest<OvertimeRecord>('/api/overtime', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    return addRecord(record);
  }
}

export function addRecord(record: Omit<OvertimeRecord, 'id' | 'createdAt' | 'dateBS' | 'amount' | 'totalMinutes' | 'status'>): OvertimeRecord {
  const records = getRecords();
  const bs = adToBS(parseADString(record.dateAD));
  const amount = getAmountForRecord(record.type, record.department);
  const newRecord: OvertimeRecord = {
    ...record,
    id: `ot-${Date.now()}`,
    dateBS: formatBS(bs),
    amount,
    totalMinutes: calcMinutes(record.startTime, record.endTime),
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  records.unshift(newRecord);
  saveRecords(records);
  return newRecord;
}

export function updateRecord(id: string, updates: Partial<OvertimeRecord>): void {
  const records = getRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return;
  const rec = records[idx];
  const type = updates.type ?? rec.type;
  const department = updates.department ?? rec.department;
  if (updates.type || updates.department) updates.amount = getAmountForRecord(type, department);
  if (updates.startTime || updates.endTime) {
    const st = updates.startTime ?? rec.startTime;
    const et = updates.endTime ?? rec.endTime;
    updates.totalMinutes = calcMinutes(st, et);
  }
  if (updates.dateAD) {
    updates.dateBS = formatBS(adToBS(parseADString(updates.dateAD)));
  }
  records[idx] = { ...rec, ...updates };
  saveRecords(records);
}

export async function apiUpdateRecord(id: string, updates: Partial<OvertimeRecord>): Promise<void> {
  try {
    await apiRequest(`/api/overtime/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    updateRecord(id, updates);
  }
}

export function deleteRecord(id: string): void {
  saveRecords(getRecords().filter(r => r.id !== id));
}

export async function apiDeleteRecord(id: string): Promise<void> {
  try {
    await apiRequest(`/api/overtime/${id}`, { method: 'DELETE' });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    deleteRecord(id);
  }
}

export function verifyRecord(id: string, adminName: string): void {
  updateRecord(id, { status: 'VERIFIED', verifiedAt: new Date().toISOString(), verifiedBy: adminName });
}

export async function apiVerifyRecord(id: string, adminName: string): Promise<void> {
  try {
    await apiRequest(`/api/overtime/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified: true, adminName }),
    });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    verifyRecord(id, adminName);
  }
}

export function unverifyRecord(id: string): void {
  const records = getRecords();
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return;
  records[idx] = { ...records[idx], status: 'PENDING', verifiedAt: undefined, verifiedBy: undefined };
  saveRecords(records);
}

export async function apiUnverifyRecord(id: string): Promise<void> {
  try {
    await apiRequest(`/api/overtime/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified: false }),
    });
  } catch (error) {
    if (!isBackendUnavailable(error)) throw error;
    unverifyRecord(id);
  }
}

export function isRecordLocked(record: OvertimeRecord, role: UserRole): boolean {
  if (role === 'ADMIN') return false;
  const hoursDiff = (Date.now() - new Date(record.createdAt).getTime()) / 3600000;
  return hoursDiff > 12;
}

// Re-calculate all amounts when rates change
export function recalculateAmountsAfterRateChange(): void {
  const records = getRecords();
  const updated = records.map(r => ({
    ...r,
    amount: getAmountForRecord(r.type, r.department),
  }));
  saveRecords(updated);
}
