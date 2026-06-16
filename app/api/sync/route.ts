import { NextResponse } from 'next/server';
import { fetchAllOrders, fetchAllPeople } from '@/lib/kajabi';
import { ensureTabsExist, writeCustomers, writeOrders, writeOrderItems, writeCustomerSummary, writeProductPaths, writeMeta } from '@/lib/sheets';
import { transformToCustomers, transformToOrders, transformToOrderItems, buildCustomerSummaries } from '@/lib/calculations';

export const maxDuration = 300;

export async function POST() {
  try {
    const [kajabiOrders, kajabiPeople] = await Promise.all([
      fetchAllOrders(),
      fetchAllPeople(),
    ]);

    const orderEmails = new Set(kajabiOrders.map(o => (o.email || '').toLowerCase().trim()).filter(Boolean));
    const customers = transformToCustomers(kajabiPeople, orderEmails);
    const orders = transformToOrders(kajabiOrders);
    const orderItems = transformToOrderItems(kajabiOrders);
    const { summaries, paths } = buildCustomerSummaries(orders, orderItems, customers);

    await ensureTabsExist();
    await writeCustomers(customers);
    await writeOrders(orders);
    await writeOrderItems(orderItems);
    await writeCustomerSummary(summaries);
    await writeProductPaths(paths);
    const lastSynced = new Date().toISOString();
    await writeMeta(lastSynced);

    return NextResponse.json({
      success: true,
      stats: { customers: customers.length, orders: orders.length, orderItems: orderItems.length, customerSummaries: summaries.length, productPaths: paths.length, lastSynced },
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sync failed' }, { status: 500 });
  }
}
