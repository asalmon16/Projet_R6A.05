'use strict';

module.exports = {
    async up(knex) {

        await knex.schema.createTable('user_favorite_film', (table) => {
            table.integer('userId').unsigned().notNullable().references('id').inTable('user').onDelete('CASCADE');
            table.integer('filmId').unsigned().notNullable().references('id').inTable('film').onDelete('CASCADE');
            table.primary(['userId', 'filmId']); // Un utilisateur ne peut avoir qu'une fois le même film
        });
    },

    async down(knex) {

        await knex.schema.dropTableIfExists('user_favorite_film');
    }
};
