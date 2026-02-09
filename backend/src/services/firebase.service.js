const { auth } = require('../config/firebase.config');
<<<<<<< HEAD
const SSOProviderDAO = require('../daos/firestore/SSOProviderFirestoreDAO');
const UserDAO = require('../daos/firestore/UserFirestoreDAO');
=======
const { getFactory } = require("../factories");
>>>>>>> test
const { determineRole } = require('../utils/roleAssignment');

class FirebaseService {
    constructor() {
        this.userDAO = getFactory().createUserDAO();
    }

    async verifyIdToken(idToken) {
        try {
            return await auth.verifyIdToken(idToken);
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            throw new Error('Invalid Firebase token');
        }
    }

    async handleFirebaseSignIn(idToken) {
        const decodedToken = await this.verifyIdToken(idToken);
        const { uid, email, name, firebase } = decodedToken;

        // 1. Try finding by Firebase UID (SSO match)
        let user = await this.userDAO.findByFirebaseUid(uid);

        if (user) {
            return { user, isNewUser: false };
        }

        // 2. Try finding by email (Linkage case)
        user = await this.userDAO.findByEmail(email);

<<<<<<< HEAD
        if (!user) {
            // Create new user with role from whitelist
            const role = determineRole(email);

            user = await UserDAO.create({
                email,
                nombre: name || email.split('@')[0],
                role, // Assigned from ADMIN_EMAILS whitelist
                passwordHash: null // SSO users don't have password
            });
=======
        if (user) {
            // Link existing user to Firebase UID
            await this.userDAO.update(user.id, { firebaseUid: uid });
            return { user, isNewUser: false };
>>>>>>> test
        }

        // 3. Create new user
        const role = determineRole(email);
        user = await this.userDAO.create({
            email,
            nombre: name || email.split('@')[0],
            role,
            passwordHash: null,
            firebaseUid: uid
        });

        return { user, isNewUser: true };
    }
}

module.exports = new FirebaseService();
