const DEFAULT_METRICS = ["totalUsers", "activeUsers", "screenPageViews"];
const DEFAULT_DIMENSIONS = ["country", "deviceCategory"];
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

const sanitizeList = (value, fallback) => {
  if (!Array.isArray(value) || value.length === 0) {
    return fallback;
  }
  return value.filter((item) => typeof item === "string" && item.trim().length);
};

const coerceLimit = (limit) => {
  if (!Number.isInteger(limit) || limit <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(limit, MAX_LIMIT);
};

const normalizeOrderBys = (orderBys) => {
  if (!Array.isArray(orderBys)) {
    return undefined;
  }

  const cleaned = orderBys
    .filter((order) => order && (order.metric || order.dimension))
    .map((order) => ({
      metric: order.metric,
      dimension: order.dimension,
      desc: typeof order.desc === "boolean" ? order.desc : true,
    }));

  return cleaned.length ? cleaned : undefined;
};

const formatReportRows = (report) => {
  if (!report?.rows?.length) {
    return [];
  }

  const dimensionHeaders = report.dimensionHeaders || [];
  const metricHeaders = report.metricHeaders || [];

  return report.rows.map((row) => {
    const dimensions = {};
    const metrics = {};

    dimensionHeaders.forEach((header, index) => {
      const key = header.name;
      dimensions[key] = row.dimensionValues?.[index]?.value ?? null;
    });

    metricHeaders.forEach((header, index) => {
      const key = header.name;
      const rawValue = row.metricValues?.[index]?.value ?? "0";
      const numericValue = Number(rawValue);
      metrics[key] = Number.isNaN(numericValue) ? rawValue : numericValue;
    });

    return { dimensions, metrics };
  });
};

const formatReportTotals = (report) => {
  if (!report?.totals?.length || !report.metricHeaders?.length) {
    return {};
  }

  const totalsRow = report.totals[0];
  const totals = {};

  report.metricHeaders.forEach((header, index) => {
    const rawValue = totalsRow.metricValues?.[index]?.value ?? "0";
    const numericValue = Number(rawValue);
    totals[header.name] = Number.isNaN(numericValue) ? rawValue : numericValue;
  });

  return totals;
};

const makeGetRealtimeAnalyticsUseCase = ({
  googleAnalyticsDataAccess,
  logger,
  propertyId,
}) => {
  if (!googleAnalyticsDataAccess) {
    throw new Error(
      "googleAnalyticsDataAccess dependency is required for GA use case"
    );
  }
  if (!logger) {
    throw new Error("logger dependency is required for GA use case");
  }
  if (!propertyId) {
    throw new Error(
      "GA4_PROPERTY_ID is not set. Please configure it in your environment."
    );
  }

  return async function getRealtimeAnalytics(params = {}) {
    const metrics = sanitizeList(params.metrics, DEFAULT_METRICS);
    const dimensions = sanitizeList(params.dimensions, DEFAULT_DIMENSIONS);
    const limit = coerceLimit(params.limit);
    const orderBys = normalizeOrderBys(params.orderBys);

    try {
      const report = await googleAnalyticsDataAccess.runRealtimeReport({
        propertyId,
        metrics,
        dimensions,
        limit,
        orderBys,
      });

      return {
        rows: formatReportRows(report),
        totals: formatReportTotals(report),
        metadata: {
          rowCount: report?.rows?.length || 0,
          limit,
          metrics,
          dimensions,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: "Failed to fetch Google Analytics realtime data",
          error: error.message,
          code: error.code,
        })
      );
      throw error;
    }
  };
};

module.exports = { makeGetRealtimeAnalyticsUseCase };

