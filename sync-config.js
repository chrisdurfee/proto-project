#!/usr/bin/env node

/**
 * Docker Environment Sync Script
 *
 * This script reads configuration from Proto's common/Config/.env
 * and generates a .env file for Docker Compose to use.
 * This ensures single source of truth for all configuration.
 */

const fs = require('fs');
const path = require('path');

function loadProtoConfig() {
    try {
        const configPath = path.join(__dirname, 'common', 'Config', '.env');
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error('❌ Could not load Proto config:', error.message);
        process.exit(1);
    }
}

function generateDockerEnv(protoConfig) {
    const envVars = [];

    // Header comment
    envVars.push('# Auto-generated from common/Config/.env');
    envVars.push('# Do not edit manually - run: node sync-config.js');
    envVars.push('');

    // Redis configuration from Proto config
    if (protoConfig.cache && protoConfig.cache.connection) {
        const redis = protoConfig.cache.connection;
        envVars.push('# Redis Configuration (from Proto cache.connection)');
        envVars.push(`REDIS_PASSWORD=${redis.password || ''}`);
        envVars.push(`REDIS_HOST=${redis.host || 'redis'}`);
        envVars.push(`REDIS_PORT=${redis.port || 6379}`);
        envVars.push('');
    }

    // Database configuration from Proto config
    if (protoConfig.connections && protoConfig.connections.default) {
        const db = protoConfig.connections.default.dev || protoConfig.connections.default.prod;
        if (db) {
            envVars.push('# Database Configuration (from Proto connections.default)');
            envVars.push(`DB_HOST=${db.host || 'mariadb'}`);
            envVars.push(`DB_DATABASE=${db.database || 'proto'}`);
            envVars.push(`DB_USERNAME=${db.username || 'proto_user'}`);
            envVars.push(`DB_PASSWORD=${db.password || 'proto_password'}`);
            envVars.push('');
        }
    }

    // Domain configuration
    if (protoConfig.domain) {
        envVars.push('# Domain Configuration (from Proto domain)');
        envVars.push(`DOMAIN_NAME=${protoConfig.domain.production || 'yourdomain.com'}`);
        envVars.push('');
    }

    // Email configuration from Proto config
    if (protoConfig.email && protoConfig.email.smtp) {
        const smtp = protoConfig.email.smtp;
        envVars.push('# Email Configuration (Universal SMTP from Proto email.smtp)');
        envVars.push(`MAIL_HOST=${smtp.host || 'smtp.mailtrap.io'}`);
        envVars.push(`MAIL_PORT=${smtp.port || 2525}`);
        envVars.push(`MAIL_USERNAME=${smtp.username || ''}`);
        envVars.push(`MAIL_PASSWORD=${smtp.password || ''}`);
        envVars.push(`MAIL_ENCRYPTION=${smtp.encryption || 'tls'}`);
        envVars.push(`MAIL_FROM_ADDRESS=${smtp.fromAddress || 'noreply@proto-project.com'}`);
        envVars.push(`MAIL_FROM_NAME="${smtp.fromName || 'Proto Project'}"`);
        envVars.push(`MAIL_SENDING_ENABLED=${smtp.sendingEnabled || false}`);
        envVars.push('');
    }

    // Application Environment
    envVars.push('# Application Environment');
    envVars.push(`APP_ENV=${protoConfig.env === 'dev' ? 'development' : 'production'}`);
    envVars.push('');

    // Automation Controls
    envVars.push('# Automation Controls');
    envVars.push('# Set to \'true\' to automatically run migrations on container startup');
    envVars.push('AUTO_MIGRATE=true');
    envVars.push('');

    // Development Settings
    envVars.push('# Development Settings');
    envVars.push('CORS_ENABLED=true');

    if (protoConfig.domain && protoConfig.domain.ports && protoConfig.domain.ports.development) {
        const ports = protoConfig.domain.ports.development;
        const origins = [
            `http://localhost:${ports.main || 3000}`,
            `http://localhost:${ports.crm || 3001}`,
            `http://localhost:${ports.developer || 3002}`
        ];
        envVars.push(`CORS_ORIGINS=${origins.join(',')}`);
    } else {
        envVars.push('CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002');
    }
    envVars.push('');

    // Add any missing defaults
    envVars.push('# Fallback defaults');
    envVars.push('DB_ROOT_PASSWORD=root');

    return envVars.join('\n');
}

function syncConfiguration() {
    console.log('🔄 Syncing configuration from Proto to Docker...');

    // Load Proto configuration
    const protoConfig = loadProtoConfig();
    console.log('✅ Loaded Proto configuration');

    // Generate Docker .env content
    const dockerEnv = generateDockerEnv(protoConfig);

    // Write to .env file
    const envPath = path.join(__dirname, '.env');
    fs.writeFileSync(envPath, dockerEnv);
    console.log('✅ Generated .env file for Docker');

    // Show what was configured
    console.log('\n📋 Configuration Summary:');
    if (protoConfig.cache?.connection) {
        console.log(`   Redis: ${protoConfig.cache.connection.host}:${protoConfig.cache.connection.port}`);
        console.log(`   Redis Password: ${protoConfig.cache.connection.password ? '[SET]' : '[EMPTY]'}`);
    }
    if (protoConfig.connections?.default) {
        const db = protoConfig.connections.default.dev || protoConfig.connections.default.prod;
        console.log(`   Database: ${db.username}@${db.host}:${db.port || 3306}/${db.database}`);
    }
    if (protoConfig.domain) {
        console.log(`   Domain: ${protoConfig.domain.production}`);
        if (protoConfig.domain.ports?.development) {
            const ports = protoConfig.domain.ports.development;
            console.log(`   Development Ports: API:${ports.api}, Main:${ports.main}, CRM:${ports.crm}, Dev:${ports.developer}`);
        }
    }
    if (protoConfig.email?.smtp) {
        const smtp = protoConfig.email.smtp;
        console.log(`   Email SMTP: ${smtp.host}:${smtp.port} (${smtp.encryption})`);
        console.log(`   Email From: ${smtp.fromName} <${smtp.fromAddress}>`);
        console.log(`   Email Sending: ${smtp.sendingEnabled ? 'ENABLED' : 'DISABLED'}`);
        console.log(`   SMTP Auth: ${smtp.username ? '[SET]' : '[EMPTY]'}`);
    }
    console.log(`   App Environment: ${protoConfig.env === 'dev' ? 'development' : 'production'}`);

    console.log('\n🎉 Configuration sync complete!');
    console.log('💡 Run: docker-compose restart');
}

// Run the sync
syncConfiguration();
