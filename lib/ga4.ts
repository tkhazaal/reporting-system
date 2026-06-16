import { google } from 'googleapis';

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';

function getAnalyticsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !key) throw new Error('Missing Google service account credentials');

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });
  return google.analyticsdata({ version: 'v1beta', auth });
}

// Map UTM source/medium combinations to friendly labels
function labelTrafficSource(source: string, medium: string): string {
  const s = source.toLowerCase();
  const m = medium.toLowerCase();
  if (s === 'facebook' && m === 'story') return 'Facebook Stories';
  if (s === 'facebook' && m === 'post') return 'Facebook Post';
  if (s === 'facebook' || s === 'fb') return 'Facebook';
  if (s === 'instagram' && m === 'story') return 'Instagram Stories';
  if (s === 'instagram' && m === 'post') return 'Instagram Post';
  if (s === 'instagram' || s === 'ig') return 'Instagram';
  if (s === 'google') return 'Google';
  if (s === 'email' || m === 'email') return 'Email';
  if (m === 'organic') return `Organic (${source})`;
  if (s === '(direct)' || s === 'direct') return 'Direct';
  return `${source} / ${medium}`.replace('(none)', '').trim().replace(/\/$/, '');
}

export interface GA4TrafficData {
  trafficSources: {
    source: string;
    medium: string;
    label: string;
    sessions: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
  }[];
  landingPages: {
    pagePath: string;
    sessions: number;
    conversions: number;
    conversionRate: number;
  }[];
  totalSessions: number;
  totalConversions: number;
  overallConversionRate: number;
  lastUpdated: string;
}

export async function fetchGA4TrafficData(daysBack = 90): Promise<GA4TrafficData> {
  if (!GA4_PROPERTY_ID) throw new Error('GA4_PROPERTY_ID is not configured');

  const analytics = getAnalyticsClient();

  const [trafficRes, landingRes] = await Promise.all([
    // Traffic by source/medium
    analytics.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: `${daysBack}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [
          { name: 'sessions' },
          { name: 'conversions' },
          { name: 'purchaseRevenue' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '50',
      },
    }),
    // Landing pages
    analytics.properties.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [{ startDate: `${daysBack}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'landingPagePlusQueryString' }],
        metrics: [{ name: 'sessions' }, { name: 'conversions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: '20',
      },
    }),
  ]);

  const trafficSources = (trafficRes.data.rows || []).map(row => {
    const source = row.dimensionValues?.[0]?.value || '';
    const medium = row.dimensionValues?.[1]?.value || '';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0');
    const conversions = parseInt(row.metricValues?.[1]?.value || '0');
    const revenue = parseFloat(row.metricValues?.[2]?.value || '0');
    return {
      source,
      medium,
      label: labelTrafficSource(source, medium),
      sessions,
      conversions,
      conversionRate: sessions > 0 ? (conversions / sessions) * 100 : 0,
      revenue,
    };
  });

  const landingPages = (landingRes.data.rows || []).map(row => {
    const pagePath = row.dimensionValues?.[0]?.value || '';
    const sessions = parseInt(row.metricValues?.[0]?.value || '0');
    const conversions = parseInt(row.metricValues?.[1]?.value || '0');
    return {
      pagePath,
      sessions,
      conversions,
      conversionRate: sessions > 0 ? (conversions / sessions) * 100 : 0,
    };
  });

  const totalSessions = trafficSources.reduce((s, r) => s + r.sessions, 0);
  const totalConversions = trafficSources.reduce((s, r) => s + r.conversions, 0);

  return {
    trafficSources,
    landingPages,
    totalSessions,
    totalConversions,
    overallConversionRate: totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0,
    lastUpdated: new Date().toISOString(),
  };
}
