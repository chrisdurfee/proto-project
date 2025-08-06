/**
 * Domain Configuration
 *
 * Update this file to configure your domain settings.
 * This will be used by all Vite configs and build scripts.
 */

// Main domain configuration
const DOMAIN_CONFIG = {
    // Set your actual domain here (without protocol)
    production: 'yourdomain.com',
    development: 'localhost',

    // Subdomain prefixes
    subdomains: {
        api: 'api',
        main: 'app',
        crm: 'crm',
        developer: 'dev'
    },

    // SSL configuration
    ssl: true,

    // Development ports
    ports: {
        api: 8080,
        main: 3000,
        crm: 3001,
        developer: 3002
    }
};

/**
 * Generate URLs based on environment
 */
function generateUrls(isDev = false) {
    const protocol = isDev ? 'http' : (DOMAIN_CONFIG.ssl ? 'https' : 'http');
    const baseDomain = isDev ? DOMAIN_CONFIG.development : DOMAIN_CONFIG.production;

    if (isDev) {
        return {
            api: `${protocol}://${baseDomain}:${DOMAIN_CONFIG.ports.api}`,
            main: `${protocol}://${baseDomain}:${DOMAIN_CONFIG.ports.main}`,
            crm: `${protocol}://${baseDomain}:${DOMAIN_CONFIG.ports.crm}`,
            developer: `${protocol}://${baseDomain}:${DOMAIN_CONFIG.ports.developer}`
        };
    }

    return {
        api: `${protocol}://${DOMAIN_CONFIG.subdomains.api}.${baseDomain}`,
        main: `${protocol}://${DOMAIN_CONFIG.subdomains.main}.${baseDomain}`,
        crm: `${protocol}://${DOMAIN_CONFIG.subdomains.crm}.${baseDomain}`,
        developer: `${protocol}://${DOMAIN_CONFIG.subdomains.developer}.${baseDomain}`
    };
}

export { DOMAIN_CONFIG, generateUrls };
