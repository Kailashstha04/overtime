import { useState } from 'react';
import Layout from '../layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { apiUpdateUser } from '../../lib/store';

export default function StaffProfile() {
  const { currentUser, refreshData } = useApp();
  const [form, setForm] = useState({ email: currentUser?.email ?? '', currentPwd: '', newPwd: '', confirmPwd: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(''); setError('');
    if (!currentUser) { setError('User not found.'); return; }
    if (currentUser.password !== form.currentPwd) { setError('Current password is incorrect.'); return; }
    if (form.newPwd) {
      if (form.newPwd.length < 6) { setError('New password must be at least 6 characters.'); return; }
      if (form.newPwd !== form.confirmPwd) { setError('Passwords do not match.'); return; }
    }
    try {
      await apiUpdateUser({ id: currentUser.id, email: form.email, password: form.newPwd || undefined });
      await refreshData();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to update profile.');
      return;
    }
    setMsg('Profile updated successfully.');
    setForm(f => ({ ...f, currentPwd: '', newPwd: '', confirmPwd: '' }));
  };

  return (
    <Layout title="Profile" subtitle="प्रोफाइल">
      <div className="max-w-md mx-auto space-y-4">
        {/* Info card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold">
              {currentUser?.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-slate-800">{currentUser?.fullName}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">STAFF</span>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['Username', currentUser?.username],
              ['Email', currentUser?.email],
              ['Member since', currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-NP') : '—'],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">{label as string}</span>
                <span className="font-medium text-slate-700">{val as string}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Update form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Update Profile</h3>

          {msg && <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">{msg}</div>}
          {error && <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Current Password</label>
              <input
                type="password"
                value={form.currentPwd}
                onChange={e => setForm(f => ({ ...f, currentPwd: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Required to save changes"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">New Password (optional)</label>
              <input
                type="password"
                value={form.newPwd}
                onChange={e => setForm(f => ({ ...f, newPwd: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Leave blank to keep current"
              />
            </div>
            {form.newPwd && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={form.confirmPwd}
                  onChange={e => setForm(f => ({ ...f, confirmPwd: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition mt-1"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
