"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

type AppContextValue = { profile: Profile | null; ready: boolean; configured: boolean; theme: "light" | "dark"; toggleTheme: () => void; toast: (message: string, type?: "success" | "error") => void; loginDemo: (role: "student" | "instructor") => Promise<void>; logout: () => Promise<void>; refreshProfile: () => Promise<void>; api: (url: string, options?: RequestInit) => Promise<Response>; supabase: SupabaseClient | null };
const AppContext = createContext<AppContextValue | null>(null);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const configured = !!(url && key && !url.includes("your_supabase"));
const supabase = configured ? createClient(url!, key!) : null;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const toast = useCallback((message: string, type: "success" | "error" = "success") => { setNotice({ message, type }); setTimeout(() => setNotice(null), 4200); }, []);
  const api = useCallback(async (path: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    if (options.body) headers.set("Content-Type", "application/json");
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session) headers.set("Authorization", `Bearer ${data.session.access_token}`);
    } else if (typeof window !== "undefined") {
      const demo = localStorage.getItem("nawa-demo-role");
      if (demo) headers.set("x-demo-user", demo);
    }
    return fetch(path, { ...options, headers });
  }, []);
  const refreshProfile = useCallback(async () => {
    try { const res = await api("/api/me"); setProfile(res.ok ? (await res.json()).profile : null); }
    catch { setProfile(null); }
    finally { setReady(true); }
  }, [api]);
  useEffect(() => {
    const saved = localStorage.getItem("nawa-theme");
    if (saved === "dark") { setTheme("dark"); document.documentElement.classList.add("dark"); }
    const load = async () => { if (supabase) await supabase.auth.getSession(); await refreshProfile(); };
    load();
    const { data: listener } = supabase?.auth.onAuthStateChange(() => { setTimeout(refreshProfile, 0); }) ?? { data: null };
    return () => listener?.subscription.unsubscribe();
  }, [refreshProfile]);
  const toggleTheme = () => { const next = theme === "light" ? "dark" : "light"; setTheme(next); document.documentElement.classList.toggle("dark", next === "dark"); localStorage.setItem("nawa-theme", next); };
  const loginDemo = async (role: "student" | "instructor") => { localStorage.setItem("nawa-demo-role", role); await refreshProfile(); };
  const logout = async () => { if (supabase) await supabase.auth.signOut(); else localStorage.removeItem("nawa-demo-role"); setProfile(null); toast("تم تسجيل الخروج بنجاح"); };
  return <AppContext.Provider value={{ profile, ready, configured, theme, toggleTheme, toast, loginDemo, logout, refreshProfile, api, supabase }}>{children}{notice && <div role="status" className={`toast ${notice.type === "error" ? "toast-error" : ""}`}>{notice.message}</div>}</AppContext.Provider>;
}
export function useApp() { const context = useContext(AppContext); if (!context) throw new Error("AppProvider missing"); return context; }
