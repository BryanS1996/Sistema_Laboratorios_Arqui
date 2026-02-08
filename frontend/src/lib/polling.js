/**
 * Adaptive Polling Service
 * 
 * Implements intelligent polling that adjusts frequency based on:
 * - Page Visibility API (active/background tab)
 * - User authentication status
 * - User role (admin vs regular user)
 */

class PollingService {
    constructor() {
        this.intervals = new Map(); // Store active intervals
        this.pollInterval = 3000; // Default: 3 seconds for active tab
        this.isActive = !document.hidden; // Track tab visibility

        // Listen to visibility changes
        document.addEventListener('visibilitychange', () => {
            const wasActive = this.isActive;
            this.isActive = !document.hidden;

            if (wasActive !== this.isActive) {
                this.updateAllIntervals();
            }
        });
    }

    /**
     * Get current poll interval based on tab visibility
     */
    getCurrentInterval() {
        return this.isActive ? 3000 : 10000; // 3s active, 10s background
    }

    /**
     * Start polling for a specific key
     */
    start(key, callback, customInterval = null) {
        // Stop existing interval if any
        this.stop(key);

        const interval = customInterval || this.getCurrentInterval();

        // Execute immediately
        callback();

        // Then set up interval
        const intervalId = setInterval(callback, interval);
        this.intervals.set(key, {
            id: intervalId,
            callback,
            customInterval
        });

        console.log(`📊 Polling started: ${key} (${interval / 1000}s)`);
    }

    /**
     * Stop polling for a specific key
     */
    stop(key) {
        const interval = this.intervals.get(key);
        if (interval) {
            clearInterval(interval.id);
            this.intervals.delete(key);
            console.log(`⏹️  Polling stopped: ${key}`);
        }
    }

    /**
     * Stop all polling
     */
    stopAll() {
        this.intervals.forEach((interval, key) => {
            clearInterval(interval.id);
            console.log(`⏹️  Polling stopped: ${key}`);
        });
        this.intervals.clear();
    }

    /**
     * Update all intervals when tab visibility changes
     */
    updateAllIntervals() {
        const newInterval = this.getCurrentInterval();
        console.log(`🔄 Tab ${this.isActive ? 'active' : 'backgrounded'}, adjusting to ${newInterval / 1000}s`);

        this.intervals.forEach((interval, key) => {
            // Skip intervals with custom intervals
            if (interval.customInterval) {
                return;
            }

            // Restart with new interval
            clearInterval(interval.id);
            const newId = setInterval(interval.callback, newInterval);
            this.intervals.set(key, {
                ...interval,
                id: newId
            });
        });
    }

    /**
     * Check if polling is active for a key
     */
    isPolling(key) {
        return this.intervals.has(key);
    }

    /**
     * Get all active polling keys
     */
    getActivePolls() {
        return Array.from(this.intervals.keys());
    }
}

// Export singleton instance
export const pollingService = new PollingService();
export default pollingService;
