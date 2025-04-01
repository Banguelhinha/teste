
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { roles } = require('../config');
const database = require('../utils/database');
const { client } = require('../index.js');

function createShopEmbed(userBalance) {
    return new MessageEmbed()
        .setTitle('🛒・Loja')
        .setDescription(`💰 Saldo: **${userBalance.toLocaleString()}** 🪙\n\nEscolha uma Assinatura abaixo:\n\n<:Calendario:1355988486016209038>┃Semanal:\n<:ServerBooster1:1355988469972729956> **OM** : ${roles.om_semanal.price.toLocaleString()} 🪙\n<:ServerBooster3:1355988454424580388> **OM+** : ${roles.omplus_semanal.price.toLocaleString()} 🪙\n<:ServerBooster4:1355988251885961276> **OM++** : ${roles.omplusplus_semanal.price.toLocaleString()} 🪙\n\n<:Calendario:1355988486016209038>┃Mensal:\n<:ServerBooster1:1355988469972729956> **OM** : ${roles.om_mensal.price.toLocaleString()} 🪙\n<:ServerBooster3:1355988454424580388> **OM+** : ${roles.omplus_mensal.price.toLocaleString()} 🪙\n<:ServerBooster4:1355988251885961276> **OM++** : ${roles.omplusplus_mensal.price.toLocaleString()} 🪙\n\n<:Calendario:1355988486016209038>┃Anual:\n<:ServerBooster1:1355988469972729956> **OM** : ${roles.om_anual.price.toLocaleString()} 🪙\n<:ServerBooster3:1355988454424580388> **OM+** : ${roles.omplus_anual.price.toLocaleString()} 🪙\n<:ServerBooster4:1355988251885961276> **OM++** : ${roles.omplusplus_anual.price.toLocaleString()} 🪙`)
        .setColor('#5271FF');
}

