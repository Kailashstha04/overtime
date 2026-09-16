import { useMemo, useState } from 'react';
import Layout from '../layout/Layout';
import { StatusBadge, TypeBadge, EmptyState, ConfirmDialog } from '../shared';
import { useApp } from '../../contexts/AppContext';
import { deleteRecord, isRecordLocked, addAuditLog } from '../../lib/store';
import { formatMinutes, getCurrentBS, BS_MONTHS } from '../../lib/nepaliDate';

export default function MyOvertime() {
  const { currentUser, records, navigate, refreshData, setEditingRecordId } = useApp();
  const currentBS = getCurrentBS();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selYear, setSelYear] = useState(String(currentBS.year));
  const [selMonth, setSelMonth] = useState(String(currentBS.month));
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const bsYears = Array.from({ length: 6 }, (_, i) => 2080 + i);

  const myRecords = useMemo(() => {
    let rs = records.filter(r => {
      if (r.staffId !== currentUser?.id) return false;
      const [y, m] = r.dateBS.split('-').map(Number);
      if (y !== parseInt(selYear)) return false;
      if (m !== parseInt(selMonth)) return false;
      return true;
    });
    if (search) rs = rs.filter(r =>
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.procedure.toLowerCase().includes(search.toLowerCase())
    );
    if (filterStatus) rs = rs.filter(r => r.status === filterStatus);
    if (filterType) rs = rs.filter(r => r.type === filterType);
    return rs;
  }, [records, currentUser, selYear, selMonth, search, filterStatus, filterType]);

  const handleDelete = (id: string) => {
    deleteRecord(id);
    addAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'DELETE', recordId: id, details: 'Deleted overtime record' });
    refreshData();
    setDeleteId(null);
  };

  const handleEdit = (id: string) => {
    setEditingRecordId(id);
    navigate('add-overtime');
  };

  const totalAmount = myRecords.reduce((s, r) => s + r.amount, 0);
  const verifiedAmount = myRecords.filter(r => r.status === 'VERIFIED').reduce((s, r) => s + r.amount, 0);
  const pendingAmount = myRecords.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);

  return (
    <Layout
      title="My Overtime"
      subtitle="ओभरटाइम — मेरो रेकर्ड"
      action={
        <button
          onClick={() => navigate('add-overtime')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white text-sm font-medium shadow-sm hover:bg-teal-700 transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add OT
        </button>
      }
    >
      {deleteId && (
        <ConfirmDialog
          message="Are you sure you want to delete this overtime record?"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Month selector */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <select value={selYear} onChange={e => setSelYear(e.target.value)}
          className="flex-1 py-1 text-sm border-0 bg-transparent focus:outline-none text-slate-700 font-medium">
          {bsYears.map(y => <option key={y} value={y}>{y} BS</option>)}
        </select>
        <select value={selMonth} onChange={e => setSelMonth(e.target.value)}
          className="flex-1 py-1 text-sm border-0 bg-transparent focus:outline-none text-slate-700 font-medium">
          {BS_MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
        </select>
      </div>

      {/* Earnings summary */}
      {myRecords.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white rounded-xl border border-green-100 shadow-sm p-3 text-center">
            <p className="text-xs text-green-500">Verified</p>
            <p className="font-bold text-green-700 text-sm">Rs. {verifiedAmount.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 shadow-sm p-3 text-center">
            <p className="text-xs text-amber-500">Pending</p>
            <p className="font-bold text-amber-700 text-sm">Rs. {pendingAmount.toLocaleString()}</p>
          </div>
          <div className="bg-teal-600 rounded-xl shadow-sm p-3 text-center">
            <p className="text-xs text-teal-100">Total</p>
            <p className="font-bold text-white text-sm">Rs. {totalAmount.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search patient or procedure..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        <div className="flex gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none">
            <option value="">All Types</option>
            <option value="Major">Major</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Minor">Minor</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">{myRecords.length} record{myRecords.length !== 1 ? 's' : ''} in {BS_MONTHS[parseInt(selMonth) - 1]} {selYear}</p>
      </div>

      {myRecords.length === 0 ? (
        <EmptyState message={`No overtime records found for ${BS_MONTHS[parseInt(selMonth) - 1]} ${selYear}.`} />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {myRecords.map(r => {
              const locked = isRecordLocked(r, currentUser!.role);
              return (
                <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-700 text-sm truncate">{r.patientName}</p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{r.procedure}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <StatusBadge status={r.status} />
                      <TypeBadge type={r.type} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs border-t border-slate-50 pt-2 mb-2">
                    <div>
                      <p className="text-slate-400">Date BS</p>
                      <p className="font-medium text-slate-600">{r.dateBS}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">OT</p>
                      <p className="font-medium text-slate-600">{formatMinutes(r.totalMinutes)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Amount</p>
                      <p className="font-bold text-teal-600">Rs. {r.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Shift: {r.shiftDuty} · {r.startTime}–{r.endTime}</span>
                  </div>
                  {locked ? (
                    <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                      <span>🔒</span>
                      <span>Locked — contact administrator for changes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(r.id)}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 transition">
                        Edit
                      </button>
                      {r.status === 'PENDING' && (
                        <button onClick={() => setDeleteId(r.id)}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition">
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Date BS', 'Date AD', 'Patient', 'Procedure', 'Type', 'Shift', 'Start', 'End', 'OT Hours', 'Amount', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myRecords.map(r => {
                  const locked = isRecordLocked(r, currentUser!.role);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.dateBS}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{r.dateAD}</td>
                      <td className="px-4 py-3 font-medium text-slate-700">{r.patientName}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{r.procedure}</td>
                      <td className="px-4 py-3"><TypeBadge type={r.type} /></td>
                      <td className="px-4 py-3 text-slate-500">{r.shiftDuty}</td>
                      <td className="px-4 py-3 text-slate-500">{r.startTime}</td>
                      <td className="px-4 py-3 text-slate-500">{r.endTime}</td>
                      <td className="px-4 py-3 text-slate-600">{formatMinutes(r.totalMinutes)}</td>
                      <td className="px-4 py-3 font-semibold text-teal-600">Rs. {r.amount.toLocaleString()}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        {locked ? (
                          <span className="text-slate-300 text-sm">🔒</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(r.id)} className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            {r.status === 'PENDING' && (
                              <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
