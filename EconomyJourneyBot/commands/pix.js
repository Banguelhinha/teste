
const database = require('../utils/database');

module.exports = {
    name: 'pix',
    description: 'Envia moedas para outro usuário',
    execute(message, args) {
        // Verificar argumentos
        if (args.length < 2) {
            return message.reply('Uso correto: j?pix @usuário quantidade [motivo]');
        }

        // Obter usuário alvo
        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('Por favor, mencione um usuário válido.');
        }

        // Não permitir pix para si mesmo
        if (targetUser.id === message.author.id) {
            return message.reply('Você não pode fazer um pix para si mesmo.');
        }

        // Verificar quantidade
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Por favor, forneça uma quantidade válida de moedas.');
        }

        // Verificar se usuário tem saldo suficiente
        const senderBalance = database.getUserBalance(message.author.id);
        if (senderBalance < amount) {
            return message.reply(`Você não tem moedas suficientes. Seu saldo atual é ${senderBalance}.`);
        }

        // Realizar a transferência
        database.removeMoney(message.author.id, amount);
        database.addMoney(targetUser.id, amount);

        // Enviar mensagem de confirmação
        message.reply(`Você enviou ${amount} moedas para ${targetUser.tag}!`);

        // Se houver motivo, enviar mensagem privada
        if (args.length > 2) {
            const motivo = args.slice(2).join(' ');
            targetUser.send(`${message.author.tag} te enviou ${amount} moedas. Motivo: ${motivo}`)
                .catch(() => message.reply('Não foi possível enviar mensagem privada com o motivo.'));
        }
    }
};
