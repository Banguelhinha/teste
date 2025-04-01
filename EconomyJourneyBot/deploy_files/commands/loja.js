// Importando somente o necessário para economizar memória
const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { roles } = require('../config');
const database = require('../utils/database');

// Cache para componentes reutilizáveis
// Economizar recursos eliminando a necessidade de criar novos componentes
const componentCache = {
    // Row para menu de seleção da loja (pré-definido e reutilizável)
    shopRow: null,
    // Row desativado (pré-definido e reutilizável)
    disabledRow: null
};

// Função para criar um embed com saldo específico
function createShopEmbed(userBalance) {
    return new MessageEmbed()
        .setTitle('🛒 Loja de Cargos')
        .setDescription(`Seu saldo atual: **${userBalance} moedas**\n\nEscolha um cargo para comprar:`)
        .setColor('#4F86F7')
        .addFields([
            { name: 'Doador Ouro', value: `Preço: ${roles.ouro.price} moedas`, inline: true },
            { name: 'Doador Platina', value: `Preço: ${roles.platina.price} moedas`, inline: true },
            { name: 'Doador Diamante', value: `Preço: ${roles.diamante.price} moedas`, inline: true }
        ])
        .setFooter({ text: 'Selecione abaixo o cargo que deseja comprar' });
}

// Inicialização lazy dos componentes
function getShopRow() {
    if (!componentCache.shopRow) {
        componentCache.shopRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('shop_select')
                    .setPlaceholder('Selecione um cargo para comprar')
                    .addOptions([
                        {
                            label: 'Doador Ouro',
                            description: `Preço: ${roles.ouro.price} moedas`,
                            value: 'ouro',
                            emoji: '🥇'
                        },
                        {
                            label: 'Doador Platina',
                            description: `Preço: ${roles.platina.price} moedas`,
                            value: 'platina',
                            emoji: '🥈'
                        },
                        {
                            label: 'Doador Diamante',
                            description: `Preço: ${roles.diamante.price} moedas`,
                            value: 'diamante',
                            emoji: '💎'
                        }
                    ])
            );
    }
    return componentCache.shopRow;
}

// Inicialização lazy para menu desativado
function getDisabledRow() {
    if (!componentCache.disabledRow) {
        componentCache.disabledRow = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('shop_select_disabled')
                    .setPlaceholder('Loja expirada. Use j?loja novamente.')
                    .addOptions([{ label: 'Expirado', value: 'expired' }])
                    .setDisabled(true)
            );
    }
    return componentCache.disabledRow;
}

