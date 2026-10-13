import React from 'react';

const SeverityBadge = ({ severity }) => {
  const getBadgeClass = (sev) => {
    switch (sev?.toUpperCase()) {
      case 'SAFE':
        return 'badge-safe';
      case 'LOW':
        return 'badge-low';
      case 'MEDIUM':
        return 'badge-medium';
      case 'HIGH':
        return 'badge-high';
      case 'CRITICAL':
        return 'badge-critical';
      default:
        return 'badge-safe';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${getBadgeClass(severity)}`}>
      {severity === 'CRITICAL' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-ping"></span>
      )}
      {severity || 'SAFE'}
    </span>
  );
};

export default SeverityBadge;
