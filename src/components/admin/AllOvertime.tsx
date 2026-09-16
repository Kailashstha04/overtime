import { useMemo, useState } from 'react';
import Layout from '../layout/Layout';
import { StatusBadge, TypeBadge, EmptyState, ConfirmDialog } from '../shared';
import { useApp } from '../../contexts/AppContext';
import { apiVerifyRecord, apiUnverifyRecord, apiDeleteRecord, apiAddAuditLog } from '../../lib/store';
import { formatMinutes, BS_MONTHS, getCurrentBS } from '../../lib/nepaliDate';

export default function AllOvertime() {
  const { currentUser, records, users, navigate, refreshData, setEditingRecordId } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStaff, setFilterStaff] = useState('');
  const [filterBSMonth, setFilterBSMonth] = useState('');
  const [filterBSYear, setFilterBSYear] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const currentBS = getCurrentBS();
  const bsYears = Array.from({ length: 6 }, (_, i) => 2080 + i);

  const filtered = useMemo(() => {
    let rs = [...records];
    if (search) {
      const q = search.toLowerCase();
      rs = rs.filter(r =>
        r.patientName.toLowerCase().includes(q) ||
        r.procedure.toLowerCase().includes(q) ||
        r.staffName.toLowerCase().includes(q)
      );
    }
    if (filterStatus) rs = rs.filter(r => r.status === filterStatus);
    if (filterType) rs = rs.filter(r => r.type === filterType);
    if (filterStaff) rs = rs.filter(r => r.staffId === filterStaff);
    if (filterBSMonth || filterBSYear) {
      rs = rs.filter(r => {
        const [y, m] = r.dateBS.split('-').map(Number);
        if (filterBSYear && y !== parseInt(filterBSYear)) return false;
        if (filterBSMonth && m !== parseInt(filterBSMonth)) return false;
        return true;
      });
    }
    if (filterDept) rs = rs.filter(r => r.department === filterDept);
    return rs;
  }, [records, search, filterStatus, filterType, filterStaff, filterBSMonth, filterBSYear]);

  const handleVerify = async (id: string) => {
    await apiVerifyRecord(id, currentUser!.fullName);
    await apiAddAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'VERIFY', recordId: id, details: 'Verified overtime record' });
    await refreshData();
  };

  const handleUnverify = async (id: string) => {
    await apiUnverifyRecord(id);
    await apiAddAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'UNVERIFY', recordId: id, details: 'Unverified overtime record' });
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    await apiDeleteRecord(id);
    await apiAddAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'DELETE', recordId: id, details: 'Deleted overtime record' });
    await refreshData();
    setDeleteId(null);
  };

  const handleEdit = (id: string) => {
    setEditingRecordId(id);
    navigate('add-overtime');
  };

  const totalVerified = filtered.filter(r => r.status === 'VERIFIED').reduce((s, r) => s + r.amount, 0);
  const totalPending = filtered.filter(r => r.status === 'PENDING').reduce((s, r) => s + r.amount, 0);

  return (
    <Layout
      title="All Overtime"
      subtitle="सबै ओभरटाइम रेकर्ड"
      action={
        <button
          onClick={() => { setEditingRecordId(null); navigate('add-overtime'); }}
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

      {/* Filters */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search staff, patient, procedure..."
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select value={filterBSYear} onChange={e => setFilterBSYear(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
            <option value="">All Years</option>
            {bsYears.map(y => <option key={y} value={y}>{y} BS</option>)}
          </select>
          <select value={filterBSMonth} onChange={e => setFilterBSMonth(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
            <option value="">All Months</option>
            {BS_MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
          </select>
          <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm">
            <option value="">All Staff</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm col-span-2">
            <option value="">All Departments</option>
            <option value="OT Nursing">🏥 OT Nursing</option>
            <option value="Cleaning">🧹 Cleaning</option>
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-white rounded-lg p-3 border border-slate-100 shadow-sm text-center">
          <p className="text-xs text-slate-500">Records</p>
          <p className="font-bold text-slate-700">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-green-100 shadow-sm text-center">
          <p className="text-xs text-green-600">Verified</p>
          <p className="font-bold text-green-700 text-xs">Rs. {totalVerified.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-amber-100 shadow-sm text-center">
          <p className="text-xs text-amber-600">Pending</p>
          <p className="font-bold text-amber-700 text-xs">Rs. {totalPending.toLocaleString()}</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No overtime records found." />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">{r.staffName}</p>
                    <p className="text-xs text-slate-500">{r.patientName} · {r.procedure}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={r.status} />
                    <TypeBadge type={r.type} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 border-t border-slate-50 pt-2 mb-2">
                  <div><p className="text-slate-400">Date BS</p><p className="font-medium text-slate-600">{r.dateBS}</p></div>
                  <div><p className="text-slate-400">OT</p><p className="font-medium text-slate-600">{formatMinutes(r.totalMinutes)}</p></div>
                  <div><p className="text-slate-400">Amount</p><p className="font-bold text-teal-600">Rs. {r.amount.toLocaleString()}</p></div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {r.status === 'PENDING' ? (
                    <button onClick={() => handleVerify(r.id)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition">
                      ✓ Verify
                    </button>
                  ) : (
                    <button onClick={() => handleUnverify(r.id)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
                      Unverify
                    </button>
                  )}
                  <button onClick={() => handleEdit(r.id)} className="flex-1 py-2 rounded-lg text-xs font-semibold bg-teal-50 text-teal-600 hover:bg-teal-100 transition">
                    Edit
                  </button>
                  <button onClick={() => setDeleteId(r.id)} className="py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-500 hover:bg-red-100 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Staff', 'Date BS', 'Date AD', 'Patient', 'Procedure', 'Type', 'Shift', 'Start', 'End', 'OT Hours', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-3 font-medium text-slate-700 whitespace-nowrap">{r.staffName}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{r.dateBS}</td>
                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{r.dateAD}</td>
                    <td className="px-3 py-3 text-slate-600">{r.patientName}</td>
                    <td className="px-3 py-3 text-slate-500 max-w-xs truncate">{r.procedure}</td>
                    <td className="px-3 py-3"><TypeBadge type={r.type} /></td>
                    <td className="px-3 py-3 text-slate-500">{r.shiftDuty}</td>
                    <td className="px-3 py-3 text-slate-500">{r.startTime}</td>
                    <td className="px-3 py-3 text-slate-500">{r.endTime}</td>
                    <td className="px-3 py-3 text-slate-600">{formatMinutes(r.totalMinutes)}</td>
                    <td className="px-3 py-3 font-semibold text-teal-600">Rs. {r.amount.toLocaleString()}</td>
                    <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        {r.status === 'PENDING' ? (
                          <button onClick={() => handleVerify(r.id)} className="p-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition text-xs font-medium px-2.5">Verify</button>
                        ) : (
                          <button onClick={() => handleUnverify(r.id)} className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition text-xs font-medium px-2">Unverify</button>
                        )}
                        <button onClick={() => handleEdit(r.id)} className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => setDeleteId(r.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
