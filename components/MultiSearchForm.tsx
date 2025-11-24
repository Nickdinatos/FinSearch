import React, { useState } from 'react';
import { Search, Loader2, Trash2, PieChart } from 'lucide-react';

interface SearchItem {
  query: string;
  weight: number;
}

interface MultiSearchFormProps {
  onSearch: (items: SearchItem[]) => void;
  isLoading: boolean;
}

export const MultiSearchForm: React.FC<MultiSearchFormProps> = ({ onSearch, isLoading }) => {
  // Supporta fino a 4 input
  const [items, setItems] = useState<SearchItem[]>([
    { query: '', weight: 25 },
    { query: '', weight: 25 },
    { query: '', weight: 25 },
    { query: '', weight: 25 }
  ]);

  const handleQueryChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].query = value;
    setItems(newItems);
  };

  const handleWeightChange = (index: number, value: string) => {
    const val = parseFloat(value);
    const newItems = [...items];
    newItems[index].weight = isNaN(val) ? 0 : val;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.query.trim().length > 0);
    if (validItems.length > 0) {
      onSearch(validItems);
    }
  };

  const clearInput = (index: number) => {
     const newItems = [...items];
     newItems[index].query = '';
     newItems[index].weight = 0;
     setItems(newItems);
  };

  const totalWeight = items.reduce((acc, curr) => curr.query ? acc + curr.weight : acc, 0);
  const hasInput = items.some(i => i.query.trim().length > 0);

  return (
    <div className="w-full max-w-5xl mx-auto relative z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="relative group flex gap-2">
              {/* Main Input */}
              <div className="relative flex-1">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg blur opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
                <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden h-12">
                  <span className="pl-3 text-slate-500 text-xs font-bold w-6">{idx + 1}</span>
                  <input
                    type="text"
                    className="w-full px-2 bg-transparent text-white placeholder-slate-500 focus:outline-none font-medium"
                    placeholder={`Asset ${idx + 1} (es. AAPL)`}
                    value={item.query}
                    onChange={(e) => handleQueryChange(idx, e.target.value)}
                    disabled={isLoading}
                  />
                  {item.query && !isLoading && (
                    <button 
                      type="button"
                      onClick={() => clearInput(idx)}
                      className="mr-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Weight Input */}
              <div className="relative w-24">
                <div className="absolute -inset-0.5 bg-slate-700 rounded-lg blur opacity-0 group-focus-within:opacity-50 transition"></div>
                <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 h-12 overflow-hidden">
                   <div className="pl-2 text-slate-500">
                      <PieChart className="w-3 h-3" />
                   </div>
                   <input 
                      type="number"
                      min="0"
                      max="100"
                      className="w-full px-2 bg-transparent text-right text-white font-mono text-sm focus:outline-none"
                      value={item.weight}
                      onChange={(e) => handleWeightChange(idx, e.target.value)}
                      disabled={isLoading}
                   />
                   <span className="pr-2 text-slate-500 text-xs font-bold">%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Validation Info */}
        {hasInput && (
           <div className={`text-center text-xs font-medium transition-colors ${totalWeight !== 100 ? 'text-amber-400' : 'text-emerald-400'}`}>
              Peso Totale Allocato: {totalWeight}% {totalWeight !== 100 && "(Consigliato: 100%)"}
           </div>
        )}

        <div className="flex justify-center mt-2">
          <button
            type="submit"
            disabled={isLoading || !hasInput}
            className="px-10 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisi in corso...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Genera Portafoglio Simulato
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};