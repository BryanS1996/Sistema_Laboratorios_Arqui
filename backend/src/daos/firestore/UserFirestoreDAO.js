const { db } = require('../../config/firebase.config');
const { COLLECTIONS } = require('../../config/firestore_schema');

class UserFirestoreDAO {
    constructor() {
        this.collection = db.collection(COLLECTIONS.USERS);
    }

    /**
     * Create a new user
     */
    async create(userData) {
        const docRef = await this.collection.add({
            ...userData,
            createdAt: new Date(),
            lastLoginAt: null
        });

        return {
            id: docRef.id,
            ...userData
        };
    }

    /**
     * Find user by email
     */
    async findByEmail(email) {
        const snapshot = await this.collection
            .where('email', '==', email)
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
     * Find user by ID
     */
    async findById(id) {
        const doc = await this.collection.doc(id).get();

        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Update user data
     */
    async update(id, updates) {
        await this.collection.doc(id).update(updates);
        return this.findById(id);
    }

    /**
     * Update last login timestamp  
     */
    async updateLastLogin(id) {
        await this.collection.doc(id).update({
            lastLoginAt: new Date()
        });
    }

    /**
     * Find all users (with optional filters)
     */
    async findAll(filters = {}) {
        let query = this.collection;

        if (filters.role) {
            query = query.where('role', '==', filters.role);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Delete user
     */
    async delete(id) {
        await this.collection.doc(id).delete();
    }
}

module.exports = new UserFirestoreDAO();
