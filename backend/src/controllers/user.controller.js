const { getFactory } = require('../factories');

const factory = getFactory();
const userDAO = factory.createUserDAO();

class UserController {

    async getUsers(req, res) {
        try {
            // Check if admin? Middleware should handle this usually, but double check
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            const users = await userDAO.findAllWithDetails();
            res.json(users);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener usuarios' });
        }
    }

    async updateUserRole(req, res) {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Acceso denegado' });
            }

            const { id } = req.params;
            const { role } = req.body;

            const updatedUser = await userDAO.updateRole(id, role);
            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar rol' });
        }
    }
}

module.exports = new UserController();
