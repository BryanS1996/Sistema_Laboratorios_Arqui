const { auth } = require('../config/firebase.config');
const SSOProviderDAO = require('../daos/firestore/SSOProviderFirestoreDAO');
const UserDAO = require('../daos/firestore/UserFirestoreDAO');
const { determineRole } = require('../utils/roleAssignment');

class FirebaseService {
    /**
     * Verify Firebase ID token
     */
    async verifyIdToken(idToken) {
        try {
            const decodedToken = await auth.verifyIdToken(idToken);
            return decodedToken;
        } catch (error) {
            console.error('Error verifying Firebase ID token:', error);
            throw new Error('Invalid Firebase token');
        }
    }

    /**
     * Handle Firebase SSO sign-in
     * Returns existing user or creates new user
     */
    async handleFirebaseSignIn(idToken) {
        const decodedToken = await this.verifyIdToken(idToken);
        const { uid, email, name, firebase } = decodedToken;

        // Determine provider from token
        const provider = firebase?.sign_in_provider || 'google';

        // Check if SSO linkage exists
        let ssoLink = await SSOProviderDAO.findByProvider(provider, uid);

        if (ssoLink) {
            // Existing SSO user - return user data
            const user = await UserDAO.findById(ssoLink.userId);
            if (!user) {
                throw new Error('User not found');
            }
            return { user, isNewUser: false };
        }

        // Check if user exists by email (may have registered with password before)
        let user = await UserDAO.findByEmail(email);

        if (!user) {
            // Create new user with role from whitelist
            const role = determineRole(email);

            user = await UserDAO.create({
                email,
                nombre: name || email.split('@')[0],
                role, // Assigned from ADMIN_EMAILS whitelist
                passwordHash: null // SSO users don't have password
            });
        }

        // Create SSO linkage
        await SSOProviderDAO.create(user.id, provider, uid, email);

        return { user, isNewUser: !user };
    }

    /**
     * Get user by Firebase UID
     */
    async getUserByFirebaseUid(provider, uid) {
        const ssoLink = await SSOProviderDAO.findByProvider(provider, uid);
        if (!ssoLink) {
            return null;
        }
        return await UserDAO.findById(ssoLink.userId);
    }

    /**
     * Link existing user to Firebase SSO
     */
    async linkUserToFirebase(userId, provider, providerUid, email) {
        await SSOProviderDAO.create(userId, provider, providerUid, email);
    }

    /**
     * Unlink Firebase SSO from user
     */
    async unlinkFirebaseFromUser(userId, provider) {
        const ssoLinks = await SSOProviderDAO.findByUserId(userId);
        const link = ssoLinks.find(l => l.provider === provider);

        if (link) {
            await SSOProviderDAO.delete(link.id);
        }
    }
}

module.exports = new FirebaseService();
