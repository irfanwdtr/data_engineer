import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "BankFlow – Banking Data Intelligence Platform",
  description: "Enterprise Data Lake, Data Warehouse & Pipeline Monitoring Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-navy-950 text-slate-100 min-h-screen flex antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 bg-navy-950">
          {children}
        </div>
      </body>
    </html>
  );
}

