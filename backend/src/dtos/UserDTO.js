class UserDTO {
  constructor({ id, email, nombre, ...rest }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.rol = rest.rol || rest.role;
  }
}

module.exports = UserDTO;
