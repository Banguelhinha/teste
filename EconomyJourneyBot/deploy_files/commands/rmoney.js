const { adminIds } = require('../config');
const database = require('../utils/database');

module.exports = {
    name: 'rmoney',
    description: 'Remove dinheiro de um usuário (Somente Admin)',
    execute(message, args) {
        // Verificar se o usuário tem permissão
        if (!adminIds.includes(message.author.id)) {
            return message.reply('Você não tem permissão para usar este comando.');
        }

        // Verificar se o comando tem argumentos corretos
        if (args.length < 2) {
            return message.reply('Uso correto: j?rmoney @usuário quantia');
        }

        // Obter usuário da menção
        const user = message.mentions.users.first();
        if (!user) {
            return message.reply('Por favor, mencione um usuário válido.');
        }

        // Analisar quantia
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Por favor, forneça uma quantia válida de dinheiro para remover.');
        }

        // Remover dinheiro do usuário
        const newBalance = database.removeMoney(user.id, amount);

        // Enviar mensagem de confirmação
        message.channel.send(`Removido ${amount} moedas de ${user.tag}. Novo saldo: ${newBalance} moedas.`);
    }
};
