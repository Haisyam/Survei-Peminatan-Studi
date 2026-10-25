"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  KeyRound,
  LogOut,
  Download,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  School,
  GraduationCap,
  HelpCircle,
  Search,
  Filter,
  BarChart3,
  Users,
  Calendar,
  MapPin,
  RefreshCw,
  X,
  FileSpreadsheet,
} from "lucide-react";

interface SurveyItem {
  id: number;
  school_name: string;
  school_city: string;
  grade_level: string;
  age_group: string;
  gender: string | null;
  intention: string;
  target_degree: string;
  target_time: string;
  considered_program: string | null;
  target_region: string;
  fields_of_study: string[];
  funding_source: string;
  obstacles: string[];
  info_sources: string[];
  needs_counseling: string;
  consent: number;
  created_at: string;
}

interface StatsData {
  total: number;
  byIntention: Record<string, number>;
  byDegree: Record<string, number>;
  byTime: Record<string, number>;
  byRegion: Record<string, number>;
  byGrade: Record<string, number>;
  byAge: Record<string, number>;
  byCounseling: Record<string, number>;
  byFunding: Record<string, number>;
  byFieldOfStudy: Record<string, number>;
  byObstacles: Record<string, number>;
  byInfoSources: Record<string, number>;
}

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Data state
  const [surveys, setSurveys] = useState<SurveyItem[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDegree, setFilterDegree] = useState("all");
  const [selectedDetail, setSelectedDetail] = useState<SurveyItem | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "responses">("overview");

  // Mount state
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    document.title = "Portal Admin Survei - Universitas Majalengka";
  }, []);

  // Check login status on mount using clean 200 session endpoint
  const checkAuthAndLoad = useCallback(async () => {
    try {
      setDataLoading(true);
      const sessionRes = await fetch("/api/admin/session");
      if (!sessionRes.ok) {
        setIsAuthenticated(false);
        return;
      }

      const sessionData = await sessionRes.json();
      if (!sessionData.authenticated) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      const [statsRes, listRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/responses"),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (listRes.ok) {
        const listData = await listRes.json();
        setSurveys(listData.surveys || []);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      checkAuthAndLoad();
    }
  }, [isMounted, checkAuthAndLoad]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      setIsAuthenticated(true);
      checkAuthAndLoad();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("Gagal login.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAuthenticated(false);
    setSurveys([]);
    setStats(null);
    setLoginForm({ username: "", password: "" });
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data responden ini?")) return;

    try {
      const res = await fetch(`/api/admin/responses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSurveys((prev) => prev.filter((s) => s.id !== id));
        if (selectedDetail?.id === id) setSelectedDetail(null);
        checkAuthAndLoad();
      } else {
        alert("Gagal menghapus data.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  // Filtered surveys
  const filteredSurveys = surveys.filter((s) => {
    const matchSearch =
      s.school_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.school_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.considered_program && s.considered_program.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchDegree = filterDegree === "all" || s.target_degree === filterDegree;
    return matchSearch && matchDegree;
  });

  // Loading initial state before mount or session check
  if (!isMounted || isAuthenticated === null) {
    return (
      <div suppressHydrationWarning className="min-h-screen flex items-center justify-center bg-slate-50">
        <div suppressHydrationWarning className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-slate-500 text-sm">Memuat portal admin...</p>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div suppressHydrationWarning className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 via-white to-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 p-8"
        >
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-16 h-16 mb-3">
              <Image
                src="https://unma.ac.id/wp-content/uploads/2023/03/Logo-Universitas-Majalengka.png"
                alt="Logo UNMA"
                width={64}
                height={64}
                priority
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/logo-unma.png";
                }}
              />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-0.5 rounded-full mb-1">
              Portal Khusus Admin
            </span>
            <h1 className="text-xl font-extrabold text-slate-900">
              Universitas Majalengka
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi &amp; Manajemen Data Survei Peminatan Studi
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, username: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm((p) => ({ ...p, password: e.target.value }))
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Masuk ke Portal Admin
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <a
              href="/"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              &larr; Kembali ke Formulir Publik
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD
  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#f8faff] text-slate-900 pb-16">
      {/* Top Navbar - Clean, uncrowded on mobile */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Left */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0">
              <Image
                src="https://unma.ac.id/wp-content/uploads/2023/03/Logo-Universitas-Majalengka.png"
                alt="Logo UNMA"
                width={36}
                height={36}
                priority
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/logo-unma.png";
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <h1 className="font-bold text-slate-900 text-xs sm:text-base leading-tight truncate">
                  Universitas Majalengka
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Admin
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 leading-none truncate hidden sm:block mt-0.5">
                Pusat Rekapitulasi Survei Peminatan Studi
              </p>
            </div>
          </div>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <a
              href="/api/admin/export"
              title="Ekspor Data ke CSV"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Ekspor CSV</span>
            </a>

            <button
              onClick={checkAuthAndLoad}
              title="Segarkan Data"
              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={handleLogout}
              title="Keluar dari Admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mt-4 sm:mt-6">
        {/* Metric Cards - 2 Columns on Mobile, 4 Columns on Large Screens */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-6">
          {/* Card 1: Total Responden */}
          <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">
                Total Responden
              </p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-50 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-blue-700 leading-tight">
                {stats?.total ?? 0}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-400 block truncate mt-0.5 sm:mt-1">
                Tersimpan di SQLite
              </span>
            </div>
          </div>

          {/* Card 2: Minat Kuliah (Ya) */}
          <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">
                Minat Kuliah (Ya)
              </p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-emerald-600 leading-tight">
                {stats?.byIntention["Ya"] ?? 0}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-400 block truncate mt-0.5 sm:mt-1">
                {stats?.total
                  ? `${Math.round(((stats.byIntention["Ya"] || 0) / stats.total) * 100)}% dari total`
                  : "0%"}
              </span>
            </div>
          </div>

          {/* Card 3: Peminat Jenjang S1 */}
          <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">
                Peminat S1
              </p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-indigo-50 text-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <School className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-indigo-600 leading-tight">
                {stats?.byDegree["S1"] ?? 0}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-400 block truncate mt-0.5 sm:mt-1">
                {stats?.total
                  ? `${Math.round(((stats.byDegree["S1"] || 0) / stats.total) * 100)}% dari total`
                  : "0%"}
              </span>
            </div>
          </div>

          {/* Card 4: Butuh Konsultasi */}
          <div className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">
                Konsultasi
              </p>
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-amber-50 text-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-amber-600 leading-tight">
                {(stats?.byCounseling["Ya"] ?? 0) + (stats?.byCounseling["Mungkin"] ?? 0)}
              </p>
              <span className="text-[10px] sm:text-xs text-slate-400 block truncate mt-0.5 sm:mt-1">
                Perlu tindak lanjut
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Ringkasan Statistik
          </button>
          <button
            onClick={() => setActiveTab("responses")}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "responses"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Data Responden ({filteredSurveys.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === "overview" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bidang Studi Terfavorit */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  Bidang Studi yang Paling Diminati
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.byFieldOfStudy)
                    .sort((a, b) => b[1] - a[1])
                    .map(([field, count]) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={field}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700">{field}</span>
                            <span className="text-slate-500">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(stats.byFieldOfStudy).length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Belum ada data respons
                    </p>
                  )}
                </div>
              </div>

              {/* Kendala Terbesar Siswa */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Kendala &amp; Pertimbangan Utama Siswa
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.byObstacles)
                    .sort((a, b) => b[1] - a[1])
                    .map(([obs, count]) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={obs}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700">{obs}</span>
                            <span className="text-slate-500">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(stats.byObstacles).length === 0 && (
                    <p className="text-xs text-slate-400 py-4 text-center">
                      Belum ada data respons
                    </p>
                  )}
                </div>
              </div>

              {/* Minat Jenjang */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800 mb-3">
                  Peminatan Jenjang Pendidikan
                </h3>
                <div className="space-y-2">
                  {Object.entries(stats.byDegree).map(([degree, count]) => {
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={degree} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0 text-xs">
                        <span className="font-medium text-slate-700">{degree}</span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {count} siswa ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sumber Informasi */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="font-bold text-sm text-slate-800 mb-3">
                  Sumber Informasi yang Digunakan Siswa
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.byInfoSources)
                    .sort((a, b) => b[1] - a[1])
                    .map(([src, count]) => {
                      const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={src}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-700">{src}</span>
                            <span className="text-slate-500">{count}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA RESPONSES TABLE */}
        {activeTab === "responses" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari sekolah, kota, atau prodi..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-blue-600"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                  value={filterDegree}
                  onChange={(e) => setFilterDegree(e.target.value)}
                >
                  <option value="all">Semua Jenjang</option>
                  <option value="S1">S1</option>
                  <option value="D3">D3</option>
                  <option value="D4/Sarjana Terapan">D4/Sarjana Terapan</option>
                  <option value="Belum menentukan">Belum menentukan</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Nama Sekolah</th>
                    <th className="py-3 px-4">Kab/Kota</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Minat</th>
                    <th className="py-3 px-4">Jenjang</th>
                    <th className="py-3 px-4">Bidang Studi</th>
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSurveys.map((s, idx) => (
                    <tr
                      key={s.id}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-[180px] truncate">
                        {s.school_name}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{s.school_city}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-700">
                          {s.grade_level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            s.intention === "Ya"
                              ? "bg-emerald-100 text-emerald-800"
                              : s.intention === "Masih mempertimbangkan"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.intention}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-blue-700">
                        {s.target_degree}
                      </td>
                      <td className="py-3 px-4 max-w-[200px] truncate text-slate-600">
                        {s.fields_of_study.join(", ")}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {s.created_at}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDetail(s)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                            title="Lihat Detail Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredSurveys.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-12 text-center text-slate-400 text-xs"
                      >
                        Tidak ada data yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Detail Responden */}
      <AnimatePresence>
        {selectedDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-100"
            >
              <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    Responden #{selectedDetail.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedDetail.school_name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedDetail.school_city} &bull; {selectedDetail.grade_level} &bull; {selectedDetail.age_group}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Minat Kuliah:</span>
                    <span className="font-bold text-slate-800">{selectedDetail.intention}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Jenjang yang Diminati:</span>
                    <span className="font-bold text-blue-700">{selectedDetail.target_degree}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Rencana Waktu:</span>
                    <span className="font-semibold text-slate-800">{selectedDetail.target_time}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Wilayah Kampus:</span>
                    <span className="font-semibold text-slate-800">{selectedDetail.target_region}</span>
                  </div>
                </div>

                {selectedDetail.considered_program && (
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">
                      Program Studi / Kampus yang Dipertimbangkan:
                    </span>
                    <p className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-700 font-medium">
                      {selectedDetail.considered_program}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Bidang Studi yang Diminati:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetail.fields_of_study.map((f) => (
                      <span key={f} className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Sumber Pembiayaan:
                  </span>
                  <span className="p-2 bg-slate-100 rounded-md text-slate-800 inline-block font-medium">
                    {selectedDetail.funding_source}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Kendala atau Pertimbangan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetail.obstacles.map((o) => (
                      <span key={o} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-md">
                        {o}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold block mb-1">
                    Sumber Informasi yang Digunakan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDetail.info_sources.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-md">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-400">
                  <span>Konsultasi: {selectedDetail.needs_counseling}</span>
                  <span>Waktu Kirim: {selectedDetail.created_at}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedDetail(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
