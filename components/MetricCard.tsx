import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, icon }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm font-medium">{label}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div>
        <div className="text-xl font-bold text-white truncate">{value}</div>
        {subValue && <div className="text-xs text-slate-500 mt-1">{subValue}</div>}
      </div>
    </div>
  );
};