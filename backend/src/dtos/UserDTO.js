class UserDTO {
<<<<<<< HEAD
  constructor({ id, email, nombre, ...rest }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.rol = rest.rol || rest.role;
=======
  constructor({ id, email, nombre, role, academicLoad }) {
    this.id = id;
    this.email = email;
    this.nombre = nombre;
    this.role = role;
    this.academicLoad = academicLoad || null;
>>>>>>> test
  }
}

module.exports = UserDTO;
