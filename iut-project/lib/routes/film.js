'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'get',
        path: '/films',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            }
        },
        handler: async (request, h) => {
            const { filmService } = request.services();
            return await filmService.findAll();
        }
    },
    {
        method: 'get',
        path: '/film/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the film')
                })
            }
        },
        handler: async (request, h) => {
            const { filmService } = request.services();
            return await filmService.findById(request.params.id);
        }
    },
    {
        method: 'post',
        path: '/film',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin'] // Uniquement les admins
            },
            validate: {
                payload: Joi.object({
                    title: Joi.string().required().description('Title of the film'),
                    description: Joi.string().required().description('Description of the film'),
                    releaseDate: Joi.date().required().description('Release date'),
                    director: Joi.string().required().description('Director of the film')
                })
            }
        },
        handler: async (request, h) => {
            const { filmService } = request.services();
            return await filmService.create(request.payload);
        }
    },
    {
        method: 'delete',
        path: '/film/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the film')
                })
            }
        },
        handler: async (request, h) => {
            const { filmService } = request.services();
            return await filmService.delete(request.params.id);
        }
    },
    {
        method: 'patch',
        path: '/film/{id}',
        options: {
            tags: ['api'],
            auth: {
                scope: ['admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID of the film')
                }),
                payload: Joi.object({
                    title: Joi.string(),
                    description: Joi.string(),
                    releaseDate: Joi.date(),
                    director: Joi.string()
                })
            }
        },
        handler: async (request, h) => {
            const { filmService } = request.services();
            return await filmService.update(request.params.id, request.payload);
        }
    }
];
