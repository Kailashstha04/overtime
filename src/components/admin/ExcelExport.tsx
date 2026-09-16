import { useState } from 'react';
import Layout from '../layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { BS_MONTHS, getCurrentBS, formatMinutes } from '../../lib/nepaliDate';

export default function ExcelExport() {
  const { records, users } = useApp();
  const currentBS = getCurrentBS();
  const [selYear, setSelYear] = useState(String(currentBS.year));
  const [selMonth, setSelMonth] = useState(String(currentBS.month));
  const [selStaff, setSelStaff] = useState('');
  const [loading, setLoading] = useState(false);
  const bsYears = Array.from({ length: 6 }, (_, i) => 2080 + i);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      let filtered = records.filter(r => {
        const [y, m] = r.dateBS.split('-').map(Number);
        return y === parseInt(selYear) && m === parseInt(selMonth);
      });
      if (selStaff) filtered = filtered.filter(r => r.staffId === selStaff);

      // Sort by staff name
      filtered = [...filtered].sort((a, b) => a.staffName.localeCompare(b.staffName));

      const header = ['SN', 'Staff Name', 'Username', 'Date BS', 'Date AD', 'Patient Name', 'Procedure', 'Type', 'Shift Duty', 'OT Start', 'OT End', 'Total OT Hours', 'Rate', 'Amount', 'Status', 'Remarks'];
      const rows = [header.join(',')];

      let sn = 1;
      filtered.forEach(r => {
        rows.push([
          sn++,
          `"${r.staffName}"`,
          users.find(u => u.id === r.staffId)?.username ?? '',
          r.dateBS, r.dateAD,
          `"${r.patientName}"`,
          `"${r.procedure}"`,
          r.type, r.shiftDuty, r.startTime, r.endTime,
          formatMinutes(r.totalMinutes),
          r.amount, r.amount,
          r.status,
          `"${r.remarks}"`,
        ].join(','));
      });

      // Summary
      rows.push('');
      rows.push(`MONTHLY TOTAL: Rs. ${filtered.reduce((s, r) => s + r.amount, 0).toLocaleString()}`);
      rows.push(`Major Cases: ${filtered.filter(r => r.type === 'Major').length}`);
      rows.push(`Intermediate Cases: ${filtered.filter(r => r.type === 'Intermediate').length}`);
      rows.push(`Minor Cases: ${filtered.filter(r => r.type === 'Minor').length}`);
      rows.push(`Verified: Rs. ${filtered.filter(r => r.status === 'VERIFIED').reduce((s, r) => s + r.amount, 0).toLocaleString()}`);
      rows.push(`Pending: Rs. ${filtered.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0).toLocaleString()}`);

      const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Smart_Overtime_${selYear}_${BS_MONTHS[parseInt(selMonth) - 1]}${selStaff ? '_' + (users.find(u => u.id === selStaff)?.fullName ?? '') : ''}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setLoading(false);
    }, 600);
  };

  const filtered = records.filter(r => {
    const [y, m] = r.dateBS.split('-').map(Number);
    return y === parseInt(selYear) && m === parseInt(selMonth) && (!selStaff || r.staffId === selStaff);
  });

  return (
    <Layout title="Excel Export" subtitle="एक्सेल निर्यात">
      <div className="max-w-md mx-auto space-y-4">
        {/* Config */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Export Options — निर्यात विकल्प</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Year (BS)</label>
              <select value={selYear} onChange={e => setSelYear(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm">
                {bsYears.map(y => <option key={y} value={y}>{y} BS</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Month (BS)</label>
              <select value={selMonth} onChange={e => setSelMonth(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm">
                {BS_MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Staff (optional)</label>
              <select value={selStaff} onChange={e => setSelStaff(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm">
                <option value="">All Staff</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Period</span>
              <span className="font-medium text-slate-700">{BS_MONTHS[parseInt(selMonth) - 1]} {selYear} BS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Staff</span>
              <span className="font-medium text-slate-700">{selStaff ? (users.find(u => u.id === selStaff)?.fullName ?? '—') : 'All Staff'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Records</span>
              <span className="font-bold text-slate-700">{filtered.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-bold text-teal-600">Rs. {filtered.reduce((s, r) => s + r.amount, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Filename preview */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 mb-1">Filename</p>
          <p className="text-sm font-mono text-slate-700 break-all">
            Smart_Overtime_{selYear}_{BS_MONTHS[parseInt(selMonth) - 1]}{selStaff ? `_${users.find(u => u.id === selStaff)?.fullName ?? ''}` : ''}.csv
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={loading || filtered.length === 0}
          className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition disabled:opacity-60 shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Report
            </>
          )}
        </button>

        {filtered.length === 0 && (
          <p className="text-center text-xs text-slate-400">No records found for selected period.</p>
        )}
      </div>
    </Layout>
  );
}
