import { useMemo } from 'react';
import Layout from '../layout/Layout';
import { StatCard, StatusBadge, TypeBadge } from '../shared';
import { useApp } from '../../contexts/AppContext';
import { formatMinutes, getCurrentBS, BS_MONTHS, formatAD } from '../../lib/nepaliDate';

export default function AdminDashboard() {
  const { records, users, navigate } = useApp();
  const currentBS = getCurrentBS();
  const today = formatAD(new Date());

  const todayRecords = useMemo(() => records.filter(r => r.dateAD === today), [records, today]);
  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const [y, m] = r.dateBS.split('-').map(Number);
      return y === currentBS.year && m === currentBS.month;
    });
  }, [records, currentBS]);

  const pending = records.filter(r => r.status === 'PENDING');

  const todayVerified = todayRecords.filter(r => r.status === 'VERIFIED');
  const todayPending = todayRecords.filter(r => r.status === 'PENDING');
  const monthVerified = monthRecords.filter(r => r.status === 'VERIFIED');
  const monthPending = monthRecords.filter(r => r.status === 'PENDING');

  // Per-staff stats for current month
  const staffStats = useMemo(() => {
    const map: Record<string, { name: string; total: number; verified: number; pending: number; hours: number; major: number; inter: number; minor: number }> = {};
    monthRecords.forEach(r => {
      if (!map[r.staffId]) map[r.staffId] = { name: r.staffName, total: 0, verified: 0, pending: 0, hours: 0, major: 0, inter: 0, minor: 0 };
      map[r.staffId].total += r.amount;
      map[r.staffId].hours += r.totalMinutes;
      if (r.status === 'VERIFIED') map[r.staffId].verified += r.amount;
      else map[r.staffId].pending += r.amount;
      if (r.type === 'Major') map[r.staffId].major++;
      else if (r.type === 'Intermediate') map[r.staffId].inter++;
      else map[r.staffId].minor++;
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [monthRecords]);

  return (
    <Layout title="Admin Dashboard" subtitle="ड्यासबोर्ड — व्यवस्थापक">
      {/* Pending alert */}
      {pending.length > 0 && (
        <div
          onClick={() => navigate('all-overtime')}
          className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer flex items-center justify-between hover:bg-amber-100 transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">{pending.length} Pending Verification</p>
              <p className="text-xs text-amber-600 font-devanagari">प्रमाणीकरण बाँकी</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      )}

      {/* Today */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Today's Statistics — आजको</h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="Today's Entries" value={todayRecords.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          color="teal" />
        <StatCard label="Today's OT Hours" value={formatMinutes(todayRecords.reduce((s, r) => s + r.totalMinutes, 0))}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="blue" />
        <StatCard label="Today's Verified" value={todayVerified.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green" />
        <StatCard label="Today's Pending" value={todayPending.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber" />
      </div>

      {/* Month */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        {BS_MONTHS[currentBS.month - 1]} {currentBS.year} — Current Month
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="Total Entries" value={monthRecords.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          color="teal" />
        <StatCard label="Total OT Hours" value={formatMinutes(monthRecords.reduce((s, r) => s + r.totalMinutes, 0))}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="blue" />
        <StatCard label="Verified Amount" value={`Rs. ${monthVerified.reduce((s, r) => s + r.amount, 0).toLocaleString()}`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green" small />
        <StatCard label="Pending Amount" value={`Rs. ${monthPending.reduce((s, r) => s + r.amount, 0).toLocaleString()}`}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber" small />
      </div>

      {/* Staff Stats */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Staff Statistics — कर्मचारी तथ्याङ्क
      </h3>
      {staffStats.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center text-slate-400 text-sm">No records this month</div>
      ) : (
        <div className="space-y-3">
          {staffStats.map(s => (
            <div key={s.name} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <p className="font-semibold text-slate-700 text-sm">{s.name}</p>
                </div>
                <p className="font-bold text-teal-600 text-sm">Rs. {s.total.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-purple-500 font-medium">Major</p>
                  <p className="font-bold text-slate-700">{s.major}</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-blue-500 font-medium">Inter.</p>
                  <p className="font-bold text-slate-700">{s.inter}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-2">
                  <p className="text-slate-500 font-medium">Minor</p>
                  <p className="font-bold text-slate-700">{s.minor}</p>
                </div>
                <div className="bg-teal-50 rounded-lg p-2">
                  <p className="text-teal-500 font-medium">Hours</p>
                  <p className="font-bold text-slate-700">{formatMinutes(s.hours)}</p>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-green-600">Verified: Rs. {s.verified.toLocaleString()}</span>
                <span className="text-amber-600">Pending: Rs. {s.pending.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
