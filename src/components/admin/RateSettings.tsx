import { useEffect, useState } from 'react';
import Layout from '../layout/Layout';
import { getRateSettings, apiGetRateSettings, apiSaveRateSettings } from '../../lib/store';
import type { RateSettings } from '../../lib/store';
import { useApp } from '../../contexts/AppContext';

export default function RateSettings() {
  const { refreshData } = useApp();
  const [rates, setRates] = useState<RateSettings>(getRateSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiGetRateSettings().then(setRates).catch(() => undefined);
  }, []);

  const handleSave = async () => {
    await apiSaveRateSettings(rates);
    await refreshData();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateOTNursing = (type: 'Major' | 'Intermediate' | 'Minor', val: string) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 0) return;
    setRates(r => ({ ...r, otNursing: { ...r.otNursing, [type]: n } }));
  };

  const updateCleaning = (type: 'Major' | 'Intermediate' | 'Minor', val: string) => {
    const n = parseInt(val);
    if (isNaN(n) || n < 0) return;
    setRates(r => ({ ...r, cleaning: { ...r.cleaning, [type]: n } }));
  };

  return (
    <Layout title="Rate Settings" subtitle="दर सेटिङ — Admin Only">
      <div className="max-w-lg mx-auto space-y-5">
        {saved && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
            Rates saved and all records recalculated successfully.
          </div>
        )}

        {/* Warning */}
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-700">
            Changing rates will recalculate amounts for <strong>all existing records</strong>. This affects both verified and pending records.
          </p>
        </div>

        {/* OT Nursing */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-teal-600 flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <div>
              <p className="font-bold text-white text-sm">OT Nursing</p>
              <p className="text-teal-100 text-xs">Overtime rates for OT Nursing staff</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {(['Major', 'Intermediate', 'Minor'] as const).map(type => (
              <div key={type} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${type === 'Major' ? 'bg-purple-500' : type === 'Intermediate' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{type}</p>
                    <p className="text-xs text-slate-400 font-devanagari">{type === 'Major' ? 'मेजर' : type === 'Intermediate' ? 'इन्टरमिडिएट' : 'माइनर'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={rates.otNursing[type]}
                    onChange={e => updateOTNursing(type, e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cleaning */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-slate-700 flex items-center gap-2">
            <span className="text-xl">🧹</span>
            <div>
              <p className="font-bold text-white text-sm">Cleaning</p>
              <p className="text-slate-300 text-xs">Overtime rates for Cleaning staff</p>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {(['Major', 'Intermediate', 'Minor'] as const).map(type => (
              <div key={type} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${type === 'Major' ? 'bg-purple-500' : type === 'Intermediate' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{type}</p>
                    <p className="text-xs text-slate-400 font-devanagari">{type === 'Major' ? 'मेजर' : type === 'Intermediate' ? 'इन्टरमिडिएट' : 'माइनर'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500 font-medium">Rs.</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={rates.cleaning[type]}
                    onChange={e => updateCleaning(type, e.target.value)}
                    className="w-24 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 text-right"
                  />
                </div>
              </div>
            ))}
            <p className="text-xs text-slate-400 pt-1 border-t border-slate-50">
              Current default: Rs. {rates.cleaning.Major} per case for all types
            </p>
          </div>
        </div>

        {/* Rate preview */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Rate Preview</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-slate-500">Type</th>
                  <th className="text-right py-2 text-teal-600">OT Nursing</th>
                  <th className="text-right py-2 text-slate-600">Cleaning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(['Major', 'Intermediate', 'Minor'] as const).map(type => (
                  <tr key={type}>
                    <td className="py-2 font-medium text-slate-700">{type}</td>
                    <td className="py-2 text-right font-bold text-teal-600">Rs. {rates.otNursing[type].toLocaleString()}</td>
                    <td className="py-2 text-right font-bold text-slate-600">Rs. {rates.cleaning[type].toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Save Rate Changes
        </button>
      </div>
    </Layout>
  );
}
