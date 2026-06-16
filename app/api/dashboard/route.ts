import { NextResponse } from 'next/server';
import { fetchAllOrders, fetchAllPeople } from '@/lib/kajabi';
import {
  transformToCustomers,
  transformToOrders,
  transformToOrderItems,
  buildCustomerSummaries,
  calculateDashboard,
} from '@/lib/calculations';
import { fetchGA4TrafficData } from '@/lib/ga4';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch from Kajabi API directly
    const [kajabiOrders, kajabiPeople] = await Promise.all([
      fetchAllOrders(),
      fetchAllPeople(),
    ]);

    // Transform raw Kajabi data
    const orderEmails = new Set(
      kajabiOrders.map(o => (o.email || '').toLowerCase().trim()).filter(Boolean)
    );
    const customers = transformToCustomers(kajabiPeople, orderEmails);
    const orders = transformToOrders(kajabiOrders);
    const orderItems = transformToOrderItems(kajabiOrders);

    // Build customer summaries and product paths
    const { summaries, paths } = buildCustomerSummaries(orders, orderItems, customers);

    // Calculate all dashboard metrics
    const data = calculateDashboard(summaries, paths, orders.length, new Date().toISOString());

    // Fetch GA4 data if configured
    if (process.env.GA4_PROPERTY_ID) {
      try {
        data.ga4 = await fetchGA4TrafficData(90);
      } catch (ga4Err) {
        data.ga4 = {
          trafficSources: [],
          landingPages: [],
          totalSessions: 0,
          totalConversions: 0,
          overallConversionRate: 0,
          lastUpdated: null,
          error: ga4Err instanceof Error ? ga4Err.message : 'GA4 unavailable',
        };
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load data' },
      { status: 500 }
    );
  }
}
