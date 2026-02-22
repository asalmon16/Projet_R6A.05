'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');

module.exports = class Favorite extends Model {

    static get tableName() {
        return 'user_favorite_film';
    }

    static get idColumn() {
        return ['userId', 'filmId'];
    }

    static get joiSchema() {
        return Joi.object({
            userId: Joi.number().integer().required(),
            filmId: Joi.number().integer().required()
        });
    }

};
