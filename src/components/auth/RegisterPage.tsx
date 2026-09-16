import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { registerUser, Department } from '../../lib/store';

export default function RegisterPage() {
  const { navigate } = useApp();
  const [form, setForm] = useState({
    fullName: '', username: '', email: '', password: '', confirm: '',
    department: 'OT Nursing' as Department,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = registerUser({
        fullName: form.fullName,
        username: form.username,
        email: form.email,
        password: form.password,
        department: form.department,
      });
      if (result.success) setSuccess(true);
      else setError(result.error ?? 'Registration failed.');
      setLoading(false);
    }, 400);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #134e4a 100%)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Registration Successful!</h2>
          <p className="text-slate-500 text-sm mb-1">Your account has been created.</p>
          <p className="text-xs text-teal-600 font-medium mb-6">Department: {form.department}</p>
          <button onClick={() => navigate('login')} className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition">
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8" style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 40%, #134e4a 100%)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Smart Overtime</h1>
          <p className="text-teal-200 text-sm">Staff Registration</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-7">
          <h2 className="text-lg font-semibold text-slate-800 mb-5">Create Staff Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name</label>
              <input type="text" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ramesh Sharma" required />
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Department — <span className="font-devanagari text-slate-400">विभाग</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['OT Nursing', 'Cleaning'] as Department[]).map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, department: dept }))}
                    className={`py-3 rounded-lg text-sm font-medium border transition text-left px-3 ${form.department === dept ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-teal-300'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{dept === 'OT Nursing' ? '🏥' : '🧹'}</span>
                      <div>
                        <p className="font-semibold leading-none">{dept}</p>
                        <p className={`text-xs mt-0.5 ${form.department === dept ? 'text-teal-100' : 'text-slate-400'}`}>
                          {dept === 'OT Nursing' ? 'OT Staff' : 'Cleaning Staff'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Username', key: 'username', type: 'text', placeholder: 'ramesh.sharma' },
              { label: 'Email', key: 'email', type: 'email', placeholder: 'ramesh@hospital.np' },
              { label: 'Password', key: 'password', type: 'password', placeholder: 'Min. 6 characters' },
              { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: 'Repeat password' },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={(form as any)[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={placeholder}
                  required
                />
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition disabled:opacity-60 shadow-md">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button onClick={() => navigate('login')} className="text-sm text-teal-600 hover:text-teal-700 font-medium">
              Already have an account? Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
