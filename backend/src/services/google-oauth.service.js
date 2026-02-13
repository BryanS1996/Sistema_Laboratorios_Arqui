const { OAuth2Client } = require('google-auth-library');

class GoogleOAuthService {
    constructor() {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('CRITICAL: GOOGLE_CLIENT_ID is not defined in environment variables');
        }
        this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }

    /**
     * Verify Google ID token and extract user information
     * @param {string} idToken - Google ID token from frontend
     * @returns {Promise<Object>} User information from Google
     */
    async verifyIdToken(idToken) {
        try {
            const ticket = await this.client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });

            const payload = ticket.getPayload();

            return {
                googleId: payload.sub,
                email: payload.email,
                emailVerified: payload.email_verified,
                name: payload.name,
                picture: payload.picture,
                givenName: payload.given_name,
                familyName: payload.family_name
            };
        } catch (error) {
            console.error('Error verifying Google ID token:', error);
            throw new Error('Invalid Google ID token');
        }
    }

    /**
     * Handle Google sign-in: verify token and create/update user
     * @param {string} idToken - Google ID token
     * @param {Object} userDAO - User Data Access Object
     * @returns {Promise<Object>} User object and isNewUser flag
     */
    async handleGoogleSignIn(idToken, userDAO) {
        const googleUser = await this.verifyIdToken(idToken);

        // 1. Try finding by email
        let user = await userDAO.findByEmail(googleUser.email);

        if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
                user = await userDAO.update(user.id, {
                    googleId: googleUser.googleId
                });
            }
            return { user, isNewUser: false };
        }

        // 2. Create new user
        const { determineRole } = require('../utils/roleAssignment');
        const role = determineRole(googleUser.email);

        user = await userDAO.create({
            email: googleUser.email,
            nombre: googleUser.name || googleUser.givenName || googleUser.email.split('@')[0],
            role: role,
            passwordHash: null, // OAuth users don't have password
            googleId: googleUser.googleId
        });

        return { user, isNewUser: true };
    }
}

module.exports = new GoogleOAuthService();
