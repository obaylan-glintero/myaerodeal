import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Base Skeleton component
const Skeleton = ({ className = '', style = {} }) => {
  const { colors, isDark } = useTheme();

  return (
    <div
      className={`animate-pulse rounded ${className}`}
      style={{
        backgroundColor: isDark ? '#1A2E45' : '#E5E7EB',
        ...style,
      }}
    />
  );
};

// Skeleton for StatCard
export const StatCardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-16 h-4" />
      </div>
      <Skeleton className="w-24 h-4 mb-2" />
      <Skeleton className="w-16 h-8" />
    </div>
  );
};

// Skeleton for Lead/Aircraft Card
export const CardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
      {/* Header skeleton */}
      <Skeleton className="w-full h-32" />

      {/* Content skeleton */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center p-4 rounded" style={{ backgroundColor: colors.secondary }}>
              <Skeleton className="w-16 h-3 mx-auto mb-2" />
              <Skeleton className="w-20 h-4 mx-auto" />
            </div>
          ))}
        </div>
        <Skeleton className="w-full h-12 rounded-lg" />
      </div>
    </div>
  );
};

// Skeleton for Task/List item
export const ListItemSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg" style={{ backgroundColor: colors.secondary }}>
      <Skeleton className="w-8 h-8 rounded" />
      <div className="flex-1">
        <Skeleton className="w-48 h-4 mb-2" />
        <Skeleton className="w-32 h-3" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="w-20 h-5 rounded" />
          <Skeleton className="w-16 h-5 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
      </div>
    </div>
  );
};

// Skeleton for Table Row
export const TableRowSkeleton = ({ columns = 6 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="w-full h-4" style={{ maxWidth: i === 0 ? '150px' : '100px' }} />
        </td>
      ))}
    </tr>
  );
};

// Skeleton for Dashboard
export const DashboardSkeleton = () => {
  const { colors } = useTheme();

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Recent Leads & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
            <Skeleton className="w-32 h-6 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <ListItemSkeleton key={j} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline */}
      <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: colors.cardBg }}>
        <Skeleton className="w-32 h-6 mb-4" />
        <div className="grid grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="text-center p-4 rounded" style={{ backgroundColor: colors.secondary }}>
              <Skeleton className="w-12 h-8 mx-auto mb-2" />
              <Skeleton className="w-20 h-3 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Skeleton for Leads/Aircraft Grid
export const GridSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

// Skeleton for Tasks List
export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListItemSkeleton key={i} />
      ))}
    </div>
  );
};

export default Skeleton;
