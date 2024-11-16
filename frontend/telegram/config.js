require("dotenv").config();

const config = {
  // Bot configuration
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  WEBAPP_URL: process.env.WEBAPP_URL,
  IMAGE_PATH: "./image.png",
  TICK3T_APP_URL: "t.me/tick3tapp_bot/tick3t_app",
  TICK3T_APP_URL_CREATE: "t.me/tick3tapp_bot/maybee_app_create",
  TICK3T_APP_URL_JOIN: "t.me/tick3tapp_bot/maybee_app_join",

  CHANNEL_ID: "@tick3tapp_bot",
};

// Validate required configuration
const requiredConfigs = ["TELEGRAM_BOT_TOKEN", "WEBAPP_URL"];
for (const configName of requiredConfigs) {
  if (!config[configName]) {
    console.error(`Missing required configuration: ${configName}`);
    process.exit(1);
  }
}

module.exports = config;
