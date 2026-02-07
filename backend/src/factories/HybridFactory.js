const PersistenceFactory = require("./PersistenceFactory");
const UserPostgresDAO = require("../daos/postgres/UserPostgresDAO");
const ReservaMongoDAO = require("../daos/mongo/ReservaMongoDAO");

class HybridFactory extends PersistenceFactory {
  createUserDAO() {
    return new UserPostgresDAO();
  }

  createReservaDAO() {
    return new ReservaMongoDAO();
  }
}

module.exports = HybridFactory;
