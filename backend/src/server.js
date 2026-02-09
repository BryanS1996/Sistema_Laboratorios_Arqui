require("dotenv").config();
const app = require("./app");

const { connectMongo } = require("./config/mongo");

const port = Number(process.env.PORT || 3000);

(async () => {
  try {
    await connectMongo();
    console.log("✅ MongoDB connected");

    app.listen(port, () => {
      console.log(`API up on :${port}`);
    });
  } catch (e) {
    console.error("❌ Failed to start server:", e);
    process.exit(1);
  }
})();
