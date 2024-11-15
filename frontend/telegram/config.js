require("dotenv").config();

const config = {
  // Bot configuration
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  LOGIN_URL: process.env.LOGIN_URL,

  // Channel and topic IDs
  CHANNEL_ID: "@",
};

// Validate required configuration
const requiredConfigs = ["TELEGRAM_BOT_TOKEN", "LOGIN_URL"];
for (const configName of requiredConfigs) {
  if (!config[configName]) {
    console.error(`Missing required configuration: ${configName}`);
    process.exit(1);
  }
}

module.exports = config;
