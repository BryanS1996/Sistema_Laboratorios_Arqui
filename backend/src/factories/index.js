const HybridFactory = require("./HybridFactory");
const PostgresFactory = require("./PostgresFactory");
const MongoFactory = require("./MongoFactory");

function getFactory() {
  const mode = String(process.env.PERSISTENCE_MODE || "hybrid").toLowerCase();
  if (mode === "postgres") return new PostgresFactory();
  if (mode === "mongo") return new MongoFactory();
  return new HybridFactory();
}

module.exports = { getFactory };
