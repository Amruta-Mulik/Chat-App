const config = {};

config.PORT = 3000;
config.REDIS_URL = "redis://localhost:6379";
config.MONGO_URL = "mongodb://localhost:27017";
config.MONGO_OPTIONS = { useUnifiedTopology: true };

module.exports = config;