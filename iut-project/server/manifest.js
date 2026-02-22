'use strict';

const Dotenv = require('dotenv');
const Confidence = require('@hapipal/confidence');
const Toys = require('@hapipal/toys');
const Schwifty = require('@hapipal/schwifty');

Dotenv.config({ path: `${__dirname}/.env` });

module.exports = new Confidence.Store({
    server: {
        host: 'localhost',
        port: {
            $env: 'PORT',
            $coerce: 'number',
            $default: 3000
        },
        debug: {
            $filter: { $env: 'NODE_ENV' },
            $default: {
                log: ['error'],
                request: ['error']
            },
            production: {
                request: ['implementation']
            }
        }
    },
    register: {
        plugins: [
            {
                plugin: '@hapipal/schwifty',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        migrateOnStart: true,
                        knex: {
                            client: 'sqlite3',
                            useNullAsDefault: true,
                            connection: {
                                filename: process.env.DB_FILE || 'database.sqlite'
                            },
                            migrations: {
                                stub: Schwifty.migrationsStubPath
                            }
                        }
                    },
                    production: {
                        migrateOnStart: false
                    }
                }
            },
            {
                plugin: '../lib',
                options: {}
            },
            {
                plugin: '@hapi/inert'
            },
            {
                plugin: '@hapi/vision'
            },
            {
                plugin: 'hapi-swagger',
                options: {
                    $filter: 'NODE_ENV',
                    $default: {},
                    $base: {
                        info: {
                            title: 'API',
                            description: 'API description',
                            version: '1.0.0'
                        },
                        securityDefinitions: {
                            jwt: {
                                type: 'apiKey',
                                name: 'Authorization',
                                in: 'header'
                            }
                        },
                        security: [{
                            jwt: []
                        }]
                    }
                }
            },
            {
                plugin: {
                    $filter: { $env: 'NODE_ENV' },
                    $default: '@hapipal/hpal-debug',
                    production: Toys.noop
                }
            }
        ]
    }
});
