require("dotenv").config();
const app = require("./app");
const { connectMongo } = require("./config/mongo");
const redisService = require("./services/redis.service");

const port = Number(process.env.PORT || 3000);

(async () => {
  try {
    await connectMongo();
    console.log("✅ MongoDB connected");

    await redisService.connect();
    console.log("✅ Redis connected");

    app.listen(port, () => {
      console.log(`API up on :${port}`);
    });
  } catch (e) {
    console.error("❌ Failed to start server:", e);
    process.exit(1);
  }
})();
