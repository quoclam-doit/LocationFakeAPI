// server/src/utils/cache.js

class Cache {
    constructor(ttl = 24 * 60 * 60 * 1000) { // Default: 1 day
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > this.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    has(key) {
        return this.get(key) !== null;
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

export const adminNameCache = new Cache(24 * 60 * 60 * 1000); // 1 day
export default Cache;
