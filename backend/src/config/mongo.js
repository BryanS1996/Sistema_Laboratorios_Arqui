const mongoose = require("mongoose");

let connected = false;
async function connectMongo() {
  if (connected) return;
  await mongoose.connect(process.env.MONGO_URI);
  connected = true;
}

module.exports = { connectMongo };
