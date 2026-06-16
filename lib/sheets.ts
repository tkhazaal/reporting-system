import { google } from 'googleapis';
import type { CustomerRow, OrderRow, OrderItemRow, CustomerSummaryRow, ProductPathRow } from './types';

export const TABS = {
  CUSTOMERS: 'Customers',
  ORDERS: 'Orders',
  ORDER_ITEMS: 'OrderItems',
  CUSTOMER_SUMMARY: 'CustomerSummary',
  PRODUCT_PATHS: 'ProductPaths',
  META: 'Meta',
} as const;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY');
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() });
}

const SHEET_ID = process.env.GOOGLE_SHEETS_ID || '';

async function clearAndWrite(tab: string, headers: string[], rows: (string | number)[][]) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.clear({ spreadsheetId: SHEET_ID, range: `${tab}!A:Z` });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${tab}!A1`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [headers, ...rows] },
  });
}

async function readTab(tab: string): Promise<string[][]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: `${tab}!A:Z` });
  return (res.data.values || []) as string[][];
}

export async function ensureTabsExist() {
  const sheets = getSheets();
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = (spreadsheet.data.sheets || []).map(s => s.properties?.title || '');
  const missing = Object.values(TABS).filter(t => !existing.includes(t));
  if (missing.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: missing.map(title => ({ addSheet: { properties: { title } } })),
      },
    });
  }
}

export async function writeCustomers(rows: CustomerRow[]) {
  await clearAndWrite(TABS.CUSTOMERS, ['email', 'first_name', 'last_name', 'kajabi_customer_id', 'platform'],
    rows.map(r => [r.email, r.first_name, r.last_name, r.kajabi_customer_id, r.platform]));
}

export async function writeOrders(rows: OrderRow[]) {
  await clearAndWrite(TABS.ORDERS, ['order_id', 'email', 'platform', 'order_date', 'total_paid', 'status', 'currency'],
    rows.map(r => [r.order_id, r.email, r.platform, r.order_date, r.total_paid, r.status, r.currency]));
}

export async function writeOrderItems(rows: OrderItemRow[]) {
  await clearAndWrite(TABS.ORDER_ITEMS, ['order_id', 'email', 'product_name', 'offer_name', 'item_price', 'quantity', 'purchase_date'],
    rows.map(r => [r.order_id, r.email, r.product_name, r.offer_name, r.item_price, r.quantity, r.purchase_date]));
}

export async function writeCustomerSummary(rows: CustomerSummaryRow[]) {
  await clearAndWrite(TABS.CUSTOMER_SUMMARY,
    ['email', 'name', 'total_orders', 'total_products', 'lifetime_value', 'first_purchase_date', 'second_purchase_date', 'gap_days', 'buyer_type'],
    rows.map(r => [r.email, r.name, r.total_orders, r.total_products, r.lifetime_value, r.first_purchase_date, r.second_purchase_date, r.gap_days, r.buyer_type]));
}

export async function writeProductPaths(rows: ProductPathRow[]) {
  await clearAndWrite(TABS.PRODUCT_PATHS,
    ['email', 'first_product', 'second_product', 'first_purchase_date', 'second_purchase_date', 'gap_days'],
    rows.map(r => [r.email, r.first_product, r.second_product, r.first_purchase_date, r.second_purchase_date, r.gap_days]));
}

export async function writeMeta(lastSynced: string) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${TABS.META}!A1:B2`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [['key', 'value'], ['last_synced', lastSynced]] },
  });
}

function toObjects<T>(rows: string[][]): T[] {
  if (rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data
    .filter(r => r.some(c => c !== ''))
    .map(r => {
      const o: Record<string, string> = {};
      headers.forEach((h, i) => { o[h] = r[i] || ''; });
      return o as unknown as T;
    });
}

export async function readCustomerSummary(): Promise<CustomerSummaryRow[]> {
  const rows = await readTab(TABS.CUSTOMER_SUMMARY);
  return toObjects<CustomerSummaryRow>(rows).map(r => ({
    ...r,
    total_orders: parseFloat(String(r.total_orders)) || 0,
    total_products: parseFloat(String(r.total_products)) || 0,
    lifetime_value: parseFloat(String(r.lifetime_value)) || 0,
  }));
}

export async function readProductPaths(): Promise<ProductPathRow[]> {
  return toObjects<ProductPathRow>(await readTab(TABS.PRODUCT_PATHS));
}

export async function readOrders(): Promise<OrderRow[]> {
  return toObjects<OrderRow>(await readTab(TABS.ORDERS)).map(r => ({
    ...r,
    total_paid: parseFloat(String(r.total_paid)) || 0,
  }));
}

export async function readLastSynced(): Promise<string | null> {
  try {
    const rows = await readTab(TABS.META);
    const objs = toObjects<{ key: string; value: string }>(rows);
    return objs.find(r => r.key === 'last_synced')?.value || null;
  } catch { return null; }
}
