/**
 * Domain Configuration
 *
 * This hybrid system loads domain settings from Proto's .env file
 * but falls back to static defaults if the file can't be read.
 * Used by all Vite configs and build scripts.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static fallback configuration
const DEFAULT_CONFIG = {
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
        //api: 8080, // http
        api: 8443, // https
        main: 3000,
        crm: 3001,
        developer: 3002
    }
};

/**
 * Load domain configuration from Proto's .env file
 */
function loadProtoConfig()
{
    try
    {
        const configPath = path.resolve(__dirname, '../../common/Config/.env');
        const configData = fs.readFileSync(configPath, 'utf8');
        const protoConfig = JSON.parse(configData);

        // Extract domain configuration if it exists
        if (protoConfig.domain)
        {
            return {
                production: protoConfig.domain.production || DEFAULT_CONFIG.production,
                development: protoConfig.domain.development || DEFAULT_CONFIG.development,
                subdomains: protoConfig.domain.subdomains || DEFAULT_CONFIG.subdomains,
                ssl: protoConfig.domain.ssl !== undefined ? protoConfig.domain.ssl : DEFAULT_CONFIG.ssl,
                ports: protoConfig.domain.ports?.development ? {
                    api: protoConfig.domain.ports.development.api || DEFAULT_CONFIG.ports.api,
                    main: protoConfig.domain.ports.development.main || DEFAULT_CONFIG.ports.main,
                    crm: protoConfig.domain.ports.development.crm || DEFAULT_CONFIG.ports.crm,
                    developer: protoConfig.domain.ports.development.developer || DEFAULT_CONFIG.ports.developer
                } : DEFAULT_CONFIG.ports
            };
        }
    }
    catch (error)
    {
        console.warn('Could not load Proto config, using defaults:', error.message);
    }

    return DEFAULT_CONFIG;
}

// Load configuration (tries Proto .env first, falls back to static)
const DOMAIN_CONFIG = loadProtoConfig();

/**
 * Generate URLs based on environment
 */
function generateUrls(isDev = false)
{
    const protocol = DOMAIN_CONFIG.ssl ? 'https' : 'http';
    const baseDomain = isDev ? DOMAIN_CONFIG.development : DOMAIN_CONFIG.production;

    if (isDev)
    {
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

