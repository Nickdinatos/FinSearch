import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FinancialData } from '../types';
import { Wallet, PieChart as PieIcon } from 'lucide-react';

interface PortfolioSummaryProps {
  items: FinancialData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ items }) => {
  const totalValue = items.reduce((acc, item) => acc + (item.price * (item.userQuantity || 1)), 0);

  const data = items.map(item => ({
    name: item.symbol,
    value: item.price * (item.userQuantity || 1)
  }));

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8 shadow-2xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Total Balance */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start text-slate-400 mb-2">
            <Wallet className="w-5 h-5" />
            <span className="font-medium text-sm uppercase tracking-wider">Valore Totale Portafoglio</span>
          </div>
          <div className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            €{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-slate-500 mt-2">
            Basato sulle quantità simulate inserite
          </p>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-24 bg-slate-700"></div>

        {/* Allocation Chart */}
        <div className="flex-1 w-full h-[200px] flex items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                ))}
              </Pie>
              <RechartsTooltip 
                 formatter={(value: number) => `€${value.toFixed(2)}`}
                 contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
              />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};