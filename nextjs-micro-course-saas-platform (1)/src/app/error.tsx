"use client";
import { RotateCcw } from "lucide-react";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) { return <main className="container empty-state"><h1>حدث خطأ غير متوقع</h1><p>لم نتمكن من تحميل الصفحة. حاول مرة أخرى.</p><button className="btn btn-primary" onClick={reset}><RotateCcw size={17}/> إعادة المحاولة</button></main>; }
