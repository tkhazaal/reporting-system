// ─── Kajabi API types ─────────────────────────────────────────────────────────
export interface KajabiOrder {
  id: string | number;
  state: string;
  total: string | number;
  currency: string;
  email: string;
  created_at: string;
  line_items: KajabiLineItem[];
}

export interface KajabiLineItem {
  id: string | number;
  product_name: string;
  offer_name: string;
  price: string | number;
  quantity: number;
}

export interface KajabiPerson {
  id: string | number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

// ─── Google Sheets row types ──────────────────────────────────────────────────
export interface CustomerRow {
  email: string;
  first_name: string;
  last_name: string;
  kajabi_customer_id: string;
  platform: string;
}

export interface OrderRow {
  order_id: string;
  email: string;
  platform: string;
  order_date: string;
  total_paid: number;
  status: string;
  currency: string;
}

export interface OrderItemRow {
  order_id: string;
  email: string;
  product_name: string;
  offer_name: string;
  item_price: number;
  quantity: number;
  purchase_date: string;
}

export interface CustomerSummaryRow {
  email: string;
  name: string;
  total_orders: number | string;
  total_products: number | string;
  lifetime_value: number | string;
  first_purchase_date: string;
  second_purchase_date: string;
  gap_days: string;
  buyer_type: string;
}

export interface ProductPathRow {
  email: string;
  first_product: string;
  second_product: string;
  first_purchase_date: string;
  second_purchase_date: string;
  gap_days: string;
}

// ─── Dashboard metrics ────────────────────────────────────────────────────────
export interface OverviewMetrics {
  totalUniqueCustomers: number;
  totalRevenue: number;
  averageLTV: number;
  medianLTV: number;
  singleBuyers: number;
  repeatBuyers: number;
  customersByOrderCount: { count: number; customers: number }[];
}

export interface RepeatBuyerMetrics {
  sameSessionRepeatBuyers: number;
  independentReturners: number;
  averageGapDays: number;
  medianGapDays: number;
  sameSessionRevenue: number;
  independentReturnRevenue: number;
}

export interface LTVBracket {
  label: string;
  min: number;
  max: number | null;
  count: number;
  totalRevenue: number;
  percentage: number;
}

export interface TopCustomer {
  name: string;
  email: string;
  totalOrders: number;
  totalProducts: number;
  lifetimeValue: number;
}

export interface ProductPath {
  firstProduct: string;
  secondProduct: string;
  count: number;
}

// ─── GA4 types ────────────────────────────────────────────────────────────────
export interface TrafficSource {
  source: string;
  medium: string;
  label: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

export interface LandingPageStats {
  pagePath: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

export interface GA4Data {
  trafficSources: TrafficSource[];
  landingPages: LandingPageStats[];
  totalSessions: number;
  totalConversions: number;
  overallConversionRate: number;
  lastUpdated: string | null;
  error?: string;
}

// ─── Full dashboard payload ───────────────────────────────────────────────────
export interface DashboardData {
  overview: OverviewMetrics;
  repeatBuyers: RepeatBuyerMetrics;
  ltvBreakdown: LTVBracket[];
  topCustomers: TopCustomer[];
  productPaths: ProductPath[];
  ga4: GA4Data | null;
  lastSynced: string | null;
  totalOrders: number;
  error?: string;
}
