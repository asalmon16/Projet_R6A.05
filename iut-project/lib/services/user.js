'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');
const Jwt = require('@hapi/jwt');
const bcrypt = require('bcrypt');

module.exports = class UserService extends Service {

    async create(user) {

        const { User } = this.server.models();
        const { mailService } = this.server.services();

        const createdUser = await User.query().insertAndFetch(user);

        // Envoi de l'e-mail de bienvenue de façon asynchrone (pas besoin d'attendre pour répondre au client)
        mailService.sendWelcomeEmail(createdUser);

        return createdUser;
    }

    async findAll() {

        const { User } = this.server.models();
        return User.query();
    }

    async findById(id) {

        const { User } = this.server.models();
        const user = await User.query().findById(id);
        if (!user) {
            throw Boom.notFound('User not found');
        }
        return user;
    }

    async delete(id) {

        const { User } = this.server.models();
        const deletedRows = await User.query().deleteById(id);
        if (deletedRows === 0) {
            throw Boom.notFound('User not found');
        }
        return '';
    }

    async update(id, userPayload) {

        const { User } = this.server.models();

        const updatedUser = await User.query().patchAndFetchById(id, userPayload);

        if (!updatedUser) {
            throw Boom.notFound('User not found');
        }

        return updatedUser;
    }

    async login(mail, password) {

        const { User } = this.server.models();
        const user = await User.query().findOne({ mail });

        if (!user) {
            throw Boom.unauthorized('Bad credentials');
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            throw Boom.unauthorized('Bad credentials');
        }

        const token = Jwt.token.generate(
            {
                aud: 'urn:audience:iut',
                iss: 'urn:issuer:iut',
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.mail,
                scope: user.scope
            },
            {
                key: 'random_string',
                algorithm: 'HS512'
            },
            {
                ttlSec: 14400
            }
        );

        return token;
    }

};
