import React, { useState, useEffect } from 'react';
import { MultiSearchForm } from './components/MultiSearchForm';
import { FinancialChart } from './components/FinancialChart';
import { MetricCard } from './components/MetricCard';
import { PortfolioSummary } from './components/PortfolioSummary';
import { searchFinancialInstrument } from './services/geminiService';
import { FinancialData, ViewState, SavedPortfolio } from './types';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  X, 
  Save, 
  FolderOpen,
  ArrowRight,
  Target,
  BarChart3,
  Layers
} from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);
  const [portfolios, setPortfolios] = useState<FinancialData[]>([]);
  const [totalCapital, setTotalCapital] = useState<number>(10000);
  const [error, setError] = useState<string | null>(null);
  
  // Saving logic
  const [savedPortfolios, setSavedPortfolios] = useState<SavedPortfolio[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('finsearch_portfolios');
    if (saved) {
      setSavedPortfolios(JSON.parse(saved));
    }
  }, []);

  const savePortfolioToStorage = () => {
    if (!newPortfolioName.trim()) return;
    const newSave: SavedPortfolio = {
      id: Date.now().toString(),
      name: newPortfolioName,
      createdAt: Date.now(),
      items: portfolios.map(p => ({ symbol: p.symbol, weight: p.userWeight || 0 }))
    };
    const updated = [...savedPortfolios, newSave];
    setSavedPortfolios(updated);
    localStorage.setItem('finsearch_portfolios', JSON.stringify(updated));
    setShowSaveModal(false);
    setNewPortfolioName('');
  };

  const loadPortfolioFromStorage = async (portfolio: SavedPortfolio) => {
    setShowLoadModal(false);
    setPortfolios([]);
    // Convert saved items format to search format
    const queries = portfolio.items.map(i => ({ query: i.symbol, weight: i.weight }));
    await handleMultiSearch(queries);
  };

  const deleteSavedPortfolio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedPortfolios.filter(p => p.id !== id);
    setSavedPortfolios(updated);
    localStorage.setItem('finsearch_portfolios', JSON.stringify(updated));
  };

  const handleMultiSearch = async (items: { query: string, weight: number }[]) => {
    setViewState(ViewState.LOADING);
    setError(null);
    
    // Filter duplicates against existing *only if needed*, but for new portfolio generation we usually clear.
    // However, specs say "insert portfolis". Let's assume we replace or append.
    // Given the "Generate Portfolio" button nature, we'll replace the current view or add to it.
    // Let's implement smart merging: Update weight if exists, Add if new.
    
    // We initiate a new clean search for simplicity and stability for now, or allow mix?
    // Let's clear and load new set to act as a "Generator".
    
    try {
      const uniqueItems = items.filter((item, index, self) => 
        index === self.findIndex((t) => (
          t.query.toLowerCase() === item.query.toLowerCase()
        ))
      );

      const promises = uniqueItems.map(item => searchFinancialInstrument(item.query));
      const results = await Promise.allSettled(promises);
      
      const newValues: FinancialData[] = [];
      
      results.forEach((res, index) => {
        if (res.status === 'fulfilled') {
          newValues.push({ 
            ...res.value, 
            userWeight: uniqueItems[index].weight 
          });
        } else {
          console.error(res.reason);
        }
      });

      if (newValues.length > 0) {
        setPortfolios(newValues);
        setViewState(ViewState.SUCCESS);
      } else {
        setError("Nessuno strumento trovato.");
        setViewState(ViewState.ERROR);
      }

    } catch (err) {
      setError("Errore durante la ricerca.");
      setViewState(ViewState.ERROR);
    }
  };

  const handleRemove = (symbol: string) => {
    const updated = portfolios.filter(item => item.symbol !== symbol);
    setPortfolios(updated);
    if (updated.length === 0) setViewState(ViewState.IDLE);
  };

  const hasItems = portfolios.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans selection:bg-primary-500/30 pb-20">
      
      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setPortfolios([]); setViewState(ViewState.IDLE); }}>
             <Layers className="w-6 h-6 text-primary-500" />
             <span className="font-bold text-xl tracking-tight">FinSearch</span>
          </div>

          <div className="flex gap-3">
             <button 
                onClick={() => setShowLoadModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
             >
                <FolderOpen className="w-4 h-4" /> Portafogli
             </button>
             {hasItems && (
               <button 
                  onClick={() => setShowSaveModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow-lg shadow-emerald-900/20"
               >
                  <Save className="w-4 h-4" /> Salva
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-24 min-h-screen flex flex-col">
        
        {/* Load Modal */}
        {showLoadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-xl font-bold">I tuoi Portafogli</h3>
                   <button onClick={() => setShowLoadModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                   {savedPortfolios.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">Nessun portafoglio salvato.</p>
                   ) : (
                      savedPortfolios.map(p => (
                         <div key={p.id} onClick={() => loadPortfolioFromStorage(p)} className="flex items-center justify-between p-4 bg-slate-800 hover:bg-slate-700 rounded-xl cursor-pointer group transition">
                            <div>
                               <div className="font-bold text-white">{p.name}</div>
                               <div className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString()} • {p.items.length} Asset</div>
                            </div>
                            <button onClick={(e) => deleteSavedPortfolio(p.id, e)} className="p-2 hover:bg-rose-500/20 hover:text-rose-400 rounded-full text-slate-500">
                               <X className="w-4 h-4" />
                            </button>
                         </div>
                      ))
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Save Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
             <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Salva Portafoglio</h3>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Nome portafoglio (es. Tech Growth)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary-500 mb-4"
                  value={newPortfolioName}
                  onChange={(e) => setNewPortfolioName(e.target.value)}
                />
                <div className="flex gap-2 justify-end">
                   <button onClick={() => setShowSaveModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Annulla</button>
                   <button onClick={savePortfolioToStorage} disabled={!newPortfolioName} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50">Salva</button>
                </div>
             </div>
          </div>
        )}

        {/* Hero / Form */}
        {!hasItems && (
          <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700 mt-10">
            <div className="mb-8 flex items-center justify-center bg-slate-900/50 p-4 rounded-full border border-slate-800 shadow-2xl">
              <Layers className="w-10 h-10 text-primary-500 mr-3" />
              <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter">
                FinSearch
              </h1>
            </div>
            
            <p className="text-lg text-slate-400 mb-10 max-w-xl text-center">
              Inserisci fino a 4 strumenti, definisci il peso percentuale e ottieni un'analisi approfondita e previsionale.
            </p>

            <MultiSearchForm onSearch={handleMultiSearch} isLoading={viewState === ViewState.LOADING} />
            
            {viewState === ViewState.ERROR && error && (
              <div className="mt-6 p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg">
                {error}
              </div>
            )}
          </div>
        )}

        {hasItems && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Summary */}
            <PortfolioSummary items={portfolios} totalCapital={totalCapital} onUpdateCapital={setTotalCapital} />

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {portfolios.map((data) => {
                const isPositive = data.change >= 0;
                // Calcolo quantità simulata: (Capital * Weight%) / Price
                const simulatedQty = ((totalCapital * (data.userWeight || 0)) / 100) / data.price;
                const simulatedValue = simulatedQty * data.price;
                
                return (
                  <div key={data.symbol} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-slate-600 group flex flex-col">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800 relative bg-gradient-to-b from-slate-800/50 to-transparent">
                      <button 
                        onClick={() => handleRemove(data.symbol)}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-full transition-colors opacity-0 group-hover:opacity-100 z-10"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                           <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 shadow-inner">
                             <span className="text-xl font-black text-white">{data.symbol.substring(0,2)}</span>
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white">{data.symbol}</h2>
                              <h3 className="text-xs text-slate-400 font-medium uppercase tracking-wider max-w-[200px] truncate">{data.name}</h3>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-3xl font-bold text-white tabular-nums tracking-tight">
                              €{data.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                           </div>
                           <div className={`flex items-center justify-end gap-1 text-sm font-bold mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              <span>{data.changePercent.toFixed(2)}%</span>
                           </div>
                        </div>
                      </div>

                      {/* Position Info */}
                      <div className="grid grid-cols-2 gap-4 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                          <div>
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Peso Portafoglio</span>
                            <div className="text-lg font-bold text-white">{data.userWeight}%</div>
                          </div>
                          <div className="text-right">
                             <span className="text-[10px] uppercase text-slate-500 font-bold">Valore Simulato</span>
                             <div className="text-lg font-bold text-primary-400">€{simulatedValue.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
                          </div>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col gap-6">
                      
                      {/* Chart */}
                      <div className="h-[250px] w-full bg-slate-900/20 rounded-xl overflow-hidden border border-slate-800/50 p-2">
                         <FinancialChart data={data.history} color={data.change >= 0 ? '#10b981' : '#f43f5e'} />
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-2">
                        <MetricCard label="Mkt Cap" value={data.marketCap} />
                        <MetricCard label="P/E" value={data.peRatio} />
                        <MetricCard label="Range 52W" value={data.high52Week} />
                      </div>

                      {/* Analysis Sections */}
                      <div className="space-y-4 mt-2">
                         
                         {/* Overview */}
                         <div className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/30">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase mb-2">
                               <Activity className="w-3 h-3 text-blue-400" /> Panoramica
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{data.analysis.overview}</p>
                         </div>

                         {/* Movements */}
                         <div className="bg-slate-800/20 rounded-xl p-4 border border-slate-700/30">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase mb-2">
                               <BarChart3 className="w-3 h-3 text-purple-400" /> Analisi Movimenti
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">{data.analysis.movements}</p>
                         </div>

                         {/* Forecast */}
                         <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900 rounded-xl p-4 border border-indigo-500/20">
                            <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase mb-2">
                               <Target className="w-3 h-3" /> Previsionale
                            </h4>
                            <p className="text-sm text-indigo-100/80 leading-relaxed italic">
                               "{data.analysis.forecast}"
                            </p>
                         </div>

                      </div>

                      {/* Sources */}
                      {data.sources && (
                         <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-800/50">
                            <Globe className="w-3 h-3 text-slate-600" />
                            <div className="flex gap-2">
                            {data.sources.map((src, i) => (
                               <a key={i} href={src} target="_blank" rel="noreferrer" className="text-[10px] text-slate-500 hover:text-primary-400 underline">Fonte {i+1}</a>
                            ))}
                            </div>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;