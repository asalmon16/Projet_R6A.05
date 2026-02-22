'use strict';

const Joi = require('joi');

module.exports = [
    {
        method: 'post',
        path: '/film/{id}/favorite',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID du film à ajouter aux favoris')
                })
            }
        },
        handler: async (request, h) => {
            const { favoriteService } = request.services();
            // L'ID de l'utilisateur est extrait du token JWT validé (request.auth.credentials.id)
            // Note: Il faut s'assurer que l'ID user est dans le JWT
            const userId = request.auth.credentials.id;

            await favoriteService.add(userId, request.params.id);
            return { message: 'Film ajouté aux favoris avec succès.' };
        }
    },
    {
        method: 'delete',
        path: '/film/{id}/favorite',
        options: {
            tags: ['api'],
            auth: {
                scope: ['user', 'admin']
            },
            validate: {
                params: Joi.object({
                    id: Joi.number().integer().required().description('ID du film à retirer des favoris')
                })
            }
        },
        handler: async (request, h) => {
            const { favoriteService } = request.services();
            const userId = request.auth.credentials.id;

            await favoriteService.remove(userId, request.params.id);
            return { message: 'Film retiré de vos favoris.' };
        }
    }
];
