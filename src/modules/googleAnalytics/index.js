const { WebSocketServer } = require("ws");

const logger = require("../../utils/logger");
const { makeGoogleAnalyticsDataAccess } = require("./data-access/makeGoogleAnalyticsDataAccess");
const { makeGetRealtimeAnalyticsUseCase } = require("./usecases/makeGetRealtimeAnalytics");
const { makeGoogleAnalyticsWebsocketController } = require("./controllers/makeGoogleAnalyticsWebsocketController");

const googleAnalyticsDataAccess = makeGoogleAnalyticsDataAccess({ logger });

const getRealtimeAnalyticsUseCase = makeGetRealtimeAnalyticsUseCase({
  googleAnalyticsDataAccess,
  logger,
  propertyId: process.env.GA4_PROPERTY_ID,
});

const googleAnalyticsWebsocketController = makeGoogleAnalyticsWebsocketController({
  getRealtimeAnalyticsUseCase,
  logger,
});

const DEFAULT_WS_PATH = "/ws/google-analytics";

const makeInitializeGoogleAnalyticsWebsocket = () => {
  const initializeGoogleAnalyticsWebsocket = ({
    server,
    path = process.env.GA_WEBSOCKET_PATH || DEFAULT_WS_PATH,
  } = {}) => {
    if (!server) {
      throw new Error(
        "HTTP server instance is required to initialize Google Analytics websocket"
      );
    }

    const wsServer = new WebSocketServer({
      server,
      path,
    });

    wsServer.on("connection", (socket, request) => {
      logger.info(
        `New Google Analytics websocket client connected from ${request.socket.remoteAddress}`
      );
      googleAnalyticsWebsocketController.handleConnection(socket, request);
    });

    wsServer.on("error", (error) => {
      logger.error(
        JSON.stringify({
          message: "Google Analytics websocket server error",
          error: error.message,
        })
      );
    });

    logger.info(
      `Google Analytics websocket server listening on path ${path || DEFAULT_WS_PATH}`
    );

    return wsServer;
  };

  return initializeGoogleAnalyticsWebsocket;
};

const initializeGoogleAnalyticsWebsocket = makeInitializeGoogleAnalyticsWebsocket();

module.exports = {
  googleAnalyticsWebsocketController,
  getRealtimeAnalyticsUseCase,
  initializeGoogleAnalyticsWebsocket,
};

