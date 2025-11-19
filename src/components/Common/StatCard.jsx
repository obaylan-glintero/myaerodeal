import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const StatCard = ({ icon, title, value, total, color, onClick }) => {
  const { colors } = useTheme();

  return (
    <div
      className="rounded-lg shadow-lg p-6 transition-all duration-200"
      style={{
        backgroundColor: colors.cardBg,
        cursor: onClick ? 'pointer' : 'default',
        transform: 'scale(1)'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.02)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '';
        }
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div style={{ color }}>{icon}</div>
        {total && (
          <span className="text-sm" style={{ color: colors.textSecondary }}>
            {value} / {total}
          </span>
        )}
      </div>
      <h3 className="text-sm mb-1" style={{ color: colors.textSecondary }}>{title}</h3>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
};

export default StatCard;