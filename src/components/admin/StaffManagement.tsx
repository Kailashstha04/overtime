import { useMemo, useState } from 'react';
import Layout from '../layout/Layout';
import { EmptyState } from '../shared';
import { useApp } from '../../contexts/AppContext';
import { apiUpdateUser, apiDeleteUser, apiAddAuditLog } from '../../lib/store';

export default function StaffManagement() {
  const { currentUser, users, records, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ fullName: '', email: '', newPassword: '' });
  const [msg, setMsg] = useState('');

  const [filterDept, setFilterDept] = useState('');

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      if (u.role !== 'STAFF') return false;
      const matchSearch = u.fullName.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchDept = !filterDept || (u as any).department === filterDept;
      return matchSearch && matchDept;
    });
  }, [users, search, filterDept]);

  const getUserStats = (userId: string) => {
    const userRecords = records.filter(r => r.staffId === userId);
    return {
      total: userRecords.length,
      verified: userRecords.filter(r => r.status === 'VERIFIED').length,
      amount: userRecords.filter(r => r.status === 'VERIFIED').reduce((s, r) => s + r.amount, 0),
    };
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    await apiUpdateUser({ id: userId, isActive: !currentActive });
    await apiAddAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: currentActive ? 'DEACTIVATE' : 'ACTIVATE', recordId: userId, details: `${currentActive ? 'Deactivated' : 'Activated'} staff account` });
    await refreshData();
  };

  const handleDelete = async (userId: string, fullName: string) => {
    const confirmed = window.confirm(`Delete ${fullName}'s account? This will permanently remove their overtime records.`);
    if (!confirmed) return;
    try {
      await apiDeleteUser(userId);
      await apiAddAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'DELETE_STAFF', recordId: userId, details: `Deleted staff account: ${fullName}` });
      await refreshData();
      setMsg('Staff account deleted successfully.');
    } catch (error) {
      setMsg(error instanceof Error ? error.message : 'Unable to delete staff account.');
    }
  };

  const startEdit = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    setEditUser(userId);
    setEditForm({ fullName: user.fullName, email: user.email, newPassword: '' });
    setMsg('');
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    await apiUpdateUser({ id: editUser, fullName: editForm.fullName, email: editForm.email, password: editForm.newPassword || undefined });
    await apiAddAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'EDIT_STAFF', recordId: editUser, details: `Edited staff account: ${editForm.fullName}` });
    await refreshData();
    setEditUser(null);
    setMsg('Staff updated successfully.');
  };

  return (
    <Layout title="Staff Management" subtitle="कर्मचारी व्यवस्थापन">
      {msg && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{msg}</div>}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-slate-800 mb-4">Edit Staff</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                <input type="text" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">New Password (optional)</label>
                <input type="password" value={editForm.newPassword} onChange={e => setEditForm(f => ({ ...f, newPassword: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Leave blank to keep current" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-2.5 rounded-lg bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search staff by name, username, email..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        <div className="flex gap-2">
          {['', 'OT Nursing', 'Cleaning'].map(dept => (
            <button key={dept} onClick={() => setFilterDept(dept)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition ${filterDept === dept ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
              {dept === '' ? 'All Depts' : dept === 'OT Nursing' ? '🏥 OT Nursing' : '🧹 Cleaning'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-500">Total Staff</p>
          <p className="font-bold text-slate-700">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-100 shadow-sm text-center">
          <p className="text-xs text-green-600">Active</p>
          <p className="font-bold text-green-700">{users.filter(u => u.isActive).length}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-500">Inactive</p>
          <p className="font-bold text-slate-500">{users.filter(u => !u.isActive).length}</p>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState message="No staff members found." />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => {
            const stats = getUserStats(user.id);
            return (
              <div key={user.id} className={`bg-white rounded-xl border shadow-sm p-4 ${!user.isActive ? 'border-slate-200 opacity-60' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.isActive ? 'bg-teal-600' : 'bg-slate-400'}`}>
                      {user.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700 text-sm">{user.fullName}</p>
                      <p className="text-xs text-slate-400">@{user.username}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs">{(user as any).department === 'Cleaning' ? '🧹' : '🏥'}</span>
                        <span className="text-xs text-teal-600 font-medium">{(user as any).department ?? 'OT Nursing'}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Total OT</p>
                    <p className="font-bold text-slate-700">{stats.total}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400">Verified</p>
                    <p className="font-bold text-slate-700">{stats.verified}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-teal-500">Earnings</p>
                    <p className="font-bold text-teal-600">Rs. {stats.amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(user.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${user.isActive ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.fullName)}
                    className="py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition"
                    title="Delete staff account"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Joined: {new Date(user.createdAt).toLocaleDateString('en-NP')}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
