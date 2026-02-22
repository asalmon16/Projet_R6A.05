'use strict';

const { Service } = require('@hapipal/schmervice');
const Nodemailer = require('nodemailer');

module.exports = class MailService extends Service {

    constructor(...args) {
        super(...args);

        // Initialisation de bde Nodemailer Transport
        this.transporter = Nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });
    }

    async sendWelcomeEmail(user) {

        try {
            const info = await this.transporter.sendMail({
                from: '"🎬 Movie Library" <noreply@movielibrary.com>',
                to: user.mail,
                subject: 'Bienvenue sur Movie Library ! 🎉',
                text: `Bonjour ${user.firstName} ${user.lastName},\n\nBienvenue sur notre application Filmothèque !\n\nL'équipe Movie Library`,
                html: `<h3>Bonjour ${user.firstName} ${user.lastName},</h3><p>Bienvenue sur notre application <b>Filmothèque</b> !</p><p>🚀 L'équipe Movie Library</p>`
            });

            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', Nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'e-mail de bienvenue:", error);
        }
    }

};