module.exports = {
    name: 'loja',
    description: 'Mostra a loja de cargos',
    
    // Função para lidar com interações do menu
    handleInteraction: async function(interaction) {
        if (interaction.customId !== 'shop_select') return;
        
        // Processamento básico da interação
        const selectedRole = interaction.values[0];
        const roleData = roles[selectedRole];
        
        // Obter saldo atualizado
        const currentBalance = database.getUserBalance(interaction.user.id);
        
        // Verificar se o usuário tem dinheiro suficiente
        if (currentBalance < roleData.price) {
            await interaction.reply({
                content: `Você não tem moedas suficientes para comprar este cargo. Preço: ${roleData.price} moedas, seu saldo: ${currentBalance} moedas.`,
                ephemeral: true
            });
            return;
        }
        
        // Verificar se o usuário já possui o cargo
        const guildMember = interaction.member;
        
        try {
            // Verificação manual de cargo (mais confiável)
            const memberRoles = Array.from(guildMember.roles.cache.keys());
            const hasRole = memberRoles.includes(roleData.id);
            
            if (hasRole) {
                await interaction.reply({
                    content: `Você já possui o cargo ${roleData.name}!`,
                    ephemeral: true
                });
                return;
            }
            
            // Remover dinheiro do usuário
            const newBalance = database.removeMoney(interaction.user.id, roleData.price);
            
            // Registrar informações do cargo sendo adicionado
            console.log(`Tentando adicionar cargo: ${roleData.name} (ID: ${roleData.id}) para o usuário ${interaction.user.tag}`);
            console.log(`Permissões do bot no servidor: ${interaction.guild.me.permissions.toArray().join(', ')}`);
            
            // Adicionar cargo ao usuário com melhor tratamento de erros
            try {
                // Verificação de permissões do bot
                const botMember = interaction.guild.me;
                
                // Verificar se o bot tem permissão para gerenciar cargos
                if (!botMember.permissions.has('MANAGE_ROLES')) {
                    console.error('Bot não tem permissão para gerenciar cargos');
                    throw new Error('Permissão MANAGE_ROLES ausente');
                }
                
                // Verifica se o cargo existe no servidor
                const role = interaction.guild.roles.cache.get(roleData.id);
                if (!role) {
                    console.error(`Cargo com ID ${roleData.id} não encontrado no servidor`);
                    throw new Error('Cargo não encontrado');
                }
                
                // Verificar se o cargo do bot está acima do cargo a ser atribuído na hierarquia
                if (botMember.roles.highest.position <= role.position) {
                    console.error('O cargo do bot está abaixo do cargo a ser atribuído na hierarquia');
                    throw new Error('Hierarquia de cargos inadequada');
                }
                
                // Tenta adicionar o cargo com uma abordagem alternativa
                await interaction.guild.members.fetch(interaction.user.id)
                    .then(freshMember => freshMember.roles.add(role))
                    .catch(err => {
                        console.error('Erro ao buscar membro atualizado:', err);
                        throw err;
                    });
                
                console.log(`Cargo ${roleData.name} adicionado com sucesso para ${interaction.user.tag}`);
                
                // Enviar confirmação
                await interaction.reply({
                    content: `Parabéns! Você comprou o cargo ${roleData.name} por ${roleData.price} moedas. Saldo restante: ${newBalance} moedas.`,
                    ephemeral: false
                });
                
                // Atualizar embed com novo saldo
                await interaction.message.edit({ 
                    embeds: [createShopEmbed(newBalance)] 
                });
            } catch (roleError) {
                // Erro específico para adicionar cargo
                console.error(`Erro ao adicionar cargo: ${roleError}`);
                
                // Devolver o dinheiro ao usuário
                database.addMoney(interaction.user.id, roleData.price);
                
                await interaction.reply({
                    content: `Erro ao adicionar o cargo "${roleData.name}". Verifique se o bot tem permissões adequadas e se o ID do cargo está correto. Seu dinheiro foi devolvido.`,
                    ephemeral: true
                });
            }
            
        } catch (error) {
            console.error('Erro ao processar compra de cargo:', error);
            await interaction.reply({
                content: 'Ocorreu um erro ao tentar comprar o cargo. Por favor, tente novamente mais tarde.',
                ephemeral: true
            });
        }
    },
    
    // Executar comando principal
    execute(message, args) {
        // Obter saldo do usuário
        const userBalance = database.getUserBalance(message.author.id);
        
        // Criar ou obter embed da loja do cache
        const embed = createShopEmbed(userBalance);
        
        // Enviar mensagem da loja com componentes reutilizáveis
        message.channel.send({
            embeds: [embed],
            components: [getShopRow()]
        }).then(sentMessage => {
            // Configurar coletor com tempo reduzido para economizar recursos
            const collector = sentMessage.createMessageComponentCollector({
                componentType: 'SELECT_MENU',
                time: 60000 // 1 minuto de timeout
            });

            // Lidar com a coleta de interações de forma otimizada
            collector.on('collect', async interaction => {
                // Verificar se é o autor do comando
                if (interaction.user.id !== message.author.id) {
                    return interaction.reply({
                        content: 'Esta loja não é para você. Use o comando j?loja para abrir sua própria loja.',
                        ephemeral: true
                    });
                }
                
                // Usar a função de tratamento de interação
                this.handleInteraction(interaction);
            });

            // Desativar o menu quando o coletor terminar (usando componente reutilizável)
            collector.on('end', () => {
                sentMessage.edit({ components: [getDisabledRow()] }).catch(() => {});
            });
        }).catch(() => message.reply('Não foi possível abrir a loja. Tente novamente.'));
    }
};
