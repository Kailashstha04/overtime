import { useMemo, useState } from 'react';
import Layout from '../layout/Layout';
import { TypeBadge, StatusBadge } from '../shared';
import { useApp } from '../../contexts/AppContext';
import { BS_MONTHS, getCurrentBS, formatMinutes } from '../../lib/nepaliDate';

export default function MonthlyReport() {
  const { records, users } = useApp();
  const currentBS = getCurrentBS();
  const [selYear, setSelYear] = useState(String(currentBS.year));
  const [selMonth, setSelMonth] = useState(String(currentBS.month));
  const bsYears = Array.from({ length: 6 }, (_, i) => 2080 + i);

  const monthRecords = useMemo(() => {
    return records.filter(r => {
      const [y, m] = r.dateBS.split('-').map(Number);
      return y === parseInt(selYear) && m === parseInt(selMonth);
    });
  }, [records, selYear, selMonth]);

  // Group by staff, sorted alphabetically
  const staffGroups = useMemo(() => {
    const map: Record<string, { name: string; recs: typeof monthRecords }> = {};
    monthRecords.forEach(r => {
      if (!map[r.staffId]) map[r.staffId] = { name: r.staffName, recs: [] };
      map[r.staffId].recs.push(r);
    });
    return Object.values(map).sort((a, b) => a.name.localeCompare(b.name));
  }, [monthRecords]);

  const monthTotal = {
    cases: monthRecords.length,
    major: monthRecords.filter(r => r.type === 'Major').length,
    inter: monthRecords.filter(r => r.type === 'Intermediate').length,
    minor: monthRecords.filter(r => r.type === 'Minor').length,
    hours: monthRecords.reduce((s, r) => s + r.totalMinutes, 0),
    verified: monthRecords.filter(r => r.status === 'VERIFIED').reduce((s, r) => s + r.amount, 0),
    pending: monthRecords.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0),
    total: monthRecords.reduce((s, r) => s + r.amount, 0),
  };

  const handleExport = () => {
    const rows: string[] = [];
    rows.push(`SMART OVERTIME — Monthly Report — ${BS_MONTHS[parseInt(selMonth) - 1]} ${selYear}`);
    rows.push('');
    rows.push('SN,Staff Name,Date BS,Date AD,Patient,Procedure,Type,Shift,Start,End,OT Hours,Amount,Status,Remarks');
    let sn = 1;
    staffGroups.forEach(({ name, recs }) => {
      rows.push(`\n--- ${name.toUpperCase()} ---`);
      recs.forEach(r => {
        rows.push([sn++, r.staffName, r.dateBS, r.dateAD, r.patientName, r.procedure, r.type, r.shiftDuty, r.startTime, r.endTime, formatMinutes(r.totalMinutes), r.amount, r.status, r.remarks].join(','));
      });
      const rVerified = recs.filter(x => x.status === 'VERIFIED').reduce((s, x) => s + x.amount, 0);
      const rPending = recs.filter(x => x.status === 'PENDING').reduce((s, x) => s + x.amount, 0);
      rows.push(`,,,,,,,,,,Total,${recs.reduce((s, x) => s + x.amount, 0)},,`);
    });
    rows.push('');
    rows.push(`MONTHLY TOTAL,,,,,,,,,,${monthTotal.total},,`);
    rows.push(`Total Cases: ${monthTotal.cases}`);
    rows.push(`Verified Amount: Rs. ${monthTotal.verified.toLocaleString()}`);
    rows.push(`Pending Amount: Rs. ${monthTotal.pending.toLocaleString()}`);

    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Overtime_${selYear}_${BS_MONTHS[parseInt(selMonth) - 1]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout
      title="Monthly Report"
      subtitle="मासिक रिपोर्ट"
      action={
        <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium shadow-sm hover:bg-teal-700 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      }
    >
      {/* Month selector */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        <select value={selYear} onChange={e => setSelYear(e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm">
          {bsYears.map(y => <option key={y} value={y}>{y} BS</option>)}
        </select>
        <select value={selMonth} onChange={e => setSelMonth(e.target.value)} className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm">
          {BS_MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {/* Report Header */}
      <div className="bg-teal-600 rounded-xl p-5 text-center text-white mb-5">
        <h2 className="text-lg font-bold">SMART OVERTIME</h2>
        <p className="text-teal-100 text-sm">Monthly Overtime Report</p>
        <p className="text-white font-semibold mt-1">{BS_MONTHS[parseInt(selMonth) - 1]} {selYear} BS</p>
      </div>

      {/* Monthly totals */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Monthly Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-center text-xs">
          {[
            ['Total Staff', staffGroups.length, 'text-slate-700'],
            ['Total Cases', monthTotal.cases, 'text-slate-700'],
            ['Major', monthTotal.major, 'text-purple-600'],
            ['Intermediate', monthTotal.inter, 'text-blue-600'],
            ['Minor', monthTotal.minor, 'text-slate-600'],
            ['Total OT Hours', formatMinutes(monthTotal.hours), 'text-teal-600'],
          ].map(([label, val, cls]) => (
            <div key={label as string} className="bg-slate-50 rounded-lg p-2.5">
              <p className="text-slate-400 text-xs">{label as string}</p>
              <p className={`font-bold text-sm ${cls as string}`}>{val as string | number}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-green-50 rounded-lg p-2.5">
            <p className="text-green-500">Verified</p>
            <p className="font-bold text-green-700">Rs. {monthTotal.verified.toLocaleString()}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-2.5">
            <p className="text-amber-500">Pending</p>
            <p className="font-bold text-amber-700">Rs. {monthTotal.pending.toLocaleString()}</p>
          </div>
          <div className="bg-teal-50 rounded-lg p-2.5">
            <p className="text-teal-500">Grand Total</p>
            <p className="font-bold text-teal-700">Rs. {monthTotal.total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Staff breakdown */}
      {staffGroups.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-slate-400 text-sm">No overtime records found for this month.</div>
      ) : (
        <div className="space-y-4">
          {staffGroups.map(({ name, recs }) => {
            const staffVerified = recs.filter(r => r.status === 'VERIFIED').reduce((s, r) => s + r.amount, 0);
            const staffPending = recs.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);
            const staffMajor = recs.filter(r => r.type === 'Major').length;
            const staffInter = recs.filter(r => r.type === 'Intermediate').length;
            const staffMinor = recs.filter(r => r.type === 'Minor').length;
            const staffHours = recs.reduce((s, r) => s + r.totalMinutes, 0);

            return (
              <div key={name} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Staff header */}
                <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-500 flex items-center justify-center text-white text-sm font-bold">{name.charAt(0)}</div>
                    <span className="font-bold text-white text-sm">{name.toUpperCase()}</span>
                  </div>
                  <span className="text-teal-300 text-sm font-semibold">Rs. {(staffVerified + staffPending).toLocaleString()}</span>
                </div>

                {/* Staff stats */}
                <div className="px-4 py-3 grid grid-cols-4 gap-2 text-xs text-center border-b border-slate-50">
                  <div><p className="text-purple-500">Major</p><p className="font-bold text-slate-700">{staffMajor}</p></div>
                  <div><p className="text-blue-500">Intermediate</p><p className="font-bold text-slate-700">{staffInter}</p></div>
                  <div><p className="text-slate-400">Minor</p><p className="font-bold text-slate-700">{staffMinor}</p></div>
                  <div><p className="text-teal-500">OT Hours</p><p className="font-bold text-slate-700">{formatMinutes(staffHours)}</p></div>
                </div>

                {/* Records */}
                <div className="divide-y divide-slate-50">
                  {recs.map((r, i) => (
                    <div key={r.id} className="px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-300 w-4">{i + 1}.</span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-700 truncate">{r.patientName}</p>
                          <p className="text-slate-400 truncate">{r.procedure} · {r.dateBS} · {formatMinutes(r.totalMinutes)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TypeBadge type={r.type} />
                        <StatusBadge status={r.status} />
                        <span className="font-bold text-teal-600">Rs. {r.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Staff total */}
                <div className="px-4 py-3 bg-slate-50 flex justify-between text-xs">
                  <span className="text-green-600 font-medium">Verified: Rs. {staffVerified.toLocaleString()}</span>
                  <span className="text-amber-600 font-medium">Pending: Rs. {staffPending.toLocaleString()}</span>
                  <span className="text-teal-700 font-bold">Total: Rs. {(staffVerified + staffPending).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
