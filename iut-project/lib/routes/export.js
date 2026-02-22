'use strict';

module.exports = {
    method: 'post',
    path: '/films/export',
    options: {
        tags: ['api'],
        auth: {
            scope: ['admin'] // EXIGÉ : Uniquement les admins
        }
    },
    handler: async (request, h) => {
        const { exportService } = request.services();

        // L'email de l'admin est dans le JWT
        const adminEmail = request.auth.credentials.email;

        return await exportService.requestCsvExport(adminEmail);
    }
};
