import { useMemo } from 'react';
import Layout from '../layout/Layout';
import { StatCard, StatusBadge, TypeBadge } from '../shared';
import { useApp } from '../../contexts/AppContext';
import { getRateSettings, Department } from '../../lib/store';
import { getCurrentBS, BS_MONTHS, formatMinutes } from '../../lib/nepaliDate';

export default function StaffDashboard() {
  const { currentUser, records, navigate } = useApp();
  const currentBS = getCurrentBS();

  const department: Department = (currentUser as any)?.department ?? 'OT Nursing';
  const rates = getRateSettings();
  const deptRates = department === 'Cleaning' ? rates.cleaning : rates.otNursing;

  const myRecords = useMemo(() => records.filter(r => r.staffId === currentUser?.id), [records, currentUser]);

  const thisMonthRecords = useMemo(() => {
    return myRecords.filter(r => {
      const parts = r.dateBS.split('-').map(Number);
      return parts[0] === currentBS.year && parts[1] === currentBS.month;
    });
  }, [myRecords, currentBS]);

  const verified = thisMonthRecords.filter(r => r.status === 'VERIFIED');
  const pending = thisMonthRecords.filter(r => r.status === 'PENDING');

  const calcEarnings = (recs: typeof myRecords) => ({
    major: recs.filter(r => r.type === 'Major').length,
    intermediate: recs.filter(r => r.type === 'Intermediate').length,
    minor: recs.filter(r => r.type === 'Minor').length,
    total: recs.reduce((s, r) => s + r.amount, 0),
  });

  const verifiedEarnings = calcEarnings(verified);
  const pendingEarnings = calcEarnings(pending);
  const totalMinutes = thisMonthRecords.reduce((s, r) => s + r.totalMinutes, 0);

  const recentRecords = myRecords.slice(0, 5);

  return (
    <Layout
      title="Dashboard"
      subtitle={`ड्यासबोर्ड — ${currentBS.year} ${BS_MONTHS[currentBS.month - 1]}`}
    >
      {/* Welcome */}
      <div className="mb-5 p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)' }}>
        <p className="text-teal-100 text-sm">Welcome back,</p>
        <p className="text-white font-bold text-lg">{currentUser?.fullName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-base">{(currentUser as any)?.department === 'Cleaning' ? '🧹' : '🏥'}</span>
          <span className="text-teal-100 text-xs">{(currentUser as any)?.department ?? 'OT Nursing'}</span>
          <span className="text-teal-300 text-xs">·</span>
          <span className="text-teal-200 text-xs font-devanagari">{currentBS.year} {BS_MONTHS[currentBS.month - 1]}</span>
        </div>
      </div>

      {/* Month Stats */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Current Month — {BS_MONTHS[currentBS.month - 1]} {currentBS.year}
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          label="Total Entries"
          value={thisMonthRecords.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          color="teal"
        />
        <StatCard
          label="Total OT Hours"
          value={formatMinutes(totalMinutes)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="blue"
        />
        <StatCard
          label="Verified"
          value={verified.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="green"
        />
        <StatCard
          label="Pending"
          value={pending.length}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          color="amber"
        />
      </div>

      {/* Earnings */}
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
        Earnings — रकम
      </h3>
      <div className="space-y-3 mb-5">
        {/* Verified earnings */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-slate-700">Verified Earnings</span>
            </div>
            <span className="text-base font-bold text-green-600">Rs. {verifiedEarnings.total.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {([['Major', verifiedEarnings.major, 1000], ['Intermediate', verifiedEarnings.intermediate, 800], ['Minor', verifiedEarnings.minor, 500]] as [string, number, number][]).map(([type, count, rate]) => (
              <div key={type} className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-500">{type}</p>
                <p className="font-bold text-slate-700">{count}</p>
                <p className="text-xs text-slate-400">Rs. {(count * rate).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pending earnings */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-sm font-semibold text-slate-700">Pending Earnings</span>
            </div>
            <span className="text-base font-bold text-amber-600">Rs. {pendingEarnings.total.toLocaleString()}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {([['Major', pendingEarnings.major, 1000], ['Intermediate', pendingEarnings.intermediate, 800], ['Minor', pendingEarnings.minor, 500]] as [string, number, number][]).map(([type, count, rate]) => (
              <div key={type} className="bg-slate-50 rounded-lg p-2">
                <p className="text-xs text-slate-500">{type}</p>
                <p className="font-bold text-slate-700">{count}</p>
                <p className="text-xs text-slate-400">Rs. {(count * rate).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-teal-600 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-xs">Total Potential Earnings</p>
            <p className="text-white text-xs font-devanagari mt-0.5">कुल अनुमानित रकम</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">Rs. {(verifiedEarnings.total + pendingEarnings.total).toLocaleString()}</p>
            <p className="text-teal-200 text-xs">{thisMonthRecords.length} cases</p>
          </div>
        </div>
      </div>

      {/* Rates reference */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span>{department === 'Cleaning' ? '🧹' : '🏥'}</span>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your OT Rates — दर</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {([['Major', 'मेजर'], ['Intermediate', 'इन्टरमिडिएट'], ['Minor', 'माइनर']] as [keyof typeof deptRates, string][]).map(([type, np]) => (
            <div key={type} className="rounded-lg bg-slate-50 p-2.5">
              <p className="text-xs font-medium text-slate-600">{type}</p>
              <p className="text-xs font-devanagari text-slate-400">{np}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">Rs. {deptRates[type].toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent records */}
      {recentRecords.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Records</h3>
            <button onClick={() => navigate('my-overtime')} className="text-xs text-teal-600 font-medium">View all →</button>
          </div>
          <div className="space-y-2">
            {recentRecords.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{r.patientName}</p>
                  <p className="text-xs text-slate-400 truncate">{r.procedure} · {r.dateBS}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={r.status} />
                  <span className="text-sm font-bold text-slate-700">Rs. {r.amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}
