import type {
  KajabiOrder, KajabiPerson,
  CustomerRow, OrderRow, OrderItemRow, CustomerSummaryRow, ProductPathRow,
  OverviewMetrics, RepeatBuyerMetrics, LTVBracket, TopCustomer, ProductPath, DashboardData,
} from './types';
import { parseOrderTotal } from './kajabi';

export function transformToCustomers(people: KajabiPerson[], orderEmails: Set<string>): CustomerRow[] {
  const seen = new Set<string>();
  const out: CustomerRow[] = [];
  for (const p of people) {
    const email = (p.email || '').toLowerCase().trim();
    if (!email || seen.has(email)) continue;
    seen.add(email);
    out.push({ email, first_name: p.first_name || '', last_name: p.last_name || '', kajabi_customer_id: String(p.id), platform: 'kajabi' });
  }
  Array.from(orderEmails).forEach(email => {
    if (!seen.has(email)) {
      seen.add(email);
      out.push({ email, first_name: '', last_name: '', kajabi_customer_id: '', platform: 'kajabi' });
    }
  });
  return out;
}

export function transformToOrders(orders: KajabiOrder[]): OrderRow[] {
  return orders.map(o => ({
    order_id: String(o.id),
    email: (o.email || '').toLowerCase().trim(),
    platform: 'kajabi',
    order_date: o.created_at || '',
    total_paid: parseOrderTotal(o.total),
    status: o.state || '',
    currency: o.currency || 'USD',
  }));
}

export function transformToOrderItems(orders: KajabiOrder[]): OrderItemRow[] {
  const items: OrderItemRow[] = [];
  for (const o of orders) {
    for (const item of o.line_items || []) {
      items.push({
        order_id: String(o.id),
        email: (o.email || '').toLowerCase().trim(),
        product_name: item.product_name || '',
        offer_name: item.offer_name || '',
        item_price: parseOrderTotal(item.price),
        quantity: item.quantity || 1,
        purchase_date: o.created_at || '',
      });
    }
  }
  return items;
}

