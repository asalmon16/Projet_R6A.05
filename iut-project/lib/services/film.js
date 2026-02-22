'use strict';

const { Service } = require('@hapipal/schmervice');
const Boom = require('@hapi/boom');

module.exports = class FilmService extends Service {

    async create(film) {
        const { Film, User } = this.server.models();
        const { mailService } = this.server.services();

        const createdFilm = await Film.query().insertAndFetch(film);

        // Envoyer une notification à tous les utilisateurs (asynchrone)
        this.notifyAllUsersNewFilm(User, mailService, createdFilm);

        return createdFilm;
    }

    async findAll() {
        const { Film } = this.server.models();
        return Film.query();
    }

    async findById(id) {
        const { Film } = this.server.models();
        const film = await Film.query().findById(id);
        if (!film) {
            throw Boom.notFound('Film not found');
        }
        return film;
    }

    async delete(id) {
        const { Film } = this.server.models();
        const deletedRows = await Film.query().deleteById(id);
        if (deletedRows === 0) {
            throw Boom.notFound('Film not found');
        }
        return '';
    }

    async update(id, filmPayload) {
        const { Film, User, Favorite } = this.server.models();
        const { mailService } = this.server.services();

        const updatedFilm = await Film.query().patchAndFetchById(id, filmPayload);
        if (!updatedFilm) {
            throw Boom.notFound('Film not found');
        }

        // Envoyer la notification de modification aux utilisateurs l'ayant en favori
        this.notifyFavoriteUsersFilmUpdated(Favorite, User, mailService, updatedFilm);

        return updatedFilm;
    }

    async notifyFavoriteUsersFilmUpdated(FavoriteModel, UserModel, mailService, film) {
        try {
            const favorites = await FavoriteModel.query().where({ filmId: film.id });
            if (favorites.length === 0) return;

            const userIds = favorites.map(f => f.userId);
            const users = await UserModel.query().findByIds(userIds);

            const emails = users.map(u => u.mail).join(', ');

            if (emails) {
                await mailService.transporter.sendMail({
                    from: '"🎬 Movie Library" <noreply@movielibrary.com>',
                    bcc: emails,
                    subject: `Un de vos films favoris a été mis à jour : ${film.title} ! 🍿`,
                    text: `Le film ${film.title} que vous avez en favori a été modifié.`,
                    html: `<h3>Mise à jour d'un favori !</h3><p>Les informations du film <b>${film.title}</b> ont été changées.</p>`
                });
            }
        } catch (err) {
            console.error('Erreur notification MAJ film:', err);
        }
    }

    async notifyAllUsersNewFilm(UserModel, mailService, film) {
        try {
            const users = await UserModel.query();
            const emails = users.map(u => u.mail).join(', '); // Envoi en CCI idéalement

            if (emails) {
                // Pour simplifier l'exemple Nodemailer permet d'envoyer à plusieurs destinataires
                await mailService.transporter.sendMail({
                    from: '"🎬 Movie Library" <noreply@movielibrary.com>',
                    bcc: emails,
                    subject: `Nouveau film ajouté : ${film.title} ! 🍿`,
                    text: `Un nouveau film est disponible : ${film.title} réalisé par ${film.director}.`,
                    html: `<h3>Nouveau film disponible !</h3><p><b>${film.title}</b> réalisé par ${film.director} vient d'être rajouté à la plateforme.</p>`
                });
            }
        } catch (err) {
            console.error('Erreur notification nouveau film:', err);
        }
    }
};