module.exports = {
    name: 'loja',
    description: 'Mostra a loja de cargos',

    async execute(message, args) {
        try {
            const userBalance = database.getUserBalance(message.author.id);
            const embed = createShopEmbed(userBalance);

            const rowSemanal = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('shop_select_semanal')
                        .setPlaceholder('Assinaturas Semanais')
                        .addOptions([
                            {
                                label: 'OM Semanal',
                                description: `${roles.om_semanal.price} moedas/semana`,
                                value: 'om_semanal',
                                emoji: '<:ServerBooster1:1355988469972729956>'
                            },
                            {
                                label: 'OM+ Semanal',
                                description: `${roles.omplus_semanal.price} moedas/semana`,
                                value: 'omplus_semanal',
                                emoji: '<:ServerBooster3:1355988454424580388>'
                            },
                            {
                                label: 'OM++ Semanal',
                                description: `${roles.omplusplus_semanal.price} moedas/semana`,
                                value: 'omplusplus_semanal',
                                emoji: '<:ServerBooster4:1355988251885961276>'
                            }
                        ])
                );

            const rowMensal = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('shop_select_mensal')
                        .setPlaceholder('Assinaturas Mensais')
                        .addOptions([
                            {
                                label: 'OM Mensal',
                                description: `${roles.om_mensal.price} moedas/mês`,
                                value: 'om_mensal',
                                emoji: '<:ServerBooster1:1355988469972729956>'
                            },
                            {
                                label: 'OM+ Mensal',
                                description: `${roles.omplus_mensal.price} moedas/mês`,
                                value: 'omplus_mensal',
                                emoji: '<:ServerBooster3:1355988454424580388>'
                            },
                            {
                                label: 'OM++ Mensal',
                                description: `${roles.omplusplus_mensal.price} moedas/mês`,
                                value: 'omplusplus_mensal',
                                emoji: '<:ServerBooster4:1355988251885961276>'
                            }
                        ])
                );

            const rowAnual = new MessageActionRow()
                .addComponents(
                    new MessageSelectMenu()
                        .setCustomId('shop_select_anual')
                        .setPlaceholder('Assinaturas Anuais')
                        .addOptions([
                            {
                                label: 'OM Anual',
                                description: `${roles.om_anual.price} moedas/ano`,
                                value: 'om_anual',
                                emoji: '<:ServerBooster1:1355988469972729956>'
                            },
                            {
                                label: 'OM+ Anual',
                                description: `${roles.omplus_anual.price} moedas/ano`,
                                value: 'omplus_anual',
                                emoji: '<:ServerBooster3:1355988454424580388>'
                            },
                            {
                                label: 'OM++ Anual',
                                description: `${roles.omplusplus_anual.price} moedas/ano`,
                                value: 'omplusplus_anual',
                                emoji: '<:ServerBooster4:1355988251885961276>'
                            }
                        ])
                );

            await message.channel.send({ embeds: [embed], components: [rowSemanal, rowMensal, rowAnual] });
        } catch (error) {
            console.error('Erro ao abrir loja:', error);
            message.reply('Ocorreu um erro ao abrir a loja. Por favor, tente novamente.');
        }
    },

    async handleInteraction(interaction) {
        if (!interaction.isSelectMenu() || !interaction.customId.startsWith('shop_select')) return;

        try {
            const selectedRole = interaction.values[0];
            const roleData = roles[selectedRole];
            const currentBalance = database.getUserBalance(interaction.user.id);

            if (!roleData) {
                await interaction.reply({
                    content: 'Erro: Cargo não encontrado na configuração.',
                    ephemeral: true
                });
                return;
            }

            if (currentBalance < roleData.price) {
                await interaction.reply({
                    content: `Você não tem moedas suficientes para comprar este cargo. Preço: ${roleData.price.toLocaleString()} moedas, seu saldo: ${currentBalance.toLocaleString()} moedas.`,
                    ephemeral: true
                });
                return;
            }

            const member = await interaction.guild.members.fetch(interaction.user.id);
            if (member.roles.cache.has(roleData.id)) {
                await interaction.reply({
                    content: `Você já possui o cargo ${roleData.name}!`,
                    ephemeral: true
                });
                return;
            }

            // Remove o dinheiro antes de adicionar o cargo
            const newBalance = database.removeMoney(interaction.user.id, roleData.price);

            try {
                const role = await interaction.guild.roles.fetch(roleData.id);
                if (!role) {
                    // Se o cargo não existir, devolve o dinheiro
                    database.addMoney(interaction.user.id, roleData.price);
                    await interaction.reply({
                        content: 'Erro: Cargo não encontrado no servidor.',
                        ephemeral: true
                    });
                    return;
                }

                await member.roles.add(role);
                
                // Atualiza o embed com o novo saldo
                const newEmbed = createShopEmbed(newBalance);
                if (interaction.message) {
                    await interaction.message.edit({ embeds: [newEmbed] });
                }

                await interaction.reply({
                    content: `Parabéns! Você comprou o cargo ${roleData.name} por ${roleData.price.toLocaleString()} moedas. Saldo restante: ${newBalance.toLocaleString()} moedas.`,
                    ephemeral: false
                });

                // Notifica os administradores
                const { adminIds } = require('../config');
                for (const adminId of adminIds) {
                    try {
                        const admin = await client.users.fetch(adminId);
                        await admin.send(`💰 Nova compra na loja!\n**Usuário:** ${interaction.user.tag}\n**Cargo:** ${roleData.name}\n**Preço:** ${roleData.price.toLocaleString()} moedas`);
                    } catch (err) {
                        console.error(`Erro ao notificar admin ${adminId}:`, err);
                    }
                }
            } catch (error) {
                // Se houver erro ao adicionar o cargo, devolve o dinheiro
                database.addMoney(interaction.user.id, roleData.price);
                console.error('Erro ao adicionar cargo:', error);
                await interaction.reply({
                    content: `Erro ao adicionar o cargo "${roleData.name}". Seu dinheiro foi devolvido.`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Erro na interação da loja:', error);
            await interaction.reply({
                content: 'Ocorreu um erro ao processar sua solicitação.',
                ephemeral: true
            });
        }
    }
};
