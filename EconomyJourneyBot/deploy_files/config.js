/**
 * Configuração do Bot de Economia do Discord
 * 
 * Este bot permite a administração e gestão de uma economia virtual em servidores Discord.
 * Os administradores podem adicionar e remover moedas dos usuários através de comandos específicos.
 * Os usuários podem comprar cargos na loja utilizando as moedas que receberam.
 * 
 * Comandos disponíveis:
 * - j?addmoney @usuario quantia - Adiciona moedas (apenas admins)
 * - j?rmoney @usuario quantia - Remove moedas (apenas admins)
 * - j?rank - Exibe o ranking de usuários com mais moedas (apenas admins)
 * - j?loja - Abre a loja de cargos (todos usuários)
 */

module.exports = {
    // Prefixo usado para chamar os comandos do bot
    prefix: 'j?',
    
    // IDs de administradores que podem usar comandos restritos
    // Apenas estes IDs podem usar comandos como addmoney, rmoney e rank
    adminIds: ['923331256710754305', '1226160958641147946'],
    
    // IDs dos cargos para o sistema de loja
    // Os usuários podem comprar estes cargos usando moedas
    roles: {
        ouro: {
            id: '1355736130615771176',
            name: 'Doador Ouro',
            price: 5000
        },
        platina: {
            id: '1355736156540506232',
            name: 'Doador Platina',
            price: 10000
        },
        diamante: {
            id: '1355736174945239090',
            name: 'Doador Diamante',
            price: 20000
        }
    },
    
    // Token do bot do Discord (configurado diretamente para Discloud)
    token: 'MTM1NTc1ODQ2MzU3MzE2ODE4OA.GgSlfO.55Y5rkECiy30OcY6EjAC-dK7H8gMQcYmz0slf0'
};
