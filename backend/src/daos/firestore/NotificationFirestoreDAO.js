const { db } = require('../../config/firebase.config');
const { COLLECTIONS } = require('../../config/firestore_schema');

class NotificationFirestoreDAO {
    constructor() {
        this.collection = db.collection(COLLECTIONS.NOTIFICATIONS);
    }

    /**
     * Create a new notification
     */
    async create(notification) {
        const docRef = await this.collection.add({
            ...notification,
            read: false,
            createdAt: new Date()
        });

        return {
            id: docRef.id,
            ...notification,
            read: false
        };
    }

    /**
     * Find notifications for a user
     */
    async findByUser(userId, unreadOnly = false, limit = 50) {
        let query = this.collection
            .where('userId', '==', userId);

        if (unreadOnly) {
            query = query.where('read', '==', false);
        }

        query = query.orderBy('createdAt', 'desc').limit(limit);

        const snapshot = await query.get();
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Mark notification as read
     */
    async markAsRead(id) {
        await this.collection.doc(id).update({
            read: true
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        if (snapshot.empty) {
            return 0;
        }

        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        await batch.commit();

        return snapshot.size;
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId) {
        const snapshot = await this.collection
            .where('userId', '==', userId)
            .where('read', '==', false)
            .get();

        return snapshot.size;
    }

    /**
     * Delete notification
     */
    async delete(id) {
        await this.collection.doc(id).delete();
    }

    /**
     * Delete old notifications (cleanup)
     */
    async deleteOld(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const snapshot = await this.collection
            .where('createdAt', '<', cutoffDate)
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
}

module.exports = new NotificationFirestoreDAO();
