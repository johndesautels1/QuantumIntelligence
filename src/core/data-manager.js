/**
 * CLUES™ Quantum Property Intelligence System
 * Core Data Manager - IndexedDB Wrapper
 * Handles all data persistence, queries, and CRUD operations
 *
 * @version 1.0.0
 */

class DataManager {
    constructor() {
        this.dbName = 'CLUES_Quantum_DB';
        this.version = 1;
        this.db = null;

        // Object store names matching schema
        this.stores = {
            properties: 'properties',
            clients: 'clients',
            portfolios: 'portfolios',
            showings: 'showings',
            alerts: 'alerts',
            marketData: 'market_data',
            userSettings: 'user_settings'
        };
    }

    /**
     * Initialize IndexedDB database
     * Creates object stores with proper indexes
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('IndexedDB initialization failed:', request.error);
                reject(request.error);
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('✅ IndexedDB initialized successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('🔧 Upgrading database schema...');

                // PROPERTIES store
                if (!db.objectStoreNames.contains(this.stores.properties)) {
                    const propertyStore = db.createObjectStore(this.stores.properties, {
                        keyPath: 'property_id'
                    });

                    // Indexes for fast queries
                    propertyStore.createIndex('mls_number', 'mls_number', { unique: true });
                    propertyStore.createIndex('status', 'status.current', { unique: false });
                    propertyStore.createIndex('price', 'price.current', { unique: false });
                    propertyStore.createIndex('city', 'address.city', { unique: false });
                    propertyStore.createIndex('zip', 'address.zip', { unique: false });
                    propertyStore.createIndex('property_type', 'property_type', { unique: false });
                    propertyStore.createIndex('created_at', 'created_at', { unique: false });

                    console.log('✅ Properties store created');
                }

                // CLIENTS store
                if (!db.objectStoreNames.contains(this.stores.clients)) {
                    const clientStore = db.createObjectStore(this.stores.clients, {
                        keyPath: 'client_id'
                    });

                    clientStore.createIndex('email', 'contact.email', { unique: true });
                    clientStore.createIndex('type', 'type', { unique: false });
                    clientStore.createIndex('status', 'status', { unique: false });

                    console.log('✅ Clients store created');
                }

                // PORTFOLIOS store
                if (!db.objectStoreNames.contains(this.stores.portfolios)) {
                    const portfolioStore = db.createObjectStore(this.stores.portfolios, {
                        keyPath: 'portfolio_id'
                    });

                    portfolioStore.createIndex('client_id', 'client_id', { unique: false });
                    portfolioStore.createIndex('status', 'status', { unique: false });

                    console.log('✅ Portfolios store created');
                }

                // SHOWINGS store
                if (!db.objectStoreNames.contains(this.stores.showings)) {
                    const showingStore = db.createObjectStore(this.stores.showings, {
                        keyPath: 'showing_id'
                    });

                    showingStore.createIndex('client_id', 'client_id', { unique: false });
                    showingStore.createIndex('scheduled_date', 'scheduled_date', { unique: false });
                    showingStore.createIndex('status', 'status', { unique: false });

                    console.log('✅ Showings store created');
                }

                // ALERTS store
                if (!db.objectStoreNames.contains(this.stores.alerts)) {
                    const alertStore = db.createObjectStore(this.stores.alerts, {
                        keyPath: 'alert_id'
                    });

                    alertStore.createIndex('type', 'type', { unique: false });
                    alertStore.createIndex('severity', 'severity', { unique: false });
                    alertStore.createIndex('read', 'read', { unique: false });
                    alertStore.createIndex('created_at', 'created_at', { unique: false });

                    console.log('✅ Alerts store created');
                }

                // MARKET_DATA store
                if (!db.objectStoreNames.contains(this.stores.marketData)) {
                    const marketStore = db.createObjectStore(this.stores.marketData, {
                        keyPath: 'market_data_id'
                    });

                    marketStore.createIndex('area_type', 'area.type', { unique: false });
                    marketStore.createIndex('area_id', 'area.identifier', { unique: false });
                    marketStore.createIndex('date', 'date', { unique: false });

                    console.log('✅ Market Data store created');
                }

                // USER_SETTINGS store
                if (!db.objectStoreNames.contains(this.stores.userSettings)) {
                    db.createObjectStore(this.stores.userSettings, {
                        keyPath: 'user_id'
                    });

                    console.log('✅ User Settings store created');
                }

                console.log('✅ Database schema upgrade complete');
            };
        });
    }

    /**
     * Generic add method
     */
    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic update method (put)
     */
    async update(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic get by key
     */
    async get(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Generic delete by key
     */
    async delete(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Get all records from a store
     */
    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Query by index
     */
    async getByIndex(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);

        return new Promise((resolve, reject) => {
            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Advanced query with filtering
     */
    async query(storeName, filterFn) {
        const all = await this.getAll(storeName);
        return all.filter(filterFn);
    }

    /**
     * Bulk add with transaction
     */
    async bulkAdd(storeName, dataArray) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const promises = dataArray.map(data => {
            return new Promise((resolve, reject) => {
                const request = store.add(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    /**
     * Clear all data from a store
     */
    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Count records in a store
     */
    async count(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);

        return new Promise((resolve, reject) => {
            const request = store.count();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // ===== PROPERTY-SPECIFIC METHODS =====

    async addProperty(property) {
        // Ensure property has required fields
        if (!property.property_id) {
            property.property_id = this.generateUUID();
        }
        if (!property.created_at) {
            property.created_at = Date.now();
        }
        property.updated_at = Date.now();

        return this.add(this.stores.properties, property);
    }

    async updateProperty(property) {
        property.updated_at = Date.now();
        return this.update(this.stores.properties, property);
    }

    async getProperty(propertyId) {
        return this.get(this.stores.properties, propertyId);
    }

    async getAllProperties() {
        return this.getAll(this.stores.properties);
    }

    async getPropertiesByStatus(status) {
        return this.getByIndex(this.stores.properties, 'status', status);
    }

    async getPropertiesByCity(city) {
        return this.getByIndex(this.stores.properties, 'city', city);
    }

    async searchProperties(criteria) {
        const all = await this.getAllProperties();

        return all.filter(property => {
            // Price range
            if (criteria.minPrice && property.price.current < criteria.minPrice) return false;
            if (criteria.maxPrice && property.price.current > criteria.maxPrice) return false;

            // Bedrooms
            if (criteria.minBedrooms && property.bedrooms < criteria.minBedrooms) return false;

            // Bathrooms
            if (criteria.minBathrooms && property.bathrooms.total < criteria.minBathrooms) return false;

            // Property type
            if (criteria.propertyType && property.property_type !== criteria.propertyType) return false;

            // City
            if (criteria.city && property.address.city !== criteria.city) return false;

            // Status
            if (criteria.status && property.status.current !== criteria.status) return false;

            return true;
        });
    }

    // ===== CLIENT-SPECIFIC METHODS =====

    async addClient(client) {
        if (!client.client_id) {
            client.client_id = this.generateUUID();
        }
        if (!client.created_at) {
            client.created_at = Date.now();
        }

        return this.add(this.stores.clients, client);
    }

    async updateClient(client) {
        return this.update(this.stores.clients, client);
    }

    async getClient(clientId) {
        return this.get(this.stores.clients, clientId);
    }

    async getAllClients() {
        return this.getAll(this.stores.clients);
    }

    async getActiveClients() {
        return this.getByIndex(this.stores.clients, 'status', 'active');
    }

    // ===== PORTFOLIO-SPECIFIC METHODS =====

    async addPortfolio(portfolio) {
        if (!portfolio.portfolio_id) {
            portfolio.portfolio_id = this.generateUUID();
        }
        if (!portfolio.created_at) {
            portfolio.created_at = Date.now();
        }
        portfolio.updated_at = Date.now();

        return this.add(this.stores.portfolios, portfolio);
    }

    async updatePortfolio(portfolio) {
        portfolio.updated_at = Date.now();
        return this.update(this.stores.portfolios, portfolio);
    }

    async getPortfolio(portfolioId) {
        return this.get(this.stores.portfolios, portfolioId);
    }

    async getPortfoliosByClient(clientId) {
        return this.getByIndex(this.stores.portfolios, 'client_id', clientId);
    }

    async getPortfolioWithProperties(portfolioId) {
        const portfolio = await this.getPortfolio(portfolioId);
        if (!portfolio) return null;

        const properties = await Promise.all(
            portfolio.property_ids.map(id => this.getProperty(id))
        );

        return {
            ...portfolio,
            properties: properties.filter(p => p !== undefined)
        };
    }

    // ===== ALERT-SPECIFIC METHODS =====

    async addAlert(alert) {
        if (!alert.alert_id) {
            alert.alert_id = this.generateUUID();
        }
        if (!alert.created_at) {
            alert.created_at = Date.now();
        }
        if (alert.read === undefined) {
            alert.read = false;
        }

        return this.add(this.stores.alerts, alert);
    }

    async getUnreadAlerts() {
        return this.getByIndex(this.stores.alerts, 'read', false);
    }

    async markAlertAsRead(alertId) {
        const alert = await this.get(this.stores.alerts, alertId);
        if (alert) {
            alert.read = true;
            return this.update(this.stores.alerts, alert);
        }
    }

    async getAlertsByType(type) {
        return this.getByIndex(this.stores.alerts, 'type', type);
    }

    async getAlertsBySeverity(severity) {
        return this.getByIndex(this.stores.alerts, 'severity', severity);
    }

    // ===== UTILITY METHODS =====

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Export all data as JSON
     */
    async exportAllData() {
        const data = {};

        for (const storeName of Object.values(this.stores)) {
            data[storeName] = await this.getAll(storeName);
        }

        return {
            version: this.version,
            exported_at: new Date().toISOString(),
            data: data
        };
    }

    /**
     * Import data from JSON
     */
    async importData(importData) {
        const stores = importData.data;

        for (const [storeName, records] of Object.entries(stores)) {
            if (records && records.length > 0) {
                await this.bulkAdd(storeName, records);
            }
        }

        return true;
    }

    /**
     * Get database statistics
     */
    async getStats() {
        const stats = {};

        for (const [key, storeName] of Object.entries(this.stores)) {
            stats[key] = await this.count(storeName);
        }

        return stats;
    }
}

// Create singleton instance
const dataManager = new DataManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}
