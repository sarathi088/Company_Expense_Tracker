import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, MobileNav } from './components/Navigation';
import { ToastContainer } from './components/ToastContainer';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { LoadEntry } from './pages/LoadEntry';
import { LocationManagement } from './pages/LocationManagement';
import { LoadHistory } from './pages/LoadHistory';
import { Reports } from './pages/Reports';
import { ExportCenter } from './pages/ExportCenter';
import { Settings } from './pages/Settings';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const MainLayout = () => {
  const { user, activeTab, isAddLoadModalOpen, setIsAddLoadModalOpen } = useApp();

  if (!user.isAuthenticated) {
    return <Login />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'load-entry':
        return <LoadEntry />;
      case 'history':
        return <LoadHistory />;
      case 'reports':
        return <Reports />;
      case 'locations':
        return <LocationManagement />;
      case 'export':
        return <ExportCenter />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      
      {/* Background Liquid Orbs */}
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      {/* Global Toast Stack */}
      <ToastContainer />

      {/* Top Header Navbar */}
      <Navbar />

      {/* Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6 pb-28 lg:pb-12 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Quick Add Load Modal Popup */}
      <AnimatePresence>
        {isAddLoadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-2xl relative"
            >
              <button
                onClick={() => setIsAddLoadModalOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/60 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <LoadEntry isModal={true} onClose={() => setIsAddLoadModalOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
