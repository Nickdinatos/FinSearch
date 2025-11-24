import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { HistoryPoint } from '../types';

interface FinancialChartProps {
  data: HistoryPoint[];
  color: string;
}

export const FinancialChart: React.FC<FinancialChartProps> = ({ data, color }) => {
  // Calcolo media semplice per la reference line
  const average = data.reduce((acc, curr) => acc + curr.price, 0) / data.length;
  const isPositive = data.length > 0 && data[data.length - 1].price >= data[0].price;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e'; // Emerald o Rose

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            minTickGap={40}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis 
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            domain={['auto', 'auto']}
            width={40}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0f172a', 
              borderColor: '#334155', 
              borderRadius: '8px', 
              color: '#f8fafc',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
            itemStyle={{ color: '#fff' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
            formatter={(value: number) => [`€${value.toFixed(2)}`, 'Prezzo']}
          />
          <ReferenceLine y={average} stroke="#475569" strokeDasharray="3 3" label={{ position: 'right',  value: 'Avg', fill: '#475569', fontSize: 10 }} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={strokeColor} 
            strokeWidth={2}
            fillOpacity={1} 
            fill={`url(#gradient-${color})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};