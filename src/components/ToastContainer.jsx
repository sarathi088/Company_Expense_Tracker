import React from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map(toast => {
          let bgGradient = 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-900 dark:text-blue-200';
          let Icon = Info;
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            bgGradient = 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-500';
          } else if (toast.type === 'warning') {
            bgGradient = 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-900 dark:text-amber-200';
            Icon = AlertTriangle;
            iconColor = 'text-amber-500';
          } else if (toast.type === 'error') {
            bgGradient = 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-900 dark:text-rose-200';
            Icon = AlertCircle;
            iconColor = 'text-rose-500';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, backdropFilter: 'blur(20px)' }}
              exit={{ opacity: 0, y: -15, scale: 0.95 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-r ${bgGradient} border backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20`}
            >
              <div className={`p-1.5 rounded-xl bg-white/40 dark:bg-white/10 backdrop-blur-md shadow-sm ${iconColor} shrink-0 mt-0.5`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-2">
                <p className="text-sm font-semibold tracking-tight">{toast.title}</p>
                <span className="text-[11px] opacity-75 font-medium">Just now</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
