'use strict';

const HauteCouture = require('@hapipal/haute-couture');
const Package = require('../package.json');

exports.plugin = {
    pkg: Package,
    dependencies: '@hapipal/schwifty',
    register: async (server, options) => {

        await HauteCouture.compose(server, options);
    }
};
