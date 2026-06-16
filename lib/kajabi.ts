import type { KajabiOrder, KajabiPerson } from './types';

const KAJABI_SITE_URL = (process.env.KAJABI_SITE_URL || 'https://tania-khazaal.mykajabi.com').replace(/\/$/, '');
const KAJABI_API_KEY = process.env.KAJABI_API_KEY || '';

const PAID_STATUSES = ['paid', 'complete', 'completed'];
const EXCLUDED_STATUSES = ['refunded', 'failed', 'cancelled', 'canceled', 'pending'];

async function kajabiGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const url = new URL(`${KAJABI_SITE_URL}/api/kajabi_integration/v1${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${KAJABI_API_KEY}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Kajabi API ${res.status} on ${path}: ${body.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

interface OrdersResponse {
  orders?: KajabiOrder[];
  data?: KajabiOrder[];
  meta?: { current_page: number; total_pages: number };
}

interface PeopleResponse {
  people?: KajabiPerson[];
  data?: KajabiPerson[];
  meta?: { current_page: number; total_pages: number };
}

export async function fetchAllOrders(): Promise<KajabiOrder[]> {
  const all: KajabiOrder[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await kajabiGet<OrdersResponse>('/orders', { page, per_page: 100 });
    const batch = res.orders || res.data || [];
    all.push(...batch);
    totalPages = res.meta?.total_pages ?? 1;
    page++;
  } while (page <= totalPages);

  return all.filter(o => {
    const s = (o.state || '').toLowerCase();
    if (EXCLUDED_STATUSES.some(x => s.includes(x))) return false;
    if (PAID_STATUSES.some(x => s.includes(x))) return true;
    return parseOrderTotal(o.total) > 0;
  });
}

export async function fetchAllPeople(): Promise<KajabiPerson[]> {
  const all: KajabiPerson[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await kajabiGet<PeopleResponse>('/people', { page, per_page: 100 });
    const batch = res.people || res.data || [];
    all.push(...batch);
    totalPages = res.meta?.total_pages ?? 1;
    page++;
  } while (page <= totalPages);

  return all;
}

export function parseOrderTotal(total: string | number): number {
  if (typeof total === 'number') return total;
  return parseFloat(String(total).replace(/[^0-9.]/g, '')) || 0;
}
