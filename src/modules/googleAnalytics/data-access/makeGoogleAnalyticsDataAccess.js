const fs = require("fs");
const path = require("path");
const { BetaAnalyticsDataClient } = require("@google-analytics/data");

const makeGoogleAnalyticsDataAccess = ({ logger }) => {
  if (!logger) {
    throw new Error(
      "logger dependency is required to create Google Analytics data access"
    );
  }

  const resolveKeyFilePath = () => {
    const customPath = process.env.GA_SERVICE_ACCOUNT_KEY_PATH;
    if (customPath) {
      return path.isAbsolute(customPath)
        ? customPath
        : path.resolve(process.cwd(), customPath);
    }

    const candidatePaths = [
      path.resolve(
        __dirname,
        "../../..",
        "utils",
        "google-analytics",
        "key.json"
      ),
      path.resolve(process.cwd(), "src", "utils", "google-analytics", "key.json"),
      path.resolve(process.cwd(), "key.json"),
    ];

    const existingPath = candidatePaths.find((candidate) => fs.existsSync(candidate));

    return existingPath || candidatePaths[0];
  };

  let cachedKeyFilePath;
  const getKeyFilePath = () => {
    if (!cachedKeyFilePath) {
      cachedKeyFilePath = resolveKeyFilePath();
    }
    return cachedKeyFilePath;
  };

  const writeKeyFileFromEnv = ({ encoded, raw }) => {
    const keyFilePath = getKeyFilePath();
    try {
      const fileContents = encoded
        ? Buffer.from(encoded, "base64").toString("utf-8")
        : raw;

      if (!fileContents) {
        return false;
      }

      JSON.parse(fileContents);
      fs.mkdirSync(path.dirname(keyFilePath), { recursive: true });
      fs.writeFileSync(keyFilePath, fileContents, {
        encoding: "utf-8",
        mode: 0o600,
      });

      logger.info(
        JSON.stringify({
          message: "Google Analytics service account key file created from environment variables",
        })
      );

      return true;
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: "Failed to create Google Analytics key file from environment variables",
          error: error.message,
        })
      );
      throw new Error(
        "Invalid Google Analytics credentials provided via environment variables. Verify GA_SERVICE_ACCOUNT_KEY or GA_SERVICE_ACCOUNT_KEY_B64."
      );
    }
  };

  const ensureKeyFile = () => {
    const keyFilePath = getKeyFilePath();

    if (fs.existsSync(keyFilePath)) {
      return keyFilePath;
    }

    const encodedKey = process.env.GA_SERVICE_ACCOUNT_KEY_B64;
    const rawKey = process.env.GA_SERVICE_ACCOUNT_KEY;

    if (encodedKey || rawKey) {
      writeKeyFileFromEnv({ encoded: encodedKey, raw: rawKey });
      return keyFilePath;
    }

    logger.error(
      JSON.stringify({
        message: "Google Analytics service account key file is missing",
        keyFilePath,
      })
    );
    throw new Error(
      "Google Analytics credentials not found. Provide key.json or set GA_SERVICE_ACCOUNT_KEY(_B64)."
    );
  };

  let cachedCredentials;
  let analyticsClient;

  const loadCredentials = () => {
    if (cachedCredentials) {
      return cachedCredentials;
    }

    ensureKeyFile();
    try {
      const keyFilePath = getKeyFilePath();
      const fileContents = fs.readFileSync(keyFilePath, "utf-8");
      cachedCredentials = JSON.parse(fileContents);
      return cachedCredentials;
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: "Unable to parse Google Analytics service account key file",
          error: error.message,
          code: error.code,
        })
      );
      throw new Error(
        "Google Analytics credentials could not be parsed. Verify key.json content."
      );
    }
  };

  const getClient = () => {
    if (analyticsClient) {
      return analyticsClient;
    }

    const credentials = loadCredentials();
    analyticsClient = new BetaAnalyticsDataClient({ credentials });
    return analyticsClient;
  };

  const runRealtimeReport = async ({
    propertyId,
    dimensions,
    metrics,
    limit,
    orderBys,
  }) => {
    try {
      const client = getClient();

      const request = {
        property: `properties/${propertyId}`,
        dimensions: dimensions.map((name) => ({ name })),
        metrics: metrics.map((name) => ({ name })),
        limit,
      };

      if (orderBys?.length) {
        request.orderBys = orderBys
          .filter((order) => order && (order.metric || order.dimension))
          .map((order) => {
            const orderConfig = {};
            if (order.metric) {
              orderConfig.metric = { metricName: order.metric };
            }
            if (order.dimension) {
              orderConfig.dimension = { dimensionName: order.dimension };
            }
            orderConfig.desc =
              typeof order.desc === "boolean" ? order.desc : true;
            return orderConfig;
          });
      }

      const [response] = await client.runRealtimeReport(request);
      return response;
    } catch (error) {
      logger.error(
        JSON.stringify({
          message: "Google Analytics realtime report failed",
          error: error.message,
          code: error.code,
        })
      );
      throw error;
    }
  };

  return Object.freeze({
    runRealtimeReport,
  });
};

module.exports = { makeGoogleAnalyticsDataAccess };

