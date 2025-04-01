
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'saldo',
    description: 'Mostra o saldo do usuário',
    execute(message, args) {
        try {
            const dbPath = path.join(__dirname, '../database.json');
            const data = JSON.parse(fs.readFileSync(dbPath));
            const userId = message.author.id;
            const balance = data.users[userId]?.balance || 0;
            message.reply(`Seu saldo atual é: ${balance} moedas.`);
        } catch (error) {
            console.error('Erro ao ler saldo:', error);
            message.reply('Erro ao verificar saldo. Tente novamente.');
        }
    }
};
