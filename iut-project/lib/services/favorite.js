'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class FavoriteService extends Service {

    async add(userId, filmId) {
        const { Favorite, Film } = this.server.models();

        // 1. Vérifier si le film existe
        const film = await Film.query().findById(filmId);
        if (!film) {
            throw Boom.notFound('Ce film n\'existe pas.');
        }

        // 2. Vérifier si le favori existe déjà
        const existingFavorite = await Favorite.query().findOne({ userId, filmId });
        if (existingFavorite) {
            throw Boom.conflict('Ce film est déjà dans vos favoris.');
        }

        // 3. Ajouter le favori
        return await Favorite.query().insert({ userId, filmId });
    }

    async remove(userId, filmId) {
        const { Favorite } = this.server.models();

        const deletedRows = await Favorite.query()
            .delete()
            .where({ userId, filmId });

        if (deletedRows === 0) {
            throw Boom.badRequest('Ce film ne fait pas partie de vos favoris.');
        }

        return '';
    }
};
