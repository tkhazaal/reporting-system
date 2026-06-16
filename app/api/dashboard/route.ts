import { NextResponse } from 'next/server';
import { readCustomerSummary, readProductPaths, readLastSynced, readOrders } from '@/lib/sheets';
import { calculateDashboard } from '@/lib/calculations';
import { fetchGA4TrafficData } from '@/lib/ga4';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [summaries, pathRows, lastSynced, orders] = await Promise.all([
      readCustomerSummary(),
      readProductPaths(),
      readLastSynced(),
      readOrders(),
    ]);

    const data = calculateDashboard(summaries, pathRows, orders.length, lastSynced);

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
          error: ga4Err instanceof Error ? ga4Err.message : 'GA4 error',
        };
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to load data' }, { status: 500 });
  }
}
