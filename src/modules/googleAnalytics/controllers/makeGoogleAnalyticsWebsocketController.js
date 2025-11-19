const MIN_INTERVAL_MS = 5000;
const MAX_INTERVAL_MS = 300000;
const DEFAULT_INTERVAL_MS = 30000;

const EVENTS = {
  CONNECTED: "ga/realtime/connected",
  DATA: "ga/realtime/data",
  FETCH: "ga/realtime/fetch",
  SUBSCRIBE: "ga/realtime/subscribe",
  SUBSCRIBED: "ga/realtime/subscribed",
  UNSUBSCRIBE: "ga/realtime/unsubscribe",
  UNSUBSCRIBED: "ga/realtime/unsubscribed",
  ERROR: "ga/realtime/error",
};

const coerceNameList = (value) => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const normalized = value
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }
      if (item && typeof item.name === "string") {
        return item.name.trim();
      }
      return undefined;
    })
    .filter((entry) => Boolean(entry));

  return normalized.length ? normalized : undefined;
};

const normalizeAnalyticsPayload = (payload = {}, logger) => {
  const metrics =
    coerceNameList(payload.metrics) ||
    coerceNameList(payload.metricNames) ||
    coerceNameList(payload.gaMetrics) ||
    coerceNameList(payload.gaMetricNames);

  const dimensions =
    coerceNameList(payload.dimensions) ||
    coerceNameList(payload.dimensionNames) ||
    coerceNameList(payload.gaDimensions) ||
    coerceNameList(payload.gaDimensionNames);

  const normalizedPayload = { ...payload };

  if (metrics && metrics.length > 0) {
    normalizedPayload.metrics = metrics;
  } else {
    delete normalizedPayload.metrics;
  }

  if (dimensions && dimensions.length > 0) {
    normalizedPayload.dimensions = dimensions;
  } else {
    delete normalizedPayload.dimensions;
  }

  if (logger && process.env.NODE_ENV !== "production") {
    logger.info(
      JSON.stringify({
        message: "Normalized GA payload",
        originalMetrics: payload.metrics || payload.gaMetrics,
        normalizedMetrics: normalizedPayload.metrics,
        originalDimensions: payload.dimensions || payload.gaDimensions,
        normalizedDimensions: normalizedPayload.dimensions,
      })
    );
  }

  return normalizedPayload;
};

const makeGoogleAnalyticsWebsocketController = ({
  getRealtimeAnalyticsUseCase,
  logger,
}) => {
  if (!getRealtimeAnalyticsUseCase) {
    throw new Error(
      "getRealtimeAnalyticsUseCase dependency is required for GA websocket controller"
    );
  }
  if (!logger) {
    throw new Error("logger dependency is required for GA websocket controller");
  }

  const subscriptions = new WeakMap();

  const safeSend = (socket, payload) => {
    if (!socket || socket.readyState !== socket.OPEN) {
      return;
    }

    try {
      socket.send(JSON.stringify(payload));
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: "Failed to send message over GA websocket",
          error: error.message,
        })
      );
    }
  };

  const clearSubscription = (socket) => {
    const subscription = subscriptions.get(socket);
    if (subscription?.timerId) {
      clearInterval(subscription.timerId);
    }
    subscriptions.delete(socket);
  };

  const handleFetch = async (socket, payload = {}) => {
    const normalizedPayload = normalizeAnalyticsPayload(payload, logger);
    try {
      const data = await getRealtimeAnalyticsUseCase(normalizedPayload);
      safeSend(socket, { event: EVENTS.DATA, data });
    } catch (error) {
      safeSend(socket, {
        event: EVENTS.ERROR,
        error: {
          message:
            error.message ||
            "Unable to fetch Google Analytics data. Please try again.",
        },
      });
    }
  };

  const handleSubscription = (socket, payload = {}) => {
    clearSubscription(socket);

    const normalizedPayload = normalizeAnalyticsPayload(payload, logger);

    const intervalMs = Math.max(
      MIN_INTERVAL_MS,
      Math.min(
        typeof payload.intervalMs === "number"
          ? payload.intervalMs
          : DEFAULT_INTERVAL_MS,
        MAX_INTERVAL_MS
      )
    );

    const timerId = setInterval(() => {
      handleFetch(socket, normalizedPayload);
    }, intervalMs);

    subscriptions.set(socket, { timerId, payload: normalizedPayload, intervalMs });

    safeSend(socket, {
      event: EVENTS.SUBSCRIBED,
      data: { intervalMs },
    });

    handleFetch(socket, normalizedPayload);
  };

  const handleMessage = (socket, rawMessage) => {
    let parsedMessage;
    try {
      parsedMessage =
        typeof rawMessage === "string"
          ? JSON.parse(rawMessage)
          : JSON.parse(rawMessage.toString());
    } catch (_error) {
      safeSend(socket, {
        event: EVENTS.ERROR,
        error: { message: "Invalid JSON payload received" },
      });
      return;
    }

    const { event, data } = parsedMessage;

    switch (event) {
      case EVENTS.FETCH:
        handleFetch(socket, data || {});
        break;
      case EVENTS.SUBSCRIBE:
        handleSubscription(socket, data || {});
        break;
      case EVENTS.UNSUBSCRIBE:
        clearSubscription(socket);
        safeSend(socket, {
          event: EVENTS.UNSUBSCRIBED,
          data: { message: "Subscription cancelled" },
        });
        break;
      case "ping":
        safeSend(socket, { event: "pong", timestamp: Date.now() });
        break;
      default:
        safeSend(socket, {
          event: EVENTS.ERROR,
          error: { message: "Unsupported event type" },
        });
    }
  };

  const handleConnection = (socket) => {
    safeSend(socket, {
      event: EVENTS.CONNECTED,
      data: {
        message: "Connected to Google Analytics realtime websocket",
        propertyId: process.env.GA4_PROPERTY_ID,
      },
    });

    socket.on("message", (message) => handleMessage(socket, message));

    socket.on("close", () => {
      clearSubscription(socket);
      logger.info("Google Analytics websocket client disconnected");
    });

    socket.on("error", (error) => {
      logger.error(
        JSON.stringify({
          message: "Google Analytics websocket client error",
          error: error.message,
        })
      );
    });
  };

  return Object.freeze({
    handleConnection,
  });
};

module.exports = { makeGoogleAnalyticsWebsocketController };

