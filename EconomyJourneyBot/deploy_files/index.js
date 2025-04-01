// Importações otimizadas
const path = require('path');
const { Client, Intents, Collection } = require('discord.js');
const config = require('./config');

// Criar instância do cliente com intents necessárias para gerenciar cargos
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ],
    // Adicionar partials para interações e garantir que o bot tenha informações de cargos
    partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_MEMBER'],
    // Configurar sweepers para otimização
    sweepers: {
        messages: {
            interval: 60,
            lifetime: 600
        }
    }
});

// Coleção para comandos - carregamento sob demanda
client.commands = new Collection();

// Pré-carregar apenas nomes dos comandos para otimização
const commandFiles = ['addmoney.js', 'loja.js', 'rank.js', 'rmoney.js'];
commandFiles.forEach(file => {
    const commandName = file.split('.')[0];
    client.commands.set(commandName, { name: commandName });
});

// Função para carregar comando apenas quando necessário
function loadCommandIfNeeded(commandName) {
    const command = client.commands.get(commandName);
    if (!command.execute) {
        const filePath = path.join(__dirname, 'commands', `${commandName}.js`);
        const fullCommand = require(filePath);
        client.commands.set(commandName, fullCommand);
        return fullCommand;
    }
    return command;
}

// Quando o cliente estiver pronto
client.once('ready', () => {
    console.log(`Bot logado como ${client.user.tag}`);
    client.user.setActivity(`${config.prefix}loja | Economia`, { type: 'PLAYING' });
});

// Manipulador de mensagens otimizado
client.on('messageCreate', message => {
    // Verificação rápida para evitar processamento desnecessário
    if (message.author.bot || !message.content.startsWith(config.prefix)) return;

    // Processar comando e argumentos (otimizado)
    const [commandName, ...args] = message.content.slice(config.prefix.length).trim().split(/ +/);
    const lowerCommandName = commandName.toLowerCase();
    
    // Verificar se o comando existe
    if (!client.commands.has(lowerCommandName)) return;

    try {
        // Carregar e executar comando (carregamento sob demanda)
        const command = loadCommandIfNeeded(lowerCommandName);
        command.execute(message, args);
    } catch (error) {
        console.error(`Erro ao executar o comando ${lowerCommandName}:`, error);
        message.reply('Ocorreu um erro ao executar o comando.');
    }
});

// Manipulador de interações (para menus de seleção) - otimizado e com logs detalhados
client.on('interactionCreate', async interaction => {
    if (!interaction.isSelectMenu()) return;
    
    // Carregamento sob demanda para o comando loja quando houver interações
    if (interaction.customId === 'shop_select') {
        console.log(`Interação recebida de ${interaction.user.tag} (${interaction.user.id}) no servidor ${interaction.guild.name}`);
        
        try {
            const lojaCommand = loadCommandIfNeeded('loja');
            
            // Verificar permissões do bot antes de executar o comando
            if (interaction.guild) {
                const botMember = interaction.guild.me;
                console.log(`Permissões do bot no servidor: ${botMember.permissions.toArray().join(', ')}`);
                console.log(`Posição do cargo do bot na hierarquia: ${botMember.roles.highest.position}`);
                
                // Registrar todos os cargos configurados e verificar se existem
                Object.entries(config.roles).forEach(([key, role]) => {
                    const guildRole = interaction.guild.roles.cache.get(role.id);
                    if (guildRole) {
                        console.log(`Cargo ${role.name} (${role.id}) encontrado. Posição: ${guildRole.position}`);
                    } else {
                        console.log(`Cargo ${role.name} (${role.id}) NÃO encontrado no servidor.`);
                    }
                });
            }
            
            if (lojaCommand.handleInteraction) {
                lojaCommand.handleInteraction(interaction);
            }
        } catch (error) {
            console.error('Erro ao processar interação de loja:', error);
            if (!interaction.replied) {
                interaction.reply({
                    content: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
                    ephemeral: true
                }).catch(console.error);
            }
        }
    }
});

// Login no Discord com tratamento de erro simplificado
client.login(config.token)
    .then(() => console.log('Bot logado com sucesso!'))
    .catch(error => {
        console.error('Erro ao fazer login:', error);
        process.exit(1);
    });

// Tratamento de erros básico
process.on('unhandledRejection', error => console.error('Erro:', error));
