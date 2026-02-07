const PersistenceFactory = require("./PersistenceFactory");
const ReservaMongoDAO = require("../daos/mongo/ReservaMongoDAO");

class MongoFactory extends PersistenceFactory {
  createUserDAO() {
    throw new Error("MongoFactory: UserDAO no implementado en este mini-proyecto. Usa PERSISTENCE_MODE=hybrid");
  }

  createReservaDAO() {
    return new ReservaMongoDAO();
  }
}

module.exports = MongoFactory;
