'use strict';

const { Service } = require('@hapipal/schmervice');
const amqp = require('amqplib');

module.exports = class ExportService extends Service {

    async requestCsvExport(adminEmail) {
        try {
            // Connexion au serveur RabbitMQ (par défaut localhost)
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            const channel = await connection.createChannel();

            const queue = 'export_csv_queue';
            await channel.assertQueue(queue, { durable: true });

            const message = JSON.stringify({ email: adminEmail });

            // On publie le message dans la file
            channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

            console.log(`[x] Message envoyé dans la queue pour l'export CSV de ${adminEmail}`);

            // Fermer le channel et la connexion proprement (ou laisser ouvert si le service est lourd, mais ici unitaire)
            setTimeout(() => {
                channel.close();
                connection.close();
            }, 500);

            return { message: "Demande d'export prise en compte. Vous recevrez un e-mail avec le CSV prochainement." };

        } catch (error) {
            console.error('RabbitMQ Error:', error);
            throw new Error("Impossible de communiquer avec le Message Broker");
        }
    }
};
