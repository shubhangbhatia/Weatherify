import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, LogIn, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick evaluation fillers for presentation evaluation
  const fillEvaluationAccount = (role) => {
    if (role === 'admin') {
      setEmail('admin@suratweather.edu');
      setPassword('AdminPassword@2026');
    } else {
      setEmail('viewer@suratweather.edu');
      setPassword('ViewerPassword@2026');
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-navy-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-navy-850 via-navy-950 to-[#03060E]">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-cyan-500 to-electric-500 rounded-2xl shadow-xl shadow-cyan-500/20 mb-4">
            <Compass className="w-8 h-8 text-navy-950 animate-spin-slow" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider">
            SURAT WEATHER INTELLIGENCE
          </h1>
          <p className="text-xs text-cyan-400 font-medium tracking-wide mt-1">
            Real-Time Weather Monitoring & Data Visualization System
          </p>
          <div className="inline-block mt-2 px-3 py-1 bg-navy-850/80 rounded-full border border-navy-800 text-[11px] text-slate-400">
            College Final Project: Data Modeling & Visualization
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-navy-900/80 backdrop-blur-xl border border-navy-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-white">System Access Portal</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sign in to access live station telemetry and analytics</p>
          </div>

          {sessionExpired && (
            <div className="mb-4 p-3 bg-amber-950/50 border border-amber-800/50 rounded-xl text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Your session has expired. Please log in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@suratweather.edu"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-navy-850 border border-navy-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-electric-500 hover:from-cyan-400 hover:to-electric-400 text-navy-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? (
                <span>Authenticating Session...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>

          {/* Quick evaluation accounts for professor / evaluators */}
          <div className="mt-6 pt-5 border-t border-navy-800">
            <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Evaluation Credentials (Click to Autofill)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillEvaluationAccount('admin')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 rounded-lg text-xs text-purple-300 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Admin Eval</span>
              </button>
              <button
                type="button"
                onClick={() => fillEvaluationAccount('viewer')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Viewer Eval</span>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-400">
            Don't have an evaluation account?{' '}
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
