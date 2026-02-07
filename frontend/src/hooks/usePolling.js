import { useEffect, useRef } from 'react';
import { pollingService } from '../lib/polling';

/**
 * Custom hook for polling with adaptive intervals
 * 
 * @param {string} key - Unique key for this poll
 * @param {() => void} callback - Function to call on each poll
 * @param {boolean} enabled - Whether polling is enabled
 * @param {number|null} customInterval - Optional custom interval (ms)
 */
export function usePolling(key, callback, enabled = true, customInterval = null) {
    const callbackRef = useRef(callback);

    // Update callback ref when it changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) {
            pollingService.stop(key);
            return;
        }

        // Start polling
        pollingService.start(key, () => callbackRef.current(), customInterval);

        // Cleanup on unmount or when key/enabled changes
        return () => {
            pollingService.stop(key);
        };
    }, [key, enabled, customInterval]);
}

export default usePolling;