export function buildCustomerSummaries(
  orders: OrderRow[],
  items: OrderItemRow[],
  customers: CustomerRow[]
): { summaries: CustomerSummaryRow[]; paths: ProductPathRow[] } {
  const nameMap = new Map<string, string>();
  for (const c of customers) {
    const name = [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
    if (name) nameMap.set(c.email, name);
  }

  const byEmail = new Map<string, { email: string; name: string; orders: { date: Date; total: number; id: string }[]; products: string[] }>();

  for (const o of orders) {
    const email = o.email;
    if (!email) continue;
    if (!byEmail.has(email)) byEmail.set(email, { email, name: nameMap.get(email) || '', orders: [], products: [] });
    const d = new Date(o.order_date);
    if (!isNaN(d.getTime())) byEmail.get(email)!.orders.push({ date: d, total: o.total_paid, id: o.order_id });
  }

  for (const item of items) {
    if (!item.email || !byEmail.has(item.email)) continue;
    const name = item.product_name || item.offer_name;
    if (name) byEmail.get(item.email)!.products.push(name);
  }

  const summaries: CustomerSummaryRow[] = [];
  const paths: ProductPathRow[] = [];

  Array.from(byEmail.values()).forEach(d => {
    d.orders.sort((a, b) => a.date.getTime() - b.date.getTime());
    const ltv = d.orders.reduce((s, o) => s + o.total, 0);
    const first = d.orders[0];
    const second = d.orders[1];
    let gapDays = '';
    let buyerType = 'single';

    if (first && second) {
      const gap = (second.date.getTime() - first.date.getTime()) / 86400000;
      gapDays = gap.toFixed(2);
      buyerType = gap <= 1 ? 'same_session_repeat' : 'independent_returner';
    }

    summaries.push({
      email: d.email,
      name: d.name,
      total_orders: d.orders.length,
      total_products: Array.from(new Set(d.products)).length,
      lifetime_value: ltv,
      first_purchase_date: first ? first.date.toISOString() : '',
      second_purchase_date: second ? second.date.toISOString() : '',
      gap_days: gapDays,
      buyer_type: buyerType,
    });

    if (first && second) {
      const firstItems = items.filter(i => i.order_id === first.id).map(i => i.product_name || i.offer_name).filter(Boolean);
      const secondItems = items.filter(i => i.order_id === second.id).map(i => i.product_name || i.offer_name).filter(Boolean);
      paths.push({
        email: d.email,
        first_product: firstItems[0] || 'Unknown',
        second_product: secondItems[0] || 'Unknown',
        first_purchase_date: first.date.toISOString(),
        second_purchase_date: second.date.toISOString(),
        gap_days: gapDays,
      });
    }
  });

  return { summaries, paths };
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

export function calculateDashboard(
  summaries: CustomerSummaryRow[],
  pathRows: ProductPathRow[],
  totalOrdersCount: number,
  lastSynced: string | null
): DashboardData {
  const ltvs = summaries.map(s => Number(s.lifetime_value) || 0);
  const totalRevenue = ltvs.reduce((a, b) => a + b, 0);
  const totalUnique = summaries.length;

  const orderCountMap = new Map<number, number>();
  for (const s of summaries) {
    const n = Number(s.total_orders) || 1;
    orderCountMap.set(n, (orderCountMap.get(n) || 0) + 1);
  }

  const sameSession = summaries.filter(s => s.buyer_type === 'same_session_repeat');
  const independent = summaries.filter(s => s.buyer_type === 'independent_returner');
  const gapValues = summaries.filter(s => s.gap_days && Number(s.gap_days) > 0).map(s => Number(s.gap_days));

  const brackets = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50–$99', min: 50, max: 100 },
    { label: '$100–$199', min: 100, max: 200 },
    { label: '$200–$499', min: 200, max: 500 },
    { label: '$500–$999', min: 500, max: 1000 },
    { label: '$1,000+', min: 1000, max: null as number | null },
  ];

  const ltvBreakdown: LTVBracket[] = brackets.map(b => {
    const inBracket = summaries.filter(s => {
      const v = Number(s.lifetime_value) || 0;
      return v >= b.min && (b.max === null || v < b.max);
    });
    const rev = inBracket.reduce((s, r) => s + (Number(r.lifetime_value) || 0), 0);
    return { ...b, count: inBracket.length, totalRevenue: rev, percentage: totalRevenue > 0 ? (rev / totalRevenue) * 100 : 0 };
  });

  const pathMap = new Map<string, number>();
  for (const p of pathRows) {
    if (!p.first_product || !p.second_product) continue;
    const key = `${p.first_product}|||${p.second_product}`;
    pathMap.set(key, (pathMap.get(key) || 0) + 1);
  }

  const productPaths: ProductPath[] = Array.from(pathMap.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 20)
    .map(([key, count]) => { const [f, s] = key.split('|||'); return { firstProduct: f, secondProduct: s, count }; });

  return {
    overview: {
      totalUniqueCustomers: totalUnique,
      totalRevenue,
      averageLTV: totalUnique > 0 ? totalRevenue / totalUnique : 0,
      medianLTV: median(ltvs),
      singleBuyers: summaries.filter(s => Number(s.total_orders) === 1).length,
      repeatBuyers: summaries.filter(s => Number(s.total_orders) >= 2).length,
      customersByOrderCount: Array.from(orderCountMap.entries()).sort((a, b) => a[0] - b[0]).map(([count, customers]) => ({ count, customers })),
    },
    repeatBuyers: {
      sameSessionRepeatBuyers: sameSession.length,
      independentReturners: independent.length,
      averageGapDays: gapValues.length > 0 ? gapValues.reduce((a, b) => a + b, 0) / gapValues.length : 0,
      medianGapDays: median(gapValues),
      sameSessionRevenue: sameSession.reduce((s, r) => s + (Number(r.lifetime_value) || 0), 0),
      independentReturnRevenue: independent.reduce((s, r) => s + (Number(r.lifetime_value) || 0), 0),
    },
    ltvBreakdown,
    topCustomers: summaries
      .sort((a, b) => (Number(b.lifetime_value) || 0) - (Number(a.lifetime_value) || 0))
      .slice(0, 20)
      .map(s => ({
        name: s.name || s.email,
        email: s.email,
        totalOrders: Number(s.total_orders) || 0,
        totalProducts: Number(s.total_products) || 0,
        lifetimeValue: Number(s.lifetime_value) || 0,
      })),
    productPaths,
    ga4: null,
    lastSynced,
    totalOrders: totalOrdersCount,
  };
}
