import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useTheme } from './ThemeContext';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ id, type, message, onClose }) => {
  const { colors, isDark } = useTheme();

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertCircle size={20} />,
    info: <Info size={20} />,
  };

  const bgColors = {
    success: isDark ? '#065F46' : '#D1FAE5',
    error: isDark ? '#7F1D1D' : '#FEE2E2',
    warning: isDark ? '#78350F' : '#FEF3C7',
    info: isDark ? '#1E3A5F' : '#DBEAFE',
  };

  const textColors = {
    success: isDark ? '#6EE7B7' : '#065F46',
    error: isDark ? '#FCA5A5' : '#991B1B',
    warning: isDark ? '#FCD34D' : '#92400E',
    info: isDark ? '#93C5FD' : '#1E40AF',
  };

  const iconColors = {
    success: isDark ? '#10B981' : '#059669',
    error: isDark ? '#EF4444' : '#DC2626',
    warning: isDark ? '#F59E0B' : '#D97706',
    info: isDark ? '#3B82F6' : '#2563EB',
  };

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[450px] animate-slide-in"
      style={{
        backgroundColor: bgColors[type],
        border: `1px solid ${iconColors[type]}30`,
      }}
    >
      <div style={{ color: iconColors[type] }}>{icons[type]}</div>
      <p className="flex-1 text-sm font-medium" style={{ color: textColors[type] }}>
        {message}
      </p>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded hover:opacity-70 transition-opacity"
        style={{ color: textColors[type] }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast('success', message, duration), [addToast]);
  const error = useCallback((message, duration) => addToast('error', message, duration), [addToast]);
  const warning = useCallback((message, duration) => addToast('warning', message, duration), [addToast]);
  const info = useCallback((message, duration) => addToast('info', message, duration), [addToast]);

  const value = {
    success,
    error,
    warning,
    info,
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
