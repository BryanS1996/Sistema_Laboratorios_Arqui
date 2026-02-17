const { db } = require('../../config/firebase.config');
const { COLLECTIONS } = require('../../config/firestore_schema');

class SSOProviderFirestoreDAO {
    constructor() {
        this.collection = db.collection(COLLECTIONS.SSO_PROVIDERS);
    }

    /**
     * Create SSO provider link
     */
    async create(userId, provider, providerUserId, email) {
        const docRef = await this.collection.add({
            userId,
            provider,
            providerUserId,
            email,
            createdAt: new Date()
        });

        return {
            id: docRef.id,
            userId,
            provider,
            providerUserId,
            email
        };
    }

    /**
     * Find SSO provider by provider and provider user ID
     */
    async findByProvider(provider, providerUserId) {
        const snapshot = await this.collection
            .where('provider', '==', provider)
            .where('providerUserId', '==', providerUserId)
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
     * Find all SSO accounts for a user
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

    /**
     * Delete SSO provider link
     */
    async delete(id) {
        await this.collection.doc(id).delete();
    }
}

module.exports = new SSOProviderFirestoreDAO();
