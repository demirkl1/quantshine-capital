// ── Domain tipleri (frontend) ──────────────────────────────────────────────
// Backend DTO'larından türetildi. Jackson BigDecimal/sayıları JSON'da `number`
// olarak serialize eder; bazı uçlar Map<String,Object> döndürdüğü için alanlar
// geniş tutuldu ve çoğu opsiyoneldir.

export interface FundPerformance {
  day?: number;
  month?: number;
  q3?: number;
  q6?: number;
  ytd?: number;
  year?: number;
  day1?: number;
  day30?: number;
  day90?: number;
  day180?: number;
  day365?: number;
}

export interface AllocationItem {
  name?: string;
  value?: number;
  percentage?: number;
}

export interface Holding {
  stockCode?: string;
  stockName?: string;
  code?: string;
  name?: string;
  lot?: number;
  lotCount?: number;
  avgCost?: number;
  boughtPrice?: number;
  currentPrice?: number;
  unitPrice?: number;
  price?: number;
  costValue?: number;
  currentValue?: number;
  suanDeger?: number;
  toplamMaliyet?: number;
  amount?: number;
  totalValue?: number;
  fundCode?: string;
  type?: string;
  tlValue?: number;
  lots?: number;
  symbol?: string;
  ticker?: string;
  assetType?: string;
  weight?: number;
  quantity?: number;
  value?: number;
}

export interface Fund extends FundPerformance {
  code?: string;
  name?: string;
  type?: string;
  currency?: string;
  tefas?: boolean;
  price?: number;
  totalValue?: number;
  totalLot?: number;
  inceptionDate?: string;
  riskLevel?: number;
  performance?: FundPerformance;
  allocation?: AllocationItem[];
  holdings?: Holding[];
  securities?: Holding[];
  founder?: string;
  objective?: string;
  description?: string;
  fullName?: string;
  managedFund?: string;
  profitLossPercentage?: number;
}

export interface Advisor {
  id?: number;
  tcNo?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  ad?: string;
  soyad?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  performance?: number;
  managedFund?: string;
  managedFundCode?: string;
  description?: string;
}

export interface Investor {
  id?: number;
  tcNo?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  ad?: string;
  soyad?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  managedFund?: string;
  managedFundCode?: string;
  holdings?: Holding[];
  totalPortfolioValue?: number;
  genelKarZararYuzde?: string;
  karZararYuzde?: string;
  createdAt?: string;
  requestDate?: string;
  lot?: number;
  suanDeger?: number;
}

export interface Trade {
  id?: number;
  type?: string;
  amount?: number;
  lot?: number;
  lotCount?: number;
  unitPrice?: number;
  price?: number;
  boughtPrice?: number;
  fundCode?: string;
  investorName?: string;
  investorTc?: string;
  isOpen?: boolean;
  createdAt?: string;
  suanDeger?: number;
  toplamMaliyet?: number;
  currentPrice?: number;
}

export interface ChartPoint {
  date?: string;
  value?: number;
}

export interface Report {
  id?: number;
  title?: string;
  content?: string;
  createdAt?: string;
  advisor?: { id?: number; firstName?: string; lastName?: string };
}
