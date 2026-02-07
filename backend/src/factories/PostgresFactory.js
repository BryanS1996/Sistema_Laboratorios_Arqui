const PersistenceFactory = require("./PersistenceFactory");
const UserPostgresDAO = require("../daos/postgres/UserPostgresDAO");

class PostgresFactory extends PersistenceFactory {
  createUserDAO() {
    return new UserPostgresDAO();
  }

  createReservaDAO() {
    throw new Error("PostgresFactory: ReservaDAO no implementado en este mini-proyecto. Usa PERSISTENCE_MODE=hybrid");
  }
}

module.exports = PostgresFactory;
