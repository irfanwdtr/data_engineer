import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Stock Intelligence Platform | Indonesian Stock Market Analytics",
  description: "Professional Indonesian financial analytics and ML prediction SaaS platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#090C15] text-slate-100 min-h-screen flex antialiased">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-y-auto min-h-screen px-8 py-7 bg-[#090C15]">
          {children}
        </main>
      </body>
    </html>
  );
}

