import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const StatCard = ({ icon, title, subtitle, value, total, color, onClick }) => {
  const { colors } = useTheme();

  return (
    <div
      className={`rounded-lg shadow-lg p-6 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl' : ''
      }`}
      style={{ backgroundColor: colors.cardBg }}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div style={{ color }}>{icon}</div>
        {total !== undefined && (
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            {value} / {total}
          </span>
        )}
      </div>
      <div className="mb-1">
        <h3 className="text-sm" style={{ color: colors.textSecondary }}>{title}</h3>
        {subtitle && (
          <span className="text-xs" style={{ color: colors.textSecondary, opacity: 0.7 }}>{subtitle}</span>
        )}
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
};

export default StatCard;