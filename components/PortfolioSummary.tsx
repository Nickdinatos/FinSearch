import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FinancialData } from '../types';
import { Wallet, Coins } from 'lucide-react';

interface PortfolioSummaryProps {
  items: FinancialData[];
  totalCapital: number;
  onUpdateCapital: (val: number) => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ items, totalCapital, onUpdateCapital }) => {
  
  // Calcolo valore reale basato sui pesi.
  // La logica: Se l'utente dice "25%", significa che il 25% del TotalCapital è in quell'asset.
  // Valore Asset = (TotalCapital * (Weight / 100))
  
  const data = items.map(item => {
    const weight = item.userWeight || 0;
    const value = (totalCapital * weight) / 100;
    return {
      name: item.symbol,
      value: value,
      weight: weight
    };
  });

  // Somma effettiva (dovrebbe matchare totalCapital se somma pesi è 100)
  const calculatedTotal = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8 shadow-2xl animate-fade-in-up">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Capital Input Config */}
        <div className="flex-1 text-center md:text-left space-y-4">
          
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 inline-block w-full max-w-sm">
            <div className="flex items-center gap-2 text-primary-400 mb-1">
               <Coins className="w-4 h-4" />
               <label className="text-xs font-bold uppercase tracking-wider">Capitale Iniziale Simulato</label>
            </div>
            <div className="flex items-baseline gap-1">
               <span className="text-2xl font-light text-slate-400">€</span>
               <input 
                  type="number" 
                  value={totalCapital}
                  onChange={(e) => onUpdateCapital(parseFloat(e.target.value) || 0)}
                  className="bg-transparent text-3xl font-bold text-white focus:outline-none w-full border-b border-dashed border-slate-600 focus:border-primary-500 transition-colors"
               />
            </div>
          </div>

          <div>
             <div className="flex items-center gap-2 justify-center md:justify-start text-slate-400 mb-1">
               <Wallet className="w-4 h-4" />
               <span className="font-medium text-sm">Valore Portafoglio Allocato</span>
             </div>
             <div className="text-2xl font-bold text-emerald-400 tracking-tight">
               €{calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
             </div>
             <p className="text-xs text-slate-500 mt-1">
               Allocazione: {items.reduce((acc, i) => acc + (i.userWeight || 0), 0)}% del capitale
             </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-32 bg-slate-700"></div>

        {/* Allocation Chart */}
        <div className="flex-1 w-full h-[220px] flex items-center justify-center">
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
                 formatter={(value: number, name: string, props: any) => [
                   `€${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 
                   `${name} (${props.payload.weight}%)`
                 ]}
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