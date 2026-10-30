import React, { useState, useEffect } from 'react';
import { adminApi, weatherApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  Database,
  Trash2,
  Activity,
  Server,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function AdminPanel() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modals
  const [deleteUserModal, setDeleteUserModal] = useState(null); // { id, email }
  const [deleteRecordModal, setDeleteRecordModal] = useState(null); // { id }
  const [deleteRecordInputId, setDeleteRecordInputId] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers(),
        adminApi.getLogs({ page: 1, limit: 15 })
      ]);
      setStats(statsRes.data.systemMetrics);
      setUsers(usersRes.data.data);
      setLogs(logsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
      setErrorMessage(err.response?.data?.message || 'Access denied or server error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const confirmDeleteUser = async () => {
    if (!deleteUserModal) return;
    try {
      const res = await adminApi.deleteUser(deleteUserModal.id);
      setActionMessage(res.data.message);
      setDeleteUserModal(null);
      fetchAdminData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const confirmDeleteWeatherRecord = async () => {
    const idToDelete = deleteRecordModal?.id || deleteRecordInputId;
    if (!idToDelete) return;

    try {
      const res = await adminApi.deleteRecord(idToDelete);
      setActionMessage(res.data.message);
      setDeleteRecordModal(null);
      setDeleteRecordInputId('');
      fetchAdminData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to delete weather record.');
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-navy-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-500/10 rounded-lg border border-purple-500/30 text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              System Administration & Audit Console
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Role-Based Authorization Enforcement, User Governance & Meteorological Record Pruning
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono">
          Admin Session: {currentUser?.email}
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">×</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white">×</button>
        </div>
      )}

      {/* SYSTEM METRICS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Registered Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalUsers ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active System Accounts</span>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Weather Records</span>
            <Database className="w-4 h-4 text-electric-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats?.totalRecords ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">MySQL Rows Persisted</span>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Last Sync Telemetry</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400 truncate">
            {stats?.lastObservationTemp ? `${stats.lastObservationTemp}°C, ${stats.lastObservationCondition}` : 'Active'}
          </p>
          <span className="text-[10px] font-mono text-slate-400 mt-1 block truncate">
            {stats?.lastCollectionTime || 'Automated node-cron 10-min active'}
          </span>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Backend Server</span>
            <Server className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-white">Online ({stats?.serverUptimeSeconds}s)</p>
          <span className="text-[11px] text-purple-400 mt-1 block font-mono">
            Node.js / Express / MySQL 8.0
          </span>
        </div>
      </div>

      {/* USER MANAGEMENT & RECORD DELETION GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Management Table (8 cols) */}
        <div className="lg:col-span-8 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                User Accounts & Access Permissions
              </h3>
              <p className="text-xs text-slate-400">Manage registered viewers and system administrators</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">User</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Registered</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800 text-slate-300">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-navy-850/50 transition">
                      <td className="py-3 px-3 font-semibold text-white">{u.full_name}</td>
                      <td className="py-3 px-3 font-mono text-cyan-400">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-purple-950 border border-purple-500/30 text-purple-300'
                              : 'bg-navy-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isSelf ? (
                          <span className="text-[10px] text-slate-500 font-mono">Current Session</span>
                        ) : (
                          <button
                            onClick={() => setDeleteUserModal({ id: u.id, email: u.email })}
                            className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-950/60 rounded-lg transition"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Record Pruning Card (4 cols) */}
        <div className="lg:col-span-4 bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Database className="w-4 h-4 text-rose-400" />
              Administrative Record Pruning
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Delete erroneous or outlier meteorological observations by Record ID
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                  Weather Record ID
                </label>
                <input
                  type="number"
                  value={deleteRecordInputId}
                  onChange={(e) => setDeleteRecordInputId(e.target.value)}
                  placeholder="e.g. 42"
                  className="w-full px-3 py-2 bg-navy-850 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
              </div>

              <button
                type="button"
                onClick={confirmDeleteWeatherRecord}
                disabled={!deleteRecordInputId}
                className="w-full py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-xl transition disabled:opacity-40"
              >
                Delete Specific Observation
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-navy-800 text-[11px] text-slate-400">
            All deletions are logged permanently into <code className="text-cyan-400">system_logs</code> table with administrator identity for compliance.
          </div>
        </div>
      </div>

      {/* SYSTEM AUDIT TRAIL LOGS */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              System Activity & Security Audit Logs (system_logs)
            </h3>
            <p className="text-xs text-slate-400">Chronological audit trail of all logins, syncs, exports, and administrative events</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-850 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Log ID</th>
                <th className="py-2.5 px-3">Timestamp (IST)</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 rounded-r-lg">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-300">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-navy-850/50 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-500">#{l.id}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400">
                    {new Date(l.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-navy-800 border border-navy-700 text-slate-200 font-mono text-[11px]">
                      {l.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-md truncate">{l.description}</td>
                  <td className="py-2.5 px-3 text-slate-400">{l.user_email || 'System Daemon'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL: DELETE USER */}
      {deleteUserModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-rose-500/30 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white">Delete User Account?</h4>
            <p className="text-xs text-slate-400 mt-1">
              Are you sure you want to delete <span className="text-rose-300 font-mono">{deleteUserModal.email}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setDeleteUserModal(null)}
                className="px-4 py-2 bg-navy-800 hover:bg-navy-750 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
