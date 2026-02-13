const { db } = require('../../config/firebase.config');
const { COLLECTIONS } = require('../../config/firestore_schema');

class AuditLogFirestoreDAO {
    constructor() {
        this.collection = db.collection(COLLECTIONS.AUDIT_LOGS);
    }

    /**
     * Create audit log entry
     */
    async create(log) {
        const docRef = await this.collection.add({
            ...log,
            createdAt: new Date()
        });

        return {
            id: docRef.id,
            ...log
        };
    }

    /**
     * Find audit logs by user with pagination
     */
    async findByUser(userId, limit = 50, startAfter = null) {
        let query = this.collection
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(limit);

        if (startAfter) {
            query = query.startAfter(startAfter);
        }

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Find audit logs by entity (e.g., all changes to a specific reserva)
     */
    async findByEntity(entityType, entityId, limit = 50) {
        const snapshot = await this.collection
            .where('entityType', '==', entityType)
            .where('entityId', '==', entityId)
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Query audit logs with filters
     */
    async query(filters = {}, limit = 100) {
        let query = this.collection;

        if (filters.userId) {
            query = query.where('userId', '==', filters.userId);
        }

        if (filters.action) {
            query = query.where('action', '==', filters.action);
        }

        if (filters.entityType) {
            query = query.where('entityType', '==', filters.entityType);
        }

        if (filters.startDate) {
            query = query.where('createdAt', '>=', filters.startDate);
        }

        if (filters.endDate) {
            query = query.where('createdAt', '<=', filters.endDate);
        }

        query = query.orderBy('createdAt', 'desc').limit(limit);

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Get recent logs (admin view)
     */
    async getRecent(limit = 100) {
        const snapshot = await this.collection
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

module.exports = new AuditLogFirestoreDAO();
