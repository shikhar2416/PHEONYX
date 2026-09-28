import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Component, type ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuroraBackground from '@/components/layout/AuroraBackground';
import { StudentProvider } from '@/context/StudentContext';
import { ToastProvider } from '@/components/ui/Toast';
import Landing from '@/pages/Landing';
import SelectClass from '@/pages/SelectClass';
import StudentIdentity from '@/pages/StudentIdentity';
import Attendance from '@/pages/Attendance';
import Leaves from '@/pages/Leaves';
import DataPage from '@/pages/DataPage';
import FreeClassesPage from '@/pages/FreeClassesPage';
import NotFound from '@/pages/NotFound';
import PixelSwapBanner from '@/components/ui/PixelSwapBanner';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="glass-card bg-white/5 border border-rose-500/30 rounded-2xl p-8 max-w-md text-center">
            <h2 className="text-xl font-heading font-bold text-rose-300 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-400 mb-4">{this.state.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-emerald-400 text-base-900 font-semibold text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <StudentProvider>
            <AuroraBackground />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <PixelSwapBanner />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/select" element={<SelectClass />} />
                  <Route path="/student/:sectionKey" element={<StudentIdentity />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/leaves" element={<Leaves />} />
                  <Route path="/data" element={<DataPage />} />
                  <Route path="/free-classes" element={<FreeClassesPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </StudentProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
