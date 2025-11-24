export interface HistoryPoint {
  date: string;
  price: number;
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
  description: string;
  history: HistoryPoint[];
  sources?: string[];
  userQuantity?: number; // Quantità posseduta nel portafoglio simulato
}

export enum ViewState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}