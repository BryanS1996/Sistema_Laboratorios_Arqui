const { db } = require('../../config/firebase.config');
const { COLLECTIONS } = require('../../config/firestore_schema');

class RefreshTokenFirestoreDAO {
    constructor() {
        this.collection = db.collection(COLLECTIONS.REFRESH_TOKENS);
    }

    /**
     * Create a new refresh token
     */
    async create(userId, token, expiresAt, deviceInfo = null, ipAddress = null) {
        const docRef = await this.collection.add({
            userId,
            token,
            expiresAt,
            deviceInfo,
            ipAddress,
            createdAt: new Date()
        });

        return {
            id: docRef.id,
            userId,
            token,
            expiresAt,
            deviceInfo,
            ipAddress
        };
    }

    /**
     * Find refresh token by token string
     */
    async findByToken(token) {
        const snapshot = await this.collection
            .where('token', '==', token)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Delete refresh token by token string (for logout)
     */
    async deleteByToken(token) {
        const snapshot = await this.collection
            .where('token', '==', token)
            .get();

        if (snapshot.empty) {
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    /**
     * Delete all refresh tokens for a user (logout all sessions)
     */
    async deleteByUserId(userId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .get();

        if (snapshot.empty) {
            return;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }

    /**
     * Delete expired tokens (cleanup job)
     */
    async deleteExpired() {
        const now = new Date();
        const snapshot = await this.collection
            .where('expiresAt', '<', now)
            .get();

        if (snapshot.empty) {
            return 0;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return snapshot.size;
    }

    /**
     * Get all tokens for a user
     */
    async findByUserId(userId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = new RefreshTokenFirestoreDAO();
