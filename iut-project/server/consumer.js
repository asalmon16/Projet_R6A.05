'use strict';

const amqp = require('amqplib');
const Nodemailer = require('nodemailer');
const { Parser } = require('json2csv');
const Schwifty = require('@hapipal/schwifty');
const Knex = require('knex');
require('dotenv').config({ path: `${__dirname}/.env` });

// Configuration de la connexion BDD (pour le worker indépendant)
const knex = Knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: ':memory:' // Note: si on utilise sqlite en mémoire, le nom 'memory' est isolé par processus.
        // En vrai production, le worker se connecterait à la base MySQL/PostgreSQL. 
        // Pour cet exemple, cela dépend de si on lance le consumer DANS Hapi ou asynchrone.
    }
});

async function startConsumer() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        const channel = await connection.createChannel();

        const queue = 'export_csv_queue';
        await channel.assertQueue(queue, { durable: true });

        // Configuration Nodemailer
        const transporter = Nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        console.log(`[*] En attente de messages dans ${queue}. Pour quitter, faire CTRL+C`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const data = JSON.parse(msg.content.toString());
                console.log(`[x] Demande d'export reçue pour : ${data.email}`);

                try {
                    // Simulation récupération BDD : Dans une vraie base, on ferait une vraie requête sql.
                    // Si on est en mémoire SQLite, la base est vide pour ce processus standalone.
                    // Pour le proof-of-concept du worker, nous mockons la donnée ou on interroge la db fichier.
                    const films = [
                        { titre: 'Inception', realisateur: 'Christopher Nolan' },
                        { titre: 'Interstellar', realisateur: 'Christopher Nolan' }
                    ];

                    // Conversion JSON to CSV
                    const json2csvParser = new Parser();
                    const csv = json2csvParser.parse(films);

                    // Envoi en pièce jointe
                    const info = await transporter.sendMail({
                        from: '"🎬 Movie Library" <noreply@movielibrary.com>',
                        to: data.email,
                        subject: 'Votre export CSV des films est prêt ! 🍿',
                        text: `Bonjour, veuillez trouver ci-joint l'export CSV de la base de films.`,
                        attachments: [
                            {
                                filename: 'films_export.csv',
                                content: Buffer.from(csv, 'utf-8')
                            }
                        ]
                    });

                    console.log('CSV envoyé ! Preview URL: %s', Nodemailer.getTestMessageUrl(info));

                    // Confirmer que le message a été traité
                    channel.ack(msg);
                } catch (err) {
                    console.error('Erreur lors du traitement CSV/Mail:', err);
                    // On ne l'acquitte pas pour qu'il soit remis en queue (nack) si c'était une erreur réseau
                    // channel.nack(msg);
                }
            }
        });

    } catch (error) {
        console.error('Consumer RabbitMQ Error:', error);
    }
}

// Lancement direct si le fichier est exécuté avec "node consumer.js"
if (require.main === module) {
    startConsumer();
}

module.exports = startConsumer;
