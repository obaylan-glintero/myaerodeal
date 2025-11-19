import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonStyle = 'danger', // 'danger' or 'primary'
  onConfirm,
  onCancel
}) => {
  const { colors } = useTheme();

  if (!isOpen) return null;

  const getConfirmButtonColor = () => {
    return confirmButtonStyle === 'danger' ? colors.error : colors.primary;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="rounded-lg shadow-xl max-w-md w-full"
        style={{ backgroundColor: colors.cardBg }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-4 border-b flex justify-between items-center"
          style={{ borderColor: colors.border }}
        >
          <div className="flex items-center gap-2">
            {confirmButtonStyle === 'danger' && (
              <AlertTriangle size={20} style={{ color: colors.error }} />
            )}
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="hover:opacity-70 p-1 rounded"
            style={{ color: colors.textSecondary }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div
          className="p-4 border-t flex gap-3 justify-end"
          style={{ borderColor: colors.border }}
        >
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg font-medium hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: colors.secondary,
              color: colors.textPrimary,
              border: `1px solid ${colors.border}`
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className="px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            style={{
              backgroundColor: getConfirmButtonColor(),
              color: '#FFFFFF'
            }}
          >
            {confirmButtonStyle === 'danger' && <Trash2 size={16} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
