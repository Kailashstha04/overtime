import Layout from '../layout/Layout';
import { useApp } from '../../contexts/AppContext';

const ACTION_COLORS: Record<string, string> = {
  VERIFY: 'bg-green-100 text-green-700',
  UNVERIFY: 'bg-amber-100 text-amber-700',
  CREATE: 'bg-blue-100 text-blue-700',
  EDIT: 'bg-purple-100 text-purple-700',
  DELETE: 'bg-red-100 text-red-700',
  ACTIVATE: 'bg-teal-100 text-teal-700',
  DEACTIVATE: 'bg-slate-100 text-slate-600',
  EDIT_STAFF: 'bg-indigo-100 text-indigo-700',
};

export default function AuditLog() {
  const { auditLogs } = useApp();

  return (
    <Layout title="Audit Logs" subtitle="अडिट लग">
      <div className="space-y-2">
        {auditLogs.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center text-slate-400 text-sm">No audit logs yet.</div>
        )}
        {auditLogs.map(log => (
          <div key={log.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex items-start gap-3">
            <span className={`shrink-0 text-xs font-semibold px-2 py-1 rounded-md ${ACTION_COLORS[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
              {log.action}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-slate-700">{log.details}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {log.userName} · {new Date(log.createdAt).toLocaleString('en-NP')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
