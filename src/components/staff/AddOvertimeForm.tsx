import { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { useApp } from '../../contexts/AppContext';
import { addRecord, updateRecord, getAmountForRecord, OTType, ShiftDuty, Department } from '../../lib/store';
import { addAuditLog } from '../../lib/store';
import { adToBS, bsToAD, formatBS, formatAD, BS_MONTHS, getBSMonthDays, getCurrentBS, calcMinutes, formatMinutes, todayUTC, parseADString } from '../../lib/nepaliDate';

const PROCEDURES = [
  'Laparoscopic Cholecystectomy', 'RIRS', 'ORIF', 'Appendectomy', 'C-Section',
  'Thyroidectomy', 'TURP', 'Knee Replacement', 'Cataract Surgery', 'Tonsillectomy',
  'Hernia Repair', 'Hysterectomy', 'Prostatectomy', 'Hip Replacement', 'Splenectomy',
  'Bowel Resection', 'Mastectomy', 'Nephrectomy',
  // Cleaning procedures
  'OT Room Cleaning', 'Post-Op Cleaning', 'OT Room Sanitization', 'Equipment Cleaning',
  'General OT Cleaning', 'Emergency OT Cleaning',
  'Other',
];

const SHIFTS: ShiftDuty[] = ['7-3', '8-4', '9-5', '10-6', '11-7', 'OFF', 'ONCALL'];

interface FormState {
  dateAD: string;
  bsYear: string;
  bsMonth: string;
  bsDay: string;
  patientName: string;
  procedure: string;
  type: OTType;
  shiftDuty: ShiftDuty;
  startTime: string;
  endTime: string;
  remarks: string;
}

export default function AddOvertimeForm() {
  const { currentUser, navigate, refreshData, editingRecordId, setEditingRecordId, records } = useApp();
  const editing = editingRecordId ? records.find(r => r.id === editingRecordId) : null;
  const currentBS = getCurrentBS();

  const department: Department = (currentUser as any)?.department ?? 'OT Nursing';

  const [form, setForm] = useState<FormState>({
    dateAD: editing?.dateAD ?? formatAD(todayUTC()),
    bsYear: editing ? editing.dateBS.split('-')[0] : String(currentBS.year),
    bsMonth: editing ? editing.dateBS.split('-')[1] : String(currentBS.month),
    bsDay: editing ? editing.dateBS.split('-')[2] : String(currentBS.day),
    patientName: editing?.patientName ?? '',
    procedure: editing?.procedure ?? '',
    type: editing?.type ?? 'Major',
    shiftDuty: editing?.shiftDuty ?? '8-4',
    startTime: editing?.startTime ?? '17:00',
    endTime: editing?.endTime ?? '19:00',
    remarks: editing?.remarks ?? '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [procedureSuggestions, setProcedureSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const totalMinutes = calcMinutes(form.startTime, form.endTime);
  const amount = getAmountForRecord(form.type, department);
  const isOvernightShift = form.endTime && form.startTime && form.endTime <= form.startTime;

  const syncADtoBS = (adStr: string) => {
    if (!adStr) return;
    const bs = adToBS(parseADString(adStr));
    setForm(f => ({ ...f, bsYear: String(bs.year), bsMonth: String(bs.month), bsDay: String(bs.day) }));
  };

  const syncBStoAD = (year: string, month: string, day: string) => {
    const y = parseInt(year), m = parseInt(month), d = parseInt(day);
    if (!y || !m || !d) return;
    const clampedDay = Math.min(d, getBSMonthDays(y, m));
    try {
      setForm(f => ({ ...f, dateAD: formatAD(bsToAD(y, m, clampedDay)), bsDay: String(clampedDay) }));
    } catch {}
  };

  const handleADChange = (val: string) => {
    setForm(f => ({ ...f, dateAD: val }));
    syncADtoBS(val);
  };

  const handleBSChange = (field: 'bsYear' | 'bsMonth' | 'bsDay', val: string) => {
    const next = { ...form, [field]: val };
    setForm(next);
    syncBStoAD(next.bsYear, next.bsMonth, next.bsDay);
  };

  const handleProcedureInput = (val: string) => {
    setForm(f => ({ ...f, procedure: val }));
    if (val.length > 1) {
      setProcedureSuggestions(PROCEDURES.filter(p => p.toLowerCase().includes(val.toLowerCase())));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.patientName.trim()) { setError('Patient name is required.'); return; }
    if (!form.procedure.trim()) { setError('Procedure is required.'); return; }
    if (!form.startTime || !form.endTime) { setError('Start and end time are required.'); return; }

    setLoading(true);
    setTimeout(() => {
      if (editing) {
        updateRecord(editing.id, {
          dateAD: form.dateAD,
          patientName: form.patientName,
          procedure: form.procedure,
          type: form.type,
          shiftDuty: form.shiftDuty,
          startTime: form.startTime,
          endTime: form.endTime,
          remarks: form.remarks,
        });
        addAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'EDIT', recordId: editing.id, details: `Edited overtime: ${form.patientName}` });
        setEditingRecordId(null);
      } else {
        addRecord({
          staffId: currentUser!.id,
          staffName: currentUser!.fullName,
          department,
          dateAD: form.dateAD,
          patientName: form.patientName,
          procedure: form.procedure,
          type: form.type,
          shiftDuty: form.shiftDuty,
          startTime: form.startTime,
          endTime: form.endTime,
          remarks: form.remarks,
        });
        addAuditLog({ userId: currentUser!.id, userName: currentUser!.fullName, action: 'CREATE', details: `Created overtime: ${form.patientName}` });
      }
      refreshData();
      navigate('my-overtime');
      setLoading(false);
    }, 500);
  };

  const bsMonthDays = getBSMonthDays(parseInt(form.bsYear), parseInt(form.bsMonth));
  const bsYears = Array.from({ length: 10 }, (_, i) => 2078 + i);

  return (
    <Layout
      title={editing ? 'Edit Overtime' : 'Add Overtime'}
      subtitle={editing ? 'ओभरटाइम सम्पादन' : 'ओभरटाइम थप्नुहोस्'}
    >
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}

        {/* Department badge */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-teal-50 border border-teal-100">
          <span className="text-lg">{department === 'OT Nursing' ? '🏥' : '🧹'}</span>
          <div>
            <p className="text-xs text-teal-600 font-semibold">{department}</p>
            <p className="text-xs text-teal-500">Rates apply based on your department</p>
          </div>
        </div>

        {/* Date Section */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Date — <span className="font-devanagari text-slate-400">मिति</span>
          </p>
          <div className="mb-3">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">English Date (AD)</label>
            <input
              type="date"
              value={form.dateAD}
              onChange={e => handleADChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Nepali Date (BS) — <span className="font-devanagari">बि.सं.</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <select value={form.bsYear} onChange={e => handleBSChange('bsYear', e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {bsYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={form.bsMonth} onChange={e => handleBSChange('bsMonth', e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {BS_MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
              <select value={form.bsDay} onChange={e => handleBSChange('bsDay', e.target.value)}
                className="px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                {Array.from({ length: bsMonthDays }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 font-devanagari">
              {form.bsYear} {BS_MONTHS[parseInt(form.bsMonth) - 1]} {form.bsDay} ↔ {form.dateAD}
            </p>
          </div>
        </div>

        {/* Patient & Procedure */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-700">
            Patient Details — <span className="font-devanagari text-slate-400">बिरामीको विवरण</span>
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Patient Name — <span className="font-devanagari">बिरामीको नाम</span>
            </label>
            <input
              type="text"
              value={form.patientName}
              onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Patient full name"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Procedure — <span className="font-devanagari">प्रक्रिया</span>
            </label>
            <input
              type="text"
              value={form.procedure}
              onChange={e => handleProcedureInput(e.target.value)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="e.g. Laparoscopic Cholecystectomy"
            />
            {showSuggestions && procedureSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {procedureSuggestions.map(p => (
                  <button key={p} type="button"
                    onClick={() => { setForm(f => ({ ...f, procedure: p })); setShowSuggestions(false); }}
                    className="w-full text-left px-3.5 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Type */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Case Type — <span className="font-devanagari text-slate-400">प्रकार</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['Major', 'Intermediate', 'Minor'] as OTType[]).map(t => (
              <button key={t} type="button"
                onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`py-3 rounded-lg text-sm font-medium border transition ${form.type === t ? 'bg-teal-600 text-white border-teal-600 shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-teal-50'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Shift */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            Shift Duty — <span className="font-devanagari text-slate-400">शिफ्ट</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {SHIFTS.map(s => (
              <button key={s} type="button"
                onClick={() => setForm(f => ({ ...f, shiftDuty: s }))}
                className={`py-2.5 rounded-lg text-xs font-semibold border transition ${form.shiftDuty === s ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-teal-50'} ${(s === 'OFF' || s === 'ONCALL') ? 'col-span-2' : ''}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Time */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-slate-700 mb-3">
            OT Time — <span className="font-devanagari text-slate-400">समय</span>
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div className="mt-3 p-3 rounded-lg bg-teal-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-teal-600 font-medium">Total OT (auto-calculated)</p>
              {isOvernightShift && <p className="text-xs text-teal-500">Overnight shift</p>}
            </div>
            <p className="text-lg font-bold text-teal-700">{formatMinutes(totalMinutes)}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Type: <span className="font-semibold text-slate-700">{form.type}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Dept: <span className="font-semibold text-slate-700">{department}</span></p>
              <p className="text-xs text-slate-500 mt-0.5">Duration: <span className="font-semibold text-slate-700">{formatMinutes(totalMinutes)}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Amount — <span className="font-devanagari">रकम</span></p>
              <p className="text-2xl font-bold text-teal-600">Rs. {amount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <label className="block text-xs font-medium text-slate-500 mb-1.5">
            Remarks (optional) — <span className="font-devanagari">कैफियत</span>
          </label>
          <textarea
            value={form.remarks}
            onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            placeholder="Optional notes..."
          />
        </div>

        <div className="flex gap-3 pb-4">
          <button type="button"
            onClick={() => { setEditingRecordId(null); navigate('my-overtime'); }}
            className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition disabled:opacity-60 shadow-md">
            {loading ? 'Saving...' : editing ? 'Save Changes' : 'Submit Overtime'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
