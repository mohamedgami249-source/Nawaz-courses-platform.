"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ChevronDown, GraduationCap, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app-provider";

export function SiteHeader() {
  const { profile, ready, theme, toggleTheme, logout } = useApp();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const dashboard = profile?.role === "instructor" ? "/instructor" : "/dashboard";
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand" onClick={() => setOpen(false)}><span className="brand-icon"><GraduationCap size={25} strokeWidth={2.4}/></span><span>نَوَى<span className="brand-dot">.</span></span></Link>
    <nav className={`main-nav ${open ? "nav-open" : ""}`} aria-label="القائمة الرئيسية">
      <Link className={pathname === "/" ? "active" : ""} href="/" onClick={() => setOpen(false)}>الرئيسية</Link>
      <Link className={pathname === "/courses" ? "active" : ""} href="/courses" onClick={() => setOpen(false)}>استكشف الدورات</Link>
      <Link href="/#how-it-works" onClick={() => setOpen(false)}>كيف نعمل</Link>
      <Link href="/#about" onClick={() => setOpen(false)}>من نحن</Link>
    </nav>
    <div className="header-actions"><button className="icon-button theme-button" onClick={toggleTheme} aria-label="تبديل المظهر">{theme === "light" ? <Moon size={20}/> : <Sun size={20}/>}</button>
      {ready && profile ? <div className="account-menu"><Link href={dashboard} className="account-trigger"><span className="avatar-small">{profile.fullName.charAt(0)}</span><span className="account-name">{profile.fullName.split(" ")[0]}</span><ChevronDown size={15}/></Link><div className="account-dropdown"><Link href={dashboard}><BookOpen size={16}/> لوحة التحكم</Link><button onClick={logout}>تسجيل الخروج</button></div></div> : <><Link href="/auth" className="login-link">تسجيل الدخول</Link><Link href="/auth?tab=signup" className="btn btn-primary header-signup">ابدأ التعلم <span>←</span></Link></>}
      <button className="icon-button mobile-toggle" onClick={() => setOpen(!open)} aria-label="فتح القائمة">{open ? <X size={24}/> : <Menu size={24}/>}</button>
    </div>
  </div></header>;
}

export function SiteFooter() { return <footer className="footer" id="about"><div className="container footer-main"><div><Link href="/" className="brand footer-brand"><span className="brand-icon"><GraduationCap size={24}/></span><span>نَوَى<span className="brand-dot">.</span></span></Link><p>مساحتك لتتعلم شيئاً جديداً كل يوم. خطوات صغيرة، أثر كبير.</p></div><div className="footer-links"><div><strong>المنصة</strong><Link href="/courses">استكشف الدورات</Link><Link href="/#how-it-works">كيف نعمل</Link><Link href="/instructor">كن مدرباً</Link></div><div><strong>حسابك</strong><Link href="/dashboard">دوراتي</Link><Link href="/auth">تسجيل الدخول</Link><Link href="/auth?tab=signup">إنشاء حساب</Link></div></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} نَوَى. صُنع بحب للتعلّم.</span><span>التعلّم يبدأ بخطوة ✦</span></div></footer>; }
