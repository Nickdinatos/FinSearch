import React, { useState } from 'react';
import { Search, Loader2, Plus, Trash2 } from 'lucide-react';

interface MultiSearchFormProps {
  onSearch: (queries: string[]) => void;
  isLoading: boolean;
}

export const MultiSearchForm: React.FC<MultiSearchFormProps> = ({ onSearch, isLoading }) => {
  const [inputs, setInputs] = useState<string[]>(['', '', '']);

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validQueries = inputs.filter(q => q.trim().length > 0);
    if (validQueries.length > 0) {
      onSearch(validQueries);
    }
  };

  const hasInput = inputs.some(i => i.trim().length > 0);

  return (
    <div className="w-full max-w-4xl mx-auto relative z-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {inputs.map((input, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg blur opacity-20 group-focus-within:opacity-100 transition duration-500"></div>
              <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
                <span className="pl-3 text-slate-500 text-xs font-bold w-6">{idx + 1}</span>
                <input
                  type="text"
                  className="w-full px-2 py-3 bg-transparent text-white placeholder-slate-500 focus:outline-none font-medium"
                  placeholder={idx === 0 ? "Es. Apple" : idx === 1 ? "Es. Bitcoin" : "Es. BTP Italia"}
                  value={input}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  disabled={isLoading}
                />
                {input && !isLoading && (
                  <button 
                    type="button"
                    onClick={() => handleInputChange(idx, '')}
                    className="mr-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-4">
          <button
            type="submit"
            disabled={isLoading || !hasInput}
            className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Elaborazione...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Genera Portafoglio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};