import React, { useState } from 'react';
import { MultiSearchForm } from './components/MultiSearchForm';
import { FinancialChart } from './components/FinancialChart';
import { MetricCard } from './components/MetricCard';
import { PortfolioSummary } from './components/PortfolioSummary';
import { searchFinancialInstrument } from './services/geminiService';
import { FinancialData, ViewState } from './types';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  X,
  Plus,
  Layers,
  Calculator
} from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);
  const [portfolios, setPortfolios] = useState<FinancialData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to handle multiple parallel searches
  const handleMultiSearch = async (queries: string[]) => {
    setViewState(ViewState.LOADING);
    setError(null);
    
    // Clear previous if performing a fresh search from hero, 
    // or append? The user prompt implies "3 simultaneous buttons", 
    // usually implies a fresh start or add. Let's assume add to existing 
    // unless it's the initial screen. 
    // Actually, simply adding them is safest.
    
    const uniqueQueries = queries.filter(q => 
      !portfolios.some(p => p.symbol.toLowerCase() === q.toLowerCase())
    );

    if (uniqueQueries.length === 0) {
      setViewState(ViewState.SUCCESS);
      return;
    }

    try {
      const promises = uniqueQueries.map(q => searchFinancialInstrument(q));
      const results = await Promise.allSettled(promises);
      
      const newItems: FinancialData[] = [];
      let failureCount = 0;

      results.forEach(res => {
        if (res.status === 'fulfilled') {
          // Initialize with quantity 1
          newItems.push({ ...res.value, userQuantity: 1 });
        } else {
          failureCount++;
          console.error(res.reason);
        }
      });

      if (newItems.length > 0) {
        setPortfolios(prev => [...prev, ...newItems]);
        setViewState(ViewState.SUCCESS);
      } else if (failureCount > 0) {
        setError("Impossibile trovare gli strumenti richiesti. Riprova con nomi più specifici.");
        setViewState(ViewState.ERROR);
      } else {
        setViewState(ViewState.SUCCESS);
      }

    } catch (err: any) {
      console.error(err);
      setError("Errore di sistema imprevisto.");
      setViewState(ViewState.ERROR);
    }
  };

  const handleRemove = (symbol: string) => {
    setPortfolios(prev => prev.filter(item => item.symbol !== symbol));
    if (portfolios.length <= 1) { // Will be 0
      // Keep viewstate success to show empty state or idle?
      // If 0 items, go IDLE to show hero
    }
  };

  const updateQuantity = (symbol: string, qty: number) => {
    setPortfolios(prev => prev.map(item => {
      if (item.symbol === symbol) {
        return { ...item, userQuantity: qty > 0 ? qty : 0 };
      }
      return item;
    }));
  };

  const hasItems = portfolios.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans selection:bg-primary-500/30">
      
      {/* Header (Minimal) */}
      <header className="absolute top-0 w-full z-50 p-6 flex justify-between items-center">
        {hasItems && (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setPortfolios([]); setViewState(ViewState.IDLE); }}>
             <Layers className="w-6 h-6 text-primary-500" />
             <span className="font-bold text-xl tracking-tight">FinSearch</span>
          </div>
        )}
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col justify-center">
        
        {/* Hero Search Section */}
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="mb-8 flex items-center justify-center bg-slate-900/50 p-4 rounded-full border border-slate-800 shadow-2xl">
              <Layers className="w-10 h-10 text-primary-500 mr-3" />
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter">
                FinSearch
              </h1>
            </div>
            
            <p className="text-lg text-slate-400 mb-10 max-w-xl text-center">
              Inserisci fino a 3 strumenti per creare istantaneamente un portafoglio simulato, confrontare grafici e analizzare i trend in Euro.
            </p>

            <MultiSearchForm onSearch={handleMultiSearch} isLoading={viewState === ViewState.LOADING} />
            
            {viewState === ViewState.ERROR && error && (
              <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="pt-20 pb-10 w-full">
            
            {/* Portfolio Summary Dashboard */}
            <PortfolioSummary items={portfolios} />

            {/* Input for adding more? */}
            <div className="mb-8 flex justify-end">
              {portfolios.length < 6 ? (
                 <div className="w-full md:w-auto">
                    {/* Reuse simplified form or a button to open modal? For simplicity, we just put the form at bottom or top. 
                        Let's put a simplified adder here or just rely on the user refreshing. 
                        Actually, let's keep it clean.
                    */}
                 </div>
              ) : null}
            </div>

            {/* Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8`}>
              
              {portfolios.map((data) => {
                const isPositive = data.change >= 0;
                
                return (
                  <div key={data.symbol} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-600 group">
                    
                    {/* Card Header */}
                    <div className="p-6 border-b border-slate-800 relative bg-gradient-to-b from-slate-800/50 to-transparent">
                      <button 
                        onClick={() => handleRemove(data.symbol)}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Rimuovi dal portafoglio"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           {/* Icon placeholder based on type could go here */}
                           <div className="bg-slate-800 p-2 rounded-xl border border-slate-700">
                             <span className="text-lg font-bold text-white">{data.symbol.substring(0,2)}</span>
                           </div>
                           <div>
                              <h2 className="text-xl font-bold text-white">{data.symbol}</h2>
                              <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider">{data.name}</h3>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-2xl font-bold text-white tabular-nums tracking-tight">
                              €{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </div>
                           <div className={`flex items-center justify-end gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit ml-auto ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              <span>{data.changePercent.toFixed(2)}%</span>
                           </div>
                        </div>
                      </div>

                      {/* Portfolio Quantity Input */}
                      <div className="flex items-center gap-3 bg-slate-950/50 p-3 rounded-xl border border-dashed border-slate-800">
                        <Calculator className="w-4 h-4 text-primary-400" />
                        <label className="text-xs text-slate-400 font-medium">Quantità:</label>
                        <input 
                          type="number" 
                          min="0" 
                          step="any"
                          value={data.userQuantity || ''}
                          onChange={(e) => updateQuantity(data.symbol, parseFloat(e.target.value) || 0)}
                          className="w-24 bg-transparent border-b border-slate-600 text-white text-sm font-bold text-right focus:outline-none focus:border-primary-500 transition-colors"
                        />
                        <div className="text-xs text-slate-500 ml-auto">
                          Valore: <span className="text-slate-200">€{((data.userQuantity || 0) * data.price).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col p-6 gap-6">
                      
                      {/* Chart */}
                      <div className="relative">
                         <div className="absolute top-0 left-0 text-[10px] text-slate-500 font-mono">TREND 30D</div>
                         <FinancialChart data={data.history} color={data.change >= 0 ? '#10b981' : '#f43f5e'} />
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <MetricCard label="Cap. Mercato" value={data.marketCap} />
                        <MetricCard label="P/E Ratio" value={data.peRatio} />
                        <MetricCard label="Div. Yield" value={data.dividendYield} />
                         <MetricCard label="Range 52W" value={data.high52Week} subValue={`Low: ${data.low52Week}`} />
                      </div>

                      {/* AI Description */}
                      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 flex-1 relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-primary-600"></div>
                         <div className="flex items-center gap-2 mb-2 text-primary-400 text-xs font-bold uppercase tracking-wider">
                            <Activity className="w-3 h-3" /> Analisi AI
                         </div>
                         <p className="text-sm text-slate-400 leading-relaxed font-light">
                            {data.description}
                         </p>
                      </div>

                      {/* Sources */}
                      {data.sources && data.sources.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-auto border-t border-slate-800 pt-4">
                            {data.sources.map((source, idx) => (
                               <a 
                                  key={idx} 
                                  href={source} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-primary-400 transition-colors bg-slate-900 px-2 py-1 rounded"
                               >
                                  <Globe className="w-3 h-3" />
                                  Fonte {idx + 1}
                               </a>
                            ))}
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Add New Slot */}
              <div className="min-h-[600px] border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-600 hover:text-primary-400 hover:border-primary-500/30 hover:bg-slate-900/20 transition-all cursor-pointer group" onClick={() => setPortfolios([])}>
                 <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                 </div>
                 <p className="font-medium text-lg">Nuova Ricerca</p>
                 <p className="text-sm mt-2 opacity-50 text-center max-w-xs">Clicca qui per resettare la dashboard e cercare nuovi asset</p>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;