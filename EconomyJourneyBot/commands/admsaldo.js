
const fs = require('fs');
const path = require('path');
const config = require('../config');

module.exports = {
    name: 'admsaldo',
    description: 'Mostra o saldo de um usuário (Somente Admin)',
    execute(message, args) {
        if (!config.adminIds.includes(message.author.id)) {
            return message.reply('Você não tem permissão para usar este comando.');
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Por favor, mencione um usuário válido.');
        }

        try {
            const dbPath = path.join(__dirname, '../database.json');
            const data = JSON.parse(fs.readFileSync(dbPath));
            const balance = data.users[user.id]?.balance || 0;
            message.reply(`O saldo de ${user.tag} é: ${balance} moedas.`);
        } catch (error) {
            console.error('Erro ao ler saldo:', error);
            message.reply('Erro ao verificar saldo. Tente novamente.');
        }
    }
};
