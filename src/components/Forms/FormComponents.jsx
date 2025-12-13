import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Reusable form input components with consistent theming
 * Use these components in all forms for consistent UI/UX
 */

// Base input styles hook
export const useFormStyles = () => {
  const { colors } = useTheme();

  return {
    inputStyle: {
      backgroundColor: colors.cardBg,
      color: colors.textPrimary,
      borderColor: colors.border,
    },
    placeholderCSS: `
      ::placeholder {
        color: ${colors.textSecondary};
      }
      select option {
        background-color: ${colors.cardBg};
        color: ${colors.textPrimary};
      }
    `,
    colors,
  };
};

// Text Input
export const FormInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  className = '',
  ...props
}) => {
  const { inputStyle, colors } = useFormStyles();

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          {label} {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2"
        style={{
          ...inputStyle,
          borderColor: error ? colors.error : colors.border,
          minHeight: '44px', // Touch-friendly
        }}
        {...props}
      />
      {error && (
        <p className="text-sm mt-1" style={{ color: colors.error }}>
          {error}
        </p>
      )}
    </div>
  );
};

// Select Input
export const FormSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  required,
  className = '',
  ...props
}) => {
  const { inputStyle, colors } = useFormStyles();

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          {label} {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <select
        value={value || ''}
        onChange={onChange}
        className="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2"
        style={{
          ...inputStyle,
          minHeight: '44px', // Touch-friendly
        }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Checkbox Input
export const FormCheckbox = ({
  label,
  checked,
  onChange,
  className = '',
  ...props
}) => {
  const { colors } = useFormStyles();

  return (
    <label
      className={`flex items-center gap-2 cursor-pointer min-h-[44px] ${className}`}
      style={{ color: colors.textSecondary }}
    >
      <input
        type="checkbox"
        checked={checked || false}
        onChange={onChange}
        className="w-5 h-5 accent-current rounded"
        style={{
          borderColor: colors.border,
          accentColor: colors.primary,
        }}
        {...props}
      />
      <span className="text-sm">{label}</span>
    </label>
  );
};

// Textarea
export const FormTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  rows = 3,
  required,
  className = '',
  ...props
}) => {
  const { inputStyle, colors } = useFormStyles();

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-2" style={{ color: colors.textSecondary }}>
          {label} {required && <span style={{ color: colors.error }}>*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        rows={rows}
        className="w-full px-4 py-2.5 border rounded-lg transition-colors focus:outline-none focus:ring-2 resize-none"
        style={inputStyle}
        {...props}
      />
    </div>
  );
};

// Form Section (for grouping related fields)
export const FormSection = ({ title, children, className = '' }) => {
  const { colors } = useFormStyles();

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h4
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: colors.primary }}
        >
          {title}
        </h4>
      )}
      {children}
    </div>
  );
};

// Form Row (for horizontal layout)
export const FormRow = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {children}
    </div>
  );
};

// Submit Button
export const FormButton = ({
  children,
  type = 'button',
  variant = 'primary',
  loading,
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const { colors } = useFormStyles();

  const variants = {
    primary: {
      backgroundColor: colors.primary,
      color: colors.secondary,
    },
    secondary: {
      backgroundColor: 'transparent',
      color: colors.primary,
      border: `2px solid ${colors.primary}`,
    },
    danger: {
      backgroundColor: colors.error,
      color: '#FFFFFF',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2
                  disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90
                  min-h-[48px] ${className}`}
      style={variants[variant]}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

// Common option sets for reuse
export const AIRCRAFT_TYPE_OPTIONS = [
  { value: 'Piston', label: 'Piston' },
  { value: 'Turboprop', label: 'Turboprop' },
  { value: 'Light Jet', label: 'Light Jet' },
  { value: 'Midsize Jet', label: 'Midsize Jet' },
  { value: 'Super-Mid Jet', label: 'Super-Mid Jet' },
  { value: 'Heavy Jet', label: 'Heavy Jet' },
  { value: 'Ultra-Long Range', label: 'Ultra-Long Range' },
  { value: 'Airliner', label: 'Airliner' },
  { value: 'Cargo', label: 'Cargo' },
  { value: 'Helicopter', label: 'Helicopter' },
];

export const LEAD_STATUS_OPTIONS = [
  { value: 'Inquiry', label: 'Inquiry' },
  { value: 'Presented', label: 'Presented' },
  { value: 'Interested', label: 'Interested' },
  { value: 'Deal Created', label: 'Deal Created' },
  { value: 'Lost', label: 'Lost' },
];

export const TASK_PRIORITY_OPTIONS = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default {
  FormInput,
  FormSelect,
  FormCheckbox,
  FormTextarea,
  FormSection,
  FormRow,
  FormButton,
  useFormStyles,
};
