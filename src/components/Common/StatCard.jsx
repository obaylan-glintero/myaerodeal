import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const StatCard = ({ icon, title, value, total, color }) => {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
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