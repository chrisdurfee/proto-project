/**
 * Domain Configuration Helper
 *
 * This utility reads domain configuration from the Proto config
 * and generates the appropriate URLs for different environments.
 */

import fs from 'fs';
import path from 'path';

class DomainConfig {
    constructor() {
        this.config = this.loadConfig();
        this.isDev = process.env.NODE_ENV !== 'production';
    }

    /**
     * Load configuration from Proto .env file
     */
    loadConfig() {
        try {
            const configPath = path.resolve(process.cwd(), '../../common/Config/.env');
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.warn('Could not load Proto config, using defaults:', error.message);
            return this.getDefaultConfig();
        }
    }

    /**
     * Default configuration fallback
     */
    getDefaultConfig() {
        return {
            domain: {
                production: 'yourdomain.com',
                development: 'localhost',
                subdomains: {
                    api: 'api',
                    main: 'app',
                    crm: 'crm',
                    developer: 'dev'
                },
                ssl: true,
                ports: {
                    development: {
                        api: 8080,
                        main: 3000,
                        crm: 3001,
                        developer: 3002
                    }
                }
            }
        };
    }

    /**
     * Get the base domain for current environment
     */
    getBaseDomain() {
        return this.isDev
            ? this.config.domain.development
            : this.config.domain.production;
    }

    /**
     * Get protocol (http/https)
     */
    getProtocol() {
        if (this.isDev) {
            return 'http';
        }
        return this.config.domain.ssl ? 'https' : 'http';
    }

    /**
     * Get API URL
     */
    getApiUrl() {
        const protocol = this.getProtocol();
        const baseDomain = this.getBaseDomain();
        const subdomain = this.config.domain.subdomains.api;

        if (this.isDev) {
            const port = this.config.domain.ports.development.api;
            return `${protocol}://${baseDomain}:${port}`;
        }

        return `${protocol}://${subdomain}.${baseDomain}`;
    }

    /**
     * Get Main App URL
     */
    getMainUrl() {
        const protocol = this.getProtocol();
        const baseDomain = this.getBaseDomain();
        const subdomain = this.config.domain.subdomains.main;

        if (this.isDev) {
            const port = this.config.domain.ports.development.main;
            return `${protocol}://${baseDomain}:${port}`;
        }

        return `${protocol}://${subdomain}.${baseDomain}`;
    }

    /**
     * Get CRM App URL
     */
    getCrmUrl() {
        const protocol = this.getProtocol();
        const baseDomain = this.getBaseDomain();
        const subdomain = this.config.domain.subdomains.crm;

        if (this.isDev) {
            const port = this.config.domain.ports.development.crm;
            return `${protocol}://${baseDomain}:${port}`;
        }

        return `${protocol}://${subdomain}.${baseDomain}`;
    }

    /**
     * Get Developer App URL
     */
    getDeveloperUrl() {
        const protocol = this.getProtocol();
        const baseDomain = this.getBaseDomain();
        const subdomain = this.config.domain.subdomains.developer;

        if (this.isDev) {
            const port = this.config.domain.ports.development.developer;
            return `${protocol}://${baseDomain}:${port}`;
        }

        return `${protocol}://${subdomain}.${baseDomain}`;
    }

    /**
     * Get all URLs for the current environment
     */
    getAllUrls() {
        return {
            api: this.getApiUrl(),
            main: this.getMainUrl(),
            crm: this.getCrmUrl(),
            developer: this.getDeveloperUrl()
        };
    }

    /**
     * Get CORS origins for API
     */
    getCorsOrigins() {
        const urls = this.getAllUrls();
        return [urls.main, urls.crm, urls.developer];
    }
}

// Export singleton instance
const domainConfig = new DomainConfig();
export default domainConfig;
