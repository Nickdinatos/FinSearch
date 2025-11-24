import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto relative z-10">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden">
          <Search className="w-5 h-5 ml-4 text-slate-400" />
          <input
            type="text"
            className="w-full px-4 py-4 bg-transparent text-white placeholder-slate-400 focus:outline-none font-medium"
            placeholder="Cerca Ticker, Azienda o ETF (es. AAPL, Bitcoin, BTP Italia)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="mr-2 px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analizza'}
          </button>
        </div>
      </form>
    </div>
  );
};