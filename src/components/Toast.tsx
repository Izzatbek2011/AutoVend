import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div
      id="autovend-toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const getIcon = () => {
            switch (toast.type) {
              case 'success':
                return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
              case 'warning':
                return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
              case 'error':
                return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
              default:
                return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
            }
          };

          const getBgBorder = () => {
            switch (toast.type) {
              case 'success':
                return 'bg-slate-900/95 border-emerald-500/30 text-emerald-100';
              case 'warning':
                return 'bg-slate-900/95 border-amber-500/30 text-amber-100';
              case 'error':
                return 'bg-slate-900/95 border-rose-500/30 text-rose-100';
              default:
                return 'bg-slate-900/95 border-sky-500/30 text-sky-100';
            }
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto rounded-xl border p-4 shadow-2xl backdrop-blur-md flex items-start gap-3 ${getBgBorder()}`}
            >
              {getIcon()}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white leading-snug">{toast.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                id={`close-toast-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
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
