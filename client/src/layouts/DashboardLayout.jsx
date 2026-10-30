import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CloudSun,
  LineChart,
  BarChart3,
  Database,
  ShieldAlert,
  LogOut,
  RefreshCw,
  MapPin,
  Clock,
  User,
  Menu,
  X,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { weatherApi } from '../services/api';

export default function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastUpdate, setLastUpdate] = useState(null);
  const [globalWarning, setGlobalWarning] = useState(null);

  // Live IST Clock (Asia/Kolkata)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGlobalRefresh = async () => {
    try {
      setRefreshing(true);
      setGlobalWarning(null);
      const res = await weatherApi.refreshCurrent();
      if (res.data?.data) {
        setLastUpdate(new Date());
        if (res.data.warning) {
          setGlobalWarning(res.data.warning);
        }
      }
      // Broadcast refresh event so active views re-fetch stats
      window.dispatchEvent(new CustomEvent('weather-refreshed'));
    } catch (err) {
      console.error('Refresh failed:', err);
      setGlobalWarning(err.response?.data?.message || 'Refresh error occurred.');
    } finally {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Live Weather', to: '/live', icon: CloudSun },
    { name: 'Historical Analytics', to: '/analytics', icon: LineChart },
    { name: 'Power BI Dashboard', to: '/powerbi', icon: BarChart3 },
    { name: 'Weather Records', to: '/records', icon: Database },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Admin Panel', to: '/admin', icon: ShieldAlert });
  }

  // Format time for Surat (IST)
  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="flex h-screen bg-navy-950 text-slate-100 overflow-hidden font-sans">
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-900 border-r border-navy-800 shrink-0 z-20">
        {/* Brand Header */}
        <div className="p-6 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-500 to-electric-500 rounded-xl shadow-lg shadow-cyan-500/20 text-navy-950 font-black">
              <Compass className="w-6 h-6 text-navy-950 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-wider text-white">
                SURAT WEATHER
              </h1>
              <p className="text-[10px] font-semibold text-cyan-400 tracking-widest uppercase">
                Intelligence System
              </p>
            </div>
          </div>
          <div className="mt-3 px-2 py-1 bg-navy-850 rounded border border-navy-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Station Online
            </span>
            <span className="font-mono text-[10px] text-cyan-400">21.17°N 72.83°E</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-electric-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-navy-800 bg-navy-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-850 border border-navy-800">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-electric-500 flex items-center justify-center font-bold text-navy-950 text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Active User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    isAdmin
                      ? 'bg-purple-900/40 text-purple-300 border border-purple-500/30'
                      : 'bg-cyan-900/40 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {user?.role || 'viewer'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-16 bg-navy-900/90 backdrop-blur-md border-b border-navy-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-10">
          {/* Mobile menu trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-navy-850 border border-navy-700 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Location Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-navy-850 rounded-lg border border-navy-800">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">Surat, Gujarat</span>
                <span className="hidden sm:inline text-slate-400 text-[11px] ml-1.5">(IN)</span>
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live IST Clock */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-navy-850 rounded-lg border border-navy-800 text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-300 font-mono font-medium">{formattedTime} IST</span>
              <span className="text-slate-500 font-normal">| {formattedDate}</span>
            </div>

            {/* Manual Sync / Refresh Button */}
            <button
              onClick={handleGlobalRefresh}
              disabled={refreshing}
              title="Refresh live meteorological observation"
              className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold transition-all shadow-sm shadow-cyan-500/10 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Updating...' : 'Sync Telemetry'}</span>
            </button>

            {/* Role indicator pill */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-[11px] text-slate-300 truncate max-w-[120px]">
                {user?.full_name || user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Global Warning Banner (if API rate limited or offline fallback used) */}
        {globalWarning && (
          <div className="bg-amber-950/80 border-b border-amber-800/80 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{globalWarning}</span>
            </div>
            <button
              onClick={() => setGlobalWarning(null)}
              className="text-amber-400 hover:text-white px-2 py-0.5 rounded"
            >
              ×
            </button>
          </div>
        )}

        {/* MOBILE SLIDE-OUT MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-navy-950/90 backdrop-blur-md flex flex-col p-6">
            <div className="flex items-center justify-between pb-6 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <Compass className="w-6 h-6 text-cyan-400" />
                <span className="font-bold text-white tracking-wider">SURAT WEATHER</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-navy-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-2 flex-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium ${
                      isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-300 hover:bg-navy-850'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </div>
            <div className="pt-4 border-t border-navy-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-950/50 text-rose-300 border border-rose-900/50"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        )}

        {/* OUTLET VIEW BODY */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-navy-950 via-navy-950 to-navy-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
