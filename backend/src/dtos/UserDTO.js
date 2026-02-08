class UserDTO {
  constructor({ id, email, nombre, role, academicLoad }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.role = role;
    this.academicLoad = academicLoad || null;
  }
}

module.exports = UserDTO;
