'use strict';

const Joi = require('joi');
const { Model } = require('@hapipal/schwifty');
const bcrypt = require('bcrypt');

module.exports = class User extends Model {

    static get tableName() {

        return 'user';
    }

    static get jsonAttributes() {
        return ['scope'];
    }

    static get joiSchema() {

        return Joi.object({
            id: Joi.number().integer().greater(0),
            firstName: Joi.string().min(3).example('John').description('Firstname of the user'),
            lastName: Joi.string().min(3).example('Doe').description('Lastname of the user'),
            password: Joi.string().min(8).description('Password of the user'),
            mail: Joi.string().email().example('john.doe@test.com').description('Email of the user'),
            username: Joi.string().example('johndoe').description('Username of the user'),
            scope: Joi.array().items(Joi.string()).default(['user']).description('Roles of the user'),
            createdAt: Joi.date(),
            updatedAt: Joi.date()
        });
    }

    async $beforeInsert(queryContext) {

        this.updatedAt = new Date();
        this.createdAt = this.updatedAt;

        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }

        if (!this.scope || this.scope.length === 0) {
            this.scope = ['user'];
        }
    }

    async $beforeUpdate(opt, queryContext) {

        this.updatedAt = new Date();

        if (this.password && this.password !== opt.old?.password) {
            this.password = await bcrypt.hash(this.password, 10);
        }
    }

};