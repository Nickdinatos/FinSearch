
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { FinancialData, PortfolioAnalysis } from '../types';
import { Wallet, Coins, ShieldAlert, Scale, Telescope, Loader2 } from 'lucide-react';

interface PortfolioSummaryProps {
  items: FinancialData[];
  totalCapital: number;
  onUpdateCapital: (val: number) => void;
  analysis: PortfolioAnalysis | null;
  isAnalyzing: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ items, totalCapital, onUpdateCapital, analysis, isAnalyzing }) => {
  
  // Calcolo valore reale basato sui pesi.
  const data = items.map(item => {
    const weight = item.userWeight || 0;
    const value = (totalCapital * weight) / 100;
    return {
      name: item.symbol,
      value: value,
      weight: weight
    };
  });

  const calculatedTotal = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-slate-800/80 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8 shadow-2xl animate-fade-in-up">
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* TOP SECTION: CHART & NUMBERS */}
        <div className="flex flex-col md:flex-row gap-8 items-center flex-1">
          {/* Capital Input Config */}
          <div className="flex-1 text-center md:text-left space-y-4 w-full md:w-auto">
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

          {/* Allocation Chart */}
          <div className="flex-1 w-full h-[220px] flex items-center justify-center border-l border-slate-700/50 pl-0 md:pl-8">
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

        {/* BOTTOM/SIDE SECTION: AI ANALYSIS */}
        <div className="flex-1 w-full xl:w-1/3 border-t xl:border-t-0 xl:border-l border-slate-700 pt-6 xl:pt-0 xl:pl-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin text-primary-400" /> : <Telescope className="w-5 h-5 text-primary-400" />}
            Analisi Strategica Portafoglio
          </h3>

          {isAnalyzing ? (
             <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
             </div>
          ) : analysis ? (
             <div className="space-y-4">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase mb-1">
                    <Scale className="w-3 h-3" /> Diversificazione
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">{analysis.diversification}</p>
                </div>

                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
                    <ShieldAlert className="w-3 h-3" /> Profilo di Rischio
                  </div>
                  <p className="text-sm text-slate-300 leading-snug">{analysis.riskProfile}</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-900/20 to-transparent p-3 rounded-lg border border-emerald-500/20">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase mb-1">
                    <Telescope className="w-3 h-3" /> Outlook Sintetico
                  </div>
                  <p className="text-sm text-emerald-100/90 leading-snug italic">"{analysis.strategyForecast}"</p>
                </div>
             </div>
          ) : (
            <p className="text-slate-500 text-sm">Analisi non disponibile.</p>
          )}
        </div>

      </div>
    </div>
  );
};
