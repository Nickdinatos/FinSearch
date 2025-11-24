
export interface HistoryPoint {
  date: string;
  price: number;
}

export interface AnalysisData {
  overview: string;
  movements: string;
  forecast: string;
}

export interface PortfolioAnalysis {
  diversification: string;
  riskProfile: string;
  strategyForecast: string;
}

export interface FinancialData {
  symbol: string;
  name: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  marketCap: string;
  peRatio: string;
  dividendYield: string;
  high52Week: string;
  low52Week: string;
  volume: string;
  description: string; // Deprecated in favor of analysis, kept for legacy
  analysis: AnalysisData; // New detailed analysis
  history: HistoryPoint[];
  sources?: string[];
  userWeight?: number; // Peso percentuale nel portafoglio (0-100)
}

export interface SavedPortfolioItem {
  symbol: string;
  weight: number;
}

export interface SavedPortfolio {
  id: string;
  name: string;
  createdAt: number;
  items: SavedPortfolioItem[];
}

export enum ViewState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
