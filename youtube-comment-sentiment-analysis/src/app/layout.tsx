import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNavbar } from '@/components/layout/TopNavbar';
import { PipelineVisualizerModal } from '@/components/dashboard/PipelineVisualizerModal';

export const metadata: Metadata = {
  title: 'YouTube Comment Sentiment Analysis - Analytics Dashboard',
  description:
    'Platform analisis sentimen publik komentar YouTube untuk Data Engineering & Analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 flex antialiased">
        <AppProvider>
          {/* Left Sidebar */}
          <Sidebar />

          {/* Right Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
            <TopNavbar />
            <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* ETL Pipeline Execution Modal */}
          <PipelineVisualizerModal />
        </AppProvider>
      </body>
    </html>
  );
}
