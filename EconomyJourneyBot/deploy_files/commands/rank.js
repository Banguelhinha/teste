const { MessageEmbed } = require('discord.js');
const { adminIds } = require('../config');
const database = require('../utils/database');

// Cache para embeds de ranking (5 minutos de expiração)
const rankCache = {
    embed: null,
    timestamp: 0,
    expiryTime: 5 * 60 * 1000 // 5 minutos
};

module.exports = {
    name: 'rank',
    description: 'Mostra os usuários com maior saldo (Somente Admin)',
    async execute(message, args) {
        // Verificar se o usuário tem permissão
        if (!adminIds.includes(message.author.id)) {
            return message.reply('Você não tem permissão para usar este comando.');
        }

        // Verificar se podemos usar o cache
        const now = Date.now();
        if (rankCache.embed && (now - rankCache.timestamp) < rankCache.expiryTime) {
            // Usar cache para economizar recursos
            message.channel.send({ embeds: [rankCache.embed] });
            return;
        }

        // Obter dados do ranking (limitado a 10 para economizar memória)
        const ranking = database.getRanking(10);

        // Criar embed para o ranking
        const embed = new MessageEmbed()
            .setTitle('🏆 Ranking de Economia')
            .setDescription('Os usuários com mais moedas no servidor')
            .setColor('#FFD700')
            .setTimestamp();

        // Adicionar usuários ao embed de forma eficiente
        if (ranking.length === 0) {
            embed.addField('Nenhum usuário encontrado', 'O ranking está vazio no momento.');
        } else {
            // Obter todos os usuários de uma vez para reduzir chamadas de API
            const userPromises = ranking.map(entry => 
                message.client.users.fetch(entry.id).catch(() => null)
            );
            
            const users = await Promise.all(userPromises);
            
            for (let i = 0; i < ranking.length; i++) {
                const user = users[i];
                embed.addField(
                    `${i + 1}. ${user ? user.tag : 'Usuário ID: ' + ranking[i].id}`,
                    `${ranking[i].balance} moedas`,
                    false
                );
            }
        }
        
        // Atualizar cache
        rankCache.embed = embed;
        rankCache.timestamp = now;

        // Enviar embed
        message.channel.send({ embeds: [embed] });
    }
};
