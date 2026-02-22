'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'get',
        path: '/users',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            return await userService.findAll();
        }
    },
    {
        method: 'get',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            return await userService.findById(request.params.id);
        }
    },
    {
        method: 'delete',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the user')
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            return await userService.delete(request.params.id);
        }
    },
    {
        method: 'patch',
        path: '/user/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the user')
                }),
                payload: Joi.object({
                    firstName: Joi.string().min(3).example('John'),
                    lastName: Joi.string().min(3).example('Doe'),
                    password: Joi.string().min(8),
                    mail: Joi.string().email(),
                    username: Joi.string(),
                    scope: Joi.array().items(Joi.string()).default(['user'])
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            return await userService.update(request.params.id, request.payload);
        }
    },
    {
        method: 'post',
        path: '/user/login',
        options: {
            tags: ['api'],
            auth: false,
            validate: {
                payload: Joi.object({
                    mail: Joi.string().email().required().example('john.doe@test.com'),
                    password: Joi.string().required().min(8)
                })
            }
        },
        handler: async (request, h) => {

            const { userService } = request.services();
            const token = await userService.login(request.payload.mail, request.payload.password);

            return { login: "successful", token };
        }
    }
];
