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
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  const data = await response.json();
  return data as T;
}

export async function apiGetRateSettings(): Promise<RateSettings> {
  try {
    return await apiRequest<RateSettings>('/api/admin/settings');
  } catch {
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

const SEED_STAFF: User[] = [
  {
    id: 'staff-001',
    fullName: 'Ramesh Sharma',
    username: 'ramesh.sharma',
    email: 'ramesh.sharma@hospital.np',
    password: 'ram123',
    role: 'STAFF',
    department: 'OT Nursing',
    isActive: true,
    createdAt: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'staff-002',
    fullName: 'Sita Gurung',
    username: 'sita.gurung',
    email: 'sita.gurung@hospital.np',
    password: 'sita456',
    role: 'STAFF',
    department: 'OT Nursing',
    isActive: true,
    createdAt: '2026-04-10T09:00:00.000Z',
  },
  {
    id: 'staff-003',
    fullName: 'Dipak Thapa',
    username: 'dipak.thapa',
    email: 'dipak.thapa@hospital.np',
    password: 'dipak789',
    role: 'STAFF',
    department: 'Cleaning',
    isActive: true,
    createdAt: '2026-05-01T08:00:00.000Z',
  },
];

function makeRecord(
  id: string,
  staffId: string,
  staffName: string,
  department: Department,
  dateAD: string,
  patientName: string,
  procedure: string,
  type: OTType,
  shift: ShiftDuty,
  start: string,
  end: string,
  status: OTStatus,
  createdDaysAgo: number,
  remarks = ''
): OvertimeRecord {
  const dateBS = formatBS(adToBS(parseADString(dateAD)));
  const totalMinutes = calcMinutes(start, end);
  const rates = DEFAULT_RATES;
  const amount = department === 'Cleaning' ? rates.cleaning[type] : rates.otNursing[type];
  const createdAt = new Date(Date.now() - createdDaysAgo * 86400000).toISOString();
  return {
    id, staffId, staffName, department, dateAD, dateBS,
    patientName, procedure, type, shiftDuty: shift,
    startTime: start, endTime: end, totalMinutes, amount,
    remarks, status, createdAt,
    verifiedAt: status === 'VERIFIED' ? new Date(Date.now() - (createdDaysAgo - 1) * 86400000).toISOString() : undefined,
    verifiedBy: status === 'VERIFIED' ? 'System Administrator' : undefined,
  };
}

const SEED_RECORDS: OvertimeRecord[] = [
  makeRecord('ot-001', 'staff-001', 'Ramesh Sharma', 'OT Nursing', '2026-09-01', 'Kumar Rai', 'Laparoscopic Cholecystectomy', 'Major', '8-4', '17:00', '21:00', 'VERIFIED', 15),
  makeRecord('ot-002', 'staff-001', 'Ramesh Sharma', 'OT Nursing', '2026-09-03', 'Asha Tamang', 'RIRS', 'Major', 'ONCALL', '22:00', '02:00', 'VERIFIED', 13),
  makeRecord('ot-003', 'staff-001', 'Ramesh Sharma', 'OT Nursing', '2026-09-07', 'Bikash Lama', 'Appendectomy', 'Intermediate', '7-3', '18:00', '21:30', 'VERIFIED', 9),
  makeRecord('ot-004', 'staff-001', 'Ramesh Sharma', 'OT Nursing', '2026-09-10', 'Sarita Magar', 'ORIF Femur', 'Major', 'ONCALL', '20:00', '23:30', 'PENDING', 6),
  makeRecord('ot-005', 'staff-001', 'Ramesh Sharma', 'OT Nursing', '2026-09-14', 'Gopal Shrestha', 'Hernia Repair', 'Minor', '9-5', '12:00', '14:00', 'PENDING', 2),
  makeRecord('ot-006', 'staff-002', 'Sita Gurung', 'OT Nursing', '2026-09-02', 'Rupa Karki', 'Thyroidectomy', 'Major', '10-6', '16:00', '20:00', 'VERIFIED', 14),
  makeRecord('ot-007', 'staff-002', 'Sita Gurung', 'OT Nursing', '2026-09-05', 'Mohan Poudel', 'Cataract Surgery', 'Minor', '7-3', '08:00', '10:00', 'VERIFIED', 11),
  makeRecord('ot-008', 'staff-002', 'Sita Gurung', 'OT Nursing', '2026-09-09', 'Laxmi Bhattarai', 'C-Section', 'Intermediate', 'ONCALL', '23:00', '02:30', 'VERIFIED', 7),
  makeRecord('ot-009', 'staff-002', 'Sita Gurung', 'OT Nursing', '2026-09-13', 'Nabin KC', 'Tonsillectomy', 'Minor', '11-7', '10:00', '12:00', 'PENDING', 3),
  makeRecord('ot-010', 'staff-003', 'Dipak Thapa', 'Cleaning', '2026-09-04', 'Sunita Giri', 'OT Room Cleaning', 'Minor', '7-3', '17:00', '20:30', 'VERIFIED', 12),
  makeRecord('ot-011', 'staff-003', 'Dipak Thapa', 'Cleaning', '2026-09-08', 'Arjun Yadav', 'Post-Op Cleaning', 'Minor', '8-4', '09:00', '11:00', 'VERIFIED', 8),
  makeRecord('ot-012', 'staff-003', 'Dipak Thapa', 'Cleaning', '2026-09-15', 'Priya Shah', 'OT Room Sanitization', 'Minor', '7-3', '18:30', '21:00', 'PENDING', 1),
];

const SEED_AUDIT: AuditLog[] = [
  { id: 'audit-001', userId: 'admin-001', userName: 'System Administrator', action: 'VERIFY', recordId: 'ot-001', details: 'Verified overtime record for Ramesh Sharma', createdAt: new Date(Date.now() - 14 * 86400000).toISOString() },
  { id: 'audit-002', userId: 'admin-001', userName: 'System Administrator', action: 'VERIFY', recordId: 'ot-002', details: 'Verified overtime record for Ramesh Sharma', createdAt: new Date(Date.now() - 12 * 86400000).toISOString() },
  { id: 'audit-003', userId: 'admin-001', userName: 'System Administrator', action: 'VERIFY', recordId: 'ot-006', details: 'Verified overtime record for Sita Gurung', createdAt: new Date(Date.now() - 13 * 86400000).toISOString() },
];

function initStore() {
  if (!localStorage.getItem('so_initialized_v2')) {
    localStorage.setItem('so_users', JSON.stringify(SEED_STAFF));
    localStorage.setItem('so_records', JSON.stringify(SEED_RECORDS));
    localStorage.setItem('so_audit', JSON.stringify(SEED_AUDIT));
    localStorage.setItem('so_initialized_v2', 'true');
    // clear old init flag
    localStorage.removeItem('so_initialized');
  }
}

export async function apiGetUsers(): Promise<User[]> {
  try {
    return await apiRequest<User[]>('/api/admin/staff');
  } catch {
    return getUsers();
  }
}

export async function apiUpdateUser(updates: Partial<User> & { id: string }): Promise<User> {
  try {
    return await apiRequest<User>('/api/admin/staff', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  } catch {
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
  } catch {
    return getRecords();
  }
}

export async function apiGetAuditLogs(): Promise<AuditLog[]> {
  try {
    return await apiRequest<AuditLog[]>('/api/admin/audit');
  } catch {
    return getAuditLogs();
  }
}

export async function apiAddAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<void> {
  try {
    await apiRequest('/api/admin/audit', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  } catch {
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
  } catch {
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
  } catch {
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
  } catch {
    updateRecord(id, updates);
  }
}

export function deleteRecord(id: string): void {
  saveRecords(getRecords().filter(r => r.id !== id));
}

export async function apiDeleteRecord(id: string): Promise<void> {
  try {
    await apiRequest(`/api/overtime/${id}`, { method: 'DELETE' });
  } catch {
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
  } catch {
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
  } catch {
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
