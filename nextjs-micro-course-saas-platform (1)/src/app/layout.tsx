import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppProvider } from "@/components/app-provider";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = { title: "نَوَى | تعلّم شيئاً جديداً كل يوم", description: "دورات قصيرة وممتعة تساعدك على تطوير مهاراتك، خطوة بخطوة وفي وقتك المناسب." };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="ar" dir="rtl" suppressHydrationWarning><body><AppProvider><SiteHeader/>{children}<SiteFooter/></AppProvider></body></html>; }
