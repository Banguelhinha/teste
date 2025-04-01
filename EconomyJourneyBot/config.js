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
    prefix: 'm?',
    
    // IDs de administradores que podem usar comandos restritos
    // Apenas estes IDs podem usar comandos como addmoney, rmoney e rank e também admsaldo
    adminIds: ['923331256710754305', '1257057648621392006'],
    
    // IDs dos cargos para o sistema de loja
    // Os usuários podem comprar estes cargos usando moedas
    roles: {
        om: {
            id: '1352459715652878376',
            name: 'OM',
            price: 5000
        },
        om_semanal: {
            id: '1352459715652878376',
            name: 'OM Semanal',
            price: 199,
            duration: '7d'
        },
        om_mensal: {
            id: '1352459715652878376',
            name: 'OM Mensal',
            price: 699,
            duration: '30d'
        },
        om_anual: {
            id: '1352459715652878376',
            name: 'OM Anual',
            price: 1499,
            duration: '365d'
        },
        omplus: {
            id: '1352459996503216240',
            name: 'OM+',
            price: 399
        },
        omplus_semanal: {
            id: '1352459996503216240',
            name: 'OM+ Semanal',
            price: 399,
            duration: '7d'
        },
        omplus_mensal: {
            id: '1352459996503216240',
            name: 'OM+ Mensal',
            price: 899,
            duration: '30d'
        },
        omplus_anual: {
            id: '1352459996503216240',
            name: 'OM+ Anual',
            price: 1799,
            duration: '365d'
        },
        omplusplus: {
            id: '1352507790471594024',
            name: 'OM++',
            price: 599
        },
        omplusplus_semanal: {
            id: '1352507790471594024',
            name: 'OM++ Semanal',
            price: 599,
            duration: '7d'
        },
        omplusplus_mensal: {
            id: '1352507790471594024',
            name: 'OM++ Mensal',
            price: 1099,
            duration: '30d'
        },
        omplusplus_anual: {
            id: '1352507790471594024',
            name: 'OM++ Anual',
            price: 2299,
            duration: '365d'
        }
    },
    
    // Token do bot do Discord (configurado diretamente para Discloud)
    token: 'MTM1NTc1ODQ2MzU3MzE2ODE4OA.GgSlfO.55Y5rkECiy30OcY6EjAC-dK7H8gMQcYmz0slf0'
};
