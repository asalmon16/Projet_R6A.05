'use strict';

const Glue = require('@hapi/glue');
const Exiting = require('exiting');
const Manifest = require('./manifest');

exports.deployment = async ({ start } = {}) => {

    const manifest = Manifest.get('/', process.env);
    const server = await Glue.compose(manifest, { relativeTo: __dirname });

    if (start) {
        await Exiting.createManager(server).start();
        server.log(['start'], `Server started at ${server.info.uri}`);
        console.log(`\nServeur démarré avec succès !`);
        console.log(`Clique ici pour ouvrir l'API : ${server.info.uri}/documentation\n`);
        return server;
    }

    await server.initialize();

    return server;
};

if (require.main === module) {

    exports.deployment({ start: true });

    process.on('unhandledRejection', (err) => {

        throw err;
    });
}
