// Load environment variables
require('dotenv').config();

const { db, FieldValue } = require('../src/config/firebase.config');
const { COLLECTIONS } = require('../src/config/firestore_schema');

/**
 * Initialize Firestore with time slots
 * Run this script once on first deployment
 */

const TIME_SLOTS = [
    { startTime: '07:00', endTime: '09:00', label: '7-9' },
    { startTime: '09:00', endTime: '11:00', label: '9-11' },
    { startTime: '11:00', endTime: '13:00', label: '11-13' },
    { startTime: '14:00', endTime: '16:00', label: '14-16' },
    { startTime: '16:00', endTime: '18:00', label: '16-18' }
];

async function initializeTimeSlots() {
    try {
        console.log('🕒 Initializing time slots...');

        const db = require('../src/config/firebase.config').db;
        const timeSlotsRef = db.collection(COLLECTIONS.TIME_SLOTS);

        // Check if time slots already exist
        const snapshot = await timeSlotsRef.limit(1).get();
        if (!snapshot.empty) {
            console.log('⚠️  Time slots already exist. Skipping initialization.');
            return;
        }

        // Create time slots
        const batch = db.batch();
        TIME_SLOTS.forEach(slot => {
            const docRef = timeSlotsRef.doc();
            batch.set(docRef, {
                ...slot,
                createdAt: FieldValue.serverTimestamp()
            });
        });

        await batch.commit();
        console.log(`✅ Successfully created ${TIME_SLOTS.length} time slots`);
    } catch (error) {
        console.error('❌ Error initializing time slots:', error);
        throw error;
    }
}

async function initializeFirestore() {
    try {
        console.log('🚀 Starting Firestore initialization...');

        await initializeTimeSlots();

        console.log('✅ Firestore initialization complete!');
        console.log('\n📋 Next steps:');
        console.log('1. Create Firestore indexes in Firebase Console');
        console.log('2. Refer to firestore_schema.js for required indexes');

        process.exit(0);
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        process.exit(1);
    }
}

// Run initialization if called directly
if (require.main === module) {
    initializeFirestore();
}

module.exports = { initializeFirestore };
